import { fetchServicio } from "../fetcher";
import type { ResumenBuyer, PuntoDiario } from "../types";

const BASE = process.env.BUYER_API_URL!;

export const buyerClient = {
  resumen: () =>
    fetchServicio<ResumenBuyer>("buyer", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<PuntoDiario[]>(
      "buyer",
      `${BASE}/api/analytics/ordenes-por-dia?desde=${desde}&hasta=${hasta}`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<unknown>("buyer", `${BASE}/api/orders?${params}`),
};