## 🔗 Deploy de producción

[https://etapa-3-analytics-dashboard-groovy.vercel.app](https://etapa-3-analytics-dashboard-groovy.vercel.app/)

---

## 👤 Usuarios disponibles

*Nota: Al ser una herramienta de monitoreo interno y consolidación de datos, esta aplicación no implementa una capa de autenticación de usuarios (login) en el frontend.*

| Rol | Email | Contraseña | Acceso |
|-----|-------|------------|--------|
| Analista / Admin | N/A | N/A | Libre a todas las rutas |

---

## 📋 Instrucciones de uso

Navegación a través del menú superior:
- `/` **(Resumen)** — Vista consolidada del ecosistema con ingresos diarios, top productos y estado general de pagos y envíos.
- `/ordenes` **(Buyer)** — Métricas de actividad de compradores, ticket promedio, usuarios activos y distribución de las órdenes.
- `/ventas` **(Seller)** — Datos del catálogo activo, top de productos más vendidos (por unidades e ingresos brutos) y curva de ventas diarias.
- `/pagos` **(Payments)** — Volumen transado, tasas de aprobación/rechazo, detalle de transacciones y balance de fondos (retenidos vs. liberados).
- `/envios` **(Shipping)** — Tiempos promedio de logística, porcentaje de entregas exitosas, envíos demorados y distribución de carga por empresa.

---

## 📝 Descripción del proyecto

**Groovy Analytics** es el panel de monitoreo general del ecosistema **Groovy Music Store**. Actúa como un agregador central (*BFF - Backend for Frontend*) que consume y unifica la información de los cuatro microservicios independientes de la plataforma (Buyer, Seller, Payments y Shipping).

La aplicación está construida con Next.js y no posee una base de datos propia. Su función principal es consolidar métricas clave en tiempo real mediante un sistema de *polling* automático cada 30 segundos. Para recolectar la información, se comunica directamente con las APIs REST de los demás servicios implementando un modelo de autorización *Machine-to-Machine* (M2M), generando tokens JWT dinámicos de corta duración firmados con *secrets* internos.

---

## 🗒️ Notas para la corrección

- **Tolerancia a fallos:** El agregador de datos (`lib/aggregator.ts`) ejecuta las peticiones concurrentes utilizando `Promise.allSettled`. Si uno de los microservicios se encuentra fuera de línea, el dashboard principal no colapsa; renderiza las métricas disponibles y muestra un banner indicando qué servicio falló.
- **Autorización M2M:** Todas las llamadas inter-servicios (`lib/fetcher.ts`) están protegidas. El dashboard genera firmas JWT al vuelo con el payload `{ service: "analytics", role: "INTERNAL" }` para validar su identidad ante las otras APIs.
- **Cruce e hidratación de datos:** Se realiza enriquecimiento de información en el backend de Next.js antes de enviarla al cliente. Por ejemplo, en `/api/datos-ventas` se cruza el listado de los productos más vendidos con sus precios reales consultados en el catálogo completo para calcular los ingresos exactos.
- **Componentes y Visualización:** Interfaz implementada con Tailwind CSS y gráficos interactivos desarrollados con la librería `recharts` (Gráficos de área, líneas, barras y donuts).

## Entrega — Etapa 3

- Dashboard de analytics colaborativo: Resumen, Órdenes, Ventas, Pagos, Envíos.
- Deploy: https://etapa-3-analytics-dashboard-groovy.vercel.app/
- Integrantes: Juan Francisco Mitzig, Francisco Uyua , Ana Paula Negrin , Juan Manuel Cristobo 
