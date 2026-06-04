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
  FileText,
  User,
  Calendar,
  Building2,
  Stethoscope,
  BookOpen
} from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useControlStore, AlertaControl, ControlExamen, ControlCurso } from "@/store/control-store";

export default function ControlPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { 
    examenes, 
    cursos, 
    fetchControlData, 
    getAllAlertas, 
    getAlertasByTrabajador,
    addExamen,
    addCurso
  } = useControlStore();

  const [activeTab, setActiveTab] = useState<"dashboard" | "trabajadores">("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Nuevos formularios
  const [showAddExamen, setShowAddExamen] = useState(false);
  const [showAddCurso, setShowAddCurso] = useState(false);
  const [formData, setFormData] = useState<any>({});

  React.useEffect(() => {
    fetchTrabajadores();
    fetchControlData();
  }, [fetchTrabajadores, fetchControlData]);

  // Dashboard Stats
  const todasLasAlertas = useMemo(() => getAllAlertas(), [examenes, cursos, getAllAlertas]);
  
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

  // Handlers para formularios
  const handleAddExamenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    await addExamen({
      id_trabajador: selectedUserId,
      tipo_examen: formData.tipo_examen,
      fecha_realizacion: formData.fecha_realizacion,
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
      nombre_curso: formData.nombre_curso,
      institucion: formData.institucion || null,
      modalidad: formData.modalidad || null,
      fecha_realizacion: formData.fecha_realizacion,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      estado: formData.estado || "Pendiente",
      observaciones: formData.observaciones || null,
      certificado_url: null
    });
    setShowAddCurso(false);
    setFormData({});
  };

  const getBadgeStyle = (nivel: string) => {
    switch(nivel) {
      case "vencido": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "critico": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "alerta": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pendiente": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  // VISTA: DETALLE DE TRABAJADOR
  if (selectedUserId && selectedUser) {
    const userExams = examenes.filter(e => e.id_trabajador === selectedUserId);
    const userCursos = cursos.filter(c => c.id_trabajador === selectedUserId);
    const userAlertas = getAlertasByTrabajador(selectedUserId);

    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedUserId(null)}
            className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-500" /> 
              Perfil de Salud y Formación
            </h1>
            <p className="text-sm text-zinc-400">
              {selectedUser.nombre_1} {selectedUser.apellido_paterno} • {selectedUser.numero_identificacion}
            </p>
          </div>
        </div>

        {/* Alertas del Trabajador */}
        {userAlertas.filter(a => a.nivel !== "vigente").length > 0 && (
          <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
            <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} /> Alertas Activas
            </h3>
            <div className="flex flex-wrap gap-2">
              {userAlertas.filter(a => a.nivel !== "vigente").map(a => (
                <div key={a.id} className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${getBadgeStyle(a.nivel)}`}>
                  {a.tipo === "Examen" ? <Stethoscope size={14}/> : <BookOpen size={14}/>}
                  {a.nombre}: {a.nivel === "vencido" ? "VENCIDO" : a.nivel === "pendiente" ? "PENDIENTE" : `Vence en ${a.dias_restantes} días`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PANEL EXAMENES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Stethoscope className="text-blue-400" size={20}/> Exámenes Médicos
              </h3>
              <button 
                onClick={() => { setShowAddExamen(true); setShowAddCurso(false); }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                + Registrar Examen
              </button>
            </div>

            {/* Formulario Add Examen */}
            {showAddExamen && (
              <form onSubmit={handleAddExamenSubmit} className="p-4 bg-zinc-900 border border-blue-500/30 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 mb-1 block">Tipo de Examen *</label>
                    <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, tipo_examen: e.target.value})} placeholder="Ej: Altura Geográfica"/>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Fecha Realización *</label>
                    <input required type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, fecha_realizacion: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Fecha Vencimiento</label>
                    <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 mb-1 block">Resultado *</label>
                    <select required className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                      onChange={e => setFormData({...formData, resultado: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Aprobado con Observaciones">Aprobado con Observaciones</option>
                      <option value="Rechazado">Rechazado</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddExamen(false)} className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded">Guardar</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {userExams.length === 0 ? (
                <p className="text-sm text-zinc-500 italic p-4 text-center border border-dashed border-zinc-800 rounded-xl">No hay exámenes registrados.</p>
              ) : (
                userExams.map(ex => (
                  <div key={ex.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm">{ex.tipo_examen}</p>
                      <p className="text-xs text-zinc-500 mt-1">Realizado: {ex.fecha_realizacion} {ex.fecha_vencimiento && `• Vence: ${ex.fecha_vencimiento}`}</p>
                      {ex.observaciones && <p className="text-xs text-amber-500/80 mt-2">Obs: {ex.observaciones}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      ex.resultado === "Aprobado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      ex.resultado.includes("Observaciones") ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      ex.resultado === "Pendiente" ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {ex.resultado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL CURSOS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="text-purple-400" size={20}/> Cursos y Formación
              </h3>
              <button 
                onClick={() => { setShowAddCurso(true); setShowAddExamen(false); }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                + Registrar Curso
              </button>
            </div>

             {/* Formulario Add Curso */}
             {showAddCurso && (
              <form onSubmit={handleAddCursoSubmit} className="p-4 bg-zinc-900 border border-purple-500/30 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 mb-1 block">Nombre del Curso *</label>
                    <input required type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, nombre_curso: e.target.value})} placeholder="Ej: Inducción ODI"/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 mb-1 block">Institución</label>
                    <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, institucion: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Fecha Realización *</label>
                    <input required type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, fecha_realizacion: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Fecha Vencimiento</label>
                    <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white" 
                      onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})}/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 mb-1 block">Estado *</label>
                    <select required className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white"
                      onChange={e => setFormData({...formData, estado: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      <option value="Aprobado">Aprobado</option>
                      <option value="Reprobado">Reprobado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="No Asiste">No Asiste</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCurso(false)} className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white">Cancelar</button>
                  <button type="submit" className="px-3 py-1.5 text-xs font-bold bg-purple-600 text-white rounded">Guardar</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {userCursos.length === 0 ? (
                <p className="text-sm text-zinc-500 italic p-4 text-center border border-dashed border-zinc-800 rounded-xl">No hay cursos registrados.</p>
              ) : (
                userCursos.map(cu => (
                  <div key={cu.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm">{cu.nombre_curso}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{cu.institucion || "Sin institución"} • {cu.modalidad || "N/A"}</p>
                      <p className="text-[10px] text-zinc-500 mt-2">Realizado: {cu.fecha_realizacion} {cu.fecha_vencimiento && `• Vence: ${cu.fecha_vencimiento}`}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      cu.estado === "Aprobado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      cu.estado === "Pendiente" ? "bg-zinc-800 text-zinc-400 border-zinc-700" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {cu.estado}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL (Dashboard / Matriz)
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="text-blue-400" size={24} />
            Control: Cursos y Exámenes
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Monitoreo de salud ocupacional y capacitaciones.</p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "dashboard" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Activity size={16}/> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("trabajadores")}
            className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "trabajadores" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <User size={16}/> Trabajadores
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats KPI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-red-400/80 font-bold uppercase">Vencidos</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">{stats.vencidos}</p>
                </div>
                <XCircle className="text-red-500/50" size={24}/>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-orange-400/80 font-bold uppercase">Crítico (≤ 30 días)</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">{stats.criticos}</p>
                </div>
                <ShieldAlert className="text-orange-500/50" size={24}/>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-yellow-400/80 font-bold uppercase">Alerta (≤ 60 días)</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.alertas}</p>
                </div>
                <AlertTriangle className="text-yellow-500/50" size={24}/>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-blue-400/80 font-bold uppercase">Pendientes / Incompletos</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{stats.pendientes}</p>
                </div>
                <Clock className="text-blue-500/50" size={24}/>
              </div>
            </div>
          </div>

          {/* Tabla de Vencimientos Próximos */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-zinc-400"/> Próximos Vencimientos y Alertas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-900/80 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nivel</th>
                    <th className="px-4 py-3 font-bold">Tipo</th>
                    <th className="px-4 py-3 font-bold">Trabajador</th>
                    <th className="px-4 py-3 font-bold">Certificación / Examen</th>
                    <th className="px-4 py-3 font-bold">Vencimiento</th>
                    <th className="px-4 py-3 font-bold">Estado actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {todasLasAlertas.filter(a => a.alerta.nivel !== "vigente").slice(0, 15).map((item, i) => {
                    const tr = trabajadores.find(t => t.id_trabajador === item.trabajador_id);
                    const { alerta } = item;
                    return (
                      <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getBadgeStyle(alerta.nivel)}`}>
                            {alerta.nivel.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">
                          {alerta.tipo === "Examen" ? <span className="flex items-center gap-1"><Stethoscope size={12}/> Examen</span> : <span className="flex items-center gap-1"><BookOpen size={12}/> Curso</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-zinc-200">{tr ? `${tr.nombre_1} ${tr.apellido_paterno}` : "Desconocido"}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{alerta.nombre}</td>
                        <td className="px-4 py-3 text-zinc-300">
                          {alerta.fecha_vencimiento || "—"} 
                          {alerta.dias_restantes !== null && (
                            <span className="text-[10px] text-zinc-500 ml-2">({alerta.dias_restantes} d)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{alerta.estado_texto}</td>
                      </tr>
                    );
                  })}
                  {todasLasAlertas.filter(a => a.alerta.nivel !== "vigente").length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500 italic">No hay alertas críticas en este momento.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trabajadores" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex gap-4 items-center">
            <div className="relative flex-1 min-w-[250px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar trabajador..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-900/80 sticky top-0 z-10 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Trabajador</th>
                  <th className="px-4 py-3 font-bold">Cargo</th>
                  <th className="px-4 py-3 font-bold">Estado General Exámenes</th>
                  <th className="px-4 py-3 font-bold">Estado General Cursos</th>
                  <th className="px-4 py-3 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
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
                    <tr key={t.id_trabajador} className="hover:bg-zinc-800/20 transition-colors group cursor-pointer" onClick={() => setSelectedUserId(t.id_trabajador)}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-200">{t.nombre_1} {t.apellido_paterno}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.numero_identificacion}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-zinc-300">{t.cargo || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {highestExamen ? (
                          <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getBadgeStyle(highestExamen.nivel)}`}>
                            {highestExamen.nivel.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold"><CheckCircle2 size={12} className="inline mr-1"/>AL DÍA</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {highestCurso ? (
                          <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getBadgeStyle(highestCurso.nivel)}`}>
                            {highestCurso.nivel.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold"><CheckCircle2 size={12} className="inline mr-1"/>AL DÍA</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="opacity-0 group-hover:opacity-100 text-blue-400 text-xs font-bold hover:text-blue-300 transition-all">
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
