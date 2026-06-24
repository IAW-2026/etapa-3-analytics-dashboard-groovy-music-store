import { fetchServicio } from "../fetcher";
import type { ResumenShipping, PuntoDiario } from "../types";

const BASE = process.env.SHIPPING_API_URL!;

export const shippingClient = {
  resumen: () =>
    fetchServicio<ResumenShipping>("shipping", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<PuntoDiario[]>(
      "shipping",
      `${BASE}/api/analytics/envios-por-dia?desde=${desde}&hasta=${hasta}`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<unknown>("shipping", `${BASE}/api/shipments?${params}`),
};