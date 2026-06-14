/**
 * Enums centralizados del dominio.
 *
 * Cada constante con sufijo plural (`*_OPCIONES`) es un `as const` array para
 * iterar en selects/filtros. El tipo asociado se deriva con
 * `(typeof CONSTANTE)[number]` para mantener perfecta sincronía entre el
 * runtime (lo que se muestra/almacena) y el type-system.
 *
 * Por qué importa: hardcodear literales en múltiples archivos abre la puerta
 * a errores de tildes/mayúsculas que el compilador no detecta (e.g.
 * `"En Atencion"` vs `"En Atención"`).
 */

// ─────────────────────────────────────────────────────────────
//  Tickets
// ─────────────────────────────────────────────────────────────

export const ESTADOS_TICKET = ["Abierto", "En Atencion", "Cerrado"] as const;
export type EstadoTicket = (typeof ESTADOS_TICKET)[number];

/** Estados que se consideran "abiertos" para conteos / filtros del dashboard. */
export const ESTADOS_TICKET_ABIERTOS: readonly EstadoTicket[] = [
  "Abierto",
  "En Atencion",
];

export const PRIORIDADES_TICKET = [
  "Critica",
  "Alta",
  "Media",
  "Baja",
] as const;
export type PrioridadTicket = (typeof PRIORIDADES_TICKET)[number];

// ─────────────────────────────────────────────────────────────
//  Contratos
// ─────────────────────────────────────────────────────────────

export const ESTADOS_CONTRATO = [
  "Activo",
  "Cerrado",
  "En Preparacion",
  "Suspendido",
] as const;
export type EstadoContrato = (typeof ESTADOS_CONTRATO)[number];

export const TIPOS_CONTRATO = [
  "Indefinido",
  "Plazo Fijo",
  "Honorarios",
  "Práctica",
] as const;
export type TipoContrato = (typeof TIPOS_CONTRATO)[number];

// ─────────────────────────────────────────────────────────────
//  Trabajadores
// ─────────────────────────────────────────────────────────────

export const MODALIDADES_TRABAJO = [
  "Presencial",
  "Teletrabajo",
  "Híbrido",
] as const;
export type ModalidadTrabajo = (typeof MODALIDADES_TRABAJO)[number];

export const TIPOS_IDENTIFICACION = ["RUT", "DNI", "PASAPORTE"] as const;
export type TipoIdentificacion = (typeof TIPOS_IDENTIFICACION)[number];

export const SISTEMAS_SALUD = ["Fonasa", "Isapre"] as const;
export type SistemaSalud = (typeof SISTEMAS_SALUD)[number];

// ─────────────────────────────────────────────────────────────
//  Activos
// ─────────────────────────────────────────────────────────────

export const TIPOS_ACTIVO = ["Notebook", "Vehículo"] as const;
export type TipoActivo = (typeof TIPOS_ACTIVO)[number];

export const ESTADOS_ACTIVO = [
  "Disponible",
  "Asignado",
  "En Mantención",
  "Baja",
] as const;
export type EstadoActivo = (typeof ESTADOS_ACTIVO)[number];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

export const esTicketAbierto = (estado: EstadoTicket): boolean =>
  ESTADOS_TICKET_ABIERTOS.includes(estado);

export const esTicketCerrado = (estado: EstadoTicket): boolean =>
  estado === "Cerrado";
