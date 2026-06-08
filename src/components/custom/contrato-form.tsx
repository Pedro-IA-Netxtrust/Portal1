"use client";

import React, { useState, useEffect } from "react";
import { useContratosStore, type CentroCosto, type ContratoUnidad } from "@/store/contratos-store";
import { useMandantesStore } from "@/store/mandantes-store";
import { X, Save, Plus, Trash2, ShieldAlert } from "lucide-react";

interface ContratoFormProps {
  contratoId?: string;
  onClose: () => void;
}

export default function ContratoForm({ contratoId, onClose }: ContratoFormProps) {
  const { contratos, addContrato, updateContrato } = useContratosStore();
  const { mandantes } = useMandantesStore();
  const isEditing = !!contratoId;

  // Form State
  const [formData, setFormData] = useState({
    codigo_contrato: "",
    nombre_contrato: "",
    id_mandante: mandantes[0]?.id_mandante ?? "",
    fecha_inicio: "",
    fecha_termino: "",
    estado: "Activo" as "Activo" | "Cerrado" | "En Preparación" | "Suspendido",
    centros_costo: [] as CentroCosto[],
    unidades: [] as ContratoUnidad[],
    cargos: [] as any[],
    trabajadores_asignados: [] as any[],
    proveedores_asignados: [] as any[],
    historial: [] as any[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && contratoId) {
      const existing = contratos.find(c => c.id_contrato === contratoId);
      if (existing) {
        const { id_contrato, ...rest } = existing;
        setFormData(rest);
      }
    }
  }, [isEditing, contratoId, contratos]);

  // Handle basic inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // --- Dynamic Centros de Costo ---
  const handleAddCC = () => {
    setFormData(prev => ({
      ...prev,
      centros_costo: [
        ...prev.centros_costo,
        { id_cc: `cc-${Date.now()}`, codigo_cc: "", nombre_cc: "" }
      ]
    }));
  };

  const handleRemoveCC = (id: string) => {
    setFormData(prev => ({
      ...prev,
      centros_costo: prev.centros_costo.filter(cc => cc.id_cc !== id)
    }));
  };

  const handleCCChange = (id: string, field: keyof Omit<CentroCosto, "id_cc">, value: string) => {
    setFormData(prev => ({
      ...prev,
      centros_costo: prev.centros_costo.map(cc => 
        cc.id_cc === id ? { ...cc, [field]: value } : cc
      )
    }));
  };

  // --- Dynamic Unidades ---
  const handleAddUnidad = () => {
    setFormData(prev => ({
      ...prev,
      unidades: [
        ...prev.unidades,
        { id_unidad: `u-${Date.now()}`, nombre: "", activa: true }
      ]
    }));
  };

  const handleRemoveUnidad = (id: string) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.filter(u => u.id_unidad !== id)
    }));
  };

  const handleUnidadChange = (id: string, field: "nombre" | "descripcion", value: string) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.map(u =>
        u.id_unidad === id ? { ...u, [field]: value } : u
      )
    }));
  };

  // --- Validate Form ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo_contrato.trim()) newErrors.codigo_contrato = "Código obligatorio";
    if (!formData.nombre_contrato.trim()) newErrors.nombre_contrato = "Nombre de contrato obligatorio";
    if (!formData.id_mandante) newErrors.id_mandante = "Mandante obligatorio";
    if (!formData.fecha_inicio) newErrors.fecha_inicio = "Fecha de inicio obligatoria";
    if (!formData.fecha_termino) newErrors.fecha_termino = "Fecha de término obligatoria";

    formData.centros_costo.forEach((cc, idx) => {
      if (!cc.codigo_cc.trim() || !cc.nombre_cc.trim()) {
        newErrors[`cc-${idx}`] = "Faltan completar campos en el Centro de Costo";
      }
    });

    formData.unidades.forEach((u, idx) => {
      if (!u.nombre.trim()) {
        newErrors[`u-${idx}`] = "Nombre de unidad obligatorio";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing && contratoId) {
      updateContrato(contratoId, formData);
    } else {
      addContrato(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-md font-bold text-white">
              {isEditing ? "Editar Estructura de Contrato" : "Crear Nuevo Contrato"}
            </h2>
            <p className="text-[11px] text-zinc-500">
              Configure el contrato maestro, sus centros de costo y divisiones operacionales
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Contrato base */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-1.5">
              1. Datos del Contrato Maestro
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Código Único *</label>
                <input
                  type="text"
                  name="codigo_contrato"
                  placeholder="Ej: CON-2026-NTE"
                  value={formData.codigo_contrato}
                  onChange={handleChange}
                  className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                    errors.codigo_contrato ? "border-red-500/50" : "border-zinc-800"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Mandante *</label>
                <select
                  name="id_mandante"
                  value={formData.id_mandante}
                  onChange={handleChange}
                  className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                    errors.id_mandante ? "border-red-500/50" : "border-zinc-800"
                  }`}
                >
                  <option value="">Seleccionar mandante...</option>
                  {mandantes.filter(m => m.activo).map(m => (
                    <option key={m.id_mandante} value={m.id_mandante}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Nombre del Contrato *</label>
              <input
                type="text"
                name="nombre_contrato"
                placeholder="Ej: Servicio de Monitoreo Zona Norte"
                value={formData.nombre_contrato}
                onChange={handleChange}
                className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.nombre_contrato ? "border-red-500/50" : "border-zinc-800"
                }`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Fecha Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Fecha Término *</label>
                <input
                  type="date"
                  name="fecha_termino"
                  value={formData.fecha_termino}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Estado *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="En Preparación">En Preparación</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Centros de Costo */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                2. Centros de Costo Vinculados
              </h3>
              <button
                type="button"
                onClick={handleAddCC}
                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white rounded flex items-center gap-1 transition-all"
              >
                <Plus size={12} />
                Añadir CC
              </button>
            </div>

            <div className="space-y-3">
              {formData.centros_costo.map((cc, idx) => (
                <div 
                  key={cc.id_cc}
                  className="flex gap-3 items-center bg-zinc-900/30 p-3 rounded-lg border border-zinc-900 animate-slideIn"
                >
                  <div className="w-1/3">
                    <input
                      type="text"
                      placeholder="Código CC-4000"
                      value={cc.codigo_cc}
                      onChange={(e) => handleCCChange(cc.id_cc, "codigo_cc", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nombre Centro de Costo"
                      value={cc.nombre_cc}
                      onChange={(e) => handleCCChange(cc.id_cc, "nombre_cc", e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCC(cc.id_cc)}
                    className="p-2 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {errors["cc-0"] && (
                <p className="text-[10px] text-red-400 flex items-center gap-1"><ShieldAlert size={10} /> Complete todos los campos de los Centros de Costo</p>
              )}

              {formData.centros_costo.length === 0 && (
                <p className="text-xs text-zinc-500 italic text-center py-2 bg-zinc-900/10 rounded-lg border border-zinc-900 border-dashed">
                  Sin centros de costo definidos. Haz clic en "Añadir CC".
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Unidades Operativas */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                3. Unidades Operativas & Cargos Habilitados
              </h3>
              <button
                type="button"
                onClick={handleAddUnidad}
                className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white rounded flex items-center gap-1 transition-all"
              >
                <Plus size={12} />
                Añadir Unidad
              </button>
            </div>

            <div className="space-y-4">
              {formData.unidades.map((u, idx) => (
                <div 
                  key={u.id_unidad}
                  className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-900 space-y-3 relative animate-slideIn"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveUnidad(u.id_unidad)}
                    className="absolute right-3 top-3 p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 gap-3 pr-8">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase">Nombre Unidad *</label>
                      <input
                        type="text"
                        placeholder="Ej: Unidad de Monitoreo Ambiental"
                        value={u.nombre}
                        onChange={(e) => handleUnidadChange(u.id_unidad, "nombre", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded p-2 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase">Descripción (opcional)</label>
                      <input
                        type="text"
                        placeholder="Descripción de la unidad"
                        value={u.descripcion ?? ""}
                        onChange={(e) => handleUnidadChange(u.id_unidad, "descripcion", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded p-2 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {formData.unidades.length === 0 && (
                <p className="text-xs text-zinc-500 italic text-center py-2 bg-zinc-900/10 rounded-lg border border-zinc-900 border-dashed">
                  Sin unidades operativas definidas. Haz clic en "Añadir Unidad".
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 flex-shrink-0">
          <div className="text-[10px] text-zinc-500">
            * Campos requeridos obligatoriamente
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
              Guardar Estructura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
