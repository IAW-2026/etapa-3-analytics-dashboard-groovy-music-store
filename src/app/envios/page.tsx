"use client";
import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoLineas from "@/components/GraficoLineas";
import GraficoBarras from "@/components/GraficoBarras";
import GraficoDonut from "@/components/GraficoDonut";
import { usePolling } from "@/hooks/usePolling";
import type { Metrica, DistribucionEstado } from "@/lib/types";

const num = (v: unknown): number | null =>
  typeof v === "number" && !isNaN(v) ? v : null;
const fmtNum = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : n.toLocaleString("es-AR");
};
const fmtPct = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${Math.round(n)}%`;
};

type DatosEnvios = {
  resumen: any;
  serieDatos: any[];
};

export default function EnviosPage() {
  const { datos, cargando, ultimaActualizacion } = usePolling<DatosEnvios>(
    "/api/datos-envios",
    30000
  );

  const resumen = datos?.resumen;
  const serieDatos = datos?.serieDatos ?? [];

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
            <a href="/ventas" className="hover:text-white/80 transition-colors">Ventas</a>
            <a href="/pagos" className="hover:text-white/80 transition-colors">Pagos</a>
            <a href="/envios" className="text-white font-medium underline decoration-primary decoration-2 underline-offset-4">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Shipping</p>
          <h1 className="text-4xl font-serif font-light tracking-tight">Análisis de envíos</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Métricas y detalle del servicio de logística · Actualizado {ultimaActualizacion || "cargando..."}
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
          </>
        )}
      </div>
    </main>
  );
}