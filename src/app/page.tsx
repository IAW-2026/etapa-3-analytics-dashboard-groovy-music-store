import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoIngresos from "@/components/GraficoIngresos";
import GraficoBarras from "@/components/GraficoBarras";
import TopProductos from "@/components/TopProductos";
import { obtenerDatosHome } from "@/lib/aggregator";

// Revalida cada 60s
export const revalidate = 60;

export default async function Home() {
  const datos = await obtenerDatosHome();

  const ahora = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="bg-[var(--secondary)] text-[var(--secondary-foreground)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-[var(--primary)] flex items-center justify-center font-[family-name:var(--font-syne)] font-bold text-sm">
              G
            </div>
            <span className="font-[family-name:var(--font-syne)] font-semibold tracking-tight">
              Groovy Analytics
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/" className="text-[var(--primary)] font-medium">Resumen</a>
            <a href="/ordenes" className="hover:text-[var(--primary)] transition-colors">Órdenes</a>
            <a href="/ventas" className="hover:text-[var(--primary)] transition-colors">Ventas</a>
            <a href="/pagos" className="hover:text-[var(--primary)] transition-colors">Pagos</a>
            <a href="/envios" className="hover:text-[var(--primary)] transition-colors">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-[family-name:var(--font-syne)] font-medium mb-2">
              Dashboard
            </p>
            <h1 className="text-4xl font-[family-name:var(--font-cormorant)] font-light tracking-tight">
              Resumen general
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Vista consolidada del ecosistema · Actualizado {ahora}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </span>
        </div>

        {/* Aviso si alguna app falló */}
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
            color="var(--primary)"
          />
          <GraficoBarras
            titulo="Pagos por estado"
            subtitulo={`Total: ${datos.pagosPorEstado.reduce((a, b) => a + b.cantidad, 0).toLocaleString("es-AR")}`}
            datos={datos.pagosPorEstado}
            color="var(--secondary)"
          />
        </div>
      </div>
    </main>
  );
}