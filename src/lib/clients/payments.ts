import { fetchServicio } from "../fetcher";

const BASE = process.env.PAYMENTS_API_URL!;

export const paymentsClient = {
  resumen: () =>
    fetchServicio<any>("payments", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<any>(
      "payments",
      `${BASE}/api/analytics/transacciones-por-dia?desde=${desde}&hasta=${hasta}`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<any>("payments", `${BASE}/api/payments?${params}`),
};