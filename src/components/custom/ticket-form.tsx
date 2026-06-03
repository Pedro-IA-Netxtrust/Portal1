"use client";

import React, { useState, useEffect } from "react";
import { Ticket, useTicketsStore } from "@/store/tickets-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useActivosStore } from "@/store/activos-store";
import { X, Save, AlertCircle, Info } from "lucide-react";

interface TicketFormProps {
  onClose: () => void;
}

export default function TicketForm({ onClose }: TicketFormProps) {
  const { addTicket } = useTicketsStore();
  const { trabajadores } = useTrabajadoresStore();
  const { activos } = useActivosStore();

  // Form State
  const [formData, setFormData] = useState({
    id_trabajador_solicitante: "",
    id_activo_relacionado: "" as string | null,
    tipo: "Incidencia" as "Incidencia" | "Requerimiento" | "Consulta",
    categoria: "Hardware" as "Hardware" | "Software" | "Red" | "Accesos" | "Otros",
    prioridad: "Media" as "Baja" | "Media" | "Alta" | "Critica",
    id_tecnico_responsable: null as string | null,
    asunto: "",
    descripcion: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter assets owned by the selected requester (Very premium cross-referencing!)
  const [requesterAssets, setRequesterAssets] = useState<typeof activos>([]);

  useEffect(() => {
    if (formData.id_trabajador_solicitante) {
      const owned = activos.filter(
        a => a.id_trabajador_asignado === formData.id_trabajador_solicitante && a.estado !== "Baja"
      );
      setRequesterAssets(owned);
      
      // Auto-select asset if there's only one
      if (owned.length === 1) {
        setFormData(prev => ({ ...prev, id_activo_relacionado: owned[0].id_activo }));
      } else {
        setFormData(prev => ({ ...prev, id_activo_relacionado: "" }));
      }
    } else {
      setRequesterAssets([]);
      setFormData(prev => ({ ...prev, id_activo_relacionado: "" }));
    }
  }, [formData.id_trabajador_solicitante, activos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id_trabajador_solicitante) newErrors.id_trabajador_solicitante = "Debe elegir un solicitante";
    if (!formData.asunto.trim()) newErrors.asunto = "El asunto es obligatorio";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addTicket({
      id_trabajador_solicitante: formData.id_trabajador_solicitante,
      id_activo_relacionado: formData.id_activo_relacionado || null,
      tipo: formData.tipo,
      categoria: formData.categoria,
      prioridad: formData.prioridad,
      id_tecnico_responsable: null,
      asunto: formData.asunto,
      descripcion: formData.descripcion
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-md font-bold text-white">
              Abrir Ticket de Soporte TI
            </h2>
            <p className="text-[11px] text-zinc-500">
              Registre incidentes, requerimientos o solicitudes de accesos para el equipo de TI
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Solicitante */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">Colaborador Solicitante *</label>
            <select
              name="id_trabajador_solicitante"
              value={formData.id_trabajador_solicitante}
              onChange={handleChange}
              className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                errors.id_trabajador_solicitante ? "border-red-500/50" : "border-zinc-800"
              }`}
            >
              <option value="">-- Buscar Persona --</option>
              {trabajadores.map(t => (
                <option key={t.id_trabajador} value={t.id_trabajador}>
                  {t.nombre_1} {t.apellido_paterno} ({t.numero_identificacion})
                </option>
              ))}
            </select>
            {errors.id_trabajador_solicitante && (
              <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.id_trabajador_solicitante}</p>
            )}
          </div>

          {/* Activo Relacionado */}
          {formData.id_trabajador_solicitante && (
            <div className="space-y-1.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 animate-fadeIn">
              <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                <span>Vincular Activo Asignado (Opcional)</span>
              </label>
              <select
                name="id_activo_relacionado"
                value={formData.id_activo_relacionado || ""}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Ninguno (No aplica) --</option>
                {requesterAssets.map(a => (
                  <option key={a.id_activo} value={a.id_activo}>
                    {a.tipo === "Notebook" ? "💻" : "🚗"} {a.marca} {a.modelo} ({a.identificador_unico})
                  </option>
                ))}
              </select>
              {requesterAssets.length > 0 ? (
                <p className="text-[9px] text-zinc-500 flex items-center gap-1 mt-1">
                  <Info size={9} />
                  Se listan los computadores y vehículos asignados activos a esta persona.
                </p>
              ) : (
                <p className="text-[9px] text-zinc-600 italic mt-1">
                  Esta persona no tiene activos asignados vigentes.
                </p>
              )}
            </div>
          )}

          {/* Tipo, Categoría, Prioridad */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Tipo *</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Incidencia">Incidencia</option>
                <option value="Requerimiento">Requerimiento</option>
                <option value="Consulta">Consulta</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Categoría *</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Red">Red / VPN</option>
                <option value="Accesos">Accesos / Cuentas</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Prioridad *</label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Critica">Crítica (SLA 2h)</option>
              </select>
            </div>
          </div>

          {/* Asunto */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">Asunto del Requerimiento *</label>
            <input
              type="text"
              name="asunto"
              placeholder="Ej: Falla en VPN corporativa, Pantalla rota de notebook, Restablecer clave ERP"
              value={formData.asunto}
              onChange={handleChange}
              className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                errors.asunto ? "border-red-500/50" : "border-zinc-800"
              }`}
            />
            {errors.asunto && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.asunto}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">Descripción Detallada *</label>
            <textarea
              name="descripcion"
              rows={4}
              placeholder="Proporcione todos los detalles del incidente para facilitar el diagnóstico del equipo de soporte TI."
              value={formData.descripcion}
              onChange={handleChange}
              className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 resize-none ${
                errors.descripcion ? "border-red-500/50" : "border-zinc-800"
              }`}
            />
            {errors.descripcion && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.descripcion}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 flex-shrink-0">
          <div className="text-[10px] text-zinc-500">
            * Campos requeridos
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            >
              <Save size={12} />
              Enviar Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
