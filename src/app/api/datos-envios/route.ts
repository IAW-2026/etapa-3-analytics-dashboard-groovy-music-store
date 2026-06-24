import { NextResponse } from "next/server";
import { shippingClient } from "@/lib/clients/shipping";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 29);
    const desde = hace30.toISOString().slice(0, 10);
    const hasta = hoy.toISOString().slice(0, 10);

    const [rResumen, rSerie] = await Promise.allSettled([
      shippingClient.resumen(),
      shippingClient.porDia(desde, hasta),
    ]);

    const resumen = rResumen.status === "fulfilled" ? rResumen.value : null;
    const serieRaw = rSerie.status === "fulfilled" ? rSerie.value : null;
    const serieDatos = serieRaw?.datos ?? (Array.isArray(serieRaw) ? serieRaw : []);

    return NextResponse.json({ resumen, serieDatos });
  } catch (error) {
    console.error("Error en datos-envios:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}