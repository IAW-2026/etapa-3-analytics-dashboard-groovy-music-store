"use client";
import TarjetaMetrica from "@/components/TarjetaMetrica";
import GraficoLineas from "@/components/GraficoLineas";
import GraficoBarras from "@/components/GraficoBarras";
import GraficoDonut from "@/components/GraficoDonut";
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

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, " ");
}

type DatosOrdenes = {
  resumen: any;
  serieArr: any[];
};

export default function OrdenesPage() {
  const { datos, cargando, ultimaActualizacion } = usePolling<DatosOrdenes>(
    "/api/datos-ordenes",
    30000
  );

  const resumen = datos?.resumen;
  const serieArr = datos?.serieArr ?? [];

  // Buyer usa snake_case: total_ordenes, usuarios_activos, ticket_promedio, ingresos_totales
  const totalOrdenes = resumen?.total_ordenes ?? resumen?.totalOrdenes;
  const usuariosActivos = resumen?.usuarios_activos ?? resumen?.usuariosActivos;
  const ticketPromedio = resumen?.ticket_promedio ?? resumen?.ticketPromedio;
  const ingresosTotales = resumen?.ingresos_totales ?? resumen?.ingresosTotales;

  const fmtFecha = (fecha: string) => {
    const d = new Date(fecha);
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`;
  };

  const serieOrdenes = serieArr.map((p: any) => ({
    fecha: fmtFecha(p.fecha ?? p.dia),
    cantidad: p.cantidad ?? p.ordenes ?? p.total ?? p.volumen_transacciones ?? 0,
  }));

  const serieIngresos = serieArr.map((p: any) => ({
    fecha: fmtFecha(p.fecha ?? p.dia),
    cantidad: Math.round(p.ingresos ?? p.monto ?? p.volumen_transacciones ?? 0),
  }));

  const metricas: Metrica[] = [
    { titulo: "Órdenes totales", valor: fmtNum(totalOrdenes), variacion: 0, tendencia: "flat" },
    { titulo: "Usuarios activos", valor: fmtNum(usuariosActivos), variacion: 0, tendencia: "flat" },
    { titulo: "Ticket promedio", valor: fmtMoneda(ticketPromedio), variacion: 0, tendencia: "flat" },
    { titulo: "Ingresos totales", valor: fmtMoneda(ingresosTotales), variacion: 0, tendencia: "flat" },
  ];

  const desgloseEstados: Record<string, number> =
    resumen?.desglose_estados ?? resumen?.desgloseEstados ?? {};

  const porEstado: DistribucionEstado[] = Object.entries(desgloseEstados).map(
    ([estado, cantidad]) => ({ estado: capitalizar(estado), cantidad: cantidad ?? 0 })
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
            <a href="/" className="hover:text-primary transition-colors">Resumen</a>
            <a href="/ordenes" className="text-primary font-medium">Órdenes</a>
            <a href="/ventas" className="hover:text-primary transition-colors">Ventas</a>
            <a href="/pagos" className="hover:text-primary transition-colors">Pagos</a>
            <a href="/envios" className="hover:text-primary transition-colors">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Buyer</p>
          <h1 className="text-4xl font-serif font-light tracking-tight">Análisis de órdenes</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Actividad de compradores y estado de las órdenes · Actualizado {ultimaActualizacion || "cargando..."}
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
                titulo="Órdenes por día"
                subtitulo="Últimos 30 días"
                datos={serieOrdenes}
                labelY="Órdenes"
              />
              <GraficoDonut
                titulo="Distribución por estado"
                subtitulo={`Total: ${fmtNum(totalOrdenes)}`}
                datos={porEstado}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GraficoLineas
                titulo="Ingresos por día"
                subtitulo="Últimos 30 días"
                datos={serieIngresos}
                color="var(--secondary)"
                labelY="Ingresos"
              />
              <GraficoBarras
                titulo="Órdenes por estado"
                subtitulo={`Total: ${fmtNum(totalOrdenes)}`}
                datos={porEstado}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}