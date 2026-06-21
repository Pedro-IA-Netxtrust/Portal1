"use client";

import React from "react";
import { Trabajador } from "@/store/trabajadores-store";
import { CicloVidaTrabajador } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { AlertaUrgencia, getAlertasUrgencia } from "@/lib/bloqueos-contextuales";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface AlertasTrabajadorProps {
  trabajador: Trabajador | null | undefined;
  ciclo: CicloVidaTrabajador | null | undefined;
  compact?: boolean;
}

export default function AlertasTrabajador({
  trabajador,
  ciclo,
  compact = false,
}: AlertasTrabajadorProps) {
  const getProgressByTrabajador = useOnboardingStore((s) => s.getProgressByTrabajador);

  const progress = trabajador
    ? getProgressByTrabajador(trabajador.id_trabajador)
    : undefined;

  const alertas = getAlertasUrgencia(
    trabajador,
    ciclo,
    progress?.porcentaje_total
  );

  if (alertas.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {alertas.slice(0, 2).map((alerta, idx) => (
          <AlertaBadge key={idx} alerta={alerta} />
        ))}
        {alertas.length > 2 && (
          <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-full font-semibold">
            +{alertas.length - 2} más
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta, idx) => (
        <AlertaCard key={idx} alerta={alerta} />
      ))}
    </div>
  );
}

function AlertaBadge({ alerta }: { alerta: AlertaUrgencia }) {
  const iconMap = {
    critica: <AlertCircle size={14} />,
    advertencia: <AlertTriangle size={14} />,
    info: <Info size={14} />,
  };

  const bgMap = {
    critica: "bg-red-100 text-red-800",
    advertencia: "bg-amber-100 text-amber-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${bgMap[alerta.nivel]}`}>
      {iconMap[alerta.nivel]}
      {alerta.titulo}
    </span>
  );
}

function AlertaCard({ alerta }: { alerta: AlertaUrgencia }) {
  const colorMap = {
    critica: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", icon: "text-red-600" },
    advertencia: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", icon: "text-amber-600" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "text-blue-600" },
  };

  const color = colorMap[alerta.nivel];
  const iconMap = {
    critica: <AlertCircle size={20} />,
    advertencia: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`p-4 rounded-lg border ${color.bg} ${color.border} flex gap-3`}>
      <div className={`${color.icon} flex-shrink-0 mt-0.5`}>{iconMap[alerta.nivel]}</div>
      <div className="flex-1">
        <p className={`font-semibold ${color.text}`}>{alerta.titulo}</p>
        <p className={`text-sm mt-1 ${color.text} opacity-90`}>{alerta.descripcion}</p>
      </div>
      {alerta.accion && (
        <button className={`text-sm font-semibold px-3 py-1 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap mt-0.5 ${color.bg} border ${color.border}`}>
          {alerta.accion}
        </button>
      )}
    </div>
  );
}
