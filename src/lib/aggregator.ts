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
  ResumenSeller,
  ResumenPayments,
  ResumenBuyer,
  PuntoDiario,
} from "./types";

function rangoUltimos30Dias(): { desde: string; hasta: string } {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 29);
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
  const { desde, hasta } = rangoUltimos30Dias();

  const [rShipping, rSeller, rPayments, rBuyer, rSeriePayments, rSerieBuyer] =
    await Promise.allSettled([
      shippingClient.resumen(),
      sellerClient.resumen(),
      paymentsClient.resumen(),
      buyerClient.resumen(),
      paymentsClient.porDia(desde, hasta),
      buyerClient.porDia(desde, hasta),
    ]);

  const shipping = ok<ResumenShipping>(rShipping);
  const seller = ok<ResumenSeller>(rSeller);
  const payments = ok<ResumenPayments>(rPayments);
  const buyer = ok<ResumenBuyer>(rBuyer);
  const seriePayments = ok<PuntoDiario[]>(rSeriePayments);
  const serieBuyer = ok<PuntoDiario[]>(rSerieBuyer);

  // Debug
  console.log("[aggregator] shipping error:", rShipping.status === "rejected" ? rShipping.reason : "ok");
  console.log("[aggregator] seller error:", rSeller.status === "rejected" ? rSeller.reason : "ok");

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
        : "sin datos",
    },
    {
      titulo: "Órdenes totales",
      valor: fmtNum(buyer?.total_ordenes),
      variacion: 0,
      tendencia: "flat",
      subtitulo: buyer?.usuarios_activos != null
        ? `${fmtNum(buyer.usuarios_activos)} usuarios activos`
        : "sin datos",
    },
    {
      titulo: "Ticket promedio",
      valor: fmtMoneda(buyer?.ticket_promedio),
      variacion: 0,
      tendencia: "flat",
      subtitulo: payments?.porcentajes?.aprobadas != null
        ? `${fmtPct(payments.porcentajes.aprobadas)} pagos aprobados`
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

  // === Serie de ingresos ===
  const fmtFecha = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`;
  };

  let serieIngresos: PuntoSerie[] = [];
  if (seriePayments && seriePayments.length > 0) {
    serieIngresos = seriePayments.map((p) => ({
      fecha: fmtFecha(p.fecha),
      ingresos: p.monto ?? p.cantidad,
    }));
  } else if (serieBuyer && buyer?.ticket_promedio != null) {
    serieIngresos = serieBuyer.map((p) => ({
      fecha: fmtFecha(p.fecha),
      ingresos: p.cantidad * buyer.ticket_promedio,
    }));
  }

  // === Envíos por estado ===
  const enviosPorEstado: DistribucionEstado[] = shipping?.porEstado
    ? [
        { estado: "En preparación", cantidad: shipping.porEstado.enPreparacion ?? 0 },
        { estado: "En camino", cantidad: shipping.porEstado.enCamino ?? 0 },
        { estado: "Entregados", cantidad: shipping.porEstado.entregados ?? 0 },
      ]
    : [];

  // === Pagos por estado (ahora con datos reales de payments.transacciones) ===
  const pagosPorEstado: DistribucionEstado[] = payments?.transacciones
    ? [
        { estado: "Aprobadas", cantidad: payments.transacciones.aprobadas ?? 0 },
        { estado: "Pendientes", cantidad: payments.transacciones.pendientes ?? 0 },
        { estado: "Rechazadas", cantidad: payments.transacciones.rechazadas ?? 0 },
        { estado: "Reembolsadas", cantidad: payments.transacciones.reembolsadas ?? 0 },
      ]
    : [];

  // === Top productos ===
  const topProductos: TopProducto[] = seller?.topProductos ?? [];

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