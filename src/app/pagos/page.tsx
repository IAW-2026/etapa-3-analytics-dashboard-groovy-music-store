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
const fmtPct = (v: unknown) => {
  const n = num(v);
  return n === null ? "—" : `${Math.round(n)}%`;
};

type DatosPagos = {
  resumen: any;
  serieArr: any[];
};

export default function PagosPage() {
  const { datos, cargando, ultimaActualizacion } = usePolling<DatosPagos>(
    "/api/datos-pagos",
    30000
  );

  const resumen = datos?.resumen;
  const serieArr = datos?.serieArr ?? [];

  const serieFormateada = serieArr.map((p: any) => {
    const fecha = p.fecha ?? p.dia;
    const d = new Date(fecha);
    const total = p.monto ?? (((p.pagado ?? 0) + (p.acreditado ?? 0) + (p.pendiente ?? 0) + (p.fallido ?? 0) + (p.reembolsado ?? 0)) || (p.cantidad ?? 0));    return {
      fecha: `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("es-AR", { month: "short" })}`,
      cantidad: Math.round(total),
    };
  });

  const metricas: Metrica[] = [
    {
      titulo: "Volumen transado",
      valor: fmtMoneda(resumen?.volumenTotal != null ? Math.round(resumen.volumenTotal) : null),
      variacion: 0,
      tendencia: "flat",
      subtitulo: resumen?.totalTransacciones != null
        ? `${resumen.totalTransacciones} transacciones`
        : (resumen?.porcentajeAprobados != null
          ? `${fmtPct(resumen.porcentajeAprobados)} aprobados`
          : "sin datos"),
    },
    {
      titulo: "Tasa de aprobación",
      valor: fmtPct(resumen?.porcentajes?.aprobadas ?? resumen?.porcentajeAprobados),
      variacion: 0,
      tendencia: "flat",
      subtitulo: (resumen?.porcentajes?.rechazadas ?? resumen?.porcentajeRechazados) != null
        ? `${fmtPct(resumen.porcentajes?.rechazadas ?? resumen.porcentajeRechazados)} rechazadas`
        : undefined,
    },
    {
      titulo: "Fondos retenidos",
      valor: fmtMoneda(Math.round(resumen?.fondos?.retenidos ?? resumen?.fondosRetenidos ?? 0) || null),
      variacion: 0,
      tendencia: "flat",
      subtitulo: "pendientes de liberación",
    },
    {
      titulo: "Fondos liberados",
      valor: fmtMoneda(Math.round(resumen?.fondos?.liberados ?? resumen?.fondosLiberados ?? 0) || null),
      variacion: 0,
      tendencia: "flat",
      subtitulo: "acreditados a vendedores",
    },
  ];

  let porEstado: DistribucionEstado[] = [];
  if (resumen?.transacciones) {
    porEstado = [
      { estado: "Aprobadas", cantidad: resumen.transacciones.aprobadas ?? 0 },
      { estado: "Pendientes", cantidad: resumen.transacciones.pendientes ?? 0 },
      { estado: "Rechazadas", cantidad: resumen.transacciones.rechazadas ?? 0 },
      { estado: "Reembolsadas", cantidad: resumen.transacciones.reembolsadas ?? 0 },
    ];
  } else if (resumen?.porcentajeAprobados != null || resumen?.porcentajeRechazados != null) {
    porEstado = [
      { estado: "Aprobados", cantidad: resumen.porcentajeAprobados ?? 0 },
      { estado: "Rechazados", cantidad: resumen.porcentajeRechazados ?? 0 },
    ];
  }

  const fondos: DistribucionEstado[] =
    (resumen?.fondos || resumen?.fondosRetenidos != null)
      ? [
          { estado: "Retenidos", cantidad: Math.round(resumen.fondos?.retenidos ?? resumen.fondosRetenidos ?? 0) },
          { estado: "Liberados", cantidad: Math.round(resumen.fondos?.liberados ?? resumen.fondosLiberados ?? 0) },
        ]
      : [];

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
            <a href="/pagos" className="text-white font-medium underline decoration-primary decoration-2 underline-offset-4">Pagos</a>
            <a href="/envios" className="hover:text-white/80 transition-colors">Envíos</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-display font-medium mb-2">Payments</p>
          <h1 className="text-4xl font-serif font-light tracking-tight">Análisis de pagos</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Métricas financieras y estado de transacciones · Actualizado {ultimaActualizacion || "cargando..."}
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
                titulo="Transacciones por día"
                subtitulo="Últimos 30 días"
                datos={serieFormateada}
                labelY="Transacciones"
              />
              <GraficoDonut
                titulo="Distribución por estado"
                subtitulo={resumen?.totalTransacciones
                  ? `Total: ${fmtNum(resumen.totalTransacciones)}`
                  : `${resumen?.porcentajeAprobados ?? 0}% aprobados`}
                datos={porEstado}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GraficoBarras
                titulo="Estado de fondos"
                subtitulo="Retenidos vs liberados (en pesos)"
                datos={fondos}
                color="var(--secondary)"
              />
              <GraficoBarras
                titulo="Transacciones por estado"
                subtitulo={resumen?.totalTransacciones
                  ? `Total: ${fmtNum(resumen.totalTransacciones)}`
                  : `${resumen?.porcentajeAprobados ?? 0}% aprobados`}
                datos={porEstado}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}