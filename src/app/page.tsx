"use client";
import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoIngresos from "@/components/GraficoIngresos";
import GraficoBarras from "@/components/GraficoBarras";
import TopProductos from "@/components/TopProductos";
import { usePolling } from "@/hooks/usePolling";
import type { DatosHome } from "@/lib/aggregator";

export default function Home() {
  const { datos, cargando, ultimaActualizacion } = usePolling<DatosHome>(
    "/api/datos-home",
    30000
  );

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
            <a href="/" className="text-primary font-medium">Resumen</a>
            <a href="/ordenes" className="hover:text-primary transition-colors">Órdenes</a>
            <a href="/ventas" className="hover:text-primary transition-colors">Ventas</a>
            <a href="/pagos" className="hover:text-primary transition-colors">Pagos</a>
            <a href="/envios" className="hover:text-primary transition-colors">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Dashboard</p>
            <h1 className="text-4xl font-serif font-light tracking-tight">Resumen general</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Vista consolidada del ecosistema · Actualizado {ultimaActualizacion || "cargando..."}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </span>
        </div>

        {cargando && !datos && (
          <p className="text-sm text-muted-foreground text-center py-20">Cargando datos...</p>
        )}

        {datos && (
          <>
            {datos.errores.length > 0 && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                ⚠ No se pudo obtener datos de: <strong>{datos.errores.join(", ")}</strong>. El resto del dashboard sigue funcionando.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {datos.metricas.map((m) => (
                <TarjetaMetrica key={m.titulo} metrica={m} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <GraficoIngresos datos={datos.serieIngresos} />
              </div>
              <TopProductos productos={datos.topProductos} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GraficoBarras
                titulo="Envíos por estado"
                subtitulo={`Total: ${datos.enviosPorEstado.reduce((a, b) => a + b.cantidad, 0).toLocaleString("es-AR")}`}
                datos={datos.enviosPorEstado}
              />
              <GraficoBarras
                titulo="Porcentaje de pagos aprobados"
                subtitulo={`Total: ${datos.pagosPorEstado.reduce((a, b) => a + b.cantidad, 0).toLocaleString("es-AR")}`}
                datos={datos.pagosPorEstado}
                color="var(--secondary)"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}