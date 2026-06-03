"use client";

import React, { useState, useEffect } from "react";
import { useInspeccionesStore } from "@/store/inspecciones-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useActivosStore } from "@/store/activos-store";
import ChecklistDiario from "@/components/custom/checklist-diario";
import ChecklistAuditoria from "@/components/custom/checklist-auditoria";
import ChecklistExpress from "@/components/custom/checklist-express";
import { 
  ClipboardCheck, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Layers, 
  FileText, 
  Activity, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";

export default function InspeccionesPage() {
  const [isClient, setIsClient] = useState(false);

  // Load stores
  const { 
    inspeccionesDiarias, 
    auditorias, 
    verificacionesExpress,
    deleteInspeccionDiaria,
    deleteAuditoria,
    deleteVerificacionExpress
  } = useInspeccionesStore();
  const { trabajadores } = useTrabajadoresStore();
  const { activos } = useActivosStore();

  // Navigation and search states
  const [activeTab, setActiveTab] = useState<"diario" | "auditoria" | "express">("diario");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal triggers
  const [diarioOpen, setDiarioOpen] = useState(false);
  const [auditoriaOpen, setAuditoriaOpen] = useState(false);
  const [expressOpen, setExpressOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <Activity className="mx-auto text-blue-500 animate-pulse" size={48} />
        <p className="text-zinc-500 text-sm font-semibold">Cargando Módulo de Checklists ECF 4...</p>
      </div>
    );
  }

  // Helpers: Name resolvers
  const getConductorName = (idConductor: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idConductor);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  const getVehiculoPatente = (idVehiculo: string) => {
    const veh = activos.find(a => a.id_activo === idVehiculo);
    return veh ? `${veh.marca} ${veh.modelo} [${veh.identificador_unico}]` : "Cargando...";
  };

  // KPIs Calculations
  const totalDiarias = inspeccionesDiarias.length;
  const aptasCount = inspeccionesDiarias.filter(i => i.resultado === "Apto").length;
  const tasaAptitud = totalDiarias > 0 ? Math.round((aptasCount / totalDiarias) * 100) : 100;
  
  const avgAuditoriaComp = auditorias.length > 0
    ? Math.round(auditorias.reduce((acc, a) => acc + a.porcentaje_cumplimiento, 0) / auditorias.length)
    : 100;

  const totalExpress = verificacionesExpress.length;

  // Filters logic
  const filteredDiarias = inspeccionesDiarias.filter((i) => {
    const searchString = `${getConductorName(i.id_trabajador_conductor)} ${getVehiculoPatente(i.id_activo_vehiculo)} ${i.observaciones || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const filteredAuditorias = auditorias.filter((a) => {
    const searchString = `${a.auditor} ${getVehiculoPatente(a.id_activo_vehiculo)} ${a.observaciones || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const filteredExpress = verificacionesExpress.filter((v) => {
    const searchString = `${v.inspector} ${getVehiculoPatente(v.id_activo_vehiculo)} ${v.observaciones || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ClipboardCheck className="text-blue-500" size={24} />
            Control de Checklists y Auditorías ECF 4
          </h1>
          <p className="text-xs text-zinc-500">
            Estándar de Control de Fatalidades N°4 CODELCO - Vehículos Livianos. Gestiona inspecciones diarias de conductores, auditorías semestrales y vericios rápidas.
          </p>
        </div>
        
        {/* Rapid Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDiarioOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
          >
            <Plus size={14} />
            Checklist Diario
          </button>
          <button
            onClick={() => setAuditoriaOpen(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/10"
          >
            <Plus size={14} />
            Nueva Auditoría
          </button>
          <button
            onClick={() => setExpressOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10"
          >
            <Plus size={14} />
            Control Express
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${tasaAptitud >= 90 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"}`}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">TASA APTITUD DIARIA</span>
            <span className="text-lg font-bold text-white">{tasaAptitud}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">INSPECCIONES DIARIAS</span>
            <span className="text-lg font-bold text-white">{totalDiarias}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${avgAuditoriaComp >= 90 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
            <FileText size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CUMPLIMIENTO AUDITORÍAS</span>
            <span className="text-lg font-bold text-white">{avgAuditoriaComp}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CONTROLES EXPRESS</span>
            <span className="text-lg font-bold text-white">{totalExpress}</span>
          </div>
        </div>

      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-800 space-x-6 bg-zinc-950 px-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab("diario")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "diario" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          📋 Pre-Operacional Diaria ({totalDiarias})
        </button>
        <button
          onClick={() => setActiveTab("auditoria")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "auditoria" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🛡️ Auditorías ECF 4 ({auditorias.length})
        </button>
        <button
          onClick={() => setActiveTab("express")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "express" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          ⚡ Controles Express ({totalExpress})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Patente, Inspector, Conductor, Observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Tab Contents: Daily Inspections */}
      {activeTab === "diario" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDiarias.map((i) => (
              <div 
                key={i.id_inspeccion} 
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                        {getVehiculoPatente(i.id_activo_vehiculo)}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors mt-0.5">
                        Conductor: {getConductorName(i.id_trabajador_conductor)}
                      </h3>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {i.fecha} {i.hora} • ⏱️ {i.kilometraje.toLocaleString("es-CL")} Km
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      i.resultado === "Apto"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {i.resultado}
                    </span>
                  </div>

                  {/* Summary items details */}
                  <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/60 text-xs text-zinc-400 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Ruedas y Neumáticos</span>
                      <strong className={i.neumaticos === "Malo" ? "text-red-400 font-bold" : "text-white"}>{i.neumaticos}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sistema de Frenos</span>
                      <strong className={i.frenos === "Malo" ? "text-red-400 font-bold" : "text-white"}>{i.frenos}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cinturones de Seguridad</span>
                      <strong className={i.cinturones === "Malo" ? "text-red-400 font-bold" : "text-white"}>{i.cinturones}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Cuñas Antideslizantes</span>
                      <strong className={i.cunas === "Ausente" ? "text-red-400 font-bold" : "text-white"}>{i.cunas}</strong>
                    </div>
                  </div>

                  {i.observaciones && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-950/20 p-2 rounded border border-zinc-900 italic">
                      " {i.observaciones} "
                    </p>
                  )}
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-zinc-800/40">
                  <button
                    onClick={() => deleteInspeccionDiaria(i.id_inspeccion)}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                    title="Eliminar Inspección"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredDiarias.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
                <Layers className="mx-auto text-zinc-700" size={32} />
                <h4 className="text-zinc-300 font-bold text-sm">No se encontraron inspecciones diarias registradas</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: ECF 4 Audits */}
      {activeTab === "auditoria" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAuditorias.map((a) => (
              <div 
                key={a.id_auditoria} 
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                        {getVehiculoPatente(a.id_activo_vehiculo)}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors mt-0.5">
                        Auditor: {a.auditor}
                      </h3>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> Evaluado el {a.fecha}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      a.porcentaje_cumplimiento >= 90
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : a.porcentaje_cumplimiento >= 75
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {a.porcentaje_cumplimiento}% Cumplimiento
                    </span>
                  </div>

                  {a.observaciones && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-950/20 p-2.5 rounded border border-zinc-900 italic">
                      " {a.observaciones} "
                    </p>
                  )}
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-zinc-800/40">
                  <button
                    onClick={() => deleteAuditoria(a.id_auditoria)}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                    title="Eliminar Auditoría"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredAuditorias.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
                <Layers className="mx-auto text-zinc-700" size={32} />
                <h4 className="text-zinc-300 font-bold text-sm">No se encontraron auditorías registradas</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Express Controls */}
      {activeTab === "express" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredExpress.map((v) => (
              <div 
                key={v.id_verificacion} 
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                        {getVehiculoPatente(v.id_activo_vehiculo)}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors mt-0.5">
                        Inspector: {v.inspector}
                      </h3>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> Controlado el {v.fecha}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      v.porcentaje_cumplimiento === 100
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : v.porcentaje_cumplimiento >= 80
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {v.porcentaje_cumplimiento}% Aprobado
                    </span>
                  </div>

                  {v.observaciones && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-950/20 p-2.5 rounded border border-zinc-900 italic">
                      " {v.observaciones} "
                    </p>
                  )}
                </div>

                <div className="flex justify-end mt-4 pt-3 border-t border-zinc-800/40">
                  <button
                    onClick={() => deleteVerificacionExpress(v.id_verificacion)}
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                    title="Eliminar Registro"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredExpress.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
                <Layers className="mx-auto text-zinc-700" size={32} />
                <h4 className="text-zinc-300 font-bold text-sm">No se encontraron verificaciones express registradas</h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forms Modals */}
      {diarioOpen && (
        <ChecklistDiario onClose={() => setDiarioOpen(false)} />
      )}

      {auditoriaOpen && (
        <ChecklistAuditoria onClose={() => setAuditoriaOpen(false)} />
      )}

      {expressOpen && (
        <ChecklistExpress onClose={() => setExpressOpen(false)} />
      )}

    </div>
  );
}
