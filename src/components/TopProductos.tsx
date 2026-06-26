import type { TopProducto } from "@/lib/types";

export default function TopProductos({ productos }: { productos: TopProducto[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-5">
        <h2 className="text-base font-[family-name:var(--font-syne)] font-semibold text-[var(--foreground)]">
          Top productos
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-[family-name:var(--font-cormorant)] italic">
          Más vendidos del mes
        </p>
      </div>
      <ul className="space-y-3.5">
        {productos.map((p, i) => (
          <li key={p.titulo} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono text-[var(--muted-foreground)] w-4">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{p.titulo}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate font-[family-name:var(--font-cormorant)] italic">
                  {p.artista}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-[family-name:var(--font-syne)] font-medium text-[var(--foreground)]">
                ${p.ingresos.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">{p.ventas} ventas</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}