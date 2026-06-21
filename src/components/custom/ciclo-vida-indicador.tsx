"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { useCicloVidaStore, EstadoCicloVida, HistorialEstado } from "@/store/ciclo-vida-store";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";

interface CicloVidaIndicadorProps {
  idTrabajador: string;
  compact?: boolean;
}

const ESTADO_CONFIG: Record<EstadoCicloVida, {
  label: string;
  color: string;
  bgColor: string;
  icono: React.ReactNode;
  descripcion: string;
}> = {
  nuevo_ingreso: {
    label: "Nuevo Ingreso",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icono: "🆕",
    descripcion: "Trabajador recién creado en el sistema",
  },
  pre_incorporacion: {
    label: "Pre-Incorporación",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    icono: "⏳",
    descripcion: "Completando checklist de onboarding",
  },
  activo: {
    label: "Activo",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    icono: "🟢",
    descripcion: "Trabajador habilitado para operar",
  },
  cambio_rol: {
    label: "Cambio de Rol",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icono: "🔄",
    descripcion: "En transición de cargo/contrato",
  },
  baja: {
    label: "Baja",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icono: "🚫",
    descripcion: "Trabajador dado de baja",
  },
  archivado: {
    label: "Archivado",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    icono: "📦",
    descripcion: "Registro archivado para historial",
  },
};

export default function CicloVidaIndicador({ idTrabajador, compact = false }: CicloVidaIndicadorProps) {
  const { getCicloByTrabajador, getTransicionesPermitidas, transicionarEstado, inicializarCiclo } = useCicloVidaStore(
    useShallow((s) => ({
      getCicloByTrabajador: s.getCicloByTrabajador,
      getTransicionesPermitidas: s.getTransicionesPermitidas,
      transicionarEstado: s.transicionarEstado,
      inicializarCiclo: s.inicializarCiclo,
    }))
  );
  const ciclo = getCicloByTrabajador(idTrabajador);

  if (!ciclo) {
    if (compact) {
      return (
        <button
          onClick={() => inicializarCiclo(idTrabajador)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Iniciar ciclo de vida"
        >
          <span>➕</span>
          <span>Sin ciclo</span>
        </button>
      );
    }
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
        <p className="text-3xl mb-2">📋</p>
        <h3 className="text-lg font-bold text-slate-900">Ciclo de vida no iniciado</h3>
        <p className="text-sm text-slate-600 mt-1 mb-4">
          Este trabajador aún no tiene un ciclo de vida registrado.
        </p>
        <button
          onClick={() => inicializarCiclo(idTrabajador)}
          className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Iniciar ciclo de vida
        </button>
      </div>
    );
  }

  const estadoActual = ESTADO_CONFIG[ciclo.estado_actual];
  const transicionesPermitidas = getTransicionesPermitidas(ciclo.estado_actual);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm ${estadoActual.bgColor} ${estadoActual.color}`}>
        <span>{estadoActual.icono}</span>
        <span>{estadoActual.label}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Estado del Ciclo de Vida</h3>

      {/* Estado Actual */}
      <div className={`${estadoActual.bgColor} border-2 border-dashed rounded-lg p-6 mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl">{estadoActual.icono}</p>
            <p className={`text-lg font-bold mt-2 ${estadoActual.color}`}>{estadoActual.label}</p>
            <p className="text-sm text-slate-600 mt-1">{estadoActual.descripcion}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Desde</p>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(ciclo.historial[ciclo.historial.length - 1]?.fecha_transicion || new Date()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transiciones Permitidas */}
      {transicionesPermitidas.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Transiciones Disponibles</p>
          <div className="flex flex-wrap gap-2">
            {transicionesPermitidas.map((estadoProximo) => {
              const configProximo = ESTADO_CONFIG[estadoProximo];
              return (
                <button
                  key={estadoProximo}
                  onClick={() => transicionarEstado(idTrabajador, estadoProximo, "Manual")}
                  className={`px-3 py-2 rounded-lg border-2 border-dashed text-sm font-semibold transition-all hover:shadow-md ${
                    configProximo.bgColor
                  } ${configProximo.color}`}
                >
                  <span className="flex items-center gap-2">
                    {configProximo.icono}
                    {configProximo.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Historial de Cambios</p>
        <div className="space-y-3">
          {ciclo.historial.slice().reverse().map((evento, idx) => (
            <HistorialItem key={idx} evento={evento} />
          ))}
        </div>
      </div>

      {/* Info Adicional por Estado */}
      {ciclo.estado_actual === "pre_incorporacion" && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">En proceso de incorporación</p>
            <p className="mt-1">Completa el checklist de onboarding para habilitar al trabajador en operación.</p>
          </div>
        </div>
      )}

      {ciclo.estado_actual === "baja" && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-semibold text-red-900 mb-2">Motivo de baja</p>
          <p className="text-sm text-red-800">{ciclo.motivo_baja || "No especificado"}</p>
          <p className="text-sm text-red-700 mt-2">
            Fecha: {new Date(ciclo.fecha_baja || new Date()).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

function HistorialItem({ evento }: { evento: HistorialEstado }) {
  const estadoAnterior = evento.estado_anterior ? ESTADO_CONFIG[evento.estado_anterior] : null;
  const estadoNuevo = ESTADO_CONFIG[evento.estado_nuevo];

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <Clock size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {estadoAnterior && (
            <>
              <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
                {estadoAnterior.icono} {estadoAnterior.label}
              </span>
              <ArrowRight size={16} className="text-slate-400" />
            </>
          )}
          <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">
            {estadoNuevo.icono} {estadoNuevo.label}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          {new Date(evento.fecha_transicion).toLocaleDateString()} • {evento.ejecutado_por}
        </p>
        {evento.razon && <p className="text-xs text-slate-700 mt-1">Razón: {evento.razon}</p>}
      </div>
    </div>
  );
}
