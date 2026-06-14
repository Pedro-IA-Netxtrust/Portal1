/**
 * Utilidades de fechas para cálculos de vencimiento.
 * Todas las comparaciones normalizan la hora a 00:00 local para que
 * "hoy" se evalúe por día calendario, no por instante exacto.
 */

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 * Días entre `dateStr` y hoy, normalizando ambos a 00:00 local.
 * - Negativo: ya venció (hace N días).
 * - 0: vence hoy.
 * - Positivo: faltan N días.
 *
 * Cuando `dateStr` es nulo/indefinido devuelve {@link SIN_VENCIMIENTO} (999)
 * para que los filtros "<= X" no lo confundan con un valor vencido.
 */
export const SIN_VENCIMIENTO = 999;

export function diasRestantes(dateStr?: string | null): number {
  if (!dateStr) return SIN_VENCIMIENTO;
  const limit = new Date(dateStr);
  if (Number.isNaN(limit.getTime())) return SIN_VENCIMIENTO;
  limit.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((limit.getTime() - hoy.getTime()) / MS_POR_DIA);
}

/**
 * `true` si la fecha ya pasó (estrictamente antes de hoy).
 */
export function estaVencido(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  return diasRestantes(dateStr) < 0;
}

/**
 * `true` si la fecha vence dentro de los próximos `dias` días (inclusive),
 * o si ya está vencida.
 */
export function venceEn(dateStr: string | null | undefined, dias: number): boolean {
  if (!dateStr) return false;
  return diasRestantes(dateStr) <= dias;
}
