import { fetchServicio } from "../fetcher";
import type { ResumenPayments, PuntoDiario } from "../types";

const BASE = process.env.PAYMENTS_API_URL!;

export const paymentsClient = {
  resumen: () =>
    fetchServicio<ResumenPayments>("payments", `${BASE}/api/analytics/resumen`),

  porDia: (desde: string, hasta: string) =>
    fetchServicio<PuntoDiario[]>(
      "payments",
      `${BASE}/api/analytics/transacciones-por-dia?desde=${desde}&hasta=${hasta}`
    ),

  listado: (params: URLSearchParams) =>
    fetchServicio<unknown>("payments", `${BASE}/api/payments?${params}`),
};