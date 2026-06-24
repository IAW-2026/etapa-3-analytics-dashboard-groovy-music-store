// Tipos UI (los que ya teníamos)
export type Tendencia = "up" | "down" | "flat";

export type Metrica = {
  titulo: string;
  valor: string;
  variacion: number;
  tendencia: Tendencia;
  subtitulo?: string;
};

export type PuntoSerie = {
  fecha: string;
  envios?: number;
  ventas?: number;
  pagos?: number;
  ordenes?: number;
  ingresos?: number;
};

export type DistribucionEstado = {
  estado: string;
  cantidad: number;
};

export type TopProducto = {
  titulo: string;
  artista: string;
  ventas: number;
  ingresos: number;
};

// === Contratos de los /api/analytics/resumen de cada app ===

export type ResumenShipping = {
  totalEnvios: number;
  porEstado: Record<string, number>;
  tiempoPromedioEntregaDias: number;
  porcentajeEntregadosATiempo: number;
};

export type ResumenSeller = {
  totalProductos: number;
  totalVentas: number;
  ingresosBrutos: number;
  topProductos: TopProducto[];
};

export type ResumenPayments = {
  volumenTotal: number;
  porcentajeAprobados: number;
  porcentajeRechazados: number;
  fondosRetenidos: number;
  fondosLiberados: number;
};

export type ResumenBuyer = {
  totalOrdenes: number;
  porEstado: Record<string, number>;
  ticketPromedio: number;
  usuariosActivos: number;
};

// Punto de serie diaria genérico (cada app devuelve algo así)
export type PuntoDiario = {
  fecha: string; // ISO YYYY-MM-DD
  cantidad: number;
  monto?: number; // opcional para ingresos
};