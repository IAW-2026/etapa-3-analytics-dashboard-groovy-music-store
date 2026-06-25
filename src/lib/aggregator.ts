import { shippingClient } from "./clients/shipping";
import { sellerClient } from "./clients/seller";
import { paymentsClient } from "./clients/payments";
import { buyerClient } from "./clients/buyer";
import type {
  Metrica,
  PuntoSerie,
  DistribucionEstado,
  TopProducto,
  ResumenShipping,
  PuntoDiario,
} from "./types";

function rangoPorDefecto(): { desde: string; hasta: string } {
  const hasta = new Date();
  const desde = new Date();
  desde.setFullYear(desde.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: fmt(desde), hasta: fmt(hasta) };
}

function ok<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === "fulfilled" ? r.value : null;
}

const num = (v: unknown): number | null =>
  typeof v === "number" && !isNaN(v) ? v : null;

const fmtMoneda = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `$${n.toLocaleString("es-AR")}`;
};

const fmtNum = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : n.toLocaleString("es-AR");
};

const fmtPct = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n.toFixed(1)}%`;
};

export type DatosHome = {
  metricas: Metrica[];
  serieIngresos: PuntoSerie[];
  enviosPorEstado: DistribucionEstado[];
  pagosPorEstado: DistribucionEstado[];
  topProductos: TopProducto[];
  errores: string[];
};

export async function obtenerDatosHome(): Promise<DatosHome> {
  const { desde, hasta } = rangoPorDefecto();

  const [rShipping, rSeller, rPayments, rBuyer, rSeriePayments, rSerieBuyer] =
    await Promise.allSettled([
      shippingClient.resumen(),
      sellerClient.resumen(),
      paymentsClient.resumen(),
      buyerClient.resumen(),
      paymentsClient.porDia(desde, hasta),
      buyerClient.porDia(desde, hasta),
    ]);

  // Los datos pueden venir wrapeados en { datos: ... } o directo
  const shipping = ok<ResumenShipping>(rShipping);
  const sellerRaw = ok<any>(rSeller);
  const paymentsRaw = ok<any>(rPayments);
  const buyerRaw = ok<any>(rBuyer);
  const seriePaymentsRaw = ok<any>(rSeriePayments);
  const serieBuyerRaw = ok<any>(rSerieBuyer);

  // Desenvolver si viene en { datos: ... }
  const seller = sellerRaw?.datos ?? sellerRaw;
  const payments = paymentsRaw?.datos ?? paymentsRaw;
  const buyer = buyerRaw?.datos ?? buyerRaw;
  const seriePaymentsArr: any[] = seriePaymentsRaw?.datos ?? (Array.isArray(seriePaymentsRaw) ? seriePaymentsRaw : []);
  const serieBuyerArr: any[] = serieBuyerRaw?.datos ?? (Array.isArray(serieBuyerRaw) ? serieBuyerRaw : []);

  const errores: string[] = [];
  if (!shipping) errores.push("shipping");
  if (!seller) errores.push("seller");
  if (!payments) errores.push("payments");
  if (!buyer) errores.push("buyer");

  // === KPIs ===
  const metricas: Metrica[] = [
    {
      titulo: "Volumen transado (30d)",
      valor: fmtMoneda(payments?.volumenTotal),
      variacion: 0,
      tendencia: "flat",
      subtitulo: payments?.totalTransacciones != null
        ? `${payments.totalTransacciones} transacciones`
        : (payments?.porcentajeAprobados != null
          ? `${fmtPct(payments.porcentajeAprobados)} aprobados`
          : "sin datos"),
    },
    {
      titulo: "Órdenes totales",
      valor: fmtNum(buyer?.total_ordenes ?? buyer?.totalOrdenes),
      variacion: 0,
      tendencia: "flat",
      subtitulo: (buyer?.usuarios_activos ?? buyer?.usuariosActivos) != null
        ? `${fmtNum(buyer.usuarios_activos ?? buyer.usuariosActivos)} usuarios activos`
        : "sin datos",
    },
    {
      titulo: "Ticket promedio",
      valor: fmtMoneda(buyer?.ticket_promedio ?? buyer?.ticketPromedio),
      variacion: 0,
      tendencia: "flat",
      subtitulo: (payments?.porcentajes?.aprobadas ?? payments?.porcentajeAprobados) != null
        ? `${fmtPct(payments.porcentajes?.aprobadas ?? payments.porcentajeAprobados)} pagos aprobados`
        : undefined,
    },
    {
      titulo: "Envíos entregados",
      valor: fmtPct(shipping?.porcentajeEntregados),
      variacion: 0,
      tendencia: "flat",
      subtitulo: shipping?.tiempoPromedioHoras != null
        ? `${shipping.tiempoPromedioHoras}hs promedio · ${shipping.demorados ?? 0} demorados`
        : "sin datos",
    },
  ];

  // === Serie de ingresos diarios ===
  const fmtFecha = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`;
  };

  let serieIngresos: PuntoSerie[] = [];

  if (seriePaymentsArr.length > 0) {
    serieIngresos = seriePaymentsArr.map((p: any) => {
      const fecha = p.fecha ?? p.dia;
      // monto (actual) > suma por estados (viejo formato) > cantidad como fallback
      const total = (p.monto ?? ((p.pagado ?? 0) + (p.acreditado ?? 0) + (p.pendiente ?? 0))) || (p.cantidad ?? 0);
      return {
        fecha: fmtFecha(fecha),
        ingresos: total,
      };
    });
  } else if (serieBuyerArr.length > 0) {
    // Buyer puede usar ingresos o volumen_transacciones
    serieIngresos = serieBuyerArr.map((p: any) => {
      const fecha = p.fecha ?? p.dia;
      return {
        fecha: fmtFecha(fecha),
        ingresos: p.ingresos ?? p.volumen_transacciones ?? p.cantidad ?? 0,
      };
    });
  }

  // === Envíos por estado ===
  const enviosPorEstado: DistribucionEstado[] = shipping?.porEstado
    ? [
        { estado: "En preparación", cantidad: shipping.porEstado.enPreparacion ?? 0 },
        { estado: "En camino", cantidad: shipping.porEstado.enCamino ?? 0 },
        { estado: "Entregados", cantidad: shipping.porEstado.entregados ?? 0 },
      ]
    : [];

  // === Pagos por estado ===
  let pagosPorEstado: DistribucionEstado[] = [];
  if (payments?.transacciones) {
    pagosPorEstado = [
      { estado: "Aprobadas", cantidad: payments.transacciones.aprobadas ?? 0 },
      { estado: "Pendientes", cantidad: payments.transacciones.pendientes ?? 0 },
      { estado: "Rechazadas", cantidad: payments.transacciones.rechazadas ?? 0 },
      { estado: "Reembolsadas", cantidad: payments.transacciones.reembolsadas ?? 0 },
    ];
  } else if (payments?.porcentajeAprobados != null || payments?.porcentajeRechazados != null) {
    // Estructura plana: solo porcentajes
    pagosPorEstado = [
      { estado: "Aprobados", cantidad: payments.porcentajeAprobados ?? 0 },
      { estado: "Rechazados", cantidad: payments.porcentajeRechazados ?? 0 },
    ];
  }

  // === Top productos (Seller usa snake_case y campos distintos) ===
  const topProductosRaw: any[] = seller?.top_productos ?? seller?.topProductos ?? [];
  const precioPromedio = (seller?.total_ventas ?? seller?.totalVentas) > 0
    ? (seller?.ingresos_brutos ?? seller?.ingresosBrutos ?? 0) / (seller?.total_ventas ?? seller?.totalVentas ?? 1)
    : 0;
  const topProductos: TopProducto[] = topProductosRaw.map((p: any) => {
    const ventas = p.unidades_vendidas ?? p.ventas ?? 0;
    return {
      titulo: p.titulo ?? p.nombre ?? "—",
      artista: p.artista ?? "—",
      ventas,
      ingresos: p.ingresos ?? Math.round(ventas * precioPromedio),
    };
  });
  console.log("[aggregator] DATOS CRUDOS:", JSON.stringify({
    rShipping: rShipping.status === "fulfilled" ? rShipping.value : rShipping.reason?.message,
    rSeller: rSeller.status === "fulfilled" ? rSeller.value : rSeller.reason?.message,
    rPayments: rPayments.status === "fulfilled" ? rPayments.value : rPayments.reason?.message,
    rBuyer: rBuyer.status === "fulfilled" ? rBuyer.value : rBuyer.reason?.message,
    rSeriePayments: rSeriePayments.status === "fulfilled" ? rSeriePayments.value : rSeriePayments.reason?.message,
    rSerieBuyer: rSerieBuyer.status === "fulfilled" ? rSerieBuyer.value : rSerieBuyer.reason?.message,
  }, null, 2));
  /*
  console.log("[aggregator] TODOS LOS DATOS:", JSON.stringify({
    shipping, seller, payments, buyer, seriePaymentsArr, serieBuyerArr,
  }, null, 2));
*/
  return {
    metricas,
    serieIngresos,
    enviosPorEstado,
    pagosPorEstado,
    topProductos,
    errores,
  };
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, " ");
}