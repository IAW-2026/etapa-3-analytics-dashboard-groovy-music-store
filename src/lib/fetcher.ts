import jwt from "jsonwebtoken";

type ServicioKey = "shipping" | "seller" | "buyer" | "payments";

const SECRETS: Record<ServicioKey, string | undefined> = {
  shipping: process.env.SHIPPING_JWT_SECRET,
  seller: process.env.SELLER_JWT_SECRET,
  buyer: process.env.BUYER_JWT_SECRET,
  payments: process.env.PAYMENTS_JWT_SECRET,
};

function firmarToken(servicio: ServicioKey): string {
  const secret = SECRETS[servicio];
  if (!secret) throw new Error(`Falta el secret para ${servicio}`);
  return jwt.sign(
    { service: "analytics", role: "INTERNAL" },
    secret,
    { expiresIn: "5m" }
  );
}

export async function fetchServicio<T>(
  servicio: ServicioKey,
  url: string,
  opts: { revalidate?: number; timeoutMs?: number } = {}
): Promise<T> {
  const { revalidate = 60, timeoutMs = 5000 } = opts;
  const token = firmarToken(servicio);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`[${servicio}] ${url} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}