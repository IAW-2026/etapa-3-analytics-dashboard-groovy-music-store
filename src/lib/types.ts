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
  total: number;
  porEstado: {
    enPreparacion: number;
    enCamino: number;
    entregados: number;
  };
  demorados: number;
  tiempoPromedioHoras: number;
  porcentajeEntregados: number;
  enviosPorEmpresa: {
    empresaId: string;
    nombre: string;
    total: number;
  }[];
};

export type ResumenSeller = {
  totalProductos: number;
  totalVentas: number;
  ingresosBrutos: number;
  topProductos: TopProducto[];
};

export type ResumenPayments = {
  volumenTotal: number;
  totalTransacciones: number;
  transacciones: {
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    reembolsadas: number;
  };
  porcentajes: {
    aprobadas: number;
    rechazadas: number;
  };
  fondos: {
    retenidos: number;
    liberados: number;
  };
};

export type ResumenBuyer = {
  total_ordenes: number;
  ingresos_totales: number;
  ticket_promedio: number;
  usuarios_activos: number;
  desglose_estados: Record<string, number>;
};

// Punto de serie diaria genérico (cada app devuelve algo así)
export type PuntoDiario = {
  fecha: string; // ISO YYYY-MM-DD
  cantidad: number;
  monto?: number; // opcional para ingresos
};