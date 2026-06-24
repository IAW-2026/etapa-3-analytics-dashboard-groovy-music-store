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

// Helper para fechas: últimos 30 días en formato YYYY-MM-DD
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

export type DatosHome = {
  metricas: Metrica[];
  serieIngresos: PuntoSerie[];
  enviosPorEstado: DistribucionEstado[];
  pagosPorEstado: DistribucionEstado[];
  topProductos: TopProducto[];
  errores: string[]; // qué apps fallaron, para mostrar en UI
};

export async function obtenerDatosHome(): Promise<DatosHome> {
  const { desde, hasta } = rangoUltimos30Dias();

  const [
    rShipping,
    rSeller,
    rPayments,
    rBuyer,
    rSeriePayments,
    rSerieBuyer,
  ] = await Promise.allSettled([
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

  // Errores para debug
  const errores: string[] = [];
  if (!shipping) errores.push("shipping");
  if (!seller) errores.push("seller");
  if (!payments) errores.push("payments");
  if (!buyer) errores.push("buyer");

  // === KPIs principales ===
  const metricas: Metrica[] = [
    {
      titulo: "Ingresos brutos (30d)",
      valor: seller ? `$${seller.ingresosBrutos.toLocaleString("es-AR")}` : "—",
      variacion: 0,
      tendencia: "flat",
      subtitulo: seller ? `${seller.totalVentas} ventas` : "sin datos",
    },
    {
      titulo: "Órdenes totales",
      valor: buyer ? buyer.totalOrdenes.toLocaleString("es-AR") : "—",
      variacion: 0,
      tendencia: "flat",
      subtitulo: buyer ? `${buyer.usuariosActivos} usuarios activos` : "sin datos",
    },
    {
      titulo: "Ticket promedio",
      valor: buyer ? `$${buyer.ticketPromedio.toLocaleString("es-AR")}` : "—",
      variacion: 0,
      tendencia: "flat",
      subtitulo: payments ? `${payments.porcentajeAprobados.toFixed(1)}% pagos aprobados` : undefined,
    },
    {
      titulo: "Entregados a tiempo",
      valor: shipping ? `${shipping.porcentajeEntregadosATiempo.toFixed(1)}%` : "—",
      variacion: 0,
      tendencia: "flat",
      subtitulo: shipping ? `${shipping.tiempoPromedioEntregaDias.toFixed(1)} días promedio` : "sin datos",
    },
  ];

  // === Serie de ingresos (combina Payments si trae monto, sino usa cantidad de Buyer * ticket promedio) ===
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
  } else if (serieBuyer && buyer) {
    serieIngresos = serieBuyer.map((p) => ({
      fecha: fmtFecha(p.fecha),
      ingresos: p.cantidad * buyer.ticketPromedio,
    }));
  }

  // === Distribución de envíos por estado ===
  const enviosPorEstado: DistribucionEstado[] = shipping
    ? Object.entries(shipping.porEstado).map(([estado, cantidad]) => ({
        estado: capitalizar(estado),
        cantidad,
      }))
    : [];

  // === Distribución de pagos (derivada del resumen) ===
  const pagosPorEstado: DistribucionEstado[] = payments
    ? [
        { estado: "Aprobados", cantidad: Math.round((payments.porcentajeAprobados / 100) * (buyer?.totalOrdenes ?? 0)) },
        { estado: "Rechazados", cantidad: Math.round((payments.porcentajeRechazados / 100) * (buyer?.totalOrdenes ?? 0)) },
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