"use client";

import React, { useState, useMemo } from "react";
import { 
  GraduationCap, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  User,
  Calendar,
  Stethoscope,
  BookOpen,
  UploadCloud,
  FileBadge,
  Plus,
  Trash2,
  Save,
  Edit2
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useContratosStore } from "@/store/contratos-store";
import { useControlStore, type CatalogoCurso, type ResultadoExamen, type EstadoCurso, type EstadoDocumento } from "@/store/control-store";

export default function ControlPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );
  const { contratos, fetchContratos } = useContratosStore(
    useShallow((s) => ({ contratos: s.contratos, fetchContratos: s.fetchContratos }))
  );
  const { 
    examenes, 
    cursos, 
    documentos,
    catalogoExamenes,
    catalogoCursos,
    catalogoDocumentos,
    fetchControlData, 
    getAllAlertas, 
    getAlertasByTrabajador,
    addExamen,
    addCurso,
    addDocumento,
    addCursoCatalogo,
    deleteCursoCatalogo,
    updateCursoCatalogo,
    addExamenCatalogo,
    deleteExamenCatalogo,
    addDocumentoCatalogo,
    deleteDocumentoCatalogo
  } = useControlStore(
    useShallow((s) => ({
      examenes: s.examenes,
      cursos: s.cursos,
      documentos: s.documentos,
      catalogoExamenes: s.catalogoExamenes,
      catalogoCursos: s.catalogoCursos,
      catalogoDocumentos: s.catalogoDocumentos,
      fetchControlData: s.fetchControlData,
      getAllAlertas: s.getAllAlertas,
      getAlertasByTrabajador: s.getAlertasByTrabajador,
      addExamen: s.addExamen,
      addCurso: s.addCurso,
      addDocumento: s.addDocumento,
      addCursoCatalogo: s.addCursoCatalogo,
      deleteCursoCatalogo: s.deleteCursoCatalogo,
      updateCursoCatalogo: s.updateCursoCatalogo,
      addExamenCatalogo: s.addExamenCatalogo,
      deleteExamenCatalogo: s.deleteExamenCatalogo,
      addDocumentoCatalogo: s.addDocumentoCatalogo,
      deleteDocumentoCatalogo: s.deleteDocumentoCatalogo,
    }))
  );

  const [activeTab, setActiveTab] = useState<"dashboard" | "trabajadores" | "catalogos">("dashboard");
  const [selectedContratoDashboard, setSelectedContratoDashboard] = useState<string>("Todos");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showAddExamen, setShowAddExamen] = useState(false);
  const [showAddCurso, setShowAddCurso] = useState(false);
  const [showAddDocumento, setShowAddDocumento] = useState(false);
  
  // Asignación Masiva
  const [showMassAssignCurso, setShowMassAssignCurso] = useState(false);
  const [showMassAssignDocumento, setShowMassAssignDocumento] = useState(false);
  const [selectedWorkersForMass, setSelectedWorkersForMass] = useState<string[]>([]);
  
  // formData es el shape del modal "agregar registro de control"; cambia
  // segun el tipo (curso/examen/documento). Definimos todos los campos
  // posibles como opcionales y validamos en cada handler de submit.
  type ControlFormData = {
    id_examen_catalogo?: string;
    id_curso_catalogo?: string;
    id_documento_catalogo?: string;
    fecha_realizacion?: string;
    fecha_emision?: string;
    fecha_vencimiento?: string;
    resultado?: ResultadoExamen;
    estado?: EstadoCurso | EstadoDocumento;
    observaciones?: string;
    numero_documento?: string;
    institucion?: string;
    modalidad?: string;
  };
  const [formData, setFormData] = useState<ControlFormData>({});

  // Catálogos search states
  const [searchCurso, setSearchCurso] = useState("");
  const [searchExamen, setSearchExamen] = useState("");
  const [searchDoc, setSearchDoc] = useState("");

  // Catálogos show form states
  const [showAddCursoForm, setShowAddCursoForm] = useState(false);
  const [showAddExamenForm, setShowAddExamenForm] = useState(false);
  const [showAddDocForm, setShowAddDocForm] = useState(false);

  // Catálogos form inputs
  const [newCursoName, setNewCursoName] = useState("");
  const [newCursoCat, setNewCursoCat] = useState("");
  const [newCursoValidez, setNewCursoValidez] = useState("");
  const [newExamenName, setNewExamenName] = useState("");
  const [newExamenCat, setNewExamenCat] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocCat, setNewDocCat] = useState("");

  const handleCreateCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCursoName.trim() || !newCursoCat.trim()) return;
    const months = newCursoValidez.trim() ? parseInt(newCursoValidez.trim(), 10) : null;
    await addCursoCatalogo(newCursoName.trim(), newCursoCat.trim(), months !== null && isNaN(months) ? null : months);
    setNewCursoName("");
    setNewCursoCat("");
    setNewCursoValidez("");
    setShowAddCursoForm(false);
  };

  const handleEditCurso = async (c: CatalogoCurso) => {
    const newName = prompt("Editar nombre del curso:", c.nombre);
    if (newName === null) return;
    const newCat = prompt("Editar categoría del curso:", c.categoria);
    if (newCat === null) return;
    const validezStr = prompt("Editar tiempo de validez en meses (vacío para sin vencimiento):", c.validez_meses?.toString() || "");
    if (validezStr === null) return;

    const validez = validezStr.trim() ? parseInt(validezStr.trim(), 10) : null;
    await updateCursoCatalogo(c.id, {
      nombre: newName.trim() || c.nombre,
      categoria: newCat.trim() || c.categoria,
      validez_meses: (validezStr.trim() === "" || (validez !== null && isNaN(validez))) ? null : validez
    });
  };

  // Pre-calcular vencimiento de curso si tiene validez
  React.useEffect(() => {
    if (formData.id_curso_catalogo && formData.fecha_realizacion) {
      const selectedCurso = catalogoCursos.find(c => c.id === formData.id_curso_catalogo);
      if (selectedCurso && selectedCurso.validez_meses) {
        const fechaRealizacion = new Date(formData.fecha_realizacion);
        if (!isNaN(fechaRealizacion.getTime())) {
          const fechaVencimiento = new Date(fechaRealizacion);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + selectedCurso.validez_meses);
          
          const yyyy = fechaVencimiento.getFullYear();
          const mm = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
          const dd = String(fechaVencimiento.getDate()).padStart(2, '0');
          const fechaStr = `${yyyy}-${mm}-${dd}`;
          
          if (formData.fecha_vencimiento !== fechaStr) {
            setFormData((prev) => ({ ...prev, fecha_vencimiento: fechaStr }));
          }
        }
      }
    }
    // El guard `formData.fecha_vencimiento !== fechaStr` evita el loop al
    // re-ejecutar el effect con `fecha_vencimiento` como dep.
  }, [formData.id_curso_catalogo, formData.fecha_realizacion, formData.fecha_vencimiento, catalogoCursos]);

  const handleCreateExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamenName.trim() || !newExamenCat.trim()) return;
    await addExamenCatalogo(newExamenName.trim(), newExamenCat.trim());
    setNewExamenName("");
    setNewExamenCat("");
    setShowAddExamenForm(false);
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocCat.trim()) return;
    await addDocumentoCatalogo(newDocName.trim(), newDocCat.trim());
    setNewDocName("");
    setNewDocCat("");
    setShowAddDocForm(false);
  };

  React.useEffect(() => {
    fetchTrabajadores();
    fetchContratos();
    fetchControlData();
  }, [fetchTrabajadores, fetchContratos, fetchControlData]);

  // Dashboard Stats
  const activeContratos = useMemo(() => contratos.filter((c) => c.estado === "Activo"), [contratos]);

  const todasLasAlertas = useMemo(() => {
    const rawAlerts = getAllAlertas();
    if (selectedContratoDashboard === "Todos") return rawAlerts;
    
    // Find workers in the selected contract
    const contrato = contratos.find(c => c.id_contrato === selectedContratoDashboard);
    if (!contrato) return [];
    
    const assignedWorkerIds = new Set(contrato.trabajadores_asignados.filter(a => a.activo).map(a => a.id_trabajador));
    return rawAlerts.filter(a => assignedWorkerIds.has(a.trabajador_id));
  }, [getAllAlertas, selectedContratoDashboard, contratos]);
  
  const stats = useMemo(() => {
    const vencidos = todasLasAlertas.filter(a => a.alerta.nivel === "vencido").length;
    const criticos = todasLasAlertas.filter(a => a.alerta.nivel === "critico").length; // <= 30 dias
    const alertas = todasLasAlertas.filter(a => a.alerta.nivel === "alerta").length; // <= 60 dias
    const pendientes = todasLasAlertas.filter(a => a.alerta.nivel === "pendiente").length;
    return { vencidos, criticos, alertas, pendientes };
  }, [todasLasAlertas]);

  // Trabajadores Filtrados
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return trabajadores;
    const lower = search.toLowerCase();
    return trabajadores.filter(t => 
      `${t.nombre_1} ${t.apellido_paterno}`.toLowerCase().includes(lower) ||
      t.numero_identificacion.includes(lower)
    );
  }, [trabajadores, search]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return trabajadores.find(t => t.id_trabajador === selectedUserId) || null;
  }, [selectedUserId, trabajadores]);

  // Handlers para formularios. La validacion HTML (`required` en cada
  // <select> / <input>) garantiza que los campos obligatorios estan
  // presentes antes de invocar los addX; usamos `!` para confirmar a TS.
  const handleAddExamenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    await addExamen({
      id_trabajador: selectedUserId,
      id_examen_catalogo: formData.id_examen_catalogo!,
      fecha_realizacion: formData.fecha_realizacion!,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      resultado: formData.resultado || "Pendiente",
      observaciones: formData.observaciones || null,
      adjunto_url: null
    });
    setShowAddExamen(false);
    setFormData({});
  };

  const handleAddCursoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    await addCurso({
      id_trabajador: selectedUserId,
      id_curso_catalogo: formData.id_curso_catalogo!,
      institucion: formData.institucion || null,
      modalidad: formData.modalidad || null,
      fecha_realizacion: formData.fecha_realizacion!,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      estado: (formData.estado as EstadoCurso) || "Pendiente",
      observaciones: formData.observaciones || null,
      certificado_url: null
    });
    setShowAddCurso(false);
    setFormData({});
  };

  const handleMassAssignCursoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkersForMass.length === 0) return alert("Selecciona al menos un trabajador.");

    await useControlStore.getState().addCursoMasivo(selectedWorkersForMass, {
      id_curso_catalogo: formData.id_curso_catalogo!,
      institucion: formData.institucion || null,
      modalidad: formData.modalidad || null,
      fecha_realizacion: formData.fecha_realizacion!,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      estado: (formData.estado as EstadoCurso) || "Pendiente",
      observaciones: formData.observaciones || null,
      certificado_url: null
    });

    setShowMassAssignCurso(false);
    setSelectedWorkersForMass([]);
    setFormData({});
  };

  const handleAddDocumentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    await addDocumento({
      id_trabajador: selectedUserId,
      id_documento_catalogo: formData.id_documento_catalogo!,
      numero_documento: formData.numero_documento || null,
      fecha_emision: formData.fecha_emision!,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      estado: (formData.estado as EstadoDocumento) || "Vigente",
      observaciones: formData.observaciones || null,
      adjunto_url: null
    });
    setShowAddDocumento(false);
    setFormData({});
  };

  const handleMassAssignDocumentoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkersForMass.length === 0) return alert("Selecciona al menos un trabajador.");

    await useControlStore.getState().addDocumentoMasivo(selectedWorkersForMass, {
      id_documento_catalogo: formData.id_documento_catalogo!,
      numero_documento: null, // No se puede asignar número masivamente
      fecha_emision: formData.fecha_emision!,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      estado: (formData.estado as EstadoDocumento) || "Vigente",
      observaciones: formData.observaciones || null,
      adjunto_url: null
    });

    setShowMassAssignDocumento(false);
    setSelectedWorkersForMass([]);
    setFormData({});
  };

  const toggleWorkerMass = (id: string) => {
    setSelectedWorkersForMass(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const getBadgeStyle = (nivel: string) => {
    switch(nivel) {
      case "vencido": return "bg-danger/10 text-danger border-danger/20";
      case "critico": return "bg-warning/10 text-warning border-warning/20";
      case "alerta": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "pendiente": return "badge-blue";
      default: return "bg-success/10 text-success border-success/20";
    }
  };

  // VISTA: DETALLE DE TRABAJADOR
  if (selectedUserId && selectedUser) {
    const userExams = examenes.filter(e => e.id_trabajador === selectedUserId);
    const userCursos = cursos.filter(c => c.id_trabajador === selectedUserId);
    const userDocumentos = documentos.filter(d => d.id_trabajador === selectedUserId);
    const userAlertas = getAlertasByTrabajador(selectedUserId);

    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pt-4">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedUserId(null)}
            className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-3">
              <User className="text-primary" size={32} /> 
              Perfil de Salud y Formación
            </h1>
            <p className="text-sm font-bold text-text-soft mt-1">
              {selectedUser.nombre_1} {selectedUser.apellido_paterno} • {selectedUser.numero_identificacion}
            </p>
          </div>
        </div>

        {/* Alertas del Trabajador */}
        {userAlertas.filter(a => a.nivel !== "vigente").length > 0 && (
          <div className="p-5 rounded-2xl border border-warning/30 bg-warning/5">
            <h3 className="font-bold text-warning mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Alertas Activas
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {userAlertas.filter(a => a.nivel !== "vigente").map(a => (
                <div key={a.id} className={`badge px-3 py-1.5 ${getBadgeStyle(a.nivel)}`}>
                  {a.tipo === "Examen" ? <Stethoscope size={14}/> : a.tipo === "Curso" ? <BookOpen size={14}/> : <FileBadge size={14}/>}
                  {a.nombre}: {a.nivel === "vencido" ? "VENCIDO" : a.nivel === "pendiente" ? "PENDIENTE" : `Vence en ${a.dias_restantes} días`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PANEL EXAMENES */}
          <div className="card space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <Stethoscope className="text-primary" size={20}/> Exámenes Médicos
              </h3>
              <button 
                onClick={() => { setShowAddExamen(true); setShowAddCurso(false); setShowAddDocumento(false); }}
                className="btn py-1.5 px-3 min-h-0 text-xs btn-primary"
              >
                + Registrar Examen
              </button>
            </div>

            {/* Formulario Add Examen */}
            {showAddExamen && (
              <form onSubmit={handleAddExamenSubmit} className="p-5 bg-surface-2 border border-primary/20 rounded-xl space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0">Tipo de Examen *</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          const name = prompt("Nombre del nuevo examen:");
                          if (!name) return;
                          const cat = prompt("Categoría:", "Salud Ocupacional");
                          if (!cat) return;
                          await addExamenCatalogo(name, cat);
                        }}
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        + Crear Nuevo
                      </button>
                    </div>
                    <select required className="input" 
                      value={formData.id_examen_catalogo || ""}
                      onChange={e => setFormData({...formData, id_examen_catalogo: e.target.value})}>
                      <option value="">Seleccionar del catálogo...</option>
                      {catalogoExamenes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Realización *</label>
                    <input required type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_realizacion: e.target.value})}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Vencimiento</label>
                    <input type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Resultado *</label>
                    <select required className="input"
                      onChange={e => setFormData({...formData, resultado: e.target.value as ResultadoExamen})}>
                      <option value="">Seleccionar...</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Aprobado con Observaciones">Aprobado con Observaciones</option>
                      <option value="Rechazado">Rechazado</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Adjuntar Documento</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-surface hover:bg-surface-2 border-border hover:border-primary/50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                          <UploadCloud className="w-6 h-6 mb-2 text-text-muted" />
                          <p className="text-xs text-text-soft"><span className="font-semibold text-primary">Click para subir</span> o arrastra un archivo</p>
                          <p className="text-[10px] text-text-muted mt-1">PDF, JPG o PNG (Max. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddExamen(false)} className="btn btn-secondary py-1.5 px-4 min-h-0 text-xs">Cancelar</button>
                  <button type="submit" className="btn btn-primary py-1.5 px-4 min-h-0 text-xs">Guardar Examen</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {userExams.length === 0 ? (
                <p className="text-sm font-medium text-text-muted italic p-6 text-center border border-dashed border-border rounded-xl bg-surface-2/50">No hay exámenes registrados.</p>
              ) : (
                userExams.map(ex => {
                  const cat = catalogoExamenes.find(c => c.id === ex.id_examen_catalogo);
                  return (
                    <div key={ex.id} className="p-4 rounded-xl border border-border bg-surface flex justify-between items-start hover:border-primary/30 transition-all">
                      <div>
                        <p className="font-bold text-text text-sm">{cat ? cat.nombre : "Desconocido"}</p>
                        <p className="text-xs font-medium text-text-soft mt-1.5">Realizado: {ex.fecha_realizacion} {ex.fecha_vencimiento && `• Vence: ${ex.fecha_vencimiento}`}</p>
                        {ex.observaciones && <p className="text-xs font-bold text-warning mt-2 bg-warning/5 p-1.5 rounded inline-block">Obs: {ex.observaciones}</p>}
                      </div>
                      <span className={`badge ${
                        ex.resultado === "Aprobado" ? "bg-success/10 text-success border-success/20" :
                        ex.resultado.includes("Observaciones") ? "bg-warning/10 text-warning border-warning/20" :
                        ex.resultado === "Pendiente" ? "bg-bg-alt text-text-muted border-border" :
                        "bg-danger/10 text-danger border-danger/20"
                      }`}>
                        {ex.resultado}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL CURSOS */}
          <div className="card space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <BookOpen className="text-purple-500" size={20}/> Cursos y Formación
              </h3>
              <button 
                onClick={() => { setShowAddCurso(true); setShowAddExamen(false); setShowAddDocumento(false); }}
                className="btn py-1.5 px-3 min-h-0 text-xs bg-purple-600 text-white hover:bg-purple-700 border-none"
              >
                + Registrar Curso
              </button>
            </div>

             {/* Formulario Add Curso */}
             {showAddCurso && (
              <form onSubmit={handleAddCursoSubmit} className="p-5 bg-surface-2 border border-purple-500/20 rounded-xl space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0">Nombre del Curso *</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          const name = prompt("Nombre del nuevo curso:");
                          if (!name) return;
                          const cat = prompt("Categoría:", "Seguridad y Salud");
                          if (!cat) return;
                          const validezStr = prompt("Tiempo de validez en meses (vacío para sin vencimiento):", "");
                          if (validezStr === null) return;
                          const valMeses = validezStr.trim() ? parseInt(validezStr.trim(), 10) : null;
                          await addCursoCatalogo(name, cat, valMeses !== null && isNaN(valMeses) ? null : valMeses);
                        }}
                        className="text-[10px] text-purple-400 font-bold hover:underline"
                      >
                        + Crear Nuevo
                      </button>
                    </div>
                    <select required className="input" 
                      value={formData.id_curso_catalogo || ""}
                      onChange={e => setFormData({...formData, id_curso_catalogo: e.target.value})}>
                      <option value="">Seleccionar del catálogo...</option>
                      {catalogoCursos.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Institución</label>
                    <input type="text" className="input" 
                      onChange={e => setFormData({...formData, institucion: e.target.value})}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Realización *</label>
                    <input required type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_realizacion: e.target.value})}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Vencimiento</label>
                    <input type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Estado *</label>
                    <select required className="input"
                      onChange={e => setFormData({...formData, estado: e.target.value as EstadoCurso})}>
                      <option value="">Seleccionar...</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Reprobado">Reprobado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="No Asiste">No Asiste</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Certificado</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-surface hover:bg-surface-2 border-border hover:border-primary/50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                          <UploadCloud className="w-6 h-6 mb-2 text-text-muted" />
                          <p className="text-xs text-text-soft"><span className="font-semibold text-primary">Click para subir</span> o arrastra un archivo</p>
                          <p className="text-[10px] text-text-muted mt-1">PDF, JPG o PNG (Max. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddCurso(false)} className="btn btn-secondary py-1.5 px-4 min-h-0 text-xs">Cancelar</button>
                  <button type="submit" className="btn py-1.5 px-4 min-h-0 text-xs bg-purple-600 text-white hover:bg-purple-700 border-none">Guardar Curso</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {userCursos.length === 0 ? (
                <p className="text-sm font-medium text-text-muted italic p-6 text-center border border-dashed border-border rounded-xl bg-surface-2/50">No hay cursos registrados.</p>
              ) : (
                userCursos.map(cu => {
                  const cat = catalogoCursos.find(c => c.id === cu.id_curso_catalogo);
                  return (
                    <div key={cu.id} className="p-4 rounded-xl border border-border bg-surface flex justify-between items-start hover:border-purple-500/30 transition-all">
                      <div>
                        <p className="font-bold text-text text-sm">{cat ? cat.nombre : "Desconocido"}</p>
                        <p className="text-xs font-medium text-text-soft mt-1.5">
                          {cu.institucion && <span className="mr-2">🏢 {cu.institucion}</span>}
                          {cu.modalidad && <span>💻 {cu.modalidad}</span>}
                        </p>
                        <p className="text-xs font-medium text-text-soft mt-1.5">Realizado: {cu.fecha_realizacion} {cu.fecha_vencimiento && `• Vence: ${cu.fecha_vencimiento}`}</p>
                      </div>
                      <span className={`badge ${
                        cu.estado === "Aprobado" ? "bg-success/10 text-success border-success/20" :
                        cu.estado === "Pendiente" ? "bg-bg-alt text-text-muted border-border" :
                        "bg-danger/10 text-danger border-danger/20"
                      }`}>
                        {cu.estado}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL DOCUMENTOS Y PASES */}
          <div className="card space-y-5 p-6 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <FileBadge className="text-amber-500" size={20}/> Documentos y Pases
              </h3>
              <button 
                onClick={() => { setShowAddDocumento(true); setShowAddCurso(false); setShowAddExamen(false); }}
                className="btn py-1.5 px-3 min-h-0 text-xs bg-amber-500 text-white hover:bg-amber-600 border-none"
              >
                + Registrar Pase/Doc
              </button>
            </div>

            {/* Formulario Add Documento */}
            {showAddDocumento && (
              <form onSubmit={handleAddDocumentoSubmit} className="p-5 bg-surface-2 border border-amber-500/20 rounded-xl space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0">Documento *</label>
                      <button 
                        type="button" 
                        onClick={async () => {
                          const name = prompt("Nombre de la acreditación/documento:");
                          if (!name) return;
                          const cat = prompt("Categoría:", "Acreditación");
                          if (!cat) return;
                          await addDocumentoCatalogo(name, cat);
                        }}
                        className="text-[10px] text-amber-500 font-bold hover:underline"
                      >
                        + Crear Nuevo
                      </button>
                    </div>
                    <select required className="input" 
                      value={formData.id_documento_catalogo || ""}
                      onChange={e => setFormData({...formData, id_documento_catalogo: e.target.value})}>
                      <option value="">Seleccionar del catálogo...</option>
                      {catalogoDocumentos.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Número (Opcional)</label>
                    <input type="text" className="input" 
                      onChange={e => setFormData({...formData, numero_documento: e.target.value})} placeholder="Ej: 12345"/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Estado *</label>
                    <select required className="input"
                      onChange={e => setFormData({...formData, estado: e.target.value as EstadoDocumento})}>
                      <option value="Vigente">Vigente</option>
                      <option value="Vencido">Vencido</option>
                      <option value="Retenido">Retenido</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Emisión *</label>
                    <input required type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_emision: e.target.value})}/>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Vencimiento</label>
                    <input type="date" className="input" 
                      onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddDocumento(false)} className="btn btn-secondary py-1.5 px-4 min-h-0 text-xs">Cancelar</button>
                  <button type="submit" className="btn py-1.5 px-4 min-h-0 text-xs bg-amber-500 text-white hover:bg-amber-600 border-none">Guardar Documento</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userDocumentos.length === 0 ? (
                <p className="col-span-2 text-sm font-medium text-text-muted italic p-6 text-center border border-dashed border-border rounded-xl bg-surface-2/50">No hay documentos ni pases registrados.</p>
              ) : (
                userDocumentos.map(doc => {
                  const cat = catalogoDocumentos.find(c => c.id === doc.id_documento_catalogo);
                  return (
                    <div key={doc.id} className="p-4 rounded-xl border border-border bg-surface flex justify-between items-start hover:border-amber-500/30 transition-all">
                      <div>
                        <p className="font-bold text-text text-sm">{cat ? cat.nombre : "Desconocido"}</p>
                        {doc.numero_documento && <p className="text-[11px] font-bold text-primary mt-1">Nº {doc.numero_documento}</p>}
                        <p className="text-xs font-medium text-text-soft mt-1.5">Emisión: {doc.fecha_emision} {doc.fecha_vencimiento && `• Vence: ${doc.fecha_vencimiento}`}</p>
                      </div>
                      <span className={`badge ${
                        doc.estado === "Vigente" ? "bg-success/10 text-success border-success/20" :
                        "bg-danger/10 text-danger border-danger/20"
                      }`}>
                        {doc.estado}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL (Dashboard / Matriz)
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <GraduationCap className="text-primary" size={32} />
            Control y Acreditaciones
          </h1>
          <p className="text-sm font-medium text-text-soft mt-1">
            Control de vigencia de exámenes de salud, certificaciones y pases de faena.
          </p>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => { setShowMassAssignCurso(true); setSelectedWorkersForMass([]); }}
              className="btn py-2 text-xs bg-purple-600 text-white hover:bg-purple-700 border-none flex items-center gap-2"
            >
              <BookOpen size={14} /> Asignar Curso Masivo
            </button>
            <button 
              onClick={() => { setShowMassAssignDocumento(true); setSelectedWorkersForMass([]); }}
              className="btn py-2 text-xs bg-amber-500 text-white hover:bg-amber-600 border-none flex items-center gap-2"
            >
              <FileBadge size={14} /> Asignar Pase Masivo
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={selectedContratoDashboard} 
            onChange={(e) => setSelectedContratoDashboard(e.target.value)}
            className="input min-h-0 py-2 w-auto bg-surface"
          >
            <option value="Todos">Todos los Contratos</option>
            {activeContratos.map(c => <option key={c.id_contrato} value={c.id_contrato}>{c.nombre_contrato}</option>)}
          </select>

          <div className="flex bg-surface-2 p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "dashboard" ? "bg-primary text-primary-content shadow-md" : "text-text-muted hover:text-text hover:bg-surface"
              }`}
            >
              <Activity size={16}/> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("trabajadores")}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "trabajadores" ? "bg-primary text-primary-content shadow-md" : "text-text-muted hover:text-text hover:bg-surface"
              }`}
            >
              <User size={16}/> Trabajadores
            </button>
            <button
              onClick={() => setActiveTab("catalogos")}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2.5 transition-all ${
                activeTab === "catalogos" ? "bg-primary text-primary-content shadow-md" : "text-text-muted hover:text-text hover:bg-surface"
              }`}
            >
              <BookOpen size={16}/> Catálogos
            </button>
          </div>
        </div>
      </div>

      {showMassAssignCurso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-text flex items-center gap-2"><BookOpen className="text-purple-500" size={24}/> Asignar Curso Masivo</h2>
              <button onClick={() => setShowMassAssignCurso(false)} className="text-text-muted hover:text-text"><XCircle size={24}/></button>
            </div>
            
            <form onSubmit={handleMassAssignCursoSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-surface-2 p-5 rounded-xl border border-purple-500/20">
                <div className="col-span-2 space-y-1.5">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0">Curso a Asignar *</label>
                    <button 
                      type="button" 
                      onClick={async () => {
                        const name = prompt("Nombre del nuevo curso:");
                        if (!name) return;
                        const cat = prompt("Categoría:", "Seguridad y Salud");
                        if (!cat) return;
                        const validezStr = prompt("Tiempo de validez en meses (vacío para sin vencimiento):", "");
                        if (validezStr === null) return;
                        const valMeses = validezStr.trim() ? parseInt(validezStr.trim(), 10) : null;
                        await addCursoCatalogo(name, cat, valMeses !== null && isNaN(valMeses) ? null : valMeses);
                      }}
                      className="text-[10px] text-purple-400 font-bold hover:underline"
                    >
                      + Crear Nuevo
                    </button>
                  </div>
                  <select required className="input bg-surface" 
                    value={formData.id_curso_catalogo || ""}
                    onChange={e => setFormData({...formData, id_curso_catalogo: e.target.value})}>
                    <option value="">Seleccionar del catálogo...</option>
                    {catalogoCursos.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Realización *</label>
                  <input required type="date" className="input bg-surface" onChange={e => setFormData({...formData, fecha_realizacion: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Estado *</label>
                  <select required className="input bg-surface" onChange={e => setFormData({...formData, estado: e.target.value as EstadoCurso})}>
                    <option value="">Seleccionar...</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Reprobado">Reprobado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="No Asiste">No Asiste</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text mb-3">Seleccionar Trabajadores ({selectedWorkersForMass.length} seleccionados)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {trabajadores.map(t => (
                    <label key={t.id_trabajador} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:border-primary/40 cursor-pointer transition-all">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary"
                        checked={selectedWorkersForMass.includes(t.id_trabajador)}
                        onChange={() => toggleWorkerMass(t.id_trabajador)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{t.nombre_1} {t.apellido_paterno}</p>
                        <p className="text-[10px] text-text-muted">{t.cargo || "Sin cargo"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowMassAssignCurso(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn bg-purple-600 text-white hover:bg-purple-700 border-none">Asignar Curso a {selectedWorkersForMass.length} trabajadores</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMassAssignDocumento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-text flex items-center gap-2"><FileBadge className="text-amber-500" size={24}/> Asignar Pase/Documento Masivo</h2>
              <button onClick={() => setShowMassAssignDocumento(false)} className="text-text-muted hover:text-text"><XCircle size={24}/></button>
            </div>
            
            <form onSubmit={handleMassAssignDocumentoSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-surface-2 p-5 rounded-xl border border-amber-500/20">
                <div className="col-span-2 space-y-1.5">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0">Documento a Asignar *</label>
                    <button 
                      type="button" 
                      onClick={async () => {
                        const name = prompt("Nombre de la acreditación/documento:");
                        if (!name) return;
                        const cat = prompt("Categoría:", "Acreditación");
                        if (!cat) return;
                        await addDocumentoCatalogo(name, cat);
                      }}
                      className="text-[10px] text-amber-500 font-bold hover:underline"
                    >
                      + Crear Nuevo
                    </button>
                  </div>
                  <select required className="input bg-surface" 
                    value={formData.id_documento_catalogo || ""}
                    onChange={e => setFormData({...formData, id_documento_catalogo: e.target.value})}>
                    <option value="">Seleccionar del catálogo...</option>
                    {catalogoDocumentos.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.categoria})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Emisión *</label>
                  <input required type="date" className="input bg-surface" onChange={e => setFormData({...formData, fecha_emision: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Fecha Vencimiento *</label>
                  <input required type="date" className="input bg-surface" onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-text mb-3">Seleccionar Trabajadores ({selectedWorkersForMass.length} seleccionados)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {trabajadores.map(t => (
                    <label key={t.id_trabajador} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface hover:border-amber-500/40 cursor-pointer transition-all">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary"
                        checked={selectedWorkersForMass.includes(t.id_trabajador)}
                        onChange={() => toggleWorkerMass(t.id_trabajador)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text truncate">{t.nombre_1} {t.apellido_paterno}</p>
                        <p className="text-[10px] text-text-muted">{t.cargo || "Sin cargo"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={() => setShowMassAssignDocumento(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn bg-amber-500 text-white hover:bg-amber-600 border-none">Asignar Documento a {selectedWorkersForMass.length} trabajadores</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats KPI */}
          <div className="stats-grid">
            <div className="stat-box border-danger/30 bg-danger/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-danger font-bold uppercase tracking-wider">Vencidos</p>
                  <p className="text-3xl font-bold text-danger mt-1">{stats.vencidos}</p>
                </div>
                <XCircle className="text-danger/50" size={24}/>
              </div>
            </div>
            
            <div className="stat-box border-warning/30 bg-warning/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-warning font-bold uppercase tracking-wider">Crítico (≤ 30 días)</p>
                  <p className="text-3xl font-bold text-warning mt-1">{stats.criticos}</p>
                </div>
                <ShieldAlert className="text-warning/50" size={24}/>
              </div>
            </div>

            <div className="stat-box border-amber-500/30 bg-amber-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Alerta (≤ 60 días)</p>
                  <p className="text-3xl font-bold text-amber-500 mt-1">{stats.alertas}</p>
                </div>
                <AlertTriangle className="text-amber-500/50" size={24}/>
              </div>
            </div>

            <div className="stat-box border-primary/30 bg-primary/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Pendientes / Incompletos</p>
                  <p className="text-3xl font-bold text-primary mt-1">{stats.pendientes}</p>
                </div>
                <Clock className="text-primary/50" size={24}/>
              </div>
            </div>
          </div>

          {/* Tabla de Vencimientos Próximos */}
          <div className="table-shell">
            <div className="p-5 border-b border-border bg-surface flex justify-between items-center">
              <h3 className="font-bold text-text flex items-center gap-2"><Calendar size={20} className="text-primary"/> Próximos Vencimientos y Alertas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-text-muted uppercase bg-surface-2 border-b border-border font-bold">
                  <tr>
                    <th className="px-5 py-4">Nivel</th>
                    <th className="px-5 py-4">Tipo</th>
                    <th className="px-5 py-4">Trabajador</th>
                    <th className="px-5 py-4">Certificación / Examen</th>
                    <th className="px-5 py-4">Vencimiento</th>
                    <th className="px-5 py-4">Estado actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {todasLasAlertas.filter(a => a.alerta.nivel !== "vigente").slice(0, 15).map((item, i) => {
                    const tr = trabajadores.find(t => t.id_trabajador === item.trabajador_id);
                    const { alerta } = item;
                    return (
                      <tr key={i} className="hover:bg-surface-2 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`badge ${getBadgeStyle(alerta.nivel)}`}>
                            {alerta.nivel}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-text-soft text-xs font-medium">
                          {alerta.tipo === "Examen" ? <span className="flex items-center gap-1.5"><Stethoscope size={14}/> Examen</span> : <span className="flex items-center gap-1.5"><BookOpen size={14}/> Curso</span>}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-bold text-text">{tr ? `${tr.nombre_1} ${tr.apellido_paterno}` : "Desconocido"}</p>
                        </td>
                        <td className="px-5 py-3 font-semibold text-text">{alerta.nombre}</td>
                        <td className="px-5 py-3 text-text-soft font-medium">
                          {alerta.fecha_vencimiento || "—"} 
                          {alerta.dias_restantes !== null && (
                            <span className="text-[10px] font-bold text-text-muted ml-2">({alerta.dias_restantes} d)</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-text-muted font-medium">{alerta.estado_texto}</td>
                      </tr>
                    );
                  })}
                  {todasLasAlertas.filter(a => a.alerta.nivel !== "vigente").length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-text-soft italic">No hay alertas críticas en este momento.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trabajadores" && (
        <div className="table-shell flex flex-col h-[600px]">
          <div className="p-4 border-b border-border bg-surface-2 flex gap-4 items-center">
            <div className="relative flex-1 min-w-[250px] max-w-sm">
              <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar trabajador..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-text-muted uppercase bg-surface-2 sticky top-0 z-10 border-b border-border font-bold">
                <tr>
                  <th className="px-5 py-4">Trabajador</th>
                  <th className="px-5 py-4">Cargo</th>
                  <th className="px-5 py-4">Estado General Exámenes</th>
                  <th className="px-5 py-4">Estado General Cursos</th>
                  <th className="px-5 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((t) => {
                  const alertas = getAlertasByTrabajador(t.id_trabajador);
                  const alertasExamen = alertas.filter(a => a.tipo === "Examen");
                  const alertasCurso = alertas.filter(a => a.tipo === "Curso");

                  const highestExamen = alertasExamen.find(a => a.nivel === "vencido") || 
                                        alertasExamen.find(a => a.nivel === "critico") || 
                                        alertasExamen.find(a => a.nivel === "alerta") || 
                                        alertasExamen.find(a => a.nivel === "pendiente");
                  
                  const highestCurso = alertasCurso.find(a => a.nivel === "vencido") || 
                                       alertasCurso.find(a => a.nivel === "critico") || 
                                       alertasCurso.find(a => a.nivel === "alerta") || 
                                       alertasCurso.find(a => a.nivel === "pendiente");

                  return (
                    <tr key={t.id_trabajador} className="hover:bg-surface-2 transition-colors group cursor-pointer" onClick={() => setSelectedUserId(t.id_trabajador)}>
                      <td className="px-5 py-3">
                        <p className="font-bold text-text">{t.nombre_1} {t.apellido_paterno}</p>
                        <p className="text-[10px] text-text-muted font-mono font-bold mt-0.5">{t.numero_identificacion}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-text-soft">{t.cargo || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        {highestExamen ? (
                          <span className={`badge ${getBadgeStyle(highestExamen.nivel)}`}>
                            {highestExamen.nivel}
                          </span>
                        ) : (
                          <span className="badge bg-success/10 text-success border-success/20"><CheckCircle2 size={12} className="inline mr-1"/>AL DÍA</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {highestCurso ? (
                          <span className={`badge ${getBadgeStyle(highestCurso.nivel)}`}>
                            {highestCurso.nivel}
                          </span>
                        ) : (
                          <span className="badge bg-success/10 text-success border-success/20"><CheckCircle2 size={12} className="inline mr-1"/>AL DÍA</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="opacity-0 group-hover:opacity-100 text-primary text-xs font-bold hover:text-primary-hover transition-all">
                          Ver Detalle →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "catalogos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* COLUMNA CURSOS */}
          <div className="card space-y-5 p-6 border-purple-500/20 bg-surface flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <BookOpen className="text-purple-500" size={20}/> Catálogo de Cursos
              </h3>
              <button 
                onClick={() => setShowAddCursoForm(!showAddCursoForm)}
                className="btn py-1.5 px-3 min-h-0 text-xs bg-purple-600 text-white hover:bg-purple-700 border-none flex items-center gap-1"
              >
                <Plus size={14}/> {showAddCursoForm ? "Cerrar" : "Nuevo"}
              </button>
            </div>

            {showAddCursoForm && (
              <form onSubmit={handleCreateCurso} className="p-4 bg-surface-2 border border-purple-500/20 rounded-xl space-y-3 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Nombre del Curso</label>
                  <input required type="text" value={newCursoName} onChange={e => setNewCursoName(e.target.value)} placeholder="Ej: Trabajo en Altura" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Categoría</label>
                  <input required type="text" value={newCursoCat} onChange={e => setNewCursoCat(e.target.value)} placeholder="Ej: Seguridad / Técnico" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Validez (Meses)</label>
                  <input type="number" value={newCursoValidez} onChange={e => setNewCursoValidez(e.target.value)} placeholder="Ej: 12 (opcional)" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddCursoForm(false)} className="btn btn-secondary py-1 px-3 min-h-0 text-[11px]">Cancelar</button>
                  <button type="submit" className="btn bg-purple-600 text-white hover:bg-purple-700 border-none py-1 px-3 min-h-0 text-[11px] flex items-center gap-1"><Save size={12}/> Guardar</button>
                </div>
              </form>
            )}

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar curso..." 
                value={searchCurso}
                onChange={(e) => setSearchCurso(e.target.value)}
                className="input pl-9 text-xs py-2 min-h-0 bg-surface-2"
              />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {catalogoCursos
                .filter(c => c.nombre.toLowerCase().includes(searchCurso.toLowerCase()) || c.categoria.toLowerCase().includes(searchCurso.toLowerCase()))
                .map(c => {
                  const numAsignado = cursos.filter(x => x.id_curso_catalogo === c.id).length;
                  return (
                    <div key={c.id} className="p-3 rounded-lg border border-border bg-surface-2 flex justify-between items-center hover:border-purple-500/30 transition-all group">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-text text-xs truncate" title={c.nombre}>{c.nombre}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400">{c.categoria}</span>
                          {c.validez_meses && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-300">Validez: {c.validez_meses} meses</span>
                          )}
                          {numAsignado > 0 && <span className="text-[9px] text-text-muted font-semibold">({numAsignado} asignado{numAsignado > 1 ? "s" : ""})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={() => handleEditCurso(c)}
                          className="p-1.5 rounded-lg border border-transparent transition-all text-text-muted hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                          title="Editar curso del catálogo"
                        >
                          <Edit2 size={13}/>
                        </button>
                        <button 
                          type="button"
                          onClick={async () => {
                            if (confirm(`¿Eliminar "${c.nombre}" del catálogo?`)) {
                              const res = await deleteCursoCatalogo(c.id);
                              if (!res.success) alert(res.message);
                            }
                          }}
                          className={`p-1.5 rounded-lg border transition-all text-text-muted hover:text-danger hover:bg-danger/10 border-transparent hover:border-danger/20 ${numAsignado > 0 ? "cursor-not-allowed opacity-40" : "opacity-0 group-hover:opacity-100"}`}
                          title={numAsignado > 0 ? "No se puede eliminar: está asignado a trabajadores" : "Eliminar del catálogo"}
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              {catalogoCursos.filter(c => c.nombre.toLowerCase().includes(searchCurso.toLowerCase()) || c.categoria.toLowerCase().includes(searchCurso.toLowerCase())).length === 0 && (
                <p className="text-center text-xs text-text-muted italic py-6">No se encontraron cursos.</p>
              )}
            </div>
          </div>

          {/* COLUMNA EXÁMENES */}
          <div className="card space-y-5 p-6 border-primary/20 bg-surface flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <Stethoscope className="text-primary" size={20}/> Catálogo de Exámenes
              </h3>
              <button 
                onClick={() => setShowAddExamenForm(!showAddExamenForm)}
                className="btn py-1.5 px-3 min-h-0 text-xs btn-primary flex items-center gap-1"
              >
                <Plus size={14}/> {showAddExamenForm ? "Cerrar" : "Nuevo"}
              </button>
            </div>

            {showAddExamenForm && (
              <form onSubmit={handleCreateExamen} className="p-4 bg-surface-2 border border-primary/20 rounded-xl space-y-3 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Nombre del Examen</label>
                  <input required type="text" value={newExamenName} onChange={e => setNewExamenName(e.target.value)} placeholder="Ej: Psicosensométrico" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Categoría</label>
                  <input required type="text" value={newExamenCat} onChange={e => setNewExamenCat(e.target.value)} placeholder="Ej: Salud Ocupacional" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddExamenForm(false)} className="btn btn-secondary py-1 px-3 min-h-0 text-[11px]">Cancelar</button>
                  <button type="submit" className="btn btn-primary py-1 px-3 min-h-0 text-[11px] flex items-center gap-1"><Save size={12}/> Guardar</button>
                </div>
              </form>
            )}

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar examen..." 
                value={searchExamen}
                onChange={(e) => setSearchExamen(e.target.value)}
                className="input pl-9 text-xs py-2 min-h-0 bg-surface-2"
              />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {catalogoExamenes
                .filter(c => c.nombre.toLowerCase().includes(searchExamen.toLowerCase()) || c.categoria.toLowerCase().includes(searchExamen.toLowerCase()))
                .map(c => {
                  const numAsignado = examenes.filter(x => x.id_examen_catalogo === c.id).length;
                  return (
                    <div key={c.id} className="p-3 rounded-lg border border-border bg-surface-2 flex justify-between items-center hover:border-primary/30 transition-all group">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-text text-xs truncate" title={c.nombre}>{c.nombre}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary">{c.categoria}</span>
                          {numAsignado > 0 && <span className="text-[9px] text-text-muted font-semibold">({numAsignado} asignado{numAsignado > 1 ? "s" : ""})</span>}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (confirm(`¿Eliminar "${c.nombre}" del catálogo?`)) {
                            const res = await deleteExamenCatalogo(c.id);
                            if (!res.success) alert(res.message);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all text-text-muted hover:text-danger hover:bg-danger/10 border-transparent hover:border-danger/20 ${numAsignado > 0 ? "cursor-not-allowed opacity-40" : "opacity-0 group-hover:opacity-100"}`}
                        title={numAsignado > 0 ? "No se puede eliminar: está asignado a trabajadores" : "Eliminar del catálogo"}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                })}
              {catalogoExamenes.filter(c => c.nombre.toLowerCase().includes(searchExamen.toLowerCase()) || c.categoria.toLowerCase().includes(searchExamen.toLowerCase())).length === 0 && (
                <p className="text-center text-xs text-text-muted italic py-6">No se encontraron exámenes.</p>
              )}
            </div>
          </div>

          {/* COLUMNA DOCUMENTOS / ACREDITACIONES */}
          <div className="card space-y-5 p-6 border-amber-500/20 bg-surface flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-text flex items-center gap-2.5">
                <FileBadge className="text-amber-500" size={20}/> Catálogo de Acreditaciones
              </h3>
              <button 
                onClick={() => setShowAddDocForm(!showAddDocForm)}
                className="btn py-1.5 px-3 min-h-0 text-xs bg-amber-500 text-white hover:bg-amber-600 border-none flex items-center gap-1"
              >
                <Plus size={14}/> {showAddDocForm ? "Cerrar" : "Nuevo"}
              </button>
            </div>

            {showAddDocForm && (
              <form onSubmit={handleCreateDoc} className="p-4 bg-surface-2 border border-amber-500/20 rounded-xl space-y-3 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Nombre del Documento / Pase</label>
                  <input required type="text" value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Ej: Pase de Ingreso Faena" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase block">Categoría</label>
                  <input required type="text" value={newDocCat} onChange={e => setNewDocCat(e.target.value)} placeholder="Ej: Acreditación / Pase" className="input bg-surface text-sm py-1.5"/>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddDocForm(false)} className="btn btn-secondary py-1 px-3 min-h-0 text-[11px]">Cancelar</button>
                  <button type="submit" className="btn bg-amber-500 text-white hover:bg-amber-600 border-none py-1 px-3 min-h-0 text-[11px] flex items-center gap-1"><Save size={12}/> Guardar</button>
                </div>
              </form>
            )}

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Buscar documento..." 
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="input pl-9 text-xs py-2 min-h-0 bg-surface-2"
              />
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {catalogoDocumentos
                .filter(c => c.nombre.toLowerCase().includes(searchDoc.toLowerCase()) || c.categoria.toLowerCase().includes(searchDoc.toLowerCase()))
                .map(c => {
                  const numAsignado = documentos.filter(x => x.id_documento_catalogo === c.id).length;
                  return (
                    <div key={c.id} className="p-3 rounded-lg border border-border bg-surface-2 flex justify-between items-center hover:border-amber-500/30 transition-all group">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-text text-xs truncate" title={c.nombre}>{c.nombre}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">{c.categoria}</span>
                          {numAsignado > 0 && <span className="text-[9px] text-text-muted font-semibold">({numAsignado} asignado{numAsignado > 1 ? "s" : ""})</span>}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={async () => {
                          if (confirm(`¿Eliminar "${c.nombre}" del catálogo?`)) {
                            const res = await deleteDocumentoCatalogo(c.id);
                            if (!res.success) alert(res.message);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all text-text-muted hover:text-danger hover:bg-danger/10 border-transparent hover:border-danger/20 ${numAsignado > 0 ? "cursor-not-allowed opacity-40" : "opacity-0 group-hover:opacity-100"}`}
                        title={numAsignado > 0 ? "No se puede eliminar: está asignado a trabajadores" : "Eliminar del catálogo"}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                })}
              {catalogoDocumentos.filter(c => c.nombre.toLowerCase().includes(searchDoc.toLowerCase()) || c.categoria.toLowerCase().includes(searchDoc.toLowerCase())).length === 0 && (
                <p className="text-center text-xs text-text-muted italic py-6">No se encontraron documentos.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icono simple de flecha
function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}
