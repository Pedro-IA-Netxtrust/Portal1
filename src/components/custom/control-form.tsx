"use client";

import React, { useState } from "react";
import { useControlStore } from "@/store/control-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useMaestrosStore } from "@/store/maestros-store";
import { X, Save, AlertCircle, Sparkles } from "lucide-react";

interface ControlFormProps {
  onClose: () => void;
}

export default function ControlForm({ onClose }: ControlFormProps) {
  const { addExamen, addCurso } = useControlStore();
  const { trabajadores, updateTrabajador } = useTrabajadoresStore();
  const { examenesMaestros, cursosMaestros } = useMaestrosStore();

  const [mode, setMode] = useState<"examen" | "curso">("examen");

  // Helper to calculate expiration date
  const calculateExpirationDate = (baseDateStr: string, duracionMeses: number) => {
    if (!baseDateStr) return "";
    const date = new Date(baseDateStr + "T12:00:00");
    date.setMonth(date.getMonth() + duracionMeses);
    return date.toISOString().split("T")[0];
  };

  const initialExamen = examenesMaestros[0];
  const initialCurso = cursosMaestros[0];
  const today = new Date().toISOString().split("T")[0];

  // Form State
  const [formData, setFormData] = useState({
    id_trabajador: "",
    tipo_examen: initialExamen?.nombre_examen || "",
    resultado: "Aprobado" as "Aprobado" | "Rechazado" | "Pendiente",
    fecha_evaluacion: today,
    fecha_vencimiento: initialExamen ? calculateExpirationDate(today, initialExamen.duracion_meses) : "",
    entidad_evaluadora: "",
    
    // Cursos fields
    nombre_curso: initialCurso?.nombre_curso || "",
    fecha_capacitacion: today,
    fecha_vencimiento_curso: initialCurso ? calculateExpirationDate(today, initialCurso.duracion_meses) : "",
    estado_curso: "Completado" as "Completado" | "Vencido" | "En Curso"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Calculate dynamic expiration dates on specific field changes
      if (name === "tipo_examen") {
        const selected = examenesMaestros.find(m => m.nombre_examen === value);
        if (selected) {
          updated.fecha_vencimiento = calculateExpirationDate(updated.fecha_evaluacion, selected.duracion_meses);
        }
      } else if (name === "fecha_evaluacion") {
        const selected = examenesMaestros.find(m => m.nombre_examen === updated.tipo_examen);
        if (selected) {
          updated.fecha_vencimiento = calculateExpirationDate(value, selected.duracion_meses);
        }
      } else if (name === "nombre_curso") {
        const selected = cursosMaestros.find(m => m.nombre_curso === value);
        if (selected) {
          updated.fecha_vencimiento_curso = calculateExpirationDate(updated.fecha_capacitacion, selected.duracion_meses);
        }
      } else if (name === "fecha_capacitacion") {
        const selected = cursosMaestros.find(m => m.nombre_curso === updated.nombre_curso);
        if (selected) {
          updated.fecha_vencimiento_curso = calculateExpirationDate(value, selected.duracion_meses);
        }
      }
      
      return updated;
    });

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
    if (!formData.id_trabajador) newErrors.id_trabajador = "Debe seleccionar un trabajador";

    if (mode === "examen") {
      if (!formData.tipo_examen) newErrors.tipo_examen = "El tipo de examen es obligatorio";
      if (!formData.fecha_vencimiento) newErrors.fecha_vencimiento = "Fecha de vencimiento obligatoria";
      if (!formData.entidad_evaluadora.trim()) newErrors.entidad_evaluadora = "Entidad evaluadora obligatoria";
    } else {
      if (!formData.nombre_curso) newErrors.nombre_curso = "El nombre del curso es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "examen") {
      addExamen({
        id_trabajador: formData.id_trabajador,
        tipo_examen: formData.tipo_examen,
        resultado: formData.resultado,
        fecha_evaluacion: formData.fecha_evaluacion,
        fecha_vencimiento: formData.fecha_vencimiento,
        entidad_evaluadora: formData.entidad_evaluadora
      });

      // --- AUTOMATED DATA LINKAGE (Cross-Module Sync!) ---
      if (formData.resultado === "Aprobado") {
        const examNameUpper = formData.tipo_examen.toUpperCase();
        if (examNameUpper.includes("ALTURA") || examNameUpper.includes("GEOGRÁFICA") || examNameUpper.includes("GEOGRAFICA")) {
          updateTrabajador(formData.id_trabajador, {
            vencimiento_altura_geo: formData.fecha_vencimiento
          });
        } else if (examNameUpper.includes("PSICOSENS") || examNameUpper.includes("PSICOSENSOMÉTRICO") || examNameUpper.includes("PSICOSENSOMETRICO")) {
          updateTrabajador(formData.id_trabajador, {
            vencimiento_psicosensometrico: formData.fecha_vencimiento
          });
        }
      }
    } else {
      addCurso({
        id_trabajador: formData.id_trabajador,
        nombre_curso: formData.nombre_curso,
        fecha_capacitacion: formData.fecha_capacitacion,
        fecha_vencimiento: formData.fecha_vencimiento_curso || undefined,
        estado: formData.estado_curso
      });

      // --- AUTOMATED DATA LINKAGE (Cross-Module Sync!) ---
      if (formData.estado_curso === "Completado") {
        const nameUpper = formData.nombre_curso.toUpperCase();
        if (nameUpper.includes("SAP") || nameUpper.includes("LMS")) {
          updateTrabajador(formData.id_trabajador, { cert_sap_lms: true });
        }
        if (nameUpper.includes("SOMA") || nameUpper.includes("SEGURIDAD")) {
          updateTrabajador(formData.id_trabajador, { cert_soma_lms: true });
        }
        if (nameUpper.includes("TI") || nameUpper.includes("TECNOLOG") || nameUpper.includes("SOPORTE")) {
          updateTrabajador(formData.id_trabajador, { cert_ti: true });
        }
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 flex-shrink-0">
          <div>
            <h2 className="text-md font-bold text-white">
              {mode === "examen" ? "Ingresar Examen Médico" : "Registrar Curso Habilitante"}
            </h2>
            <p className="text-[11px] text-zinc-500">
              Registra certificaciones y vigencias operativas de tu personal
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Selector Tab */}
        <div className="flex bg-zinc-950 border-b border-zinc-900 p-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode("examen")}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
              mode === "examen" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🩺 Examen Médico
          </button>
          <button
            type="button"
            onClick={() => setMode("curso")}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${
              mode === "curso" ? "bg-zinc-900 border border-zinc-800 text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🎓 Curso Habilitante
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Worker Select */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">Seleccionar Trabajador *</label>
            <select
              name="id_trabajador"
              value={formData.id_trabajador}
              onChange={handleChange}
              className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                errors.id_trabajador ? "border-red-500/50" : "border-zinc-800"
              }`}
            >
              <option value="">-- Buscar Persona --</option>
              {trabajadores.map(t => (
                <option key={t.id_trabajador} value={t.id_trabajador}>
                  {t.nombre_1} {t.apellido_paterno} ({t.numero_identificacion})
                </option>
              ))}
            </select>
            {errors.id_trabajador && (
              <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.id_trabajador}</p>
            )}
          </div>

          {/* DYNAMIC FOR EXAMS */}
          {mode === "examen" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Tipo Examen *</label>
                  {examenesMaestros.length > 0 ? (
                    <select
                      name="tipo_examen"
                      value={formData.tipo_examen}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    >
                      {examenesMaestros.map(em => (
                        <option key={em.id_examen_maestro} value={em.nombre_examen}>
                          {em.nombre_examen}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="tipo_examen"
                      placeholder="Ingrese examen"
                      value={formData.tipo_examen}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  )}
                  {formData.tipo_examen && examenesMaestros.length > 0 && (
                    <p className="text-[10px] text-zinc-500 italic mt-0.5">
                      ⏱️ Vigencia sugerida: {examenesMaestros.find(em => em.nombre_examen === formData.tipo_examen)?.duracion_meses || 12} meses
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Resultado *</label>
                  <select
                    name="resultado"
                    value={formData.resultado}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha Evaluación *</label>
                  <input
                    type="date"
                    name="fecha_evaluacion"
                    value={formData.fecha_evaluacion}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha Vencimiento *</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                      errors.fecha_vencimiento ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Entidad Evaluadora *</label>
                <input
                  type="text"
                  name="entidad_evaluadora"
                  placeholder="Ej: Mutual de Seguridad, ACHS, IST"
                  value={formData.entidad_evaluadora}
                  onChange={handleChange}
                  className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                    errors.entidad_evaluadora ? "border-red-500/50" : "border-zinc-800"
                  }`}
                />
              </div>

              {formData.resultado === "Aprobado" && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] text-blue-400 flex items-center gap-2">
                  <Sparkles size={14} />
                  <span>Al guardar, se actualizará el vencimiento en la ficha del trabajador.</span>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC FOR COURSES */}
          {mode === "curso" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Nombre del Curso *</label>
                {cursosMaestros.length > 0 ? (
                  <select
                    name="nombre_curso"
                    value={formData.nombre_curso}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                      errors.nombre_curso ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  >
                    {cursosMaestros.map(cm => (
                      <option key={cm.id_curso_maestro} value={cm.nombre_curso}>
                        {cm.nombre_curso}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="nombre_curso"
                    placeholder="Ej: Inducción de Seguridad SOMA, Curso SAP LMS Básico"
                    value={formData.nombre_curso}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 ${
                      errors.nombre_curso ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                )}
                {formData.nombre_curso && cursosMaestros.length > 0 && (
                  <p className="text-[10px] text-zinc-500 italic mt-0.5">
                    ⏱️ Vigencia sugerida: {cursosMaestros.find(cm => cm.nombre_curso === formData.nombre_curso)?.duracion_meses || 12} meses
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha Capacitación *</label>
                  <input
                    type="date"
                    name="fecha_capacitacion"
                    value={formData.fecha_capacitacion}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Vencimiento (Opcional)</label>
                  <input
                    type="date"
                    name="fecha_vencimiento_curso"
                    value={formData.fecha_vencimiento_curso}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Estado de Habilitación *</label>
                <select
                  name="estado_curso"
                  value={formData.estado_curso}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="Completado">Completado</option>
                  <option value="En Curso">En Curso</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] text-blue-400 flex items-center gap-2">
                <Sparkles size={14} />
                <span>Si el título contiene 'SAP' o 'SOMA', habilitará esa certificación en su ficha.</span>
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
              Guardar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
