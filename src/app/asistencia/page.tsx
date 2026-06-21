"use client";

import React, { useState, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useAsistenciaStore,
  ESTADO_CONFIG,
  ESTADOS_CYCLE,
  EstadoAsistencia,
} from "@/store/asistencia-store";
import { useContratosStore } from "@/store/contratos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  Activity,
  Building2,
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
type RegistroTab = "diario" | "planificacion" | "resumen";
type GroupBy = "unidad" | "nivel" | "sexo" | "modalidad";

function getTodayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
}

function dateStr(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
}

function getDiasDelMes(anio: number, mes: number): number[] {
  const total = new Date(anio, mes, 0).getDate();
  return Array.from({ length: total }, (_, i) => i + 1);
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

// Estado badge colours for non-bg uses (borders, text)
const ESTADO_BADGE: Record<EstadoAsistencia, string> = {
  P:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  T:   "bg-purple-500/15  text-purple-400  border-purple-500/25",
  V:   "bg-amber-500/15   text-amber-400   border-amber-500/25",
  L:   "bg-red-500/15     text-red-400     border-red-500/25",
  D:   "bg-zinc-700/40    text-zinc-300    border-zinc-600/40",
  C:   "bg-cyan-500/15    text-cyan-400    border-cyan-500/25",
  Per: "bg-blue-500/15    text-blue-400    border-blue-500/25",
};

// ─────────────────────────────────────────────────────────────────────────────
//  FTE Gauge (SVG circle)
// ─────────────────────────────────────────────────────────────────────────────

function FTEGauge({ real, meta, size = 80 }: { real: number; meta: number; size?: number }) {
  const pct = meta > 0 ? Math.min(1, real / meta) : 0;
  const r = 15.9;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct >= 0.9 ? "#10b981" : pct >= 0.7 ? "#f59e0b" : "#ef4444";

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
        <span className="text-base font-bold text-white leading-none">{real.toFixed(1)}</span>
        <span className="text-[9px] text-zinc-500">/ {meta.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Stacked state bar
// ─────────────────────────────────────────────────────────────────────────────

const ESTADO_BAR_COLOR: Record<EstadoAsistencia, string> = {
  P: "#10b981", T: "#a855f7", V: "#f59e0b",
  L: "#ef4444", D: "#71717a", C: "#06b6d4", Per: "#3b82f6",
};

function StateBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) return <div className="h-2 rounded-full bg-zinc-800 w-full" />;
  const states = (Object.keys(ESTADO_BAR_COLOR) as EstadoAsistencia[]).filter((s) => counts[s] > 0);
  return (
    <div className="flex h-2 rounded-full overflow-hidden w-full gap-px">
      {states.map((s) => (
        <div
          key={s}
          style={{ width: `${(counts[s] / total) * 100}%`, background: ESTADO_BAR_COLOR[s] }}
          title={`${ESTADO_CONFIG[s].label}: ${counts[s]}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AsistenciaPage() {
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
  const [filtroSexo, setFiltroSexo] = useState<"Todos" | "M" | "F">("Todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("Todos");

  const [modoFechas, setModoFechas] = useState<"semana" | "mes" | "rango">("semana");
  const [fechaInicioRango, setFechaInicioRango] = useState<string>(todayStr);
  const [fechaFinRango, setFechaFinRango] = useState<string>(todayStr);

  // ── Stores ──────────────────────────────────────────────────────────────────
  const {
    registros,
    auditoria,
    setEstado,
    getMetaFTE,
    calcularFTEReal,
    calcularDiasHabiles,
    fetchAsistencia,
    fetchMetasFTE,
  } = useAsistenciaStore(
    useShallow((s) => ({
      registros: s.registros,
      auditoria: s.auditoria,
      setEstado: s.setEstado,
      getMetaFTE: s.getMetaFTE,
      calcularFTEReal: s.calcularFTEReal,
      calcularDiasHabiles: s.calcularDiasHabiles,
      fetchAsistencia: s.fetchAsistencia,
      fetchMetasFTE: s.fetchMetasFTE,
    }))
  );
  const { contratos, fetchContratos } = useContratosStore(
    useShallow((s) => ({ contratos: s.contratos, fetchContratos: s.fetchContratos }))
  );
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );

  React.useEffect(() => {
    fetchContratos();
    fetchTrabajadores();
    fetchAsistencia();
    fetchMetasFTE();
  }, [fetchContratos, fetchTrabajadores, fetchAsistencia, fetchMetasFTE]);

  const activeContratos = useMemo(() => contratos.filter((c) => c.estado === "Activo"), [contratos]);
  const selectedContrato = useMemo(
    () => contratos.find((c) => c.id_contrato === selectedContratoId) ?? null,
    [contratos, selectedContratoId]
  );

  // ── Fast registro lookup (for the table rendering) ─────────────────────────
  const registroMap = useMemo(() => {
    const m = new Map<string, EstadoAsistencia>();
    for (const r of registros) m.set(`${r.id_contrato}|${r.id_trabajador}|${r.fecha}`, r.estado);
    return m;
  }, [registros]);

  // ── Dashboard stats ─────────────────────────────────────────────────────────
  const dashStats = useMemo(() => {
    const contratoCards = activeContratos.map((c) => {
      const activos = c.trabajadores_asignados.filter((a) => a.activo);

      // Counts for today
      const todayCounts: Record<string, number> = {};
      let presente = 0, ausente = 0;
      for (const a of activos) {
        const est = registroMap.get(`${c.id_contrato}|${a.id_trabajador}|${todayStr}`);
        if (est) {
          todayCounts[est] = (todayCounts[est] || 0) + 1;
          if (ESTADO_CONFIG[est].contabiliza) presente++; else ausente++;
        }
      }

      // FTE
      const diasH = calcularDiasHabiles(anio, mes);
      const meta = getMetaFTE(c.id_contrato);
      const fteReal = calcularFTEReal(c.id_contrato, anio, mes, diasH);

      // 12-month mini trend
      const monthTrend: number[] = [];
      for (let m2 = 1; m2 <= 12; m2++) {
        const dh = calcularDiasHabiles(anio, m2);
        const ft = calcularFTEReal(c.id_contrato, anio, m2, dh);
        monthTrend.push(Math.round((meta > 0 ? Math.min(1, ft / meta) : 0) * 100));
      }

      return {
        contrato: c,
        activos: activos.length,
        presente,
        ausente,
        sinRegistro: activos.length - presente - ausente,
        meta,
        fteReal: Math.round(fteReal * 100) / 100,
        todayCounts,
        monthTrend,
      };
    });

    const totalDotacion = contratoCards.reduce((s, c) => s + c.activos, 0);
    const globalPresente = contratoCards.reduce((s, c) => s + c.presente, 0);
    const globalAusente = contratoCards.reduce((s, c) => s + c.ausente, 0);

    // Global state distribution for today
    const globalCounts: Record<string, number> = {};
    let globalTotal = 0;
    for (const r of registros.filter((r) => r.fecha === todayStr)) {
      globalCounts[r.estado] = (globalCounts[r.estado] || 0) + 1;
      globalTotal++;
    }

    return { totalDotacion, globalPresente, globalAusente, contratoCards, globalCounts, globalTotal };
  }, [activeContratos, registros, registroMap, todayStr, anio, mes, calcularDiasHabiles, getMetaFTE, calcularFTEReal]);

  // ── Registro table data ─────────────────────────────────────────────────────
  const dias = useMemo(() => getDiasDelMes(anio, mes), [anio, mes]);
  
  const diasSemana = useMemo(() => {
    const arr: Date[] = [];
    if (modoFechas === "semana") {
      for (let i = 0; i <= 7; i++) {
        const d = new Date(fechaInicioSemana);
        d.setDate(d.getDate() + i);
        arr.push(d);
      }
    } else if (modoFechas === "mes") {
      const totalDays = new Date(anio, mes, 0).getDate();
      for (let i = 1; i <= totalDays; i++) {
        arr.push(new Date(anio, mes - 1, i));
      }
    } else {
      const start = new Date(fechaInicioRango + "T00:00:00");
      const end = new Date(fechaFinRango + "T00:00:00");
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const current = new Date(start);
        let count = 0;
        while (current <= end && count < 45) { // max 45 days
          arr.push(new Date(current));
          current.setDate(current.getDate() + 1);
          count++;
        }
      } else {
        // Fallback cuando el rango es invalido: mostrar solo el dia actual.
        arr.push(new Date());
      }
    }
    return arr;
  }, [modoFechas, fechaInicioSemana, anio, mes, fechaInicioRango, fechaFinRango]);

  const trabajadoresContrato = useMemo(() => {
    if (!selectedContrato) return [];
    return selectedContrato.trabajadores_asignados
      .filter((a) => {
        if (!a.activo) return false;
        if (filtroSexo !== "Todos") {
          const t = trabajadores.find((t) => t.id_trabajador === a.id_trabajador);
          if (t && t.sexo !== filtroSexo) return false;
        }
        if (filtroNivel !== "Todos" && a.nivel !== filtroNivel) return false;
        return true;
      })
      .sort((a, b) => (a.nombre_unidad ?? "").localeCompare(b.nombre_unidad ?? ""));
  }, [selectedContrato, trabajadores, filtroSexo, filtroNivel]);

  const groupedWorkers = useMemo(() => {
    const groups: Record<string, typeof trabajadoresContrato> = {};
    for (const w of trabajadoresContrato) {
      let key: string;
      if (groupBy === "nivel") key = w.nivel || "Sin Nivel";
      else if (groupBy === "sexo") {
        const t = trabajadores.find((t) => t.id_trabajador === w.id_trabajador);
        key = t?.sexo === "M" ? "Masculino" : t?.sexo === "F" ? "Femenino" : "Otro";
      } else if (groupBy === "modalidad") {
        const t = trabajadores.find((t) => t.id_trabajador === w.id_trabajador);
        key = t?.modalidad_trabajo || "No definido";
      } else {
        key = w.nombre_unidad || "Sin Unidad";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    }
    return groups;
  }, [trabajadoresContrato, groupBy, trabajadores]);

  const diasHabilesSeleccionados = useMemo(
    () => calcularDiasHabiles(anio, mes),
    [anio, mes, calcularDiasHabiles]
  );
  const fteRealSeleccionado = useMemo(
    () => selectedContratoId
      ? Math.round(calcularFTEReal(selectedContratoId, anio, mes, diasHabilesSeleccionados) * 100) / 100
      : 0,
    [selectedContratoId, anio, mes, diasHabilesSeleccionados, calcularFTEReal]
  );
  const metaSeleccionada = useMemo(
    () => (selectedContratoId ? getMetaFTE(selectedContratoId) : 0),
    [selectedContratoId, getMetaFTE]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const goToContrato = (id: string) => {
    setSelectedContratoId(id);
    setAnio(today.getFullYear());
    setMes(today.getMonth() + 1);
    setView("registro");
    setRegistroTab("diario");
  };

  const handleCellClick = (
    id_trabajador: string,
    id_asignacion: string,
    nombre: string,
    fecha: string
  ) => {
    if (!selectedContratoId) return;
    const cur = registroMap.get(`${selectedContratoId}|${id_trabajador}|${fecha}`) ?? null;
    const idx = ESTADOS_CYCLE.indexOf(cur);
    const next = ESTADOS_CYCLE[(idx + 1) % ESTADOS_CYCLE.length];
    setEstado({ id_contrato: selectedContratoId, id_trabajador, id_asignacion, nombre_trabajador: nombre, fecha, estado: next });
  };

  const changeMes = (dir: 1 | -1) => {
    const { anio: a, mes: m } = dir === -1 ? prevMes(anio, mes) : nextMes(anio, mes);
    setAnio(a); setMes(m);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════════════
  //  DASHBOARD VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "dashboard") {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
              <CalendarDays className="text-primary" size={32} />
              Control de Asistencia
            </h1>
            <p className="text-sm font-bold text-text-soft mt-2">
              Hoy: {DIAS_SEMANA_SHORT[today.getDay()]}{" "}
              {today.getDate()} de {MESES_ES[today.getMonth()]} {today.getFullYear()} •{" "}
              Período activo: {MESES_ES[mes - 1]} {anio}
            </p>
          </div>
          <button
            onClick={() => setView("auditoria")}
            className="btn btn-secondary py-1.5 text-xs flex items-center gap-2"
          >
            <FileText size={14} /> Auditoría Global
          </button>
        </div>

        {/* KPI Cards */}
        <div className="stats-grid">
          {[
            {
              icon: Users, color: "primary",
              label: "DOTACIÓN ACTIVA",
              value: dashStats.totalDotacion,
              sub: `En ${activeContratos.length} contratos activos`,
            },
            {
              icon: CheckCircle2, color: "success",
              label: "PRESENTES HOY",
              value: dashStats.globalPresente,
              sub: `${Math.round((dashStats.globalPresente / Math.max(dashStats.totalDotacion,1)) * 100)}% de la dotación`,
            },
            {
              icon: XCircle, color: "warning",
              label: "AUSENTES HOY",
              value: dashStats.globalAusente,
              sub: `${dashStats.totalDotacion - dashStats.globalPresente - dashStats.globalAusente} sin registrar`,
            },
            {
              icon: Activity, color: "purple",
              label: `FTE PERÍODO (${MESES_ES[mes-1].toUpperCase()})`,
              value: dashStats.contratoCards.reduce((acc, c) => acc + c.fteReal, 0).toFixed(1),
              sub: `Meta total: ${dashStats.contratoCards.reduce((acc, c) => acc + c.meta, 0).toFixed(1)} FTE`,
            },
          ].map(({ icon: Icon, color, label, value, sub }) => (
            <div key={label} className="stat-box flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${color === 'purple' ? 'purple-500/10' : color + '/10'} text-${color === 'purple' ? 'purple-500' : color} flex-shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <span className="label">{label}</span>
                <span className="value text-2xl">{value}</span>
                <span className="text-[10px] font-medium text-text-muted block truncate">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Global state distribution */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              Distribución de Estados — Hoy
            </h3>
            <span className="text-[11px] font-bold text-text-muted">{dashStats.globalTotal} registros</span>
          </div>
          <StateBar counts={dashStats.globalCounts} total={dashStats.globalTotal} />
          <div className="flex flex-wrap gap-4 pt-2">
            {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => (
              <div key={s} className="flex items-center gap-2 text-[11px] font-semibold text-text-soft">
                <span className={`w-3 h-3 rounded-sm ${ESTADO_CONFIG[s].bg}`} />
                {ESTADO_CONFIG[s].label}
                {dashStats.globalCounts[s] ? (
                  <span className="text-text font-bold ml-1">{dashStats.globalCounts[s]}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Contract cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashStats.contratoCards.map(({ contrato, activos, presente, ausente, sinRegistro, meta, fteReal, todayCounts }) => {
            const pct = meta > 0 ? Math.min(100, Math.round((fteReal / meta) * 100)) : 0;
            const pctColor = pct >= 90 ? "text-success" : pct >= 70 ? "text-warning" : "text-danger";
            const barColor = pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger";

            return (
              <div
                key={contrato.id_contrato}
                className="card group hover:border-primary/40 transition-all space-y-5 flex flex-col p-6"
              >
                {/* Contract header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-text text-base truncate group-hover:text-primary transition-colors">{contrato.nombre_contrato}</h3>
                    <p className="text-[11px] text-text-muted font-bold font-mono mt-0.5">{contrato.codigo_contrato}</p>
                  </div>
                  <span className="badge bg-success/10 text-success border-success/20 flex-shrink-0">
                    {contrato.estado}
                  </span>
                </div>

                {/* FTE gauge + stats */}
                <div className="flex items-center gap-5 bg-surface-2 p-4 rounded-xl border border-border">
                  <FTEGauge real={fteReal} meta={meta} size={76} />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-soft">FTE Real</span>
                      <span className={`${pctColor}`}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-text-muted">
                      <span>Meta: {meta.toFixed(1)} FTE</span>
                      <span>Real: {fteReal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Today breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    <span>Estado de hoy</span>
                    <span>{activos} personas</span>
                  </div>
                  <StateBar counts={todayCounts} total={activos} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold">
                    <span className="text-success flex items-center gap-1"><CheckCircle2 size={12}/> {presente} presentes</span>
                    <span className="text-warning flex items-center gap-1"><AlertTriangle size={12}/> {ausente} ausentes</span>
                    {sinRegistro > 0 && <span className="text-text-muted">— {sinRegistro} sin reg.</span>}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => goToContrato(contrato.id_contrato)}
                  className="btn btn-primary w-full mt-auto py-2 flex items-center justify-center gap-2"
                >
                  <CalendarDays size={14} />
                  Registrar Asistencia
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  AUDITORIA VIEW
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "auditoria") {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">Log de Auditoría</h1>
            <p className="text-sm font-bold text-text-soft mt-1">{auditoria.length} cambios registrados</p>
          </div>
        </div>

        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 border-b border-border">
                <tr>
                  {["Fecha/Hora","Trabajador","Contrato","Fecha Asist.","Anterior","Nuevo","Usuario"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditoria.slice(0, 100).map((a) => (
                  <tr key={a.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3 text-text-soft text-xs whitespace-nowrap font-medium">
                      {new Date(a.editado_at).toLocaleString("es-CL")}
                    </td>
                    <td className="px-5 py-3 text-text font-bold">{a.nombre_trabajador}</td>
                    <td className="px-5 py-3 text-text-muted font-bold font-mono text-[10px]">{a.id_contrato}</td>
                    <td className="px-5 py-3 text-text-soft font-semibold">{a.fecha_asistencia}</td>
                    <td className="px-5 py-3">
                      {a.estado_anterior ? (
                        <span className={`badge ${ESTADO_BADGE[a.estado_anterior]}`}>
                          {a.estado_anterior}
                        </span>
                      ) : <span className="text-text-muted font-bold">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {a.estado_nuevo ? (
                        <span className={`badge ${ESTADO_BADGE[a.estado_nuevo]}`}>
                          {a.estado_nuevo}
                        </span>
                      ) : <span className="text-text-muted text-xs font-bold">Eliminado</span>}
                    </td>
                    <td className="px-5 py-3 text-text-soft text-xs font-semibold">{a.editado_por}</td>
                  </tr>
                ))}
                {auditoria.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-text-soft text-sm font-medium italic">No hay cambios registrados aún.</td></tr>
                )}
              </tbody>
            </table>
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

  // Resumen stats for the selected month
  const mesStr = `${anio}-${String(mes).padStart(2,"0")}`;
  const mesRegistros = registros.filter((r) => r.id_contrato === selectedContratoId && r.fecha.startsWith(mesStr));
  const estadoCountsMes: Record<string, number> = {};
  for (const r of mesRegistros) estadoCountsMes[r.estado] = (estadoCountsMes[r.estado] || 0) + 1;

  return (
    <div className="max-w-full mx-auto space-y-6 animate-fadeIn pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">{selectedContrato.nombre_contrato}</h1>
            <p className="text-sm font-bold text-text-soft font-mono mt-1">{selectedContrato.codigo_contrato}</p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2 bg-surface-2 p-1.5 rounded-xl border border-border">
          <button onClick={() => changeMes(-1)} className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold text-text min-w-[140px] text-center">{MESES_ES[mes - 1]} {anio}</span>
          <button onClick={() => changeMes(1)} className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0 pt-2">
        {([["diario","Registro Diario"],["resumen","Resumen Mes"],["planificacion","Planificación 12M"]] as [RegistroTab,string][]).map(([tab, label]) => (
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
        <button
          onClick={() => setView("auditoria")}
          className="ml-auto px-4 py-3 text-xs font-bold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
        >
          <FileText size={14} /> Auditoría
        </button>
      </div>

      {/* ── TAB: RESUMEN ── */}
      {registroTab === "resumen" && (
        <div className="space-y-6 animate-fadeIn">
          {/* FTE + state breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FTE Card */}
            <div className="card flex items-center gap-6 p-6">
              <FTEGauge real={fteRealSeleccionado} meta={metaSeleccionada} size={88} />
              <div className="space-y-2">
                <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider">FTE Real {MESES_ES[mes-1]}</p>
                <p className="text-3xl font-bold text-text">{fteRealSeleccionado.toFixed(2)}</p>
                <p className="text-xs font-bold text-text-soft">Meta: <span className="text-text">{metaSeleccionada.toFixed(1)}</span> FTE</p>
                <p className="text-xs font-bold text-text-soft">Días hábiles: <span className="text-text">{diasHabilesSeleccionados}</span></p>
              </div>
            </div>

            {/* States breakdown */}
            <div className="md:col-span-2 card space-y-4 p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Distribución de Estados — {MESES_ES[mes-1]} {anio}</h3>
              <div className="space-y-2.5">
                {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => {
                  const count = estadoCountsMes[s] || 0;
                  const pct = mesRegistros.length > 0 ? Math.round((count / mesRegistros.length) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-4">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${ESTADO_CONFIG[s].bg}`}>
                        {ESTADO_CONFIG[s].shortLabel}
                      </span>
                      <span className="text-xs font-bold text-text-soft w-28">{ESTADO_CONFIG[s].label}</span>
                      <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                        <div className={`h-full rounded-full ${ESTADO_CONFIG[s].bg}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-text font-bold w-8 text-right">{count}</span>
                      <span className="text-[11px] font-bold text-text-muted w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Per-unit breakdown */}
          <div className="table-shell">
            <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-primary" /> Desglose por Unidad
              </h3>
            </div>
            <div className="divide-y divide-border">
              {selectedContrato.unidades.filter((u) => u.activa).map((unidad) => {
                const workersInUnit = selectedContrato.trabajadores_asignados.filter(
                  (a) => a.activo && a.id_unidad === unidad.id_unidad
                );
                const unitRecords = mesRegistros.filter((r) =>
                  workersInUnit.some((w) => w.id_trabajador === r.id_trabajador)
                );
                const unitCounts: Record<string, number> = {};
                for (const r of unitRecords) unitCounts[r.estado] = (unitCounts[r.estado] || 0) + 1;
                const dh = diasHabilesSeleccionados;
                const fteUnit = dh > 0
                  ? (unitRecords.filter((r) => ESTADO_CONFIG[r.estado].contabiliza).length / dh).toFixed(2)
                  : "—";

                return (
                  <div key={unidad.id_unidad} className="px-5 py-4 flex items-center gap-5 flex-wrap hover:bg-surface-2 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-text">{unidad.nombre}</p>
                      <p className="text-[11px] font-medium text-text-soft mt-0.5">{workersInUnit.length} personas</p>
                    </div>
                    <div className="w-48">
                      <StateBar counts={unitCounts} total={unitRecords.length} />
                    </div>
                    <span className="text-xs font-bold text-text-soft">FTE: <span className="text-text">{fteUnit}</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: PLANIFICACIÓN 12M ── */}
      {registroTab === "planificacion" && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-sm font-bold text-text-soft">Vista anual de asistencia — color dominante por mes. Click en un mes para ir al registro diario.</p>
          <div className="table-shell overflow-x-auto">
            <table className="border-collapse w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-text-muted uppercase sticky left-0 bg-surface-2 z-10 min-w-[150px] shadow-[1px_0_0_0_var(--color-border)]">Trabajador</th>
                  {MESES_ES.map((m) => (
                    <th key={m} className="px-2 py-3 text-center text-[10px] font-bold text-text-muted uppercase min-w-[60px]">{m.slice(0,3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {selectedContrato.trabajadores_asignados.filter((a) => a.activo).map((w) => (
                  <tr key={w.id_asignacion} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-surface z-10 shadow-[1px_0_0_0_var(--color-border)] group-hover:bg-surface-2 transition-colors">
                      <p className="font-bold text-text text-xs truncate max-w-[140px]">{w.nombre}</p>
                      <p className="text-[10px] font-medium text-text-soft truncate mt-0.5">{w.nombre_unidad}</p>
                    </td>
                    {MESES_ES.map((_, mi) => {
                      const m2 = mi + 1;
                      const ms = `${anio}-${String(m2).padStart(2,"0")}`;
                      const monthRecs = registros.filter((r) => r.id_contrato === selectedContratoId && r.id_trabajador === w.id_trabajador && r.fecha.startsWith(ms));
                      const counts: Record<string, number> = {};
                      for (const r of monthRecs) counts[r.estado] = (counts[r.estado] || 0) + 1;
                      const dominant = (Object.keys(counts) as EstadoAsistencia[]).sort((a, b) => counts[b] - counts[a])[0];
                      const isCurrentMes = m2 === mes;
                      return (
                        <td key={mi} className="px-2 py-2 text-center">
                          <button
                            onClick={() => { setMes(m2); setRegistroTab("diario"); }}
                            className={`w-14 h-8 rounded-lg text-[10px] font-bold transition-all ${
                              dominant
                                ? `${ESTADO_CONFIG[dominant as EstadoAsistencia].bg} text-white shadow-sm hover:opacity-90`
                                : isCurrentMes
                                ? "bg-primary/10 border border-primary/20 text-primary"
                                : "bg-bg text-text-muted hover:bg-border"
                            }`}
                          >
                            {dominant ? ESTADO_CONFIG[dominant as EstadoAsistencia].shortLabel : monthRecs.length > 0 ? "·" : "—"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: DIARIO ── */}
      {registroTab === "diario" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Filters + FTE summary strip */}
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 rounded-2xl border border-border bg-surface">
            {/* View Mode & Date Navigators */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <select value={modoFechas} onChange={(e) => setModoFechas(e.target.value as "semana" | "mes" | "rango")} className="input py-1.5 px-3 min-h-0 text-xs w-auto border-dashed border-primary/50 text-text">
                  <option value="semana">Semana (Mié - Mié)</option>
                  <option value="mes">Mes Completo</option>
                  <option value="rango">Rango Específico</option>
                </select>

                {modoFechas === "semana" && (
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
                )}
                
                {modoFechas === "mes" && (
                  <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border">
                    <button onClick={() => changeMes(-1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-bold text-text min-w-[130px] text-center">
                      {MESES_ES[mes-1]} {anio}
                    </span>
                    <button onClick={() => changeMes(1)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-all"><ChevronRight size={16} /></button>
                  </div>
                )}

                {modoFechas === "rango" && (
                  <div className="flex items-center gap-2 bg-surface-2 p-1 rounded-xl border border-border">
                    <input type="date" className="input py-1 min-h-0 text-xs w-auto bg-surface" value={fechaInicioRango} onChange={e => setFechaInicioRango(e.target.value)} />
                    <span className="text-text-muted text-[10px] uppercase font-bold">hasta</span>
                    <input type="date" className="input py-1 min-h-0 text-xs w-auto bg-surface" value={fechaFinRango} onChange={e => setFechaFinRango(e.target.value)} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">

              <div className="flex items-center gap-3">
                <FTEGauge real={fteRealSeleccionado} meta={metaSeleccionada} size={40} />
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">FTE {MESES_ES[mes-1]}</p>
                  <p className="text-sm font-bold text-text leading-tight">{fteRealSeleccionado.toFixed(2)} <span className="text-text-soft text-xs">/ {metaSeleccionada.toFixed(1)}</span></p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Filter size={16} className="text-primary" />
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="input py-1.5 px-3 min-h-0 text-xs w-auto">
                <option value="unidad">Agrupar por Unidad</option>
                <option value="nivel">Agrupar por Nivel</option>
                <option value="sexo">Agrupar por Sexo</option>
                <option value="modalidad">Agrupar por Modalidad</option>
              </select>
              <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value as "Todos" | "M" | "F")}
                className="input py-1.5 px-3 min-h-0 text-xs w-auto">
                <option value="Todos">Todos los Sexos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}
                className="input py-1.5 px-3 min-h-0 text-xs w-auto">
                <option value="Todos">Todos los Niveles</option>
                {["Operativo","Supervisión","Jefatura","Gerencia"].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 items-center text-[11px] font-bold text-text-muted">
            <span className="text-text-soft uppercase tracking-wider mr-1">Leyenda:</span>
            {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => (
              <span key={s} className={`badge px-2 py-1 ${ESTADO_BADGE[s]}`}>
                <span className="font-extrabold mr-1">{ESTADO_CONFIG[s].shortLabel}</span> {ESTADO_CONFIG[s].label}
              </span>
            ))}
            <span className="ml-auto text-primary flex items-center gap-1"><ArrowLeft size={12} className="rotate-90" /> Click en celda para cambiar estado</span>
          </div>

          {/* Attendance table */}
          <div className="table-shell overflow-x-auto">
            <table className="border-collapse text-[11px]" style={{ minWidth: "max-content" }}>
              <thead>
                {/* Day numbers */}
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
                        className={`w-8 py-2 text-center font-bold ${
                          isToday ? "text-primary bg-primary/10" : isWE ? "text-text-muted/70" : "text-text-soft"
                        }`}
                      >
                        {dNum}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-right text-[10px] font-bold text-text-muted sticky right-0 bg-surface-2 border-l border-border shadow-[-1px_0_0_0_var(--color-border)]">
                    Días ✓
                  </th>
                </tr>
                {/* Day of week */}
                <tr className="border-b border-border bg-surface">
                  <th className="sticky left-0 z-20 bg-surface shadow-[1px_0_0_0_var(--color-border)]" />
                  {diasSemana.map((dObj, i) => {
                    const dow = dObj.getDay();
                    const isWE = dow === 0 || dow === 6;
                    return (
                      <th key={i} className={`w-8 py-1.5 text-center text-[9px] font-bold ${isWE ? "text-text-muted/40" : "text-text-muted"}`}>
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
                    {/* Group header */}
                    <tr className="bg-surface-2">
                      <td colSpan={dias.length + 2} className="px-4 py-2 sticky left-0 shadow-[1px_0_0_0_var(--color-border)]">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 size={12} /> {groupName}
                          <span className="text-text-muted font-bold ml-1">({workers.length} personas)</span>
                        </span>
                      </td>
                    </tr>

                    {/* Worker rows */}
                    {workers.map((w) => {
                      const workedDays = diasSemana.filter((dObj) => {
                        const st = registroMap.get(`${selectedContratoId}|${w.id_trabajador}|${dateStr(dObj.getFullYear(), dObj.getMonth() + 1, dObj.getDate())}`);
                        return st ? ESTADO_CONFIG[st].contabiliza : false;
                      }).length;

                      return (
                        <tr key={w.id_asignacion} className="hover:bg-surface-2 transition-colors group">
                          <td className="px-4 py-2 sticky left-0 z-10 bg-surface group-hover:bg-surface-2 shadow-[1px_0_0_0_var(--color-border)] transition-colors">
                            <p className="font-bold text-text truncate max-w-[160px]">{w.nombre}</p>
                            <p className="text-[10px] font-medium text-text-soft">{w.nombre_cargo}</p>
                          </td>

                          {diasSemana.map((dObj, i) => {
                            const dNum = dObj.getDate();
                            const fecha = dateStr(dObj.getFullYear(), dObj.getMonth() + 1, dNum);
                            const dow = dObj.getDay();
                            const isWE = dow === 0 || dow === 6;
                            const isToday = fecha === todayStr;
                            const estado = registroMap.get(`${selectedContratoId}|${w.id_trabajador}|${fecha}`) ?? null;
                            const cfg = estado ? ESTADO_CONFIG[estado] : null;

                            return (
                              <td
                                key={i}
                                onClick={() => handleCellClick(w.id_trabajador, w.id_asignacion, w.nombre, fecha)}
                                title={cfg ? cfg.label : isWE ? "Fin de semana" : "Sin registro"}
                                className={`w-8 py-1.5 text-center transition-all ${
                                  isToday
                                    ? "ring-1 ring-inset ring-primary/30 bg-primary/5 cursor-pointer hover:ring-primary hover:bg-primary/10"
                                    : "cursor-pointer hover:bg-surface-2"
                                }`}
                              >
                                {estado && (
                                  <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-extrabold text-white shadow-sm ${cfg!.bg}`}>
                                    {cfg!.shortLabel}
                                  </span>
                                )}
                                {!estado && (
                                  <span className="text-text-muted/30 text-[10px] font-bold">·</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-4 py-2 text-right sticky right-0 bg-surface group-hover:bg-surface-2 shadow-[-1px_0_0_0_var(--color-border)] transition-colors">
                            <span className="font-bold text-text">{workedDays}</span>
                            <span className="text-text-soft font-bold text-[10px]"> d</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {trabajadoresContrato.length === 0 && (
                  <tr>
                    <td colSpan={dias.length + 2} className="px-5 py-12 text-center text-text-soft text-sm font-medium italic">
                      No hay trabajadores que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
