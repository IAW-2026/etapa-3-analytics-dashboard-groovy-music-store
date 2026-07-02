"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { DistribucionEstado } from "@/lib/types";

const COLORES = ["var(--primary)", "var(--ring)", "var(--secondary)", "var(--muted)", "var(--muted-foreground)"];

export default function GraficoDonut({ titulo, subtitulo, datos }: {
  titulo: string;
  subtitulo?: string;
  datos: DistribucionEstado[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-base font-display font-semibold text-foreground">{titulo}</h2>
        {subtitulo && (
          <p className="text-xs text-muted-foreground mt-0.5 font-serif italic">{subtitulo}</p>
        )}
      </div>
      {datos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Sin datos</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={datos} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
              {datos.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, backgroundColor: "var(--card)" }} />
            <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}