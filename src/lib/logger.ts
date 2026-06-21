/**
 * Logger estructurado central con sink configurable.
 *
 * Uso:
 *
 *     import { createLogger } from "@/lib/logger";
 *     const log = createLogger("onboarding-store");
 *     log.info("Tareas creadas", { count: 24 });
 *     log.error("Error al actualizar", err);
 *
 * El sink por defecto escribe a `console`. En producción se puede
 * reemplazar por uno que mande a Sentry, Logflare, Datadog, etc.,
 * sin tocar a los consumidores:
 *
 *     import { setSink } from "@/lib/logger";
 *     setSink((level, scope, msg, data) => {
 *       Sentry.captureMessage(`[${scope}] ${msg}`, { level, extra: { data } });
 *     });
 *
 * Niveles:
 *   - `debug`: trazas de desarrollo. En prod se silencian.
 *   - `info`:  eventos normales.
 *   - `warn`:  algo inesperado pero recuperable.
 *   - `error`: fallos que deberían investigarse.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogSink = (
  level: LogLevel,
  scope: string,
  message: string,
  data?: unknown
) => void;

const isProd = process.env.NODE_ENV === "production";

const consoleSink: LogSink = (level, scope, message, data) => {
  // Silenciar `debug` e `info` en prod por defecto. `warn` y `error`
  // siempre se muestran.
  if (isProd && (level === "debug" || level === "info")) return;

  const fn =
    level === "error"
      ? console.error
      : level === "warn"
      ? console.warn
      : level === "debug"
      ? console.debug
      : console.log;

  const prefix = `[${scope}]`;
  if (data === undefined) {
    fn(prefix, message);
  } else {
    fn(prefix, message, data);
  }
};

let activeSink: LogSink = consoleSink;

/** Reemplaza el sink global. Útil para tests o para enchufar Sentry/etc. */
export function setSink(sink: LogSink): void {
  activeSink = sink;
}

/** Restaura el sink por defecto (consola). */
export function resetSink(): void {
  activeSink = consoleSink;
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

export function createLogger(scope: string): Logger {
  return {
    debug: (m, d) => activeSink("debug", scope, m, d),
    info: (m, d) => activeSink("info", scope, m, d),
    warn: (m, d) => activeSink("warn", scope, m, d),
    error: (m, d) => activeSink("error", scope, m, d),
  };
}
