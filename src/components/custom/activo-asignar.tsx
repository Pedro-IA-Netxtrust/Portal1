"use client";

import React, { useState } from "react";
import { Activo, useActivosStore } from "@/store/activos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { X, UserPlus, Undo2, Calendar, User, ArrowRight, CheckCircle } from "lucide-react";

interface ActivoAsignarProps {
  activo: Activo;
  onClose: () => void;
}

export default function ActivoAsignar({ activo, onClose }: ActivoAsignarProps) {
  const { assignActivo, returnActivo } = useActivosStore();
  const { trabajadores } = useTrabajadoresStore();

  const isAssigned = activo.estado === "Asignado";

  // Assignment states
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState("");
  const [fechaAsignacion, setFechaAsignacion] = useState(new Date().toISOString().split("T")[0]);

  // Current assigned worker details
  const currentWorker = isAssigned 
    ? trabajadores.find(t => t.id_trabajador === activo.id_trabajador_asignado)
    : null;

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrabajadorId) return;

    assignActivo(activo.id_activo, selectedTrabajadorId, fechaAsignacion);
    onClose();
  };

  const handleReturn = () => {
    if (confirm(`¿Confirmar devolución de este activo?`)) {
      returnActivo(activo.id_activo);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white">
              {isAssigned ? "Control de Devolución de Recurso" : "Asignación de Activo Corporativo"}
            </h2>
            <p className="text-[10px] text-zinc-500">
              {activo.marca} {activo.modelo} ({activo.identificador_unico})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* CASE A: ALREADY ASSIGNED -> SHOW RETURN OPTION */}
          {isAssigned ? (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">Asignado a:</span>
                    <h3 className="text-sm font-bold text-white">
                      {currentWorker ? `${currentWorker.nombre_1} ${currentWorker.apellido_paterno}` : "Trabajador no encontrado"}
                    </h3>
                    {currentWorker && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">{currentWorker.cargo} • {currentWorker.numero_identificacion}</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar size={13} className="text-zinc-500" />
                  <span>Entregado el: <strong className="text-white">{activo.fecha_asignacion}</strong></span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleReturn}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-amber-600/20 transition-all"
                >
                  <Undo2 size={13} />
                  Registrar Devolución
                </button>
              </div>
            </div>
          ) : (
            /* CASE B: AVAILABLE -> SHOW ASSIGNMENT FORM */
            <form onSubmit={handleAssign} className="space-y-5">
              <div className="space-y-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900">
                {/* Select worker */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Seleccionar Colaborador *</label>
                  <select
                    value={selectedTrabajadorId}
                    onChange={(e) => setSelectedTrabajadorId(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Buscar Persona --</option>
                    {trabajadores.map(t => (
                      <option key={t.id_trabajador} value={t.id_trabajador}>
                        {t.nombre_1} {t.apellido_paterno} ({t.numero_identificacion})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha de Entrega *</label>
                  <input
                    type="date"
                    value={fechaAsignacion}
                    onChange={(e) => setFechaAsignacion(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
                >
                  Confirmar Asignación
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
