"use client";
import { useState, useEffect, useCallback } from "react";

export function usePolling<T>(url: string, intervaloMs: number = 30000) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>("");

  const fetchDatos = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setDatos(json);
      setError(null);
      setUltimaActualizacion(
        new Date().toLocaleString("es-AR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [url]);

  useEffect(() => {
    fetchDatos();
    const timer = setInterval(fetchDatos, intervaloMs);
    return () => clearInterval(timer);
  }, [fetchDatos, intervaloMs]);

  return { datos, cargando, error, ultimaActualizacion };
}