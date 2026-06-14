"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Error boundary a nivel de segmento raíz. Aísla crashes de cualquier página
 * para que el `layout.tsx` (sidebar + header + notifications-center) siga
 * funcionando. Para errores del propio root layout, ver `global-error.tsx`.
 *
 * API de Next.js 16.2+: usar `unstable_retry` (reemplaza al `reset` previo).
 */
export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // En producción esto debería ir a un servicio (Sentry / Logflare / etc.).
    // Por ahora, log local para que sea visible en la consola durante dev.
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="card border-danger/40 bg-danger/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-danger/10 text-danger flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-bold text-text">
                Ocurrió un error al cargar esta sección
              </h2>
              <p className="text-sm text-text-soft font-medium mt-1">
                El resto de la aplicación sigue disponible desde el menú lateral.
              </p>
            </div>

            {error.message && (
              <pre className="text-xs bg-bg-alt border border-border rounded-lg p-3 overflow-x-auto text-text-soft">
                {error.message}
              </pre>
            )}

            {error.digest && (
              <p className="text-[11px] text-text-muted font-mono">
                ID interno: {error.digest}
              </p>
            )}

            <button
              type="button"
              onClick={() => unstable_retry()}
              className="btn btn-primary text-sm"
            >
              <RotateCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
