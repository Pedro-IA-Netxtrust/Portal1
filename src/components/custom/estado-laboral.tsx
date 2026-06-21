"use client";

import React from "react";
import { Trabajador } from "@/store/trabajadores-store";
import { CicloVidaTrabajador } from "@/store/ciclo-vida-store";
import { getEstadoLaboralDerivado } from "@/lib/bloqueos-contextuales";

interface EstadoLaboralProps {
  trabajador: Trabajador | null | undefined;
  ciclo: CicloVidaTrabajador | null | undefined;
  compact?: boolean;
}

export default function EstadoLaboral({
  trabajador,
  ciclo,
  compact = false,
}: EstadoLaboralProps) {
  const estado = getEstadoLaboralDerivado(trabajador, ciclo);

  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-900", ring: "ring-blue-400/40" },
    amber: { bg: "bg-amber-50", text: "text-amber-900", ring: "ring-amber-400/40" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-900", ring: "ring-emerald-400/40" },
    purple: { bg: "bg-purple-50", text: "text-purple-900", ring: "ring-purple-400/40" },
    red: { bg: "bg-red-50", text: "text-red-900", ring: "ring-red-400/40" },
    slate: { bg: "bg-slate-50", text: "text-slate-900", ring: "ring-slate-400/40" },
  };

  const colorClass = colorMap[estado.color] || colorMap.slate;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm ${colorClass.bg} ${colorClass.text} ring-1 ${colorClass.ring}`}>
        <span className="text-lg">{estado.icono}</span>
        <span>{estado.descripcion}</span>
      </span>
    );
  }

  return (
    <div className={`${colorClass.bg} border-l-4 rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{estado.icono}</span>
        <div className="flex-1">
          <p className={`font-bold text-lg ${colorClass.text}`}>{estado.descripcion}</p>
          <p className={`text-sm mt-2 ${colorClass.text} opacity-90`}>
            Estado actual: <strong>{estado.estado}</strong>
          </p>

          {/* Acciones permitidas */}
          {estado.acciones_permitidas.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-bold uppercase mb-2 ${colorClass.text} opacity-75`}>
                Acciones permitidas
              </p>
              <div className="flex flex-wrap gap-2">
                {estado.acciones_permitidas.map((accion) => (
                  <span
                    key={accion}
                    className={`text-xs px-2 py-1 rounded ${colorClass.bg} border ${
                      colorClass.text === "text-blue-900"
                        ? "border-blue-300"
                        : colorClass.text === "text-amber-900"
                        ? "border-amber-300"
                        : colorClass.text === "text-emerald-900"
                        ? "border-emerald-300"
                        : "border-slate-300"
                    }`}
                  >
                    ✓ {accion.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acciones bloqueadas */}
          {estado.acciones_bloqueadas.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-bold uppercase mb-2 ${colorClass.text} opacity-75`}>
                Acciones bloqueadas
              </p>
              <div className="flex flex-wrap gap-2">
                {estado.acciones_bloqueadas.map((accion) => (
                  <span
                    key={accion}
                    className={`text-xs px-2 py-1 rounded bg-slate-100 border border-slate-300 text-slate-600 opacity-60`}
                  >
                    ✗ {accion.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
