import { fetchServicio } from "../fetcher";
import type { ResumenShipping } from "../types";

const BASE = process.env.SHIPPING_API_URL!;

export const shippingClient = {
  resumen: () =>
    fetchServicio<ResumenShipping>("shipping", `${BASE}/api/analytics/resumen`, { timeoutMs: 10000 }),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<any>(
      "shipping",
      `${BASE}/api/analytics/envios-por-dia?desde=${desde}&hasta=${hasta}`,
      { timeoutMs: 10000 }
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<any>("shipping", `${BASE}/api/shipments?${params}`, { timeoutMs: 10000 }),
};