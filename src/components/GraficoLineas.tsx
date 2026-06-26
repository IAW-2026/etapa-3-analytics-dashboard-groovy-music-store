"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

type Props = {
  titulo: string;
  subtitulo?: string;
  datos: { fecha: string; cantidad: number }[];
  color?: string;
  labelY?: string;
};

export default function GraficoLineas({ titulo, subtitulo, datos, color = "var(--primary)", labelY = "Cantidad" }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5">
        <h2 className="text-base font-display font-semibold text-foreground">{titulo}</h2>
        {subtitulo && (
          <p className="text-xs text-muted-foreground mt-0.5 font-serif italic">{subtitulo}</p>
        )}
      </div>
      {datos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Sin datos para el rango seleccionado</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={datos} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="fecha" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, backgroundColor: "var(--card)" }}
              formatter={(v: any) => [v, labelY]}
            />
            <Line type="monotone" dataKey="cantidad" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}