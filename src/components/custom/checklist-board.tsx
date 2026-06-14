"use client";

import React, { useState } from "react";
import {
  useOnboardingStore,
  FaseOnboarding,
  FaseProgress,
  TareaOnboarding,
} from "@/store/onboarding-store";
import { CheckCircle2, Circle, Calendar, User } from "lucide-react";

interface ChecklistBoardProps {
  idTrabajador: string;
  editable?: boolean;
}

export default function ChecklistBoard({ idTrabajador, editable = true }: ChecklistBoardProps) {
  const { getTareasByFase, getFasesProgress, completarTarea } = useOnboardingStore();
  const fasesProgress = getFasesProgress(idTrabajador);

  const FASES: FaseOnboarding[] = [
    "datos_personales",
    "laboral",
    "administracion",
    "seguridad_control",
    "equipamiento",
    "operacion",
  ];

  const FASE_LABELS: Record<FaseOnboarding, string> = {
    datos_personales: "📋 Datos Personales",
    laboral: "💼 Laboral",
    administracion: "🏦 Administración",
    seguridad_control: "⚠️ Seguridad",
    equipamiento: "📦 Equipamiento",
    operacion: "⚙️ Operación",
  };

  return (
    <div className="space-y-6">
      {FASES.map((fase) => {
        const tareas = getTareasByFase(idTrabajador, fase);
        const progress = fasesProgress.find((f) => f.fase === fase);

        if (!progress || tareas.length === 0) return null;

        return (
          <FaseSection
            key={fase}
            fase={fase}
            label={FASE_LABELS[fase]}
            progress={progress}
            tareas={tareas}
            editable={editable}
            idTrabajador={idTrabajador}
            onCompletarTarea={completarTarea}
          />
        );
      })}
    </div>
  );
}

interface FaseSectionProps {
  fase: FaseOnboarding;
  label: string;
  progress: FaseProgress;
  tareas: TareaOnboarding[];
  editable: boolean;
  idTrabajador: string;
  onCompletarTarea: (id: string, obs?: string) => Promise<boolean>;
}

function FaseSection({
  label,
  progress,
  tareas,
  editable,
  onCompletarTarea,
}: FaseSectionProps) {
  const [expandida, setExpandida] = useState(false);

  const tareasIncompletas = tareas.filter((t) => !t.completada);
  const tareasCompletadas = tareas.filter((t) => t.completada);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpandida(!expandida)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="text-lg">{label.split(" ")[0]}</div>
          <div>
            <p className="font-semibold text-slate-900 text-left">{label.split(" ").slice(1).join(" ")}</p>
            <p className="text-xs text-slate-600">
              {progress.tareas_completadas} de {progress.tareas_total} completadas
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="w-32 bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                progress.completada ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress.porcentaje}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700 w-12 text-right">
            {progress.porcentaje}%
          </span>
        </div>
      </button>

      {/* Content */}
      {expandida && (
        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            {/* Tareas Incompletas */}
            {tareasIncompletas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase">Pendientes</p>
                <div className="space-y-2">
                  {tareasIncompletas.map((tarea) => (
                    <TareaItem
                      key={tarea.id}
                      tarea={tarea}
                      editable={editable}
                      onCompletarTarea={onCompletarTarea}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tareas Completadas */}
            {tareasCompletadas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase">Completadas</p>
                <div className="space-y-2 opacity-60">
                  {tareasCompletadas.map((tarea) => (
                    <TareaItem
                      key={tarea.id}
                      tarea={tarea}
                      editable={false}
                      onCompletarTarea={onCompletarTarea}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface TareaItemProps {
  tarea: TareaOnboarding;
  editable: boolean;
  onCompletarTarea: (id: string, obs?: string) => Promise<boolean>;
}

function TareaItem({ tarea, editable, onCompletarTarea }: TareaItemProps) {
  const [completando, setCompletando] = useState(false);
  const [mostrarObs, setMostrarObs] = useState(false);
  const [observacion, setObservacion] = useState(tarea.observaciones || "");

  const handleCompletar = async () => {
    setCompletando(true);
    try {
      await onCompletarTarea(tarea.id, observacion);
      setMostrarObs(false);
    } finally {
      setCompletando(false);
    }
  };

  const getDiasRestantes = (fecha?: string): number | null => {
    if (!fecha) return null;
    const hoy = new Date();
    const limite = new Date(fecha);
    const dias = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : null;
  };

  const diasRestantes = getDiasRestantes(tarea.fecha_limite);

  return (
    <div className={`p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3 ${
      tarea.completada ? "opacity-60" : ""
    }`}>
      <button
        type="button"
        onClick={() => !tarea.completada && editable && handleCompletar()}
        disabled={tarea.completada || !editable || completando}
        className={`mt-0.5 flex-shrink-0 ${
          !tarea.completada && editable ? "cursor-pointer" : "cursor-default"
        }`}
        aria-label={tarea.completada ? "Tarea completada" : "Marcar como completada"}
      >
        {tarea.completada ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : (
          <Circle size={20} className="text-slate-400 hover:text-slate-600" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${tarea.completada ? "line-through text-slate-500" : "text-slate-900"}`}>
          {tarea.nombre}
        </p>
        <p className="text-xs text-slate-600 mt-0.5">{tarea.descripcion}</p>

        {/* Metadata */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
          {tarea.responsable && (
            <span className="flex items-center gap-1">
              <User size={14} />
              {tarea.responsable}
            </span>
          )}
          {tarea.fecha_limite && (
            <span className={`flex items-center gap-1 ${
              diasRestantes !== null && diasRestantes < 7 ? "text-amber-600" : ""
            }`}>
              <Calendar size={14} />
              {new Date(tarea.fecha_limite).toLocaleDateString()}
              {diasRestantes !== null && ` (${diasRestantes}d)`}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            tarea.tipo === "auto"
              ? "bg-blue-100 text-blue-700"
              : tarea.tipo === "manual"
              ? "bg-purple-100 text-purple-700"
              : tarea.tipo === "actividad"
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}>
            {tarea.tipo === "auto" ? "Auto" : tarea.tipo === "manual" ? "Manual" : tarea.tipo === "actividad" ? "Actividad" : "Transacción"}
          </span>
        </div>

        {/* Completa si está pendiente y es editable */}
        {!tarea.completada && editable && (
          <div className="mt-3">
            {!mostrarObs ? (
              <button
                onClick={() => setMostrarObs(true)}
                className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 font-semibold transition-colors"
              >
                ✓ Marcar como completada
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Notas (opcional)"
                  className="w-full text-xs p-2 border border-slate-200 rounded"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCompletar}
                    disabled={completando}
                    className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                  >
                    {completando ? "..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setMostrarObs(false)}
                    className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Muestra observaciones si está completada */}
        {tarea.completada && tarea.observaciones && (
          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
            <p className="font-semibold">Notas:</p>
            <p>{tarea.observaciones}</p>
          </div>
        )}
      </div>

      {/* Fecha completada */}
      {tarea.completada && tarea.fecha_completada && (
        <div className="text-xs text-emerald-700 text-right flex-shrink-0">
          <CheckCircle2 size={16} className="mx-auto mb-1" />
          {new Date(tarea.fecha_completada).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
