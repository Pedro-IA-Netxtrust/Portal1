"use client";

import React, { useState } from "react";
import { useControlStore, ExamenMedico, CursoCapacitacion } from "@/store/control-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useMaestrosStore } from "@/store/maestros-store";
import ControlForm from "@/components/custom/control-form";
import { 
  Plus, 
  Search, 
  HeartPulse, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  Layers, 
  Calendar,
  User,
  ShieldCheck,
  Check,
  Settings
} from "lucide-react";

export default function ControlPage() {
  const { examenes, cursos, deleteExamen, deleteCurso } = useControlStore();
  const { trabajadores } = useTrabajadoresStore();
  const { 
    examenesMaestros, 
    cursosMaestros, 
    addExamenMaestro, 
    deleteExamenMaestro, 
    addCursoMaestro, 
    deleteCursoMaestro 
  } = useMaestrosStore();

  const [activeTab, setActiveTab] = useState<"examen" | "curso" | "maestros">("examen");
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  // Master Forms State
  const [newExamen, setNewExamen] = useState({
    nombre_examen: "",
    duracion_meses: 12,
    descripcion: ""
  });

  const [newCurso, setNewCurso] = useState({
    nombre_curso: "",
    duracion_meses: 12,
    descripcion: ""
  });

  const handleAddExamenMaestro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamen.nombre_examen) return;
    addExamenMaestro({
      nombre_examen: newExamen.nombre_examen,
      duracion_meses: newExamen.duracion_meses,
      descripcion: newExamen.descripcion || undefined
    });
    setNewExamen({ nombre_examen: "", duracion_meses: 12, descripcion: "" });
  };

  const handleAddCursoMaestro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurso.nombre_curso) return;
    addCursoMaestro({
      nombre_curso: newCurso.nombre_curso,
      duracion_meses: newCurso.duracion_meses,
      descripcion: newCurso.descripcion || undefined
    });
    setNewCurso({ nombre_curso: "", duracion_meses: 12, descripcion: "" });
  };

  // Helper: Get worker full name
  const getWorkerName = (idWorker: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  // Helper: Get worker RUT/ID
  const getWorkerIdCard = (idWorker: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.tipo_identificacion}: ${worker.numero_identificacion}` : "";
  };

  // Helper: Expiration Semaphore
  const checkVencimientoAlerta = (vencimiento?: string) => {
    if (!vencimiento) return null;
    const hoy = new Date();
    const limit = new Date(vencimiento);
    hoy.setHours(0,0,0,0);
    limit.setHours(0,0,0,0);

    const diff = limit.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencido hace ${Math.abs(diffDays)} días`, color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (diffDays <= 30) return { text: `Expira en ${diffDays} días`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Vigente", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  // Filters
  const filteredExamenes = examenes.filter((e) => {
    const searchString = `${e.tipo_examen} ${e.resultado} ${e.entidad_evaluadora} ${getWorkerName(e.id_trabajador)}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const filteredCursos = cursos.filter((c) => {
    const searchString = `${c.nombre_curso} ${c.estado} ${getWorkerName(c.id_trabajador)}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalExams = examenes.length;
  const totalCursos = cursos.length;
  
  // Calculate overdue alerts for occupancy
  const overdueExams = examenes.filter(e => {
    const status = checkVencimientoAlerta(e.fecha_vencimiento);
    return status?.text.startsWith("Vencido");
  }).length;

  const compliedCursosRate = totalCursos > 0
    ? Math.round((cursos.filter(c => c.estado === "Completado").length / totalCursos) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cumplimiento Operativo y Formación</h1>
          <p className="text-xs text-zinc-500">
            Fase 3: Administra las vigencias de exámenes médicos ocupacionales y cursos de capacitación obligatorios (LMS).
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Registrar Habilitación
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <HeartPulse size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">EXÁMENES MEDICOS</span>
            <span className="text-lg font-bold text-white">{totalExams}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <GraduationCap size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CURSOS TOTALES</span>
            <span className="text-lg font-bold text-white">{totalCursos}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CUMPLIMIENTO CURSOS</span>
            <span className="text-lg font-bold text-white">{compliedCursosRate}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${overdueExams > 0 ? "bg-red-500/15 text-red-400 animate-pulse" : "bg-zinc-800 text-zinc-400"}`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">EXÁMENES VENCIDOS</span>
            <span className="text-lg font-bold text-white">{overdueExams}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800 space-x-6 bg-zinc-950 px-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab("examen")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "examen" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <HeartPulse size={16} />
          Exámenes Médicos ({totalExams})
        </button>
        <button
          onClick={() => setActiveTab("curso")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "curso" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <GraduationCap size={16} />
          Cursos y Capacitación ({totalCursos})
        </button>
        <button
          onClick={() => setActiveTab("maestros")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "maestros" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Settings size={16} />
          ⚙️ Catálogos Maestros
        </button>
      </div>

      {/* Search Filter (only for exams and courses tabs) */}
      {activeTab !== "maestros" && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder={activeTab === "examen" ? "Buscar por Tipo de Examen, Entidad, Resultado o Trabajador..." : "Buscar por Nombre del Curso, Estado o Trabajador..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Exámenes Médicos Grid */}
      {activeTab === "examen" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {filteredExamenes.map((e) => {
            const sem = checkVencimientoAlerta(e.fecha_vencimiento);
            return (
              <div 
                key={e.id_examen}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                        {getWorkerName(e.id_trabajador)}
                      </span>
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors mt-0.5">
                        {e.tipo_examen}
                      </h3>
                      <p className="text-[10px] text-zinc-500">{getWorkerIdCard(e.id_trabajador)}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      e.resultado === "Aprobado" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : e.resultado === "Pendiente"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {e.resultado}
                    </span>
                  </div>

                  {/* Date specs card */}
                  <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/60 text-xs text-zinc-400 space-y-2">
                    <div className="flex justify-between py-0.5">
                      <span>Evaluado en</span>
                      <strong className="text-white">{e.fecha_evaluacion}</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Entidad Evaluadora</span>
                      <strong className="text-white">{e.entidad_evaluadora}</strong>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span>Fecha Vencimiento</span>
                      <strong className="text-white">{e.fecha_vencimiento}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer and Semaphores */}
                <div className="flex justify-between items-center mt-5 pt-3 border-t border-zinc-800/40">
                  {sem && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${sem.color}`}>
                      {sem.text}
                    </span>
                  )}

                  <button
                    onClick={() => deleteExamen(e.id_examen)}
                    title="Eliminar Registro"
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all ml-auto cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredExamenes.length === 0 && (
            <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
              <Layers className="mx-auto text-zinc-700" size={32} />
              <h4 className="text-zinc-300 font-bold text-sm">No se encontraron exámenes registrados</h4>
            </div>
          )}
        </div>
      )}

      {/* Cursos y Capacitación Grid */}
      {activeTab === "curso" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {filteredCursos.map((c) => {
            const sem = checkVencimientoAlerta(c.fecha_vencimiento);
            return (
              <div 
                key={c.id_curso}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                        {getWorkerName(c.id_trabajador)}
                      </span>
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors mt-0.5">
                        {c.nombre_curso}
                      </h3>
                      <p className="text-[10px] text-zinc-500">{getWorkerIdCard(c.id_trabajador)}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      c.estado === "Completado" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : c.estado === "En Curso"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {c.estado}
                    </span>
                  </div>

                  {/* Date specs card */}
                  <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/60 text-xs text-zinc-400 space-y-2">
                    <div className="flex justify-between py-0.5">
                      <span>Fecha Capacitación</span>
                      <strong className="text-white">{c.fecha_capacitacion}</strong>
                    </div>
                    {c.fecha_vencimiento && (
                      <div className="flex justify-between py-0.5">
                        <span>Vencimiento</span>
                        <strong className="text-white">{c.fecha_vencimiento}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer and Semaphores */}
                <div className="flex justify-between items-center mt-5 pt-3 border-t border-zinc-800/40">
                  {sem && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${sem.color}`}>
                      {sem.text}
                    </span>
                  )}

                  <button
                    onClick={() => deleteCurso(c.id_curso)}
                    title="Eliminar Registro"
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all ml-auto cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCursos.length === 0 && (
            <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
              <Layers className="mx-auto text-zinc-700" size={32} />
              <h4 className="text-zinc-300 font-bold text-sm">No se encontraron cursos registrados</h4>
            </div>
          )}
        </div>
      )}

      {/* Catálogos Maestros (Administrative UI Dashboard) */}
      {activeTab === "maestros" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Exámenes Médicos Maestros */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <HeartPulse className="text-red-400" size={18} />
                    Catálogo Maestro de Exámenes
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Define la lista oficial de exámenes médicos y sus vigencias reglamentarias por defecto.
                  </p>
                </div>
              </div>

              {/* Add Examen Maestro Form */}
              <form onSubmit={handleAddExamenMaestro} className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-900/80 space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">➕ Crear Nuevo Examen Maestro</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Nombre del Examen</label>
                    <input
                      type="text"
                      placeholder="Ej: Altura Física > 1.8m"
                      value={newExamen.nombre_examen}
                      onChange={(e) => setNewExamen({ ...newExamen, nombre_examen: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Duración (Meses)</label>
                    <input
                      type="number"
                      placeholder="Ej: 12"
                      value={newExamen.duracion_meses || ""}
                      onChange={(e) => setNewExamen({ ...newExamen, duracion_meses: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                      min={1}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Descripción (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Detalles técnicos o notas sobre este examen..."
                    value={newExamen.descripcion}
                    onChange={(e) => setNewExamen({ ...newExamen, descripcion: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                >
                  Agregar Examen
                </button>
              </form>

              {/* Master Exams List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {examenesMaestros.map((em) => (
                  <div 
                    key={em.id_examen_maestro} 
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 transition-colors flex justify-between items-start gap-4 group"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{em.nombre_examen}</h3>
                      {em.descripcion && <p className="text-[10px] text-zinc-500">{em.descripcion}</p>}
                      <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded-full inline-block mt-1">
                        ⏱️ Vigencia: {em.duracion_meses} meses
                      </span>
                    </div>
                    <button
                      onClick={() => deleteExamenMaestro(em.id_examen_maestro)}
                      className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {examenesMaestros.length === 0 && (
                  <p className="text-center py-6 text-xs text-zinc-600">No hay exámenes registrados en el catálogo maestro.</p>
                )}
              </div>
            </div>
          </div>

          {/* Cursos Maestros */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <GraduationCap className="text-emerald-400" size={18} />
                    Catálogo Maestro de Cursos
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Define las capacitaciones corporativas, inducciones y certificaciones obligatorias por defecto.
                  </p>
                </div>
              </div>

              {/* Add Curso Maestro Form */}
              <form onSubmit={handleAddCursoMaestro} className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-900/80 space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">➕ Crear Nuevo Curso Maestro</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Nombre del Curso</label>
                    <input
                      type="text"
                      placeholder="Ej: Inducción de Seguridad SOMA"
                      value={newCurso.nombre_curso}
                      onChange={(e) => setNewCurso({ ...newCurso, nombre_curso: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase">Duración (Meses)</label>
                    <input
                      type="number"
                      placeholder="Ej: 12"
                      value={newCurso.duracion_meses || ""}
                      onChange={(e) => setNewCurso({ ...newCurso, duracion_meses: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      required
                      min={1}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Descripción (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Detalles sobre los contenidos o alcance de la capacitación..."
                    value={newCurso.descripcion}
                    onChange={(e) => setNewCurso({ ...newCurso, descripcion: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                >
                  Agregar Curso
                </button>
              </form>

              {/* Master Courses List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {cursosMaestros.map((cm) => (
                  <div 
                    key={cm.id_curso_maestro} 
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 transition-colors flex justify-between items-start gap-4 group"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{cm.nombre_curso}</h3>
                      {cm.descripcion && <p className="text-[10px] text-zinc-500">{cm.descripcion}</p>}
                      <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 rounded-full inline-block mt-1">
                        ⏱️ Vigencia: {cm.duracion_meses} meses
                      </span>
                    </div>
                    <button
                      onClick={() => deleteCursoMaestro(cm.id_curso_maestro)}
                      className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {cursosMaestros.length === 0 && (
                  <p className="text-center py-6 text-xs text-zinc-600">No hay cursos registrados en el catálogo maestro.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <ControlForm 
          onClose={() => setFormOpen(false)} 
        />
      )}
    </div>
  );
}
