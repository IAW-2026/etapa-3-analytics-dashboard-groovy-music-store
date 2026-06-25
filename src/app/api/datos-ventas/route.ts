import { NextResponse } from "next/server";
import { sellerClient } from "@/lib/clients/seller";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 29);
    const desde = hace30.toISOString().slice(0, 10);
    const hasta = hoy.toISOString().slice(0, 10);

    const [rResumen, rSerie, rProductos] = await Promise.allSettled([
      sellerClient.resumen(),
      sellerClient.porDia(desde, hasta),
      sellerClient.productos(),
    ]);

    const resumenRaw = rResumen.status === "fulfilled" ? rResumen.value : null;
    const serieRaw = rSerie.status === "fulfilled" ? rSerie.value : null;
    const productosRaw = rProductos.status === "fulfilled" ? rProductos.value : null;

    const resumen = (resumenRaw as any)?.datos ?? resumenRaw;
    const serieArr = (serieRaw as any)?.datos ?? (Array.isArray(serieRaw) ? serieRaw : []);

    // Mapa de precios reales desde GET /api/products
    const productosArr: any[] = (productosRaw as any)?.datos ?? (Array.isArray(productosRaw) ? productosRaw : []);
    const preciosPorId: Record<string, number> = {};
    for (const p of productosArr) {
      if (p.id && typeof p.precio === "number") {
        preciosPorId[p.id] = p.precio;
      }
    }

    // Enriquecer top_productos con ingresos reales
    const topRaw: any[] = resumen?.top_productos ?? resumen?.topProductos ?? [];
    const topEnriquecido = topRaw.map((p: any) => {
      const ventas = p.unidades_vendidas ?? p.ventas ?? 0;
      const precioReal = p.id ? preciosPorId[p.id] : undefined;
      return {
        ...p,
        ingresos: p.ingresos ?? (precioReal != null ? ventas * precioReal : 0),
      };
    });

    // Reemplazar top_productos en el resumen
    const resumenEnriquecido = resumen
      ? { ...resumen, top_productos: topEnriquecido, topProductos: topEnriquecido }
      : null;

    return NextResponse.json({ resumen: resumenEnriquecido, serieArr });
  } catch (error) {
    console.error("Error en datos-ventas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}