"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText, Stethoscope, GraduationCap } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useControlStore, type EstadoDocumento, type EstadoCurso, type ResultadoExamen } from "@/store/control-store";

interface Props {
  type: "documento" | "curso" | "examen";
  trabajadorId: string;
  onClose: () => void;
}

type Modalidad = "Presencial" | "E-learning" | "Virtual";

export function AsignarControlModal({ type, trabajadorId, onClose }: Props) {
  const {
    catalogoDocumentos, catalogoCursos, catalogoExamenes,
    addDocumento, addCurso, addExamen,
    addCursoCatalogo, addExamenCatalogo, addDocumentoCatalogo
  } = useControlStore(
    useShallow((s) => ({
      catalogoDocumentos: s.catalogoDocumentos,
      catalogoCursos: s.catalogoCursos,
      catalogoExamenes: s.catalogoExamenes,
      addDocumento: s.addDocumento,
      addCurso: s.addCurso,
      addExamen: s.addExamen,
      addCursoCatalogo: s.addCursoCatalogo,
      addExamenCatalogo: s.addExamenCatalogo,
      addDocumentoCatalogo: s.addDocumentoCatalogo,
    }))
  );

  const [formData, setFormData] = useState<{
    catalogo_id: string;
    numero_documento: string;
    estado_documento: EstadoDocumento;
    institucion: string;
    modalidad: Modalidad;
    estado_curso: EstadoCurso;
    resultado_examen: ResultadoExamen;
    fecha_emision: string;
    fecha_vencimiento: string;
    observaciones: string;
  }>({
    catalogo_id: "",
    numero_documento: "",
    estado_documento: "Vigente",
    institucion: "",
    modalidad: "Presencial",
    estado_curso: "Aprobado",
    resultado_examen: "Aprobado",

    fecha_emision: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    observaciones: ""
  });

  // Pre-calcular vencimiento de curso si tiene validez
  useEffect(() => {
    if (type === "curso" && formData.catalogo_id && formData.fecha_emision) {
      const selectedCurso = catalogoCursos.find(c => c.id === formData.catalogo_id);
      if (selectedCurso && selectedCurso.validez_meses) {
        const fechaEmision = new Date(formData.fecha_emision);
        if (!isNaN(fechaEmision.getTime())) {
          const fechaVencimiento = new Date(fechaEmision);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + selectedCurso.validez_meses);
          
          const yyyy = fechaVencimiento.getFullYear();
          const mm = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
          const dd = String(fechaVencimiento.getDate()).padStart(2, '0');
          const fechaStr = `${yyyy}-${mm}-${dd}`;
          
          if (formData.fecha_vencimiento !== fechaStr) {
            setFormData(prev => ({ ...prev, fecha_vencimiento: fechaStr }));
          }
        }
      }
    }
    // El guard `formData.fecha_vencimiento !== fechaStr` evita el loop al
    // re-ejecutar el effect con `fecha_vencimiento` como dep.
  }, [formData.catalogo_id, formData.fecha_emision, formData.fecha_vencimiento, type, catalogoCursos]);

  const getTitle = () => {
    switch (type) {
      case "documento": return "Asignar Documento / Pase";
      case "curso": return "Registrar Curso";
      case "examen": return "Registrar Examen Médico";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "documento": return <FileText className="text-primary" size={20} />;
      case "curso": return <GraduationCap className="text-primary" size={20} />;
      case "examen": return <Stethoscope className="text-primary" size={20} />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.catalogo_id) return alert("Debe seleccionar un tipo del catálogo");

    try {
      if (type === "documento") {
        await addDocumento({
          id_trabajador: trabajadorId,
          id_documento_catalogo: formData.catalogo_id,
          numero_documento: formData.numero_documento,
          fecha_emision: formData.fecha_emision,
          fecha_vencimiento: formData.fecha_vencimiento || null,
          estado: formData.estado_documento,
          observaciones: formData.observaciones || null,
          adjunto_url: null
        });
      } else if (type === "curso") {
        await addCurso({
          id_trabajador: trabajadorId,
          id_curso_catalogo: formData.catalogo_id,
          institucion: formData.institucion,
          modalidad: formData.modalidad,
          fecha_realizacion: formData.fecha_emision,
          fecha_vencimiento: formData.fecha_vencimiento || null,
          estado: formData.estado_curso,
          observaciones: formData.observaciones || null,
          certificado_url: null
        });
      } else if (type === "examen") {
        await addExamen({
          id_trabajador: trabajadorId,
          id_examen_catalogo: formData.catalogo_id,
          fecha_realizacion: formData.fecha_emision,
          fecha_vencimiento: formData.fecha_vencimiento || null,
          resultado: formData.resultado_examen,
          observaciones: formData.observaciones || null,
          adjunto_url: null
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el registro");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {getIcon()} {getTitle()}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
              <label className="text-xs text-zinc-400 font-semibold mb-0">Tipo (Catálogo) *</label>
              <button 
                type="button" 
                onClick={async () => {
                  const name = prompt(`Nombre del nuevo ${type === "documento" ? "documento/pase" : type === "curso" ? "curso" : "examen"}:`);
                  if (!name) return;
                  const cat = prompt("Categoría:", type === "documento" ? "Acreditación" : type === "curso" ? "Seguridad y Salud" : "Salud Ocupacional");
                  if (!cat) return;

                  if (type === "documento") {
                    await addDocumentoCatalogo(name, cat);
                  } else if (type === "curso") {
                    const validezStr = prompt("Tiempo de validez en meses (vacío para sin vencimiento):", "");
                    if (validezStr === null) return;
                    const valMeses = validezStr.trim() ? parseInt(validezStr.trim(), 10) : null;
                    await addCursoCatalogo(name, cat, valMeses !== null && isNaN(valMeses) ? null : valMeses);
                  } else if (type === "examen") {
                    await addExamenCatalogo(name, cat);
                  }
                }}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                + Crear Nuevo
              </button>
            </div>
            <select 
              className="input bg-zinc-900 border-zinc-800 text-sm"
              value={formData.catalogo_id}
              onChange={e => setFormData({...formData, catalogo_id: e.target.value})}
              required
            >
              <option value="">Seleccione una opción...</option>
              {type === "documento" && catalogoDocumentos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              {type === "curso" && catalogoCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              {type === "examen" && catalogoExamenes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {type === "documento" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Nº Documento</label>
                <input type="text" className="input bg-zinc-900 border-zinc-800 text-sm"
                  value={formData.numero_documento} onChange={e => setFormData({...formData, numero_documento: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Estado</label>
                <select className="input bg-zinc-900 border-zinc-800 text-sm"
                  value={formData.estado_documento} onChange={e => setFormData({...formData, estado_documento: e.target.value as EstadoDocumento})}>
                  <option value="Vigente">Vigente</option>
                  <option value="Vencido">Vencido</option>
                  <option value="En Trámite">En Trámite</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Revocado">Revocado</option>
                </select>
              </div>
            </div>
          )}

          {type === "curso" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold">Institución Dictante</label>
                <input type="text" className="input bg-zinc-900 border-zinc-800 text-sm"
                  value={formData.institucion} onChange={e => setFormData({...formData, institucion: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Modalidad</label>
                  <select className="input bg-zinc-900 border-zinc-800 text-sm"
                    value={formData.modalidad} onChange={e => setFormData({...formData, modalidad: e.target.value as Modalidad})}>
                    <option value="Presencial">Presencial</option>
                    <option value="E-learning">E-learning</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Terreno">Terreno</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Estado</label>
                  <select className="input bg-zinc-900 border-zinc-800 text-sm"
                    value={formData.estado_curso} onChange={e => setFormData({...formData, estado_curso: e.target.value as EstadoCurso})}>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Reprobado">Reprobado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="No Asiste">No Asiste</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {type === "examen" && (
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Resultado</label>
              <select className="input bg-zinc-900 border-zinc-800 text-sm"
                value={formData.resultado_examen} onChange={e => setFormData({...formData, resultado_examen: e.target.value as ResultadoExamen})}>
                <option value="Apto">Apto</option>
                <option value="Apto con Restricciones">Apto con Restricciones</option>
                <option value="No Apto">No Apto</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Fecha Emisión/Realización *</label>
              <input type="date" required className="input bg-zinc-900 border-zinc-800 text-sm"
                value={formData.fecha_emision} onChange={e => setFormData({...formData, fecha_emision: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-semibold">Fecha Vencimiento (Opcional)</label>
              <input type="date" className="input bg-zinc-900 border-zinc-800 text-sm"
                value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold">Observaciones</label>
            <textarea className="input bg-zinc-900 border-zinc-800 text-sm resize-none" rows={2}
              value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2">
              <Save size={16} /> Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
