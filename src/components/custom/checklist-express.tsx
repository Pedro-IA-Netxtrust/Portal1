"use client";

import React, { useState } from "react";
import { useInspeccionesStore } from "@/store/inspecciones-store";
import { useActivosStore } from "@/store/activos-store";
import { X, Save, AlertCircle } from "lucide-react";

interface ChecklistExpressProps {
  onClose: () => void;
}

export default function ChecklistExpress({ onClose }: ChecklistExpressProps) {
  const { addVerificacionExpress } = useInspeccionesStore();
  const { activos } = useActivosStore();

  const vehiculos = activos.filter(a => a.tipo === "Vehículo");
  const today = new Date().toISOString().split("T")[0];

  // Form State
  const [inspector, setInspector] = useState("");
  const [idVehiculo, setIdVehiculo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 27 key equipment check list (ECF 4)
  const items = [
    { id: 1, desc: "Aire acondicionado o climatizador operativo", req: "C.1" },
    { id: 2, desc: "Airbag frontales (conductor y copiloto)", req: "C.2" },
    { id: 3, desc: "Barrera dura de protección ante impacto de carga", req: "C.3" },
    { id: 4, desc: "Sistema de aseguramiento de carga (cajas/baúles)", req: "C.4" },
    { id: 5, desc: "Antigüedad vehículo dentro de límites permitidos", req: "C.5" },
    { id: 6, desc: "Cinturones de seguridad 3 puntas en todos los asientos", req: "C.6" },
    { id: 7, desc: "Apoyacabezas ajustable en todos los asientos", req: "C.7" },
    { id: 8, desc: "Barras internas/externas y/o jaulas ROPS certificadas", req: "C.8" },
    { id: 9, desc: "Cuñas antideslizantes para ruedas (2 unidades)", req: "C.9" },
    { id: 10, desc: "Neumáticos: no redibujados ni recauchados, banda ≥4 mm", req: "C.10" },
    { id: 11, desc: "Bocina en buen funcionamiento", req: "C.11" },
    { id: 12, desc: "Alarma sonora de retroceso automática", req: "C.12" },
    { id: 13, desc: "Número de identificación y cinta reflectante visible", req: "C.13" },
    { id: 14, desc: "Sistema de monitoreo de velocidad (GPS) operativo", req: "C.14" },
    { id: 15, desc: "Vehículo doble tracción sujeto a análisis de riesgo", req: "C.15" },
    { id: 16, desc: "Vehículo diésel para minería subterránea / plantas", req: "C.16" },
    { id: 17, desc: "Parabrisas inastillable + lámina protectora de impacto", req: "C.17" },
    { id: 18, desc: "Extintor portátil de incendio (capacidad reglamentaria)", req: "C.26" },
    { id: 19, desc: "Triángulos retro-reflectantes reglamentarios (2)", req: "C.18" },
    { id: 20, desc: "Color del vehículo de alta visibilidad (rojo corporativo)", req: "C.20" },
    { id: 21, desc: "Equipo de radiocomunicación bidireccional operativo", req: "C.19/C.21" },
    { id: 22, desc: "Pértiga de seguridad con luz y banderola (4,60 m)", req: "C.22" },
    { id: 23, desc: "Baliza estroboscópica visible en 360°", req: "C.23" },
    { id: 24, desc: "Foco faenero para visión posterior", req: "C.24" },
    { id: 25, desc: "Dispositivo corta-corriente general", req: "C.25" },
    { id: 26, desc: "Extintor PQS de 10 kg en equipos de subterránea", req: "C.26.a" },
    { id: 27, desc: "Cámara de retroceso integrada con pantalla", req: "Prácticas" }
  ];

  // Answers State
  const [respuestas, setRespuestas] = useState<Record<number, "SI" | "NO" | "NA">>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: "SI" }), {})
  );

  const handleAnswer = (id: number, ans: "SI" | "NO" | "NA") => {
    setRespuestas(prev => ({ ...prev, [id]: ans }));
  };

  // Live compliance rate calculation
  const calculateComplianceRate = () => {
    const list = Object.values(respuestas);
    const si = list.filter(r => r === "SI").length;
    const no = list.filter(r => r === "NO").length;
    const total = si + no;
    return total > 0 ? Math.round((si / total) * 100) : 100;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!inspector.trim()) newErrors.inspector = "Inspector obligatorio";
    if (!idVehiculo) newErrors.id_vehiculo = "Vehículo obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addVerificacionExpress({
      fecha: today,
      inspector,
      id_activo_vehiculo: idVehiculo,
      porcentaje_cumplimiento: calculateComplianceRate(),
      observaciones: observaciones || undefined,
      respuestas
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-md font-bold text-white flex items-center gap-2">
              ⚡ Verificación Express ECF 4
            </h2>
            <p className="text-[11px] text-zinc-500">
              Control rápido de 27 ítems críticos de equipamiento y cabina segura
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live stats banner */}
        <div className="px-6 py-2 border-b border-zinc-900 bg-zinc-900/10 text-center text-xs flex justify-between items-center flex-shrink-0">
          <span className="text-zinc-500 font-semibold">ÍTEMS DE SEGURIDAD APROBADOS:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            calculateComplianceRate() === 100
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : calculateComplianceRate() >= 80
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {calculateComplianceRate()}% ({Object.values(respuestas).filter(r => r === "SI").length}/27)
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[55vh]">
          
          {/* General inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Inspector / Verificador *</label>
              <input
                type="text"
                placeholder="Nombre del inspector..."
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.inspector ? "border-red-500/50" : "border-zinc-800"
                }`}
              />
              {errors.inspector && (
                <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.inspector}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Vehículo Inspeccionado *</label>
              <select
                value={idVehiculo}
                onChange={(e) => setIdVehiculo(e.target.value)}
                className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.id_vehiculo ? "border-red-500/50" : "border-zinc-800"
                }`}
              >
                <option value="">-- Patente --</option>
                {vehiculos.map(v => (
                  <option key={v.id_activo} value={v.id_activo}>
                    {v.marca} {v.modelo} ({v.identificador_unico})
                  </option>
                ))}
              </select>
              {errors.id_vehiculo && (
                <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.id_vehiculo}</p>
              )}
            </div>
          </div>

          {/* 27 items Checklists */}
          <div className="space-y-4 pt-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Listado Express de 27 Criterios ECF 4</span>
            
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg flex justify-between items-start gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-600/5 border border-blue-500/10 px-1.5 rounded">#{item.id}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">ECF 4 - Req. {item.req}</span>
                    </div>
                    <p className="text-zinc-200 font-medium">{item.desc}</p>
                  </div>
                  
                  <div className="flex gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-900 flex-shrink-0">
                    {(["SI", "NO", "NA"] as const).map(ans => (
                      <button
                        type="button"
                        key={ans}
                        onClick={() => handleAnswer(item.id, ans)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          respuestas[item.id] === ans
                            ? ans === "SI"
                              ? "bg-emerald-600 text-white"
                              : ans === "NO"
                              ? "bg-red-600 text-white"
                              : "bg-zinc-800 text-zinc-300"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5 pt-4 border-t border-zinc-900">
            <label className="text-xs text-zinc-400 font-semibold">Observaciones Rápidas</label>
            <textarea
              placeholder="Detalle hallazgos rápidos o elementos faltantes..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 h-20 resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 flex-shrink-0">
          <div className="text-[10px] text-zinc-500">
            * Verificación rápida en terreno
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 hover:shadow-lg hover:shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save size={12} />
              Guardar Verificación
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
