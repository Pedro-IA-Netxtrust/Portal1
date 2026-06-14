"use client";

import { useEffect } from "react";

/**
 * Fallback de último recurso: se activa si el propio `layout.tsx` raíz lanza.
 * Debe incluir `<html>` y `<body>` porque reemplaza al root layout completo.
 * Mantener intencionalmente sin dependencias de estilos del proyecto para
 * minimizar el riesgo de cascada de errores.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0a0a0a",
          color: "#f5f5f5",
        }}
      >
        <div style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            Error crítico de la aplicación
          </h1>
          <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 20 }}>
            El portal no pudo cargar la interfaz principal. Si el problema
            persiste, contacta a Administración.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                opacity: 0.6,
                marginBottom: 20,
              }}
            >
              ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#1a1a1a",
              color: "#f5f5f5",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
