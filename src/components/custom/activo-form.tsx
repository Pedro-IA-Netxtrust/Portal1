"use client";

import React, { useState, useEffect } from "react";
import { Activo, useActivosStore, LicenciaSoftware } from "@/store/activos-store";
import { X, Save, ShieldAlert, Plus, Trash2, Key, Calendar } from "lucide-react";

interface ActivoFormProps {
  activoId?: string; // If provided, we are editing
  defaultTipo?: "Notebook" | "Vehículo";
  onClose: () => void;
}

export default function ActivoForm({ activoId, defaultTipo, onClose }: ActivoFormProps) {
  const { activos, addActivo, updateActivo } = useActivosStore();
  const isEditing = !!activoId;

  // Form State
  const [formData, setFormData] = useState<Omit<Activo, "id_activo">>({
    tipo: defaultTipo || "Notebook",
    marca: "",
    modelo: "",
    identificador_unico: "",
    estado: "Disponible",
    id_trabajador_asignado: null,
    detalles_adicionales: {
      procesador: "",
      ram_gb: 8,
      almacenamiento_gb: 256,
      kilometraje_actual: 0,
      vencimiento_revision_tecnica: "",
      tipo_combustible: "Diésel",
      // Nuevos campos de compra
      fecha_compra: "",
      proveedor: "",
      numero_factura_oc: "",
      valor_compra: 0,
      moneda: "CLP",
      fecha_vencimiento_garantia: "",
      licencias: []
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && activoId) {
      const existing = activos.find(a => a.id_activo === activoId);
      if (existing) {
        const { id_activo, ...rest } = existing;
        setFormData(rest);
      }
    }
  }, [isEditing, activoId, activos]);

  // Handle standard changes
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

  // Handle sub-details (detalles_adicionales) changes
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let finalValue: any = value;
    if (name === "ram_gb" || name === "almacenamiento_gb" || name === "kilometraje_actual" || name === "valor_compra") {
      finalValue = Number(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      detalles_adicionales: {
        ...prev.detalles_adicionales,
        [name]: finalValue
      }
    }));
  };

  // Gestión de Licencias de Software
  const addLicencia = () => {
    const newLic: LicenciaSoftware = {
      id: `lic-${Date.now()}`,
      nombre: "",
      tipo: "Office",
      version: "",
      clave_producto: "",
      fecha_vencimiento: "",
      activa: true
    };
    setFormData(prev => ({
      ...prev,
      detalles_adicionales: {
        ...prev.detalles_adicionales,
        licencias: [...(prev.detalles_adicionales.licencias || []), newLic]
      }
    }));
  };

  const removeLicencia = (id: string) => {
    setFormData(prev => ({
      ...prev,
      detalles_adicionales: {
        ...prev.detalles_adicionales,
        licencias: (prev.detalles_adicionales.licencias || []).filter(l => l.id !== id)
      }
    }));
  };

  const updateLicenciaField = (id: string, field: keyof LicenciaSoftware, value: any) => {
    setFormData(prev => ({
      ...prev,
      detalles_adicionales: {
        ...prev.detalles_adicionales,
        licencias: (prev.detalles_adicionales.licencias || []).map(l => 
          l.id === id ? { ...l, [field]: value } : l
        )
      }
    }));
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.marca.trim()) newErrors.marca = "Marca obligatoria";
    if (!formData.modelo.trim()) newErrors.modelo = "Modelo obligatorio";
    if (!formData.identificador_unico.trim()) {
      newErrors.identificador_unico = formData.tipo === "Vehículo" ? "Patente obligatoria" : "Nº de Serie obligatorio";
    }

    if (formData.tipo === "Vehículo") {
      if (!formData.detalles_adicionales.vencimiento_revision_tecnica) {
        newErrors.vencimiento_revision_tecnica = "Fecha de revisión técnica obligatoria";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter sub-fields so we don't save vehicle details on notebooks and vice-versa
    const cleanDetails: any = {};
    if (formData.tipo === "Notebook") {
      cleanDetails.procesador = formData.detalles_adicionales.procesador || "";
      cleanDetails.ram_gb = formData.detalles_adicionales.ram_gb || 8;
      cleanDetails.almacenamiento_gb = formData.detalles_adicionales.almacenamiento_gb || 256;
      cleanDetails.fecha_compra = formData.detalles_adicionales.fecha_compra || "";
      cleanDetails.proveedor = formData.detalles_adicionales.proveedor || "";
      cleanDetails.numero_factura_oc = formData.detalles_adicionales.numero_factura_oc || "";
      cleanDetails.valor_compra = Number(formData.detalles_adicionales.valor_compra) || 0;
      cleanDetails.moneda = formData.detalles_adicionales.moneda || "CLP";
      cleanDetails.fecha_vencimiento_garantia = formData.detalles_adicionales.fecha_vencimiento_garantia || "";
      cleanDetails.licencias = formData.detalles_adicionales.licencias || [];
    } else {
      cleanDetails.kilometraje_actual = formData.detalles_adicionales.kilometraje_actual || 0;
      cleanDetails.vencimiento_revision_tecnica = formData.detalles_adicionales.vencimiento_revision_tecnica || "";
      cleanDetails.tipo_combustible = formData.detalles_adicionales.tipo_combustible || "Diésel";
    }

    const payload = {
      ...formData,
      detalles_adicionales: cleanDetails
    };

    if (isEditing && activoId) {
      updateActivo(activoId, payload);
    } else {
      addActivo(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div>
            <h2 className="text-md font-bold text-white">
              {isEditing ? "Editar Registro de Activo" : "Ingresar Nuevo Activo"}
            </h2>
            <p className="text-[11px] text-zinc-500">
              Complete la ficha técnica y asigne un estado operativo al activo
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Main Selects */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Tipo de Activo *</label>
              <select
                name="tipo"
                disabled={isEditing || !!defaultTipo}
                value={formData.tipo}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-40"
              >
                <option value="Notebook">Notebook (Equipo TI)</option>
                <option value="Vehículo">Vehículo (Faena / Operativo)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Estado Inicial *</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="Disponible">Disponible</option>
                <option value="En Mantención">En Mantención</option>
                <option value="Baja">Baja / Desactivado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Marca *</label>
              <input
                type="text"
                name="marca"
                placeholder="Ej: Lenovo, Toyota, HP, Nissan"
                value={formData.marca}
                onChange={handleChange}
                className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.marca ? "border-red-500/50" : "border-zinc-800"
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Modelo *</label>
              <input
                type="text"
                name="modelo"
                placeholder="Ej: ThinkPad T14, Hilux 4x4"
                value={formData.modelo}
                onChange={handleChange}
                className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.modelo ? "border-red-500/50" : "border-zinc-800"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">
              {formData.tipo === "Vehículo" ? "Patente del Vehículo *" : "Número de Serie / Identificador *"}
            </label>
            <input
              type="text"
              name="identificador_unico"
              placeholder={formData.tipo === "Vehículo" ? "Ej: SW-PK-92" : "Ej: LNV-87564921"}
              value={formData.identificador_unico}
              onChange={handleChange}
              className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                errors.identificador_unico ? "border-red-500/50" : "border-zinc-800"
              }`}
            />
          </div>

          {/* DYNAMIC FIELDSET FOR NOTEBOOKS */}
          {formData.tipo === "Notebook" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Ficha Técnica Hardware */}
              <div className="space-y-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Ficha Técnica Hardware</span>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Procesador</label>
                  <input
                    type="text"
                    name="procesador"
                    placeholder="Ej: Intel Core i7-1260P, Apple M3"
                    value={formData.detalles_adicionales.procesador || ""}
                    onChange={handleDetailChange}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Memoria RAM (GB)</label>
                    <select
                      name="ram_gb"
                      value={formData.detalles_adicionales.ram_gb || 8}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value={8}>8 GB</option>
                      <option value={16}>16 GB</option>
                      <option value={18}>18 GB</option>
                      <option value={32}>32 GB</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Almacenamiento (SSD GB)</label>
                    <select
                      name="almacenamiento_gb"
                      value={formData.detalles_adicionales.almacenamiento_gb || 256}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value={256}>256 GB</option>
                      <option value={512}>512 GB</option>
                      <option value={1000}>1 TB (1000 GB)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos de Compra y Adquisición */}
              <div className="space-y-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-850">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Datos de Adquisición / Compra</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Proveedor</label>
                    <input
                      type="text"
                      name="proveedor"
                      placeholder="Ej: PC Factory, Dell Chile"
                      value={formData.detalles_adicionales.proveedor || ""}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Factura o Nº Compra</label>
                    <input
                      type="text"
                      name="numero_factura_oc"
                      placeholder="Ej: FAC-4512 o OC-8872"
                      value={formData.detalles_adicionales.numero_factura_oc || ""}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Fecha de Compra</label>
                    <input
                      type="date"
                      name="fecha_compra"
                      value={formData.detalles_adicionales.fecha_compra || ""}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Vencimiento de Garantía</label>
                    <input
                      type="date"
                      name="fecha_vencimiento_garantia"
                      value={formData.detalles_adicionales.fecha_vencimiento_garantia || ""}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Valor de Compra</label>
                    <input
                      type="number"
                      name="valor_compra"
                      placeholder="0"
                      value={formData.detalles_adicionales.valor_compra || ""}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Moneda</label>
                    <select
                      name="moneda"
                      value={formData.detalles_adicionales.moneda || "CLP"}
                      onChange={handleDetailChange}
                      className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="CLP">Pesos Chilenos (CLP)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Licencias de Software */}
              <div className="space-y-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-850">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Licencias de Software</span>
                  <button
                    type="button"
                    onClick={addLicencia}
                    className="px-2 py-1 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-blue-400 hover:text-white rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} />
                    Agregar Licencia
                  </button>
                </div>

                {(!formData.detalles_adicionales.licencias || formData.detalles_adicionales.licencias.length === 0) ? (
                  <p className="text-[11px] text-zinc-600 text-center py-2 border border-zinc-850 border-dashed rounded-lg">
                    No hay licencias registradas para este notebook.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.detalles_adicionales.licencias.map((lic) => (
                      <div 
                        key={lic.id} 
                        className="p-3 bg-zinc-950/70 border border-zinc-850 rounded-lg space-y-2.5 relative group/lic"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              placeholder="Nombre del Software (ej: Office 365, Antivirus)"
                              value={lic.nombre}
                              onChange={(e) => updateLicenciaField(lic.id, "nombre", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white rounded p-1.5 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLicencia(lic.id)}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                            title="Eliminar Licencia"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-semibold uppercase">Tipo</label>
                            <select
                              value={lic.tipo}
                              onChange={(e) => updateLicenciaField(lic.id, "tipo", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 rounded p-1 focus:outline-none focus:border-blue-500"
                            >
                              <option value="Office">Office / Productividad</option>
                              <option value="Antivirus">Antivirus / Seguridad</option>
                              <option value="Sistema Operativo">Sistema Operativo</option>
                              <option value="Diseño">Diseño / Editor</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-semibold uppercase">Versión</label>
                            <input
                              type="text"
                              placeholder="Ej: 2026, Enterprise"
                              value={lic.version || ""}
                              onChange={(e) => updateLicenciaField(lic.id, "version", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-white rounded p-1 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 font-semibold uppercase flex items-center gap-1">
                            <Key size={8} /> Clave de Producto / Serial Key
                          </label>
                          <input
                            type="text"
                            placeholder="Código de licencia (clave)"
                            value={lic.clave_producto || ""}
                            onChange={(e) => updateLicenciaField(lic.id, "clave_producto", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-white font-mono rounded p-1 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-semibold uppercase flex items-center gap-1">
                              <Calendar size={8} /> Vencimiento
                            </label>
                            <input
                              type="date"
                              value={lic.fecha_vencimiento || ""}
                              onChange={(e) => updateLicenciaField(lic.id, "fecha_vencimiento", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-white rounded p-1 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-end h-full pt-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={lic.activa}
                                onChange={(e) => updateLicenciaField(lic.id, "activa", e.target.checked)}
                                className="rounded border-zinc-800 bg-zinc-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                              />
                              <span className="text-[11px] text-zinc-400 font-semibold">Licencia Activa</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDSET FOR VEHICLES */}
          {formData.tipo === "Vehículo" && (
            <div className="space-y-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-850 animate-fadeIn">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Ficha Técnica Automotriz</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Kilometraje Actual (Km)</label>
                  <input
                    type="number"
                    name="kilometraje_actual"
                    value={formData.detalles_adicionales.kilometraje_actual || 0}
                    onChange={handleDetailChange}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Combustible</label>
                  <select
                    name="tipo_combustible"
                    value={formData.detalles_adicionales.tipo_combustible || "Diésel"}
                    onChange={handleDetailChange}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Diésel">Diésel</option>
                    <option value="Bencina">Bencina</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Vencimiento Revisión Técnica *</label>
                <input
                  type="date"
                  name="vencimiento_revision_tecnica"
                  value={formData.detalles_adicionales.vencimiento_revision_tecnica || ""}
                  onChange={handleDetailChange}
                  className={`w-full bg-zinc-950 border text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-500 ${
                    errors.vencimiento_revision_tecnica ? "border-red-500/50" : "border-zinc-800"
                  }`}
                />
                {errors.vencimiento_revision_tecnica && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1"><ShieldAlert size={10} />{errors.vencimiento_revision_tecnica}</p>
                )}
              </div>
            </div>
          )}
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
              Guardar Activo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
