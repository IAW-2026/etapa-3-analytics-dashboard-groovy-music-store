"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { PuntoSerie } from "@/lib/types";

export default function GraficoIngresos({ datos }: { datos: PuntoSerie[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-base font-display font-semibold text-foreground">Ingresos diarios</h2>
        <p className="text-xs text-muted-foreground mt-0.5 font-serif italic">Últimos 30 días</p>
      </div>
      {datos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Sin datos de ingresos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={datos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="fecha" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
                return `$${v}`;
              }}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                backgroundColor: "var(--card)",
              }}
              formatter={(v: any) => [`$${Number(v).toLocaleString("es-AR")}`, "Ingresos"]}
            />
            <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={2} fill="url(#gradIngresos)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}