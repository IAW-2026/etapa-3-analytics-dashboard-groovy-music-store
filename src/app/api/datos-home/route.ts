import { NextResponse } from "next/server";
import { obtenerDatosHome } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const datos = await obtenerDatosHome();
    return NextResponse.json(datos);
  } catch (error) {
    console.error("Error en datos-home:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}