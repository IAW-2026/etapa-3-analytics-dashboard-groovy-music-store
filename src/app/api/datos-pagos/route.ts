import { NextResponse } from "next/server";
import { paymentsClient } from "@/lib/clients/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 29);
    const desde = hace30.toISOString().slice(0, 10);
    const hasta = hoy.toISOString().slice(0, 10);

    const [rResumen, rSerie] = await Promise.allSettled([
      paymentsClient.resumen(),
      paymentsClient.porDia(desde, hasta),
    ]);

    const resumenRaw = rResumen.status === "fulfilled" ? rResumen.value : null;
    const serieRaw = rSerie.status === "fulfilled" ? rSerie.value : null;

    const resumen = resumenRaw?.datos ?? resumenRaw;
    const serieArr = serieRaw?.datos ?? (Array.isArray(serieRaw) ? serieRaw : []);

    return NextResponse.json({ resumen, serieArr });
  } catch (error) {
    console.error("Error en datos-pagos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}