import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoLineas from "@/components/GraficoLineas";
import GraficoBarras from "@/components/GraficoBarras";
import GraficoDonut from "@/components/GraficoDonut";
import { shippingClient } from "@/lib/clients/shipping";
import type { Metrica, DistribucionEstado } from "@/lib/types";

export const revalidate = 60;

const num = (v: unknown): number | null =>
  typeof v === "number" && !isNaN(v) ? v : null;
const fmtNum = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : n.toLocaleString("es-AR");
};
const fmtPct = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${n.toFixed(1)}%`;
};

export default async function EnviosPage() {
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

  const serieDatos: { fecha: string; cantidad: number }[] =
    serieRaw?.datos ?? (Array.isArray(serieRaw) ? serieRaw : []);

  const serieFormateada = serieDatos.map((p: any) => {
    const d = new Date(p.fecha);
    return {
      fecha: `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`,
      cantidad: p.cantidad ?? 0,
    };
  });

  const metricas: Metrica[] = [
    {
      titulo: "Total envíos",
      valor: fmtNum(resumen?.total),
      variacion: 0,
      tendencia: "flat",
    },
    {
      titulo: "Entregados",
      valor: fmtPct(resumen?.porcentajeEntregados),
      variacion: 0,
      tendencia: "flat",
      subtitulo: resumen?.porEstado
        ? `${resumen.porEstado.entregados ?? 0} de ${resumen.total ?? 0}`
        : undefined,
    },
    {
      titulo: "Tiempo promedio",
      valor: resumen?.tiempoPromedioHoras != null ? `${resumen.tiempoPromedioHoras}hs` : "—",
      variacion: 0,
      tendencia: "flat",
      subtitulo: "desde creación a entrega",
    },
    {
      titulo: "Demorados",
      valor: fmtNum(resumen?.demorados),
      variacion: 0,
      tendencia: "flat",
      subtitulo: "pasaron fecha estimada",
    },
  ];

  const porEstado: DistribucionEstado[] = resumen?.porEstado
    ? [
        { estado: "En preparación", cantidad: resumen.porEstado.enPreparacion ?? 0 },
        { estado: "En camino", cantidad: resumen.porEstado.enCamino ?? 0 },
        { estado: "Entregados", cantidad: resumen.porEstado.entregados ?? 0 },
      ]
    : [];

  const porEmpresa: DistribucionEstado[] = (resumen?.enviosPorEmpresa ?? []).map(
    (e: any) => ({ estado: e.nombre, cantidad: e.total })
  );

  const hayError = !resumen;

  const ahora = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <a href="/" className="hover:text-primary transition-colors">Resumen</a>
            <a href="/ordenes" className="hover:text-primary transition-colors">Órdenes</a>
            <a href="/ventas" className="hover:text-primary transition-colors">Ventas</a>
            <a href="/pagos" className="hover:text-primary transition-colors">Pagos</a>
            <a href="/envios" className="text-primary font-medium">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Shipping</p>
          <h1 className="text-4xl font-serif font-light tracking-tight">Análisis de envíos</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Métricas y detalle del servicio de logística · Actualizado {ahora}
          </p>
        </div>

        {hayError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            ⚠ No se pudo obtener datos de Shipping.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricas.map((m) => (
            <TarjetaMetrica key={m.titulo} metrica={m} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GraficoLineas
            titulo="Envíos por día"
            subtitulo="Últimos 30 días"
            datos={serieFormateada}
            labelY="Envíos"
          />
          <GraficoDonut
            titulo="Distribución por estado"
            subtitulo={`Total: ${fmtNum(resumen?.total)}`}
            datos={porEstado}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GraficoBarras
            titulo="Envíos por empresa"
            subtitulo="Distribución entre operadores logísticos"
            datos={porEmpresa}
            color="var(--secondary)"
          />
          <GraficoBarras
            titulo="Envíos por estado"
            subtitulo={`Total: ${fmtNum(resumen?.total)}`}
            datos={porEstado}
          />
        </div>
      </div>
    </main>
  );
}