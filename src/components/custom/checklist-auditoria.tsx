"use client";

import React, { useState } from "react";
import { useInspeccionesStore } from "@/store/inspecciones-store";
import { useActivosStore } from "@/store/activos-store";
import { X, Save, AlertCircle } from "lucide-react";

interface ChecklistAuditoriaProps {
  onClose: () => void;
}

export default function ChecklistAuditoria({ onClose }: ChecklistAuditoriaProps) {
  const addAuditoria = useInspeccionesStore((s) => s.addAuditoria);
  const activos = useActivosStore((s) => s.activos);

  const vehiculos = activos.filter(a => a.tipo === "Vehículo");
  const today = new Date().toISOString().split("T")[0];

  // Auditoria General State
  const [auditor, setAuditor] = useState("");
  const [idVehiculo, setIdVehiculo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ECF 4 Requirements checklist
  const requirements = [
    { code: "A.1.a", desc: "Licencia Municipal vigente + Autorización interna CODELCO", group: "Personas" },
    { code: "A.1.b", desc: "Mínimo 2 años experiencia como conductor", group: "Personas" },
    { code: "A.1.c", desc: "Capacitación teórico/práctica específica", group: "Personas" },
    { code: "A.1.d", desc: "Prueba de conocimiento aprobada", group: "Personas" },
    { code: "A.1.e", desc: "Prueba práctica aprobada", group: "Personas" },
    { code: "A.1.f", desc: "Curso 4x4 vigente (4 años) si aplica", group: "Personas" },
    { code: "A.2.a", desc: "Evaluación psicosensotécnica rigurosa vigente", group: "Personas" },
    { code: "A.3.a", desc: "Certificado médico de aptitud vigente", group: "Personas" },
    { code: "A.6.a", desc: "Uso obligatorio cinturón 3 puntas retráctil", group: "Personas" },
    
    { code: "B.1", desc: "Metodología de evaluación teórico/práctica", group: "Organización" },
    { code: "B.2", desc: "Reglamento de Tránsito aprobado SERNAGEOMIN", group: "Organización" },
    { code: "B.3", desc: "Registro actualizado de licencias y pases", group: "Organización" },
    { code: "B.4", desc: "Gestión de GPS con revisión ≤ 15 días", group: "Organización" },
    { code: "B.8", desc: "Plan de mantenimiento preventivo según fabricante", group: "Organización" },

    { code: "C.1", desc: "Aire acondicionado/climatizador operativo", group: "Vehículo" },
    { code: "C.2", desc: "Airbag frontales (conductor y copiloto)", group: "Vehículo" },
    { code: "C.3", desc: "Barrera dura de protección de carga", group: "Vehículo" },
    { code: "C.5", desc: "Antigüedad vehículo dentro de límites", group: "Vehículo" },
    { code: "C.8", desc: "Cabina segura: EuroNCAP 4★ / jaula ROPS", group: "Vehículo" },
    { code: "C.9", desc: "2 cuñas antideslizantes fijación segura", group: "Vehículo" },
    { code: "C.10", desc: "Neumáticos: banda ≥4 mm, sin rajaduras", group: "Vehículo" },
    { code: "C.12", desc: "Alarma sonora de retroceso automática", group: "Vehículo" },
    { code: "C.13", desc: "Identificación alfanumérica + logo visible", group: "Vehículo" },
    { code: "C.14", desc: "GPS con posicionamiento ≤20 segundos", group: "Vehículo" },
    { code: "C.22", desc: "Pértiga 4,60 m + luz intermitente", group: "Vehículo" },
    { code: "C.23", desc: "Baliza estroboscópica visible 360°", group: "Vehículo" },
    { code: "C.26", desc: "Extintor de rápida extracción", group: "Vehículo" }
  ];

  // Answer State
  const [respuestas, setRespuestas] = useState<Record<string, "SI" | "NO" | "NA">>(
    requirements.reduce((acc, req) => ({ ...acc, [req.code]: "SI" }), {})
  );

  const handleAnswer = (code: string, ans: "SI" | "NO" | "NA") => {
    setRespuestas(prev => ({ ...prev, [code]: ans }));
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
    if (!auditor.trim()) newErrors.auditor = "Auditor obligatorio";
    if (!idVehiculo) newErrors.id_vehiculo = "Vehículo obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addAuditoria({
      fecha: today,
      auditor,
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
              🛡️ Auditoría de Cumplimiento ECF 4
            </h2>
            <p className="text-[11px] text-zinc-500">
              Evaluación semestral integral del estándar técnico CODELCO
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
          <span className="text-zinc-500 font-semibold">TASA DE CUMPLIMIENTO ECF 4:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            calculateComplianceRate() >= 90
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : calculateComplianceRate() >= 75
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {calculateComplianceRate()}%
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[55vh]">
          
          {/* General inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Auditor RSSO / Supervisor *</label>
              <input
                type="text"
                placeholder="Nombre del auditor..."
                value={auditor}
                onChange={(e) => setAuditor(e.target.value)}
                className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                  errors.auditor ? "border-red-500/50" : "border-zinc-800"
                }`}
              />
              {errors.auditor && (
                <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.auditor}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Vehículo Evaluado *</label>
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

          {/* Requirements Checklists */}
          <div className="space-y-4 pt-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Validación de Criterios del Estándar</span>
            
            <div className="space-y-2">
              {requirements.map(req => (
                <div key={req.code} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg flex justify-between items-start gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-600/5 border border-blue-500/10 px-1.5 rounded">{req.code}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">ECF 4 - {req.group}</span>
                    </div>
                    <p className="text-zinc-200 font-medium">{req.desc}</p>
                  </div>
                  
                  <div className="flex gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-900 flex-shrink-0">
                    {(["SI", "NO", "NA"] as const).map(ans => (
                      <button
                        type="button"
                        key={ans}
                        onClick={() => handleAnswer(req.code, ans)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          respuestas[req.code] === ans
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
            <label className="text-xs text-zinc-400 font-semibold">Observaciones de Auditoría</label>
            <textarea
              placeholder="Detalle hallazgos, brechas o plazos de regularización técnica..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 h-20 resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 flex-shrink-0">
          <div className="text-[10px] text-zinc-500">
            * Cumplimiento mínimo corporativo: 90%
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
              Guardar Auditoría
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
