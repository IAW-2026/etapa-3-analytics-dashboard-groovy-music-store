import { fetchServicio } from "../fetcher";
import type { ResumenBuyer, PuntoDiario } from "../types";

const BASE = process.env.BUYER_API_URL!;

export const buyerClient = {
  resumen: () =>
    fetchServicio<ResumenBuyer>("buyer", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<any[]>(
      "buyer",
      `${BASE}/api/analytics/orders/time-series?fecha_desde=${desde}&fecha_hasta=${hasta}&intervalo=dia`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<unknown>("buyer", `${BASE}/api/orders?${params}`),
};