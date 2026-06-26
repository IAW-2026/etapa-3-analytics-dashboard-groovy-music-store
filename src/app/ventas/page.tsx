"use client";
import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoLineas from "@/components/GraficoLineas";
import GraficoBarras from "@/components/GraficoBarras";
import { usePolling } from "@/hooks/usePolling";
import type { Metrica, DistribucionEstado } from "@/lib/types";

const num = (v: unknown): number | null =>
  typeof v === "number" && !isNaN(v) ? v : null;
const fmtMoneda = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `$${Math.round(n).toLocaleString("es-AR")}`;
};
const fmtNum = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : n.toLocaleString("es-AR");
};

type DatosVentas = {
  resumen: any;
  serieArr: any[];
};

export default function VentasPage() {
  const { datos, cargando, ultimaActualizacion } = usePolling<DatosVentas>(
    "/api/datos-ventas",
    30000
  );

  const resumen = datos?.resumen;
  const serieArr = datos?.serieArr ?? [];

  // Tu propia API (Seller) devuelve snake_case: total_productos, total_ventas, ingresos_brutos
  const totalProductos = resumen?.total_productos ?? resumen?.totalProductos;
  const totalVentas = resumen?.total_ventas ?? resumen?.totalVentas;
  const ingresosBrutos = resumen?.ingresos_brutos ?? resumen?.ingresosBrutos;

  const totalVentasNum = num(totalVentas);
  const ingresosBrutosNum = num(ingresosBrutos);
  const ticketPromedio =
    totalVentasNum && ingresosBrutosNum != null
      ? ingresosBrutosNum / totalVentasNum
      : null;

  const fmtFecha = (fecha: string) => {
    const d = new Date(fecha);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`;
  };

  const serieVentas = serieArr.map((p: any) => ({
    fecha: fmtFecha(p.dia ?? p.fecha),
    cantidad: p.cantidad_ventas ?? p.cantidad ?? 0,
  }));

  const serieIngresos = serieArr.map((p: any) => ({
    fecha: fmtFecha(p.dia ?? p.fecha),
    cantidad: p.ingresos ?? p.monto ?? 0,
  }));

  const metricas: Metrica[] = [
    { titulo: "Productos activos", valor: fmtNum(totalProductos), variacion: 0, tendencia: "flat" },
    { titulo: "Ventas totales", valor: fmtNum(totalVentas), variacion: 0, tendencia: "flat" },
    { titulo: "Ingresos brutos", valor: fmtMoneda(ingresosBrutos), variacion: 0, tendencia: "flat" },
    {
      titulo: "Ticket promedio",
      valor: fmtMoneda(ticketPromedio),
      variacion: 0,
      tendencia: "flat",
      subtitulo: "ingresos brutos / ventas totales",
    },
  ];

  const topProductosRaw: any[] = resumen?.top_productos ?? resumen?.topProductos ?? [];

  const porUnidades: DistribucionEstado[] = topProductosRaw.map((p: any) => ({
    estado: p.titulo ?? p.nombre ?? "—",
    cantidad: p.unidades_vendidas ?? p.ventas ?? 0,
  }));

  const porIngresos: DistribucionEstado[] = topProductosRaw.map((p: any) => ({
    estado: p.titulo ?? p.nombre ?? "—",
    cantidad: Math.round(p.ingresos ?? 0),
  }));

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center font-display font-bold text-sm text-primary-foreground">
              G
            </div>
            <span className="font-display font-semibold tracking-tight">Groovy Analytics</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="hover:text-white/80 transition-colors">Resumen</a>
            <a href="/ordenes" className="hover:text-white/80 transition-colors">Órdenes</a>
            <a href="/ventas" className="text-white font-medium underline decoration-primary decoration-2 underline-offset-4">Ventas</a>
            <a href="/pagos" className="hover:text-white/80 transition-colors">Pagos</a>
            <a href="/envios" className="hover:text-white/80 transition-colors">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Seller</p>
          <h1 className="text-4xl font-serif font-light tracking-tight">Análisis de ventas</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Catálogo, ventas e ingresos del marketplace · Actualizado {ultimaActualizacion || "cargando..."}
          </p>
        </div>

        {cargando && !datos && (
          <p className="text-sm text-muted-foreground text-center py-20">Cargando datos...</p>
        )}

        {datos && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {metricas.map((m) => (
                <TarjetaMetrica key={m.titulo} metrica={m} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <GraficoLineas
                titulo="Ventas por día"
                subtitulo="Últimos 30 días"
                datos={serieVentas}
                labelY="Ventas"
              />
              <GraficoLineas
                titulo="Ingresos por día"
                subtitulo="Últimos 30 días"
                datos={serieIngresos}
                color="var(--secondary)"
                labelY="Ingresos"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GraficoBarras
                titulo="Top productos por unidades"
                subtitulo="Más vendidos"
                datos={porUnidades}
              />
              <GraficoBarras
                titulo="Top productos por ingresos"
                subtitulo="Más vendidos"
                datos={porIngresos}
                color="var(--secondary)"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}