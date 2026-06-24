import { fetchServicio } from "../fetcher";
import type { ResumenSeller, PuntoDiario } from "../types";

const BASE = process.env.SELLER_API_URL!;

export const sellerClient = {
  resumen: () =>
    fetchServicio<ResumenSeller>("seller", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<PuntoDiario[]>(
      "seller",
      `${BASE}/api/analytics/ventas-por-dia?desde=${desde}&hasta=${hasta}`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<unknown>("seller", `${BASE}/api/products?${params}`),
};