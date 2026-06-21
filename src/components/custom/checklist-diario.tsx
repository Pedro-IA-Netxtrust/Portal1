"use client";

import React, { useState } from "react";
import { useInspeccionesStore } from "@/store/inspecciones-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useActivosStore } from "@/store/activos-store";
import { X, Save, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";

interface ChecklistDiarioProps {
  onClose: () => void;
}

export default function ChecklistDiario({ onClose }: ChecklistDiarioProps) {
  const addInspeccionDiaria = useInspeccionesStore((s) => s.addInspeccionDiaria);
  const trabajadores = useTrabajadoresStore((s) => s.trabajadores);
  const activos = useActivosStore((s) => s.activos);

  const vehiculos = activos.filter(a => a.tipo === "Vehículo");
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().split(" ")[0].slice(0, 5);

  const [activeStep, setActiveStep] = useState<"datos" | "exterior" | "luces" | "interior" | "seguridad">("datos");

  // Form State
  const [formData, setFormData] = useState({
    id_trabajador_conductor: "",
    id_activo_vehiculo: "",
    fecha: today,
    hora: nowTime,
    kilometraje: 0,
    
    // Section 1: Exterior
    carroceria: "Bueno" as "Bueno" | "Regular" | "Malo",
    parachoques_delantero: "Bueno" as "Bueno" | "Regular" | "Malo",
    parachoques_trasero: "Bueno" as "Bueno" | "Regular" | "Malo",
    espejos_laterales: "Bueno" as "Bueno" | "Regular" | "Malo",
    parabrisas: "Bueno" as "Bueno" | "Regular" | "Malo",
    limpia_parabrisas: "Bueno" as "Bueno" | "Regular" | "Malo",
    neumaticos: "Bueno" as "Bueno" | "Regular" | "Malo",
    presion_neumaticos: "Bueno" as "Bueno" | "Regular" | "Malo",
    neumatico_repuesto: "Bueno" as "Bueno" | "Regular" | "Malo",
    llave_rueda: "Bueno" as "Bueno" | "Regular" | "Malo",
    gata: "Bueno" as "Bueno" | "Regular" | "Malo",
    
    // Section 2: Luces
    luces_bajas: "Bueno" as "Bueno" | "Regular" | "Malo",
    luces_altas: "Bueno" as "Bueno" | "Regular" | "Malo",
    luces_freno: "Bueno" as "Bueno" | "Regular" | "Malo",
    luces_intermitentes: "Bueno" as "Bueno" | "Regular" | "Malo",
    luces_retroceso: "Bueno" as "Bueno" | "Regular" | "Malo",
    baliza: "Bueno" as "Bueno" | "Regular" | "Malo",
    pertiga: "Bueno" as "Bueno" | "Regular" | "Malo" | "NA",
    
    // Section 3: Interior
    cinturones: "Bueno" as "Bueno" | "Regular" | "Malo",
    bocina: "Bueno" as "Bueno" | "Regular" | "Malo",
    tablero_instrumentos: "Bueno" as "Bueno" | "Regular" | "Malo",
    indicadores_advertencia: "Bueno" as "Bueno" | "Regular" | "Malo",
    climatizador: "Bueno" as "Bueno" | "Regular" | "Malo",
    asientos_apoyacabezas: "Bueno" as "Bueno" | "Regular" | "Malo",
    frenos: "Bueno" as "Bueno" | "Regular" | "Malo",
    
    // Section 4: Equipos Seguridad
    extintor: "Presente" as "Presente" | "Incompleto" | "Ausente",
    botiquin: "Presente" as "Presente" | "Incompleto" | "Ausente",
    triangulos: "Presente" as "Presente" | "Incompleto" | "Ausente",
    chaleco: "Presente" as "Presente" | "Incompleto" | "Ausente",
    cunas: "Presente" as "Presente" | "Incompleto" | "Ausente",
    
    observaciones: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Aptitude Calculation
  const checkAptitude = () => {
    const hasCriticalFail = 
      formData.neumaticos === "Malo" || 
      formData.frenos === "Malo" || 
      formData.cinturones === "Malo" || 
      formData.luces_freno === "Malo" || 
      formData.luces_bajas === "Malo" ||
      formData.extintor === "Ausente" || 
      formData.cunas === "Ausente" || 
      formData.botiquin === "Ausente";
      
    return hasCriticalFail ? "No Apto" : "Apto";
  };

  const handleSelectChange = (name: string, value: string) => {
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
    if (!formData.id_trabajador_conductor) newErrors.id_trabajador_conductor = "Conductor obligatorio";
    if (!formData.id_activo_vehiculo) newErrors.id_activo_vehiculo = "Vehículo obligatorio";
    if (formData.kilometraje <= 0) newErrors.kilometraje = "Ingrese un kilometraje válido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveStep("datos");
      return;
    }
    
    addInspeccionDiaria(formData);
    onClose();
  };

  const renderRadioRow = (label: string, fieldName: string, options: string[]) => {
    const currentValue = (formData as Record<string, unknown>)[fieldName];
    return (
      <div className="flex justify-between items-center py-2 border-b border-zinc-900 text-xs">
        <span className="text-zinc-300 font-semibold">{label}</span>
        <div className="flex gap-2 bg-zinc-950 p-0.5 rounded-lg border border-zinc-900">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setFormData(prev => ({ ...prev, [fieldName]: opt }))}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                currentValue === opt
                  ? opt === "Bueno" || opt === "Presente"
                    ? "bg-emerald-600 text-white"
                    : opt === "Regular" || opt === "Incompleto"
                    ? "bg-amber-600 text-white"
                    : "bg-red-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-md font-bold text-white flex items-center gap-2">
              📋 Inspección Pre-Operacional Diaria
            </h2>
            <p className="text-[11px] text-zinc-500">
              ECF 4 - Verificación de seguridad antes de iniciar el turno
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Steps menu */}
        <div className="flex bg-zinc-950 border-b border-zinc-900 p-1 flex-shrink-0 text-[10px] font-bold uppercase overflow-x-auto gap-0.5">
          <button
            type="button"
            onClick={() => setActiveStep("datos")}
            className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
              activeStep === "datos" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            📍 Datos
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("exterior")}
            className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
              activeStep === "exterior" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🚗 Exterior
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("luces")}
            className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
              activeStep === "luces" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            💡 Luces
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("interior")}
            className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
              activeStep === "interior" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🪑 Interior
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("seguridad")}
            className={`px-3 py-2 rounded-md transition-all whitespace-nowrap ${
              activeStep === "seguridad" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🛡️ Seguridad
          </button>
        </div>

        {/* Dynamic Aptitude Banner */}
        <div className={`px-6 py-2 border-b text-center font-bold text-xs uppercase flex-shrink-0 flex items-center justify-center gap-2 ${
          checkAptitude() === "Apto"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
        }`}>
          <AlertTriangle size={14} />
          {checkAptitude() === "Apto"
            ? "🟢 VEHÍCULO APTO PARA OPERAR"
            : "🔴 VEHÍCULO NO APTO PARA OPERAR (ECF 4 COMPROMETIDO)"
          }
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
          
          {/* STEP 1: GENERAL DATA */}
          {activeStep === "datos" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Seleccionar Conductor *</label>
                <select
                  name="id_trabajador_conductor"
                  value={formData.id_trabajador_conductor}
                  onChange={(e) => handleSelectChange("id_trabajador_conductor", e.target.value)}
                  className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                    errors.id_trabajador_conductor ? "border-red-500/50" : "border-zinc-800"
                  }`}
                >
                  <option value="">-- Buscar Conductor --</option>
                  {trabajadores.map(t => (
                    <option key={t.id_trabajador} value={t.id_trabajador}>
                      {t.nombre_1} {t.apellido_paterno} ({t.numero_identificacion})
                    </option>
                  ))}
                </select>
                {errors.id_trabajador_conductor && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle size={10} />{errors.id_trabajador_conductor}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Seleccionar Vehículo/Camioneta *</label>
                <select
                  name="id_activo_vehiculo"
                  value={formData.id_activo_vehiculo}
                  onChange={(e) => handleSelectChange("id_activo_vehiculo", e.target.value)}
                  className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                    errors.id_activo_vehiculo ? "border-red-500/50" : "border-zinc-800"
                  }`}
                >
                  <option value="">-- Seleccionar Patente --</option>
                  {vehiculos.map(v => (
                    <option key={v.id_activo} value={v.id_activo}>
                      {v.marca} {v.modelo} - {v.identificador_unico}
                    </option>
                  ))}
                </select>
                {errors.id_activo_vehiculo && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle size={10} />{errors.id_activo_vehiculo}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Kilometraje Actual *</label>
                  <input
                    type="number"
                    name="kilometraje"
                    value={formData.kilometraje || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, kilometraje: parseInt(e.target.value) || 0 }))}
                    className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                      errors.kilometraje ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.kilometraje && (
                    <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle size={10} />{errors.kilometraje}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha y Hora</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="date"
                      value={formData.fecha}
                      disabled
                      className="bg-zinc-950 border border-zinc-900 p-2 rounded text-zinc-500"
                    />
                    <input
                      type="time"
                      value={formData.hora}
                      disabled
                      className="bg-zinc-950 border border-zinc-900 p-2 rounded text-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EXTERIOR INSPECTION */}
          {activeStep === "exterior" && (
            <div className="space-y-1 animate-fadeIn divide-y divide-zinc-900/60">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block pb-2">🚗 Estado de Carrocería y Ruedas</span>
              {renderRadioRow("Estado general carrocería", "carroceria", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Parachoques delantero", "parachoques_delantero", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Parachoques trasero", "parachoques_trasero", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Espejos laterales", "espejos_laterales", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Parabrisas (sin trizaduras)", "parabrisas", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Limpia parabrisas", "limpia_parabrisas", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Estado de neumáticos *", "neumaticos", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Presión de neumáticos", "presion_neumaticos", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Neumático de repuesto", "neumatico_repuesto", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Llave de rueda", "llave_rueda", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Gata hidráulica", "gata", ["Bueno", "Regular", "Malo"])}
            </div>
          )}

          {/* STEP 3: LIGHTS */}
          {activeStep === "luces" && (
            <div className="space-y-1 animate-fadeIn divide-y divide-zinc-900/60">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block pb-2">💡 Sistema de Luces y Señalización</span>
              {renderRadioRow("Luces bajas *", "luces_bajas", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Luces altas", "luces_altas", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Luces de freno *", "luces_freno", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Luces intermitentes/viraje", "luces_intermitentes", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Luces de retroceso", "luces_retroceso", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Baliza estroboscópica", "baliza", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Pértiga con bandera", "pertiga", ["Bueno", "Regular", "Malo", "NA"])}
            </div>
          )}

          {/* STEP 4: INTERIOR */}
          {activeStep === "interior" && (
            <div className="space-y-1 animate-fadeIn divide-y divide-zinc-900/60">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block pb-2">🪑 Habáculo e Instrumentos</span>
              {renderRadioRow("Cinturones de seguridad *", "cinturones", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Bocina", "bocina", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Tablero de instrumentos", "tablero_instrumentos", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Indicadores de advertencia", "indicadores_advertencia", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Climatizador (Calefacción/AC)", "climatizador", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Asientos y apoyacabezas", "asientos_apoyacabezas", ["Bueno", "Regular", "Malo"])}
              {renderRadioRow("Sistema de frenos *", "frenos", ["Bueno", "Regular", "Malo"])}
            </div>
          )}

          {/* STEP 5: SAFETY EQUIPMENT */}
          {activeStep === "seguridad" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1 divide-y divide-zinc-900/60">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block pb-2">🛡️ Equipamiento Obligatorio ECF 4</span>
                {renderRadioRow("Extintor (PQS) *", "extintor", ["Presente", "Incompleto", "Ausente"])}
                {renderRadioRow("Botiquín primeros auxilios *", "botiquin", ["Presente", "Incompleto", "Ausente"])}
                {renderRadioRow("Triángulos retroreflectantes", "triangulos", ["Presente", "Incompleto", "Ausente"])}
                {renderRadioRow("Chaleco reflectante", "chaleco", ["Presente", "Incompleto", "Ausente"])}
                {renderRadioRow("Cuñas antideslizantes (2) *", "cunas", ["Presente", "Incompleto", "Ausente"])}
              </div>

              <div className="space-y-1.5 pt-4 border-t border-zinc-900">
                <label className="text-xs text-zinc-400 font-semibold">Observaciones Generales</label>
                <textarea
                  name="observaciones"
                  placeholder="Escriba aquí si detectó alguna falla o regularidad..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 h-20 resize-none"
                />
              </div>
            </div>
          )}

        </form>

        {/* Footer Navigation */}
        <div className="h-16 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 flex-shrink-0">
          <div className="text-[10px] text-zinc-500">
            * Criterios determinantes
          </div>
          <div className="flex gap-2">
            {activeStep !== "datos" && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === "exterior") setActiveStep("datos");
                  else if (activeStep === "luces") setActiveStep("exterior");
                  else if (activeStep === "interior") setActiveStep("luces");
                  else if (activeStep === "seguridad") setActiveStep("interior");
                }}
                className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft size={13} />
                Atrás
              </button>
            )}

            {activeStep !== "seguridad" ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === "datos") setActiveStep("exterior");
                  else if (activeStep === "exterior") setActiveStep("luces");
                  else if (activeStep === "luces") setActiveStep("interior");
                  else if (activeStep === "interior") setActiveStep("seguridad");
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                Siguiente
                <ChevronRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Save size={12} />
                Guardar Checklist
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
