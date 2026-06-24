"use client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { PuntoSerie } from "@/lib/types";

export default function GraficoIngresos({ datos }: { datos: PuntoSerie[] }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-5">
        <h3 className="text-base font-[family-name:var(--font-syne)] font-semibold text-[var(--foreground)]">
          Ingresos diarios
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-[family-name:var(--font-cormorant)] italic">
          Últimos 30 días
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={datos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B0431D" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#B0431D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#D5D1C8" vertical={false} />
          <XAxis dataKey="fecha" stroke="#46443F" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#46443F"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #D5D1C8",
              borderRadius: 8,
              fontSize: 12,
              backgroundColor: "#FFFFFF",
            }}
           formatter={(v: any) => [`$${Number(v).toLocaleString("es-AR")}`,"Ingresos",]}
          />
          <Area type="monotone" dataKey="ingresos" stroke="#B0431D" strokeWidth={2} fill="url(#gradIngresos)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}