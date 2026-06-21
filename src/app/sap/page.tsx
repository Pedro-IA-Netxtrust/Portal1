"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTrabajadoresSAPStore, TrabajadorSAP } from "@/store/trabajadores-sap-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useContratosStore } from "@/store/contratos-store";
import { useMandantesStore } from "@/store/mandantes-store";
import {
  Shield,
  Search,
  Download,
  RefreshCw,
  Mail,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Pencil,
  X,
  Check,
} from "lucide-react";

// Configuración de los 4 accesos principales para visualización en tabla/tarjetas
const PLATFORM_CONFIG = {
  codelco: {
    label: "Correo Codelco",
    icon: Mail,
    activeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pendingColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    inactiveColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    notReqColor: "",
  },
  sap: {
    label: "Cuenta SAP",
    icon: Key,
    activeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pendingColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    inactiveColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    notReqColor: "",
  },
  perfiles: {
    label: "Perfiles SAP",
    icon: Shield,
    activeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pendingColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    inactiveColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    notReqColor: "",
  },
  datamart: {
    label: "Datamart",
    icon: Database,
    activeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pendingColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    inactiveColor: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    notReqColor: "text-zinc-600 bg-zinc-950 border-zinc-900",
  }
};

export default function SapAccesosPage() {
  const { sapList, fetchSAPData, upsertSAPData, loading: loadingSAP } = useTrabajadoresSAPStore(
    useShallow((s) => ({
      sapList: s.sapList,
      fetchSAPData: s.fetchSAPData,
      upsertSAPData: s.upsertSAPData,
      loading: s.loading,
    }))
  );
  const fetchTrabajadores = useTrabajadoresStore((s) => s.fetchTrabajadores);
  const { contratos, fetchContratos } = useContratosStore(
    useShallow((s) => ({ contratos: s.contratos, fetchContratos: s.fetchContratos }))
  );
  const mandantes = useMandantesStore((s) => s.mandantes);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("Todos");
  const [filtroMandante, setFiltroMandante] = useState("Todos");
  const [filtroEstadoGeneral, setFiltroEstadoGeneral] = useState("Todos"); // Todos | Completos | Pendientes | Sin Solicitud

  // Estado del modal de edición
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"codelco" | "sap" | "perfiles" | "datamart">("codelco");

  // Form states para el modal (21 campos)
  const [formValues, setFormValues] = useState<Partial<Omit<TrabajadorSAP, "id_trabajador">>>({});

  useEffect(() => {
    fetchSAPData();
    fetchTrabajadores();
    fetchContratos();
  }, [fetchSAPData, fetchTrabajadores, fetchContratos]);

  const activeContratos = useMemo(() => contratos.filter(c => c.estado === "Activo"), [contratos]);
  const activeMandantes = useMemo(() => mandantes.filter(m => m.activo), [mandantes]);

  // Cruzar listado de trabajadores activos asignados con sus registros de accesos SAP
  type MappedWorker = {
    id_trabajador: string;
    nombre: string;
    rut?: string;
    contrato_id: string;
    contrato_nombre: string;
    mandante_id: string;
    mandante_nombre: string;
    sapRecord: TrabajadorSAP;
    states: {
      codelco: "active" | "pending" | "inactive" | "not_required";
      sap: "active" | "pending" | "inactive" | "not_required";
      perfiles: "active" | "pending" | "inactive" | "not_required";
      datamart: "active" | "pending" | "inactive" | "not_required";
    };
    isComplete: boolean;
    hasPending: boolean;
  };
  const mappedWorkers = useMemo(() => {
    const list: MappedWorker[] = [];
    
    contratos
      .filter(c => c.estado === "Activo")
      .forEach(c => {
        const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
        c.trabajadores_asignados
          .filter(ta => ta.activo)
          .forEach(ta => {
            // Evitar duplicados si un trabajador está asignado a múltiples contratos
            if (list.some(item => item.id_trabajador === ta.id_trabajador)) return;

            const sapRecord = sapList.find(s => s.id_trabajador === ta.id_trabajador) || {
              id_trabajador: ta.id_trabajador,
              correo_adc_codelco: null,
              aprobacion_correo_adc_codelco: null,
              solicitud_cuenta_realizada_codelco: null,
              cuenta_correo_activa_codelco: false,
              ticket_codelco: null,
              correo_adc_sap: null,
              aprobacion_correo_adc_sap: null,
              solicitud_cuenta_sap: null,
              cuenta_sap_activa: false,
              ticket_sap: null,
              correo_adc_perfiles_sap: null,
              aprobacion_correo_adc_perfiles_sap: null,
              solicitud_perfiles_roles_sap: null,
              ticket_perfiles_sap: null,
              perfiles_sap_activos: false,
              requiere_datamart: false,
              correo_adc_datamart: null,
              aprobacion_correo_adc_datamart: null,
              solicitud_datamart: null,
              datamart_activo: false,
              ticket_datamart: null
            };

            // Determinar estados de cada plataforma
            const stateCodelco = sapRecord.cuenta_correo_activa_codelco
              ? "active"
              : sapRecord.ticket_codelco || sapRecord.solicitud_cuenta_realizada_codelco
              ? "pending"
              : "inactive";

            const stateSap = sapRecord.cuenta_sap_activa
              ? "active"
              : sapRecord.ticket_sap || sapRecord.solicitud_cuenta_sap
              ? "pending"
              : "inactive";

            const statePerfiles = sapRecord.perfiles_sap_activos
              ? "active"
              : sapRecord.ticket_perfiles_sap || sapRecord.solicitud_perfiles_roles_sap
              ? "pending"
              : "inactive";

            const stateDatamart = !sapRecord.requiere_datamart
              ? "not_required"
              : sapRecord.datamart_activo
              ? "active"
              : sapRecord.ticket_datamart || sapRecord.solicitud_datamart
              ? "pending"
              : "inactive";

            // Un trabajador está completo si todas las plataformas requeridas están activas
            const isComplete =
              stateCodelco === "active" &&
              stateSap === "active" &&
              statePerfiles === "active" &&
              (stateDatamart === "active" || stateDatamart === "not_required");

            // Tiene algún trámite en curso
            const hasPending =
              stateCodelco === "pending" ||
              stateSap === "pending" ||
              statePerfiles === "pending" ||
              stateDatamart === "pending";

            list.push({
              id_trabajador: ta.id_trabajador,
              nombre: ta.nombre,
              rut: ta.rut,
              contrato_id: c.id_contrato,
              contrato_nombre: c.nombre_contrato,
              mandante_id: c.id_mandante,
              mandante_nombre: mandante?.nombre || "N/A",
              sapRecord,
              states: {
                codelco: stateCodelco,
                sap: stateSap,
                perfiles: statePerfiles,
                datamart: stateDatamart
              },
              isComplete,
              hasPending
            });
          });
      });

    return list;
  }, [contratos, mandantes, sapList]);

  // Aplicar filtros en memoria
  const filteredWorkers = useMemo(() => {
    return mappedWorkers.filter(w => {
      // 1. Filtro de Búsqueda (Texto)
      const q = busqueda.toLowerCase();
      const matchSearch =
        !q.trim() ||
        w.nombre.toLowerCase().includes(q) ||
        (w.rut && w.rut.toLowerCase().includes(q));

      // 2. Filtro de Contrato
      const matchContrato = filtroContrato === "Todos" || w.contrato_id === filtroContrato;

      // 3. Filtro de Mandante
      const matchMandante = filtroMandante === "Todos" || w.mandante_id === filtroMandante;

      // 4. Filtro de Estado de Proceso
      let matchEstado = true;
      if (filtroEstadoGeneral === "Completos") {
        matchEstado = w.isComplete;
      } else if (filtroEstadoGeneral === "Pendientes") {
        matchEstado = !w.isComplete && w.hasPending;
      } else if (filtroEstadoGeneral === "Sin Solicitud") {
        matchEstado =
          !w.isComplete &&
          !w.hasPending &&
          w.states.codelco === "inactive" &&
          w.states.sap === "inactive" &&
          w.states.perfiles === "inactive" &&
          (w.states.datamart === "inactive" || w.states.datamart === "not_required");
      }

      return matchSearch && matchContrato && matchMandante && matchEstado;
    });
  }, [mappedWorkers, busqueda, filtroContrato, filtroMandante, filtroEstadoGeneral]);

  // Estadísticas del Proceso (con base en el listado filtrado actual)
  const processStats = useMemo(() => {
    const total = filteredWorkers.length;
    if (total === 0) {
      return { total: 0, codelcoPct: 0, sapPct: 0, perfilesPct: 0, datamartPct: 0, pendingTickets: 0, completos: 0 };
    }

    const codelcoActive = filteredWorkers.filter(w => w.states.codelco === "active").length;
    const sapActive = filteredWorkers.filter(w => w.states.sap === "active").length;
    const perfilesActive = filteredWorkers.filter(w => w.states.perfiles === "active").length;
    
    const datamartRequired = filteredWorkers.filter(w => w.sapRecord.requiere_datamart);
    const datamartActive = datamartRequired.filter(w => w.states.datamart === "active").length;

    const completos = filteredWorkers.filter(w => w.isComplete).length;

    // Tickets en trámite (conteo de tickets registrados en cualquier plataforma cuyo estado no sea completo)
    let pendingTicketsCount = 0;
    const trackedTickets = new Set<string>();

    filteredWorkers.forEach(w => {
      if (w.states.codelco === "pending" && w.sapRecord.ticket_codelco) trackedTickets.add(w.sapRecord.ticket_codelco);
      if (w.states.sap === "pending" && w.sapRecord.ticket_sap) trackedTickets.add(w.sapRecord.ticket_sap);
      if (w.states.perfiles === "pending" && w.sapRecord.ticket_perfiles_sap) trackedTickets.add(w.sapRecord.ticket_perfiles_sap);
      if (w.states.datamart === "pending" && w.sapRecord.ticket_datamart) trackedTickets.add(w.sapRecord.ticket_datamart);
    });

    pendingTicketsCount = trackedTickets.size;

    return {
      total,
      completos,
      codelcoPct: Math.round((codelcoActive / total) * 100),
      sapPct: Math.round((sapActive / total) * 100),
      perfilesPct: Math.round((perfilesActive / total) * 100),
      datamartPct: datamartRequired.length > 0 ? Math.round((datamartActive / datamartRequired.length) * 100) : 0,
      datamartReqCount: datamartRequired.length,
      datamartActiveCount: datamartActive,
      pendingTickets: pendingTicketsCount
    };
  }, [filteredWorkers]);

  // Abrir modal de edición
  const handleEditAccess = (worker: MappedWorker) => {
    setSelectedWorkerId(worker.id_trabajador);
    setFormValues(worker.sapRecord);
    setActiveTab("codelco");
    setModalOpen(true);
  };

  // Guardar cambios del modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    await upsertSAPData(selectedWorkerId, formValues);
    setModalOpen(false);
    setSelectedWorkerId(null);
  };

  // Exportar listado filtrado a CSV
  const handleExportCSV = () => {
    if (filteredWorkers.length === 0) return;

    let csvContent = "Trabajador,RUT,Contrato,Mandante," +
      "Correo Codelco Activo,Ticket Codelco,ADC Codelco,Aprobacion Codelco,Solicitud Codelco," +
      "Cuenta SAP Activa,Ticket SAP,ADC SAP,Aprobacion SAP,Solicitud SAP," +
      "Perfiles SAP Activos,Ticket Perfiles,ADC Perfiles,Aprobacion Perfiles,Solicitud Perfiles," +
      "Requiere Datamart,Datamart Activo,Ticket Datamart,ADC Datamart,Aprobacion Datamart,Solicitud Datamart\n";

    filteredWorkers.forEach(w => {
      const s = w.sapRecord;
      csvContent += `"${w.nombre}","${w.rut}","${w.contrato_nombre}","${w.mandante_nombre}",` +
        `"${s.cuenta_correo_activa_codelco ? 'SÍ' : 'NO'}","${s.ticket_codelco || ''}","${s.correo_adc_codelco || ''}","${s.aprobacion_correo_adc_codelco || ''}","${s.solicitud_cuenta_realizada_codelco || ''}",` +
        `"${s.cuenta_sap_activa ? 'SÍ' : 'NO'}","${s.ticket_sap || ''}","${s.correo_adc_sap || ''}","${s.aprobacion_correo_adc_sap || ''}","${s.solicitud_cuenta_sap || ''}",` +
        `"${s.perfiles_sap_activos ? 'SÍ' : 'NO'}","${s.ticket_perfiles_sap || ''}","${s.correo_adc_perfiles_sap || ''}","${s.aprobacion_correo_adc_perfiles_sap || ''}","${s.solicitud_perfiles_roles_sap || ''}",` +
        `"${s.requiere_datamart ? 'SÍ' : 'NO'}","${s.datamart_activo ? 'SÍ' : 'NO'}","${s.ticket_datamart || ''}","${s.correo_adc_datamart || ''}","${s.aprobacion_correo_adc_datamart || ''}","${s.solicitud_datamart || ''}"\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `accesos_ti_sap_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pt-4 pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            Control de Accesos SAP y TI
          </h1>
          <p className="text-sm font-semibold text-text-soft mt-1">
            Gestión y seguimiento de aprovisionamiento de cuentas Codelco, SAP, perfiles y roles, y Datamart.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchSAPData();
              fetchTrabajadores();
              fetchContratos();
            }}
            className="btn btn-secondary py-2 px-3 flex items-center gap-1.5 text-xs font-bold"
            disabled={loadingSAP}
          >
            <RefreshCw size={14} className={loadingSAP ? "animate-spin" : ""} />
            Sincronizar
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredWorkers.length === 0}
            className="btn btn-accent py-2 px-3 flex items-center gap-1.5 text-xs font-bold"
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* METRICAS DE PROCESO (ESTADISTICAS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Progreso Codelco */}
        <div className="stat-box p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Correo Codelco</span>
            <Mail className="text-sky-400 shrink-0" size={16} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text">{processStats.codelcoPct}%</span>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800 mt-1.5">
              <div
                className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${processStats.codelcoPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progreso Cuenta SAP */}
        <div className="stat-box p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Cuenta SAP</span>
            <Key className="text-amber-400 shrink-0" size={16} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text">{processStats.sapPct}%</span>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800 mt-1.5">
              <div
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${processStats.sapPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progreso Perfiles SAP */}
        <div className="stat-box p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Perfiles y Roles</span>
            <Shield className="text-violet-400 shrink-0" size={16} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text">{processStats.perfilesPct}%</span>
            <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800 mt-1.5">
              <div
                className="bg-violet-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${processStats.perfilesPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progreso Datamart */}
        <div className="stat-box p-4 rounded-xl bg-surface border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Datamart Habilitado</span>
            <Database className="text-emerald-400 shrink-0" size={16} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-text">{processStats.datamartPct}%</span>
            <span className="text-[10px] text-text-soft font-semibold block mt-0.5">
              {processStats.datamartActiveCount} de {processStats.datamartReqCount} requeridos
            </span>
          </div>
        </div>

        {/* Proceso General */}
        <div className="stat-box p-4 rounded-xl bg-surface border border-border flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Proceso General</span>
            <CheckCircle2 className="text-primary shrink-0" size={16} />
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-bold text-text block">
              {processStats.completos} <span className="text-xs text-text-soft font-semibold">Listos</span>
            </span>
            <span className="text-xs font-semibold text-amber-400 block mt-1">
              {processStats.pendingTickets} Tickets en Trámite
            </span>
          </div>
        </div>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="card space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-soft" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar trabajador por nombre o RUT..."
              className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 pl-9 pr-4 text-xs font-semibold placeholder:text-text-soft focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Filtro Contrato */}
          <div className="w-[200px]">
            <select
              value={filtroContrato}
              onChange={(e) => setFiltroContrato(e.target.value)}
              className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
            >
              <option value="Todos">Todos los Contratos</option>
              {activeContratos.map(c => (
                <option key={c.id_contrato} value={c.id_contrato}>{c.nombre_contrato}</option>
              ))}
            </select>
          </div>

          {/* Filtro Mandante */}
          <div className="w-[200px]">
            <select
              value={filtroMandante}
              onChange={(e) => setFiltroMandante(e.target.value)}
              className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
            >
              <option value="Todos">Todos los Mandantes</option>
              {activeMandantes.map(m => (
                <option key={m.id_mandante} value={m.id_mandante}>{m.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Estado General */}
          <div className="w-[180px]">
            <select
              value={filtroEstadoGeneral}
              onChange={(e) => setFiltroEstadoGeneral(e.target.value)}
              className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Completos">Accesos Habilitados</option>
              <option value="Pendientes">Con Trámites Pendientes</option>
              <option value="Sin Solicitud">Sin Solicitudes</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRILLA / TABLA PRINCIPAL */}
      <div className="table-shell">
        <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-primary" /> Dotación y Estado de Credenciales ({filteredWorkers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-wider">Trabajador</th>
                <th className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-wider">Contrato / Mandante</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">Codelco Mail</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">Cuenta SAP</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">Perfiles SAP</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">Datamart</th>
                <th className="px-5 py-4 text-center text-[11px] font-bold text-text-muted uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWorkers.map(w => {
                // Generar componentes visuales por plataforma
                const renderBadge = (type: "codelco" | "sap" | "perfiles" | "datamart") => {
                  const state = w.states[type];
                  const cfg = PLATFORM_CONFIG[type];

                  if (state === "active") {
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.activeColor}`}>
                        <CheckCircle2 size={12} /> ACTIVO
                      </span>
                    );
                  }

                  if (state === "pending") {
                    const ticketNum =
                      type === "codelco"
                        ? w.sapRecord.ticket_codelco
                        : type === "sap"
                        ? w.sapRecord.ticket_sap
                        : type === "perfiles"
                        ? w.sapRecord.ticket_perfiles_sap
                        : w.sapRecord.ticket_datamart;

                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-help ${cfg.pendingColor}`}
                        title={ticketNum ? `Ticket N°: ${ticketNum}` : "Trámite en curso"}
                      >
                        <AlertCircle size={12} /> {ticketNum ? `TK #${ticketNum}` : "PENDIENTE"}
                      </span>
                    );
                  }

                  if (state === "not_required") {
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.notReqColor || ""}`}>
                        NO REQ.
                      </span>
                    );
                  }

                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.inactiveColor}`}>
                      <XCircle size={12} /> INACTIVO
                    </span>
                  );
                };

                return (
                  <tr key={w.id_trabajador} className="hover:bg-surface-2 transition-colors">
                    {/* Trabajador */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-bold text-text">{w.nombre}</p>
                      <p className="text-[10px] text-text-soft font-mono mt-0.5">{w.rut}</p>
                    </td>

                    {/* Contrato / Mandante */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-text text-xs">{w.contrato_nombre}</p>
                      <p className="text-[10px] text-text-soft font-medium mt-0.5">{w.mandante_nombre}</p>
                    </td>

                    {/* Codelco */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {renderBadge("codelco")}
                    </td>

                    {/* SAP */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {renderBadge("sap")}
                    </td>

                    {/* Perfiles */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {renderBadge("perfiles")}
                    </td>

                    {/* Datamart */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {renderBadge("datamart")}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleEditAccess(w)}
                        className="btn btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 font-bold mx-auto"
                        title="Gestionar Accesos TI"
                      >
                        <Pencil size={12} /> Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-text-soft text-sm font-medium italic">
                    No se encontraron trabajadores que coincidan con la búsqueda o filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN RAPIDA IN-SITU (21 CAMPOS) */}
      {modalOpen && selectedWorkerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-2">
              <div>
                <h3 className="text-md font-bold text-text flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  Gestionar Accesos TI y Credenciales
                </h3>
                <p className="text-xs text-text-soft font-semibold mt-0.5">
                  {mappedWorkers.find(w => w.id_trabajador === selectedWorkerId)?.nombre}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedWorkerId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-bg-alt text-text-soft hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pestañas del Modal */}
            <div className="flex border-b border-border bg-surface-2 px-4 gap-2">
              {[
                { id: "codelco", label: "Codelco Mail", icon: Mail },
                { id: "sap", label: "SAP Cuenta", icon: Key },
                { id: "perfiles", label: "Perfiles", icon: Shield },
                { id: "datamart", label: "Datamart", icon: Database }
              ].map(t => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as "codelco" | "sap" | "perfiles" | "datamart")}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-text-muted hover:text-text"
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* TAB 1: CORREO CODELCO */}
              {activeTab === "codelco" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <label className="text-xs font-bold text-text cursor-pointer flex flex-col">
                      <span>Cuenta Correo Codelco Activa</span>
                      <span className="text-[10px] text-text-soft font-normal mt-0.5">Habilitar si el correo del trabajador ya fue activado por Codelco.</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={formValues.cuenta_correo_activa_codelco || false}
                      onChange={(e) => setFormValues(prev => ({ ...prev, cuenta_correo_activa_codelco: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-0 bg-surface w-5 h-5 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Correo a AdC</label>
                      <input
                        type="date"
                        value={formValues.correo_adc_codelco || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, correo_adc_codelco: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Aprobación Correo AdC</label>
                      <input
                        type="date"
                        value={formValues.aprobacion_correo_adc_codelco || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, aprobacion_correo_adc_codelco: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Solicitud Cuenta Realizada</label>
                      <input
                        type="date"
                        value={formValues.solicitud_cuenta_realizada_codelco || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, solicitud_cuenta_realizada_codelco: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Número de Ticket Codelco</label>
                      <input
                        type="text"
                        placeholder="Ej. INC0000123"
                        value={formValues.ticket_codelco || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, ticket_codelco: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CUENTA SAP */}
              {activeTab === "sap" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <label className="text-xs font-bold text-text cursor-pointer flex flex-col">
                      <span>Cuenta SAP Activa</span>
                      <span className="text-[10px] text-text-soft font-normal mt-0.5">Habilitar si la cuenta SAP ya fue creada.</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={formValues.cuenta_sap_activa || false}
                      onChange={(e) => setFormValues(prev => ({ ...prev, cuenta_sap_activa: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-0 bg-surface w-5 h-5 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Correo a AdC SAP</label>
                      <input
                        type="date"
                        value={formValues.correo_adc_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, correo_adc_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Aprobación Correo AdC SAP</label>
                      <input
                        type="date"
                        value={formValues.aprobacion_correo_adc_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, aprobacion_correo_adc_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Solicitud Cuenta SAP</label>
                      <input
                        type="date"
                        value={formValues.solicitud_cuenta_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, solicitud_cuenta_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Número de Ticket SAP (ticket3)</label>
                      <input
                        type="text"
                        placeholder="Ej. TKT-129038"
                        value={formValues.ticket_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, ticket_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PERFILES SAP */}
              {activeTab === "perfiles" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                    <label className="text-xs font-bold text-text cursor-pointer flex flex-col">
                      <span>Perfiles SAP Activos</span>
                      <span className="text-[10px] text-text-soft font-normal mt-0.5">Marcar si los perfiles y roles SAP asignados están activos.</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={formValues.perfiles_sap_activos || false}
                      onChange={(e) => setFormValues(prev => ({ ...prev, perfiles_sap_activos: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-0 bg-surface w-5 h-5 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Correo a AdC Perfiles</label>
                      <input
                        type="date"
                        value={formValues.correo_adc_perfiles_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, correo_adc_perfiles_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Aprobación Correo AdC Perfiles</label>
                      <input
                        type="date"
                        value={formValues.aprobacion_correo_adc_perfiles_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, aprobacion_correo_adc_perfiles_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Solicitud Perfiles y Roles</label>
                      <input
                        type="date"
                        value={formValues.solicitud_perfiles_roles_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, solicitud_perfiles_roles_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Número de Ticket Perfiles</label>
                      <input
                        type="text"
                        placeholder="Ej. TKT-981729"
                        value={formValues.ticket_perfiles_sap || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, ticket_perfiles_sap: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DATAMART */}
              {activeTab === "datamart" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                      <label className="text-xs font-bold text-text cursor-pointer flex flex-col">
                        <span>Requiere Datamart</span>
                        <span className="text-[10px] text-text-soft font-normal mt-0.5">Indica si el perfil lo exige.</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={formValues.requiere_datamart || false}
                        onChange={(e) => setFormValues(prev => ({ ...prev, requiere_datamart: e.target.checked }))}
                        className="rounded border-border text-primary focus:ring-0 bg-surface w-5 h-5 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-2 border border-border">
                      <label className="text-xs font-bold text-text cursor-pointer flex flex-col">
                        <span>Datamart Activo</span>
                        <span className="text-[10px] text-text-soft font-normal mt-0.5">Marcar si el acceso ya está listo.</span>
                      </label>
                      <input
                        type="checkbox"
                        checked={formValues.datamart_activo || false}
                        disabled={!formValues.requiere_datamart}
                        onChange={(e) => setFormValues(prev => ({ ...prev, datamart_activo: e.target.checked }))}
                        className="rounded border-border text-primary focus:ring-0 bg-surface w-5 h-5 cursor-pointer disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Correo a AdC Datamart</label>
                      <input
                        type="date"
                        disabled={!formValues.requiere_datamart}
                        value={formValues.correo_adc_datamart || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, correo_adc_datamart: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary disabled:opacity-40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Aprobación Correo AdC Datamart</label>
                      <input
                        type="date"
                        disabled={!formValues.requiere_datamart}
                        value={formValues.aprobacion_correo_adc_datamart || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, aprobacion_correo_adc_datamart: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Solicitud de Datamart</label>
                      <input
                        type="date"
                        disabled={!formValues.requiere_datamart}
                        value={formValues.solicitud_datamart || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, solicitud_datamart: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary disabled:opacity-40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-soft">Número de Ticket Datamart (ticket2)</label>
                      <input
                        type="text"
                        disabled={!formValues.requiere_datamart}
                        placeholder="Ej. TKT-001298"
                        value={formValues.ticket_datamart || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, ticket_datamart: e.target.value || null }))}
                        className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary font-semibold disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              )}

            </form>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-2">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedWorkerId(null);
                }}
                className="btn btn-secondary py-2 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModal}
                className="btn btn-accent py-2 text-xs flex items-center gap-1.5 font-bold"
              >
                <Check size={14} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
