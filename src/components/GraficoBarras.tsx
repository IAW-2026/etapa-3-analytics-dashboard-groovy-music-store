"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { DistribucionEstado } from "@/lib/types";

export default function GraficoBarras({
  titulo,
  subtitulo,
  datos,
  color = "#B0431D",
}: {
  titulo: string;
  subtitulo?: string;
  datos: DistribucionEstado[];
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-5">
        <h3 className="text-base font-[family-name:var(--font-syne)] font-semibold text-[var(--foreground)]">
          {titulo}
        </h3>
        {subtitulo && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-[family-name:var(--font-cormorant)] italic">
            {subtitulo}
          </p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D5D1C8" vertical={false} />
          <XAxis dataKey="estado" stroke="#46443F" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#46443F" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ border: "1px solid #D5D1C8", borderRadius: 8, fontSize: 12, backgroundColor: "#FFFFFF" }}
          />
          <Bar dataKey="cantidad" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}