import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { Metrica } from "@/lib/types";

export default function TarjetaMetrica({ metrica }: { metrica: Metrica }) {
  const { titulo, valor, variacion, tendencia, subtitulo } = metrica;

  const estilosTendencia =
    tendencia === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : tendencia === "down"
      ? "text-red-700 bg-red-50 border-red-100"
      : "text-[var(--muted-foreground)] bg-[var(--muted)] border-[var(--border)]";

  const Icono = tendencia === "up" ? ArrowUpRight : tendencia === "down" ? ArrowDownRight : Minus;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--accent)]/30 transition-colors">
      <p className="text-xs uppercase tracking-wider font-[family-name:var(--font-syne)] font-medium text-[var(--muted-foreground)]">
        {titulo}
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-3xl font-[family-name:var(--font-syne)] font-semibold text-[var(--foreground)] tracking-tight">
          {valor}
        </p>
        <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-xs font-medium ${estilosTendencia}`}>
          <Icono size={12} />
          {Math.abs(variacion)}%
        </span>
      </div>
      {subtitulo && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)] font-[family-name:var(--font-cormorant)] italic">
          {subtitulo}
        </p>
      )}
    </div>
  );
}