import { NextResponse } from "next/server";
import { buyerClient } from "@/lib/clients/buyer";
import { paymentsClient } from "@/lib/clients/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 29);
    const desde = hace30.toISOString().slice(0, 10);
    const hasta = hoy.toISOString().slice(0, 10);

    const [rResumen, rSerieBuyer, rSeriePayments] = await Promise.allSettled([
      buyerClient.resumen(),
      buyerClient.porDia(desde, hasta),
      paymentsClient.porDia(desde, hasta),
    ]);

    const resumenRaw = rResumen.status === "fulfilled" ? rResumen.value : null;
    const serieBuyerRaw = rSerieBuyer.status === "fulfilled" ? rSerieBuyer.value : null;
    const seriePaymentsRaw = rSeriePayments.status === "fulfilled" ? rSeriePayments.value : null;

    const resumen = (resumenRaw as any)?.datos ?? resumenRaw;

    // Serie buyer: para órdenes por día
    const serieBuyer: any[] = (serieBuyerRaw as any)?.datos ?? (Array.isArray(serieBuyerRaw) ? serieBuyerRaw : []);

    // Serie payments: para ingresos por día (mucho más completa)
    const seriePayments: any[] = (seriePaymentsRaw as any)?.datos ?? (Array.isArray(seriePaymentsRaw) ? seriePaymentsRaw : []);

    // Mergear por fecha: buyer aporta volumen_transacciones, payments aporta monto
    const porFecha: Record<string, { ordenes: number; ingresos: number }> = {};

    for (const p of serieBuyer) {
      const f = p.fecha ?? p.dia;
      if (!porFecha[f]) porFecha[f] = { ordenes: 0, ingresos: 0 };
      porFecha[f].ordenes += p.volumen_transacciones ?? p.cantidad ?? 0;
      porFecha[f].ingresos += p.ingresos ?? p.monto ?? 0;
    }

    for (const p of seriePayments) {
      const f = p.fecha ?? p.dia;
      if (!porFecha[f]) porFecha[f] = { ordenes: 0, ingresos: 0 };
      // Solo sumar ingresos de payments si buyer no tenía dato para esa fecha
      if (!porFecha[f].ingresos) {
        porFecha[f].ingresos += p.monto ?? p.cantidad ?? 0;
      }
      // Si buyer no tenía ordenes para esa fecha, usar cantidad de payments
      if (!porFecha[f].ordenes) {
        porFecha[f].ordenes += p.cantidad ?? 0;
      }
    }

    // Ordenar por fecha y armar array unificado
    const serieArr = Object.entries(porFecha)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, v]) => ({
        fecha,
        volumen_transacciones: v.ordenes,
        ingresos: Math.round(v.ingresos),
      }));

    return NextResponse.json({ resumen, serieArr });
  } catch (error) {
    console.error("Error en datos-ordenes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}