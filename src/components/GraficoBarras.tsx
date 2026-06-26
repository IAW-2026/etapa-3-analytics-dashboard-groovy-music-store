"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { DistribucionEstado } from "@/lib/types";

export default function GraficoBarras({
  titulo,
  subtitulo,
  datos,
  color = "var(--primary)",
}: {
  titulo: string;
  subtitulo?: string;
  datos: DistribucionEstado[];
  color?: string;
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
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={datos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="estado" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, backgroundColor: "var(--card)" }} />
            <Bar dataKey="cantidad" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}