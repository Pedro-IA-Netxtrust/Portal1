"use client";

import { useEffect } from "react";
import { setSink, type LogLevel } from "@/lib/logger";

const LEVEL_TO_SENTRY: Record<LogLevel, "debug" | "info" | "warning" | "error"> = {
  debug: "debug",
  info: "info",
  warn: "warning",
  error: "error",
};

function getSentryBrowser(): {
  captureMessage: (message: string, context?: Record<string, unknown>) => void;
} | null {
  if (typeof window === "undefined") return null;
  const maybe = (window as Window & { Sentry?: unknown }).Sentry;
  if (
    maybe &&
    typeof maybe === "object" &&
    "captureMessage" in maybe &&
    typeof (maybe as { captureMessage?: unknown }).captureMessage === "function"
  ) {
    return maybe as { captureMessage: (message: string, context?: Record<string, unknown>) => void };
  }
  return null;
}

export default function LoggerInit() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const sentry = getSentryBrowser();
    if (!sentry) return;

    setSink((level, scope, message, data) => {
      sentry.captureMessage(`[${scope}] ${message}`, {
        level: LEVEL_TO_SENTRY[level],
        extra: data === undefined ? undefined : { data },
      });
    });
  }, []);

  return null;
}
