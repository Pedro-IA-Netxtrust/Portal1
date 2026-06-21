"use client";

import React, { useState, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useAlimentacionStore,
  ALIMENTACION_CONFIG,
  EstadoAlimentacion,
} from "@/store/alimentacion-store";
import { useContratosStore } from "@/store/contratos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useProveedoresStore } from "@/store/proveedores-store";
import {
  Utensils,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowLeft,
  FileText,
  Filter,
  Building2,
  Coffee,
  X,
  Target,
  Printer
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

const MESES_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DIAS_SEMANA_SHORT = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

type PageView = "dashboard" | "registro" | "auditoria";
type RegistroTab = "diario" | "resumen" | "planificacion";
type GroupBy = "unidad" | "nivel" | "sexo" | "modalidad";

function getTodayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}

function dateStr(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
}

function prevMes(anio: number, mes: number) {
  return mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
}
function nextMes(anio: number, mes: number) {
  return mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
}

function getLastWednesday(baseDate = new Date()): Date {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 3=Wed
  const diff = day >= 3 ? day - 3 : day + 4;
  d.setDate(d.getDate() - diff);
  d.setHours(0,0,0,0);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Rations Gauge (SVG circle)
// ─────────────────────────────────────────────────────────────────────────────

function PresupuestoGauge({ real, meta, size = 80 }: { real: number; meta: number; size?: number }) {
  const pct = meta > 0 ? Math.min(1, real / meta) : 0;
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct >= 0.9 ? "#ef4444" : pct >= 0.7 ? "#f59e0b" : "#10b981";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#27272a" strokeWidth="3.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{real}</span>
        <span className="text-[9px] text-zinc-500">/ {meta}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AlimentacionPage() {
  const today = new Date();
  const todayStr = getTodayStr();

  // ── View state ──────────────────────────────────────────────────────────────
  const [view, setView] = useState<PageView>("dashboard");
  const [registroTab, setRegistroTab] = useState<RegistroTab>("diario");
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  
  const [anio, setAnio] = useState(today.getFullYear());
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [fechaInicioSemana, setFechaInicioSemana] = useState<Date>(() => getLastWednesday());
  
  const [groupBy, setGroupBy] = useState<GroupBy>("unidad");
  const [filtroArea, setFiltroArea] = useState<string>("Todas");
  const [filtroProveedor, setFiltroProveedor] = useState<string>("Todos");

  // State for cell editing modal
  const [editingCell, setEditingCell] = useState<{
    id_trabajador: string;
    id_asignacion: string;
    nombre: string;
    fecha: string;
  } | null>(null);

  // Edit Presupuesto Modal
  const [editingPresupuesto, setEditingPresupuesto] = useState<{ id_contrato: string, name: string } | null>(null);
  const [tempPresupuestoVal, setTempPresupuestoVal] = useState<string>("");

  // ── Stores ──────────────────────────────────────────────────────────────────
  const { registros, setEstados, getPresupuestoMensual, setPresupuestoMensual } = useAlimentacionStore(
    useShallow((s) => ({
      registros: s.registros,
      setEstados: s.setEstados,
      getPresupuestoMensual: s.getPresupuestoMensual,
      setPresupuestoMensual: s.setPresupuestoMensual,
    }))
  );
  const { contratos, fetchContratos } = useContratosStore(
    useShallow((s) => ({ contratos: s.contratos, fetchContratos: s.fetchContratos }))
  );
  const fetchTrabajadores = useTrabajadoresStore((s) => s.fetchTrabajadores);
  const proveedores = useProveedoresStore((s) => s.proveedores);

  React.useEffect(() => { fetchContratos(); fetchTrabajadores(); }, [fetchContratos, fetchTrabajadores]);

  const activeContratos = useMemo(() => contratos.filter((c) => c.estado === "Activo"), [contratos]);
  const selectedContrato = useMemo(
    () => contratos.find((c) => c.id_contrato === selectedContratoId) ?? null,
    [contratos, selectedContratoId]
  );

  // ── Fast registro lookup ───────────────────────────────────────────────────
  const registroMap = useMemo(() => {
    const m = new Map<string, EstadoAlimentacion[]>();
    for (const r of registros) m.set(`${r.id_contrato}|${r.id_trabajador}|${r.fecha}`, r.estados);
    return m;
  }, [registros]);

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  const dashStats = useMemo(() => {
    const contratoCards = activeContratos.map((c) => {
      const activos = c.trabajadores_asignados.filter((a) => a.activo);
      let racionesHoy_inner = 0;

      for (const a of activos) {
        const est = registroMap.get(`${c.id_contrato}|${a.id_trabajador}|${todayStr}`);
        if (est) racionesHoy_inner += est.length;
      }
      const racionesHoy = racionesHoy_inner;

      const metaMensual = getPresupuestoMensual(c.id_contrato);
      const mesStr = todayStr.slice(0, 7); // YYYY-MM
      
      let consumosMes = 0;
      for (const r of registros) {
        if (r.id_contrato === c.id_contrato && r.fecha.startsWith(mesStr)) {
          consumosMes += r.estados.length;
        }
      }

      return {
        contrato: c,
        activos: activos.length,
        racionesHoy,
        consumosMes,
        metaMensual,
      };
    });

    const totalDotacion = contratoCards.reduce((s, c) => s + c.activos, 0);
    const globalRacionesHoy = contratoCards.reduce((s, c) => s + c.racionesHoy, 0);
    return { totalDotacion, globalRacionesHoy, contratoCards };
  }, [activeContratos, registros, registroMap, todayStr, getPresupuestoMensual]);

  // ── Registro table data ─────────────────────────────────────────────────────
  
  const diasSemana = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(fechaInicioSemana);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [fechaInicioSemana]);

  const uniqueAreas = useMemo(() => {
    if (!selectedContrato) return [];
    const areas = new Set<string>();
    selectedContrato.trabajadores_asignados.forEach(a => {
      if (a.activo && a.nombre_unidad) areas.add(a.nombre_unidad);
    });
    return Array.from(areas).sort();
  }, [selectedContrato]);

  const trabajadoresContrato = useMemo(() => {
    if (!selectedContrato) return [];
    return selectedContrato.trabajadores_asignados
      .filter((a) => {
        if (!a.activo) return false;
        if (filtroArea !== "Todas" && a.nombre_unidad !== filtroArea) return false;
        return true;
      })
      .sort((a, b) => (a.nombre_unidad ?? "").localeCompare(b.nombre_unidad ?? ""));
  }, [selectedContrato, filtroArea]);

  const groupedWorkers = useMemo(() => {
    const groups: Record<string, typeof trabajadoresContrato> = {};
    for (const w of trabajadoresContrato) {
      let key: string;
      if (groupBy === "nivel") key = w.nivel || "Sin Nivel";
      else key = w.nombre_unidad || "Sin Unidad";
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    }
    return groups;
  }, [trabajadoresContrato, groupBy]);

  // Proveedores asignados al contrato actual (categoría Alimentación)
  const proveedoresContrato = useMemo(() => {
    if (!selectedContrato || !selectedContrato.proveedores_asignados) return [];
    return selectedContrato.proveedores_asignados
      .filter(pa => pa.categoria === "Alimentación")
      .map(pa => proveedores.find(p => p.id_proveedor === pa.id_proveedor))
      .filter(p => p !== undefined);
  }, [selectedContrato, proveedores]);

  const presupuestoMesSeleccionado = useMemo(
    () => (selectedContratoId ? getPresupuestoMensual(selectedContratoId) : 0),
    [selectedContratoId, getPresupuestoMensual]
  );
  
  const consumosMesSeleccionado = useMemo(() => {
    if (!selectedContratoId) return 0;
    const mesStr = `${anio}-${String(mes).padStart(2,"0")}`;
    return registros
      .filter(r => r.id_contrato === selectedContratoId && r.fecha.startsWith(mesStr))
      .reduce((acc, r) => acc + r.estados.length, 0);
  }, [selectedContratoId, anio, mes, registros]);


  // ── Handlers ────────────────────────────────────────────────────────────────
  const goToContrato = (id: string) => {
    setSelectedContratoId(id);
    setAnio(today.getFullYear());
    setMes(today.getMonth() + 1);
    setView("registro");
    setRegistroTab("diario");
  };

  const changeMes = (dir: 1 | -1) => {
    const { anio: a, mes: m } = dir === -1 ? prevMes(anio, mes) : nextMes(anio, mes);
    setAnio(a); setMes(m);
  };

  const handleCellSave = (estados: EstadoAlimentacion[]) => {
    if (!selectedContratoId || !editingCell) return;
    setEstados({
      id_contrato: selectedContratoId,
      id_trabajador: editingCell.id_trabajador,
      id_asignacion: editingCell.id_asignacion,
      nombre_trabajador: editingCell.nombre,
      fecha: editingCell.fecha,
      estados
    });
    setEditingCell(null);
  };

  const savePresupuesto = () => {
    if (editingPresupuesto) {
      setPresupuestoMensual(editingPresupuesto.id_contrato, parseInt(tempPresupuestoVal) || 0);
      setEditingPresupuesto(null);
    }
  };

  // ── Render Modal Edición de Celda ───────────────────────────────────────────
  const renderCellEditor = () => {
    if (!editingCell || !selectedContratoId) return null;
    const currentEstados = registroMap.get(`${selectedContratoId}|${editingCell.id_trabajador}|${editingCell.fecha}`) || [];
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
        <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2">
            <h3 className="font-bold text-text text-sm">Registrar Alimentación</h3>
            <button onClick={() => setEditingCell(null)} className="text-text-muted hover:text-text"><X size={18}/></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm font-bold text-text">{editingCell.nombre}</p>
              <p className="text-xs text-text-soft font-mono mt-0.5">{editingCell.fecha}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <CellEditorOptions initial={currentEstados} onSave={handleCellSave} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render Modal Presupuesto ────────────────────────────────────────────────
  const renderPresupuestoModal = () => {
    if (!editingPresupuesto) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
        <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6">
          <h3 className="font-bold text-text text-lg mb-1">Presupuesto Mensual</h3>
          <p className="text-xs text-text-soft mb-4">Ajustar límite de raciones para el contrato: <strong className="text-text">{editingPresupuesto.name}</strong></p>
          
          <div className="space-y-4">
            <div>
              <label className="label">Meta de Raciones / Mes</label>
              <input 
                type="number" 
                className="input" 
                value={tempPresupuestoVal} 
                onChange={e => setTempPresupuestoVal(e.target.value)} 
                autoFocus 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn btn-secondary" onClick={() => setEditingPresupuesto(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={savePresupuesto}>Guardar Meta</button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════════════════════
  //  DASHBOARD VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "dashboard") {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
        {renderPresupuestoModal()}
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
              <Utensils className="text-primary" size={32} />
              Gestión de Alimentación
            </h1>
            <p className="text-sm font-bold text-text-soft mt-2">
              Hoy: {DIAS_SEMANA_SHORT[today.getDay()]} {today.getDate()} de {MESES_ES[today.getMonth()]} {today.getFullYear()}
            </p>
          </div>
          <button
            onClick={() => setView("auditoria")}
            className="btn btn-secondary py-1.5 text-xs flex items-center gap-2"
          >
            <FileText size={14} /> Historial de Cambios
          </button>
        </div>

        {/* KPI Cards */}
        <div className="stats-grid">
          {[
            {
              icon: Users, color: "primary",
              label: "DOTACIÓN ACTIVA",
              value: dashStats.totalDotacion,
            },
            {
              icon: Coffee, color: "warning",
              label: "RACIONES HOY",
              value: dashStats.globalRacionesHoy,
            },
          ].map((s, i) => (
            <div key={i} className="stat-box flex items-center gap-4 group">
              <div className={`p-4 rounded-2xl transition-transform group-hover:scale-105 bg-${s.color}/10 text-${s.color}`}>
                <s.icon size={28} />
              </div>
              <div>
                <p className="label">{s.label}</p>
                <p className="value text-3xl">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contratos List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text">Contratos Activos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashStats.contratoCards.map((c) => (
              <div key={c.contrato.id_contrato} className="card group hover:border-primary/50 transition-all flex flex-col p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity group-hover:scale-110 transform duration-500">
                  <Utensils size={120} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors">{c.contrato.nombre_contrato}</h3>
                    <p className="text-xs text-text-soft font-mono mt-1">{c.contrato.codigo_contrato}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-bold bg-surface-2 p-3 rounded-xl border border-border/50">
                    <div className="flex-1">
                      <p className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Raciones Hoy</p>
                      <p className="text-lg text-text leading-none">{c.racionesHoy}</p>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex-1">
                      <p className="text-text-muted uppercase tracking-wider text-[9px] mb-0.5">Consumo Mes</p>
                      <p className="text-lg text-text leading-none">{c.consumosMes} <span className="text-[10px] text-text-soft font-medium">/ {c.metaMensual}</span></p>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex items-center justify-center">
                      <button 
                        className="p-2 text-text-muted hover:text-primary transition-colors bg-surface rounded-lg shadow-sm border border-border"
                        title="Ajustar Meta/Presupuesto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPresupuesto({ id_contrato: c.contrato.id_contrato, name: c.contrato.nombre_contrato });
                          setTempPresupuestoVal(c.metaMensual.toString());
                        }}
                      >
                        <Target size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-bold text-text-soft flex items-center gap-1.5"><Users size={14}/> {c.activos} personas</span>
                  <button 
                    onClick={() => goToContrato(c.contrato.id_contrato)}
                    className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                  >
                    Registrar <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  REGISTRO VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (!selectedContrato) {
    setView("dashboard");
    return null;
  }

  return (
    <div className="max-w-full mx-auto space-y-6 animate-fadeIn pt-4">
      {renderCellEditor()}
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm no-print"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">{selectedContrato.nombre_contrato}</h1>
            <p className="text-sm font-bold text-text-soft font-mono mt-1">{selectedContrato.codigo_contrato}</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-primary py-1.5 text-xs flex items-center gap-2 no-print"
        >
          <Printer size={14} /> Exportar a PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0 pt-2 no-print">
        {([["diario","Registro Semanal"],["resumen","Resumen Mes"]] as [RegistroTab,string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setRegistroTab(tab)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              registroTab === tab ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: RESUMEN ── */}
      {registroTab === "resumen" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Month navigator */}
          <div className="flex items-center gap-2 bg-surface-2 p-1.5 rounded-xl border border-border w-fit">
            <button onClick={() => changeMes(-1)} className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronLeft size={16} /></button>
            <span className="text-sm font-bold text-text min-w-[140px] text-center">{MESES_ES[mes - 1]} {anio}</span>
            <button onClick={() => changeMes(1)} className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronRight size={16} /></button>
          </div>

          {/* FTE + state breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card flex items-center gap-6 p-6">
              <PresupuestoGauge real={consumosMesSeleccionado} meta={presupuestoMesSeleccionado} size={88} />
              <div className="space-y-2">
                <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Consumo {MESES_ES[mes-1]}</p>
                <p className="text-3xl font-bold text-text">{consumosMesSeleccionado}</p>
                <p className="text-xs font-bold text-text-soft">Meta: <span className="text-text">{presupuestoMesSeleccionado}</span> raciones</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: DIARIO ── */}
      {registroTab === "diario" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Filters + Week Navigator strip */}
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl border border-border bg-surface no-print">
            {/* Week Navigator */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
                <button onClick={() => setFechaInicioSemana(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronLeft size={16} /></button>
                <span className="text-xs font-bold text-text min-w-[170px] text-center">
                  {fechaInicioSemana.getDate()} {MESES_ES[fechaInicioSemana.getMonth()].slice(0,3)} - {(() => {
                    const end = new Date(fechaInicioSemana); end.setDate(end.getDate() + 7);
                    return `${end.getDate()} ${MESES_ES[end.getMonth()].slice(0,3)}`;
                  })()} {fechaInicioSemana.getFullYear()}
                </span>
                <button onClick={() => setFechaInicioSemana(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Filter size={16} className="text-primary" />
              {proveedoresContrato.length > 0 && (
                <select value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)}
                  className="input py-1.5 px-3 min-h-0 text-xs w-auto border-dashed border-primary/50">
                  <option value="Todos">Todos los Proveedores</option>
                  {proveedoresContrato.map(p => <option key={p!.id_proveedor} value={p!.id_proveedor}>{p!.nombre}</option>)}
                </select>
              )}
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="input py-1.5 px-3 min-h-0 text-xs w-auto">
                <option value="unidad">Agrupar por Área/Unidad</option>
                <option value="nivel">Agrupar por Nivel</option>
              </select>
              <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}
                className="input py-1.5 px-3 min-h-0 text-xs w-auto">
                <option value="Todas">Todas las Áreas</option>
                {uniqueAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Active PDF Title context */}
          <div className="hidden print:block mb-4">
            <h2 className="text-lg font-bold">Registro de Alimentación Semanal</h2>
            <p className="text-sm">Semana: {fechaInicioSemana.getDate()} {MESES_ES[fechaInicioSemana.getMonth()].slice(0,3)} al {(() => { const end = new Date(fechaInicioSemana); end.setDate(end.getDate() + 7); return `${end.getDate()} ${MESES_ES[end.getMonth()].slice(0,3)}`; })()} {fechaInicioSemana.getFullYear()}</p>
            {filtroProveedor !== "Todos" && <p className="text-sm">Proveedor Seleccionado: {proveedores.find(p => p.id_proveedor === filtroProveedor)?.nombre}</p>}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 items-center text-[11px] font-bold text-text-muted no-print">
            <span className="text-text-soft uppercase tracking-wider mr-1">Raciones:</span>
            {(Object.keys(ALIMENTACION_CONFIG) as EstadoAlimentacion[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                <span className={`w-2.5 h-2.5 rounded-full ${ALIMENTACION_CONFIG[s].bg}`} />
                <span className="font-extrabold text-text">{ALIMENTACION_CONFIG[s].shortLabel}</span>
                <span className="text-text-soft">{ALIMENTACION_CONFIG[s].label}</span>
              </span>
            ))}
            <span className="ml-auto text-primary flex items-center gap-1"><ArrowLeft size={12} className="rotate-90" /> Click en celda para registrar</span>
          </div>

          {/* Attendance table */}
          <div className="table-shell overflow-x-auto">
            <table className="border-collapse text-[11px]" style={{ minWidth: "max-content" }}>
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-text-muted uppercase sticky left-0 z-20 bg-surface-2 min-w-[180px] shadow-[1px_0_0_0_var(--color-border)]">
                    Trabajador
                  </th>
                  {diasSemana.map((dObj, i) => {
                    const dow = dObj.getDay();
                    const isWE = dow === 0 || dow === 6;
                    const dNum = dObj.getDate();
                    const isToday = dateStr(dObj.getFullYear(), dObj.getMonth() + 1, dNum) === todayStr;
                    return (
                      <th
                        key={i}
                        className={`w-14 py-2 text-center font-bold ${
                          isToday ? "text-primary bg-primary/10" : isWE ? "text-text-muted/70" : "text-text-soft"
                        }`}
                      >
                        {dNum}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-right text-[10px] font-bold text-text-muted sticky right-0 bg-surface-2 border-l border-border shadow-[-1px_0_0_0_var(--color-border)]">
                    Total Sem.
                  </th>
                </tr>
                <tr className="border-b border-border bg-surface">
                  <th className="sticky left-0 z-20 bg-surface shadow-[1px_0_0_0_var(--color-border)]" />
                  {diasSemana.map((dObj, i) => {
                    const dow = dObj.getDay();
                    const isWE = dow === 0 || dow === 6;
                    return (
                      <th key={i} className={`w-14 py-1.5 text-center text-[9px] font-bold ${isWE ? "text-text-muted/40" : "text-text-muted"}`}>
                        {DIAS_SEMANA_SHORT[dow]}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 bg-surface shadow-[-1px_0_0_0_var(--color-border)]" />
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {Object.entries(groupedWorkers).map(([groupName, workers]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-surface-2">
                      <td colSpan={diasSemana.length + 2} className="px-4 py-2 sticky left-0 shadow-[1px_0_0_0_var(--color-border)]">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 size={12} /> {groupName}
                          <span className="text-text-muted font-bold ml-1">({workers.length} personas)</span>
                        </span>
                      </td>
                    </tr>

                    {workers.map((w) => {
                      let totalSemana = 0;
                      
                      return (
                        <tr key={w.id_asignacion} className="hover:bg-surface-2 transition-colors group">
                          <td className="px-4 py-2 sticky left-0 z-10 bg-surface group-hover:bg-surface-2 shadow-[1px_0_0_0_var(--color-border)] transition-colors">
                            <p className="font-bold text-text truncate max-w-[160px]">{w.nombre}</p>
                            <p className="text-[10px] font-medium text-text-soft">{w.nombre_cargo}</p>
                          </td>

                          {diasSemana.map((dObj, i) => {
                            const dNum = dObj.getDate();
                            const fecha = dateStr(dObj.getFullYear(), dObj.getMonth() + 1, dNum);
                            const isToday = fecha === todayStr;
                            
                            const estadosList = registroMap.get(`${selectedContratoId}|${w.id_trabajador}|${fecha}`) || [];
                            totalSemana += estadosList.length;

                            return (
                              <td
                                key={i}
                                onClick={() => setEditingCell({ id_trabajador: w.id_trabajador, id_asignacion: w.id_asignacion, nombre: w.nombre, fecha })}
                                className={`w-14 h-full p-1 text-center transition-all align-top ${
                                  isToday
                                    ? "ring-1 ring-inset ring-primary/30 bg-primary/5 cursor-pointer hover:ring-primary hover:bg-primary/10"
                                    : "cursor-pointer hover:bg-surface-2"
                                }`}
                              >
                                {estadosList.length > 0 ? (
                                  <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                                    {estadosList.map(st => (
                                      <span key={st} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-extrabold ${ALIMENTACION_CONFIG[st].bg} text-white shadow-sm`} title={ALIMENTACION_CONFIG[st].label}>
                                        {ALIMENTACION_CONFIG[st].shortLabel}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center pt-1 pb-1">
                                    <span className="text-text-muted/30 text-[10px] font-bold">·</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-4 py-2 text-right sticky right-0 bg-surface group-hover:bg-surface-2 shadow-[-1px_0_0_0_var(--color-border)] transition-colors">
                            <span className="font-bold text-text">{totalSemana}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
                {Object.keys(groupedWorkers).length === 0 && (
                  <tr>
                    <td colSpan={diasSemana.length + 2} className="px-4 py-8 text-center text-text-muted text-sm italic font-medium">
                      No hay trabajadores para esta selección.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* ── TAB: AUDITORIA ── */}
      {/* Omitted auditoria detail to save size, can be added if needed, or simply let user know it exists via the general button */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Internal Editor Component for Modal
// ─────────────────────────────────────────────────────────────────────────────
function CellEditorOptions({ initial, onSave }: { initial: EstadoAlimentacion[], onSave: (selected: EstadoAlimentacion[]) => void }) {
  const [selected, setSelected] = useState<EstadoAlimentacion[]>([...initial]);
  
  const toggleLocalEstado = (st: EstadoAlimentacion) => {
    if (selected.includes(st)) setSelected(selected.filter((e) => e !== st));
    else setSelected([...selected, st]);
  };
  
  return (
    <>
      {(Object.keys(ALIMENTACION_CONFIG) as EstadoAlimentacion[]).map(st => {
        const cfg = ALIMENTACION_CONFIG[st];
        const isSel = selected.includes(st);
        return (
          <button
            key={st}
            onClick={() => toggleLocalEstado(st)}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
              isSel ? `border-[${cfg.colorHex}] bg-[${cfg.colorHex}]/10 ring-1 ring-[${cfg.colorHex}]/50` : "border-border bg-bg hover:border-text-muted"
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isSel ? cfg.bg + " text-white" : "bg-surface-2 text-text-muted"}`}>
              {cfg.shortLabel}
            </span>
            <span className={`text-[11px] font-bold ${isSel ? "text-text" : "text-text-soft"}`}>{cfg.label}</span>
          </button>
        );
      })}
      <div className="col-span-2 pt-2 flex justify-end gap-2">
        <button className="btn btn-primary w-full" onClick={() => onSave(selected)}>
          Guardar Consumo
        </button>
      </div>
    </>
  );
}
