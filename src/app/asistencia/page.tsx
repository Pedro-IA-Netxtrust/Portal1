"use client";

import React, { useState, useMemo } from "react";
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
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  FileText,
  Filter,
  Clock,
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

function getDayOfWeek(anio: number, mes: number, dia: number): number {
  return new Date(anio, mes - 1, dia).getDay();
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
  const [groupBy, setGroupBy] = useState<GroupBy>("unidad");
  const [filtroSexo, setFiltroSexo] = useState<"Todos" | "M" | "F">("Todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("Todos");

  // ── Stores ──────────────────────────────────────────────────────────────────
  const { registros, auditoria, setEstado, getMetaFTE, calcularFTEReal, calcularDiasHabiles } =
    useAsistenciaStore();
  const { contratos, fetchContratos } = useContratosStore();
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();

  React.useEffect(() => { fetchContratos(); fetchTrabajadores(); }, [fetchContratos, fetchTrabajadores]);

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
    let totalDotacion = 0;
    let globalPresente = 0;
    let globalAusente = 0;

    const contratoCards = activeContratos.map((c) => {
      const activos = c.trabajadores_asignados.filter((a) => a.activo);
      totalDotacion += activos.length;

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
      globalPresente += presente;
      globalAusente += ausente;

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
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <CalendarDays className="text-blue-400" size={22} />
              Control de Asistencia
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Hoy: {DIAS_SEMANA_SHORT[today.getDay()]}{" "}
              {today.getDate()} de {MESES_ES[today.getMonth()]} {today.getFullYear()} •{" "}
              Período activo: {MESES_ES[mes - 1]} {anio}
            </p>
          </div>
          <button
            onClick={() => setView("auditoria")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <FileText size={13} /> Auditoría Global
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Users, color: "blue",
              label: "DOTACIÓN ACTIVA",
              value: dashStats.totalDotacion,
              sub: `En ${activeContratos.length} contratos activos`,
            },
            {
              icon: CheckCircle2, color: "emerald",
              label: "PRESENTES HOY",
              value: dashStats.globalPresente,
              sub: `${Math.round((dashStats.globalPresente / Math.max(dashStats.totalDotacion,1)) * 100)}% de la dotación`,
            },
            {
              icon: XCircle, color: "amber",
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
            <div key={label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg bg-${color}-500/10 text-${color}-400 flex-shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">{label}</span>
                <span className="text-xl font-bold text-white">{value}</span>
                <span className="text-[10px] text-zinc-500 block truncate">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Global state distribution */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={14} className="text-blue-400" />
              Distribución de Estados — Hoy
            </h3>
            <span className="text-[10px] text-zinc-500">{dashStats.globalTotal} registros</span>
          </div>
          <StateBar counts={dashStats.globalCounts} total={dashStats.globalTotal} />
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className={`w-2.5 h-2.5 rounded-sm ${ESTADO_CONFIG[s].bg}`} />
                {ESTADO_CONFIG[s].label}
                {dashStats.globalCounts[s] ? (
                  <span className="text-zinc-200 font-semibold">{dashStats.globalCounts[s]}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Contract cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dashStats.contratoCards.map(({ contrato, activos, presente, ausente, sinRegistro, meta, fteReal, todayCounts }) => {
            const pct = meta > 0 ? Math.min(100, Math.round((fteReal / meta) * 100)) : 0;
            const pctColor = pct >= 90 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-red-400";
            const barColor = pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500";

            return (
              <div
                key={contrato.id_contrato}
                className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all space-y-4 flex flex-col"
              >
                {/* Contract header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{contrato.nombre_contrato}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{contrato.codigo_contrato}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex-shrink-0">
                    {contrato.estado}
                  </span>
                </div>

                {/* FTE gauge + stats */}
                <div className="flex items-center gap-4">
                  <FTEGauge real={fteReal} meta={meta} size={76} />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">FTE Real</span>
                      <span className={`font-bold ${pctColor}`}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Meta: {meta.toFixed(1)} FTE</span>
                      <span>Real: {fteReal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Today breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    <span>Estado de hoy</span>
                    <span>{activos} personas</span>
                  </div>
                  <StateBar counts={todayCounts} total={activos} />
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-emerald-400">✓ {presente} presentes</span>
                    <span className="text-amber-400">✕ {ausente} ausentes</span>
                    {sinRegistro > 0 && <span className="text-zinc-500">– {sinRegistro} sin reg.</span>}
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => goToContrato(contrato.id_contrato)}
                  className="w-full mt-auto py-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-600/20 hover:border-blue-500/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <CalendarDays size={13} />
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
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Log de Auditoría</h1>
            <p className="text-xs text-zinc-500">{auditoria.length} cambios registrados</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-900/60 border-b border-zinc-800">
              <tr>
                {["Fecha/Hora","Trabajador","Contrato","Fecha Asist.","Anterior","Nuevo","Usuario"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {auditoria.slice(0, 100).map((a) => (
                <tr key={a.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">
                    {new Date(a.editado_at).toLocaleString("es-CL")}
                  </td>
                  <td className="px-3 py-2 text-zinc-200 font-medium">{a.nombre_trabajador}</td>
                  <td className="px-3 py-2 text-zinc-400 font-mono text-[10px]">{a.id_contrato}</td>
                  <td className="px-3 py-2 text-zinc-300">{a.fecha_asistencia}</td>
                  <td className="px-3 py-2">
                    {a.estado_anterior ? (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${ESTADO_BADGE[a.estado_anterior]}`}>
                        {a.estado_anterior}
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {a.estado_nuevo ? (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${ESTADO_BADGE[a.estado_nuevo]}`}>
                        {a.estado_nuevo}
                      </span>
                    ) : <span className="text-zinc-600 text-[10px]">Eliminado</span>}
                  </td>
                  <td className="px-3 py-2 text-zinc-500">{a.editado_por}</td>
                </tr>
              ))}
              {auditoria.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-10 text-center text-zinc-500 text-sm">No hay cambios registrados aún.</td></tr>
              )}
            </tbody>
          </table>
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
    <div className="max-w-full mx-auto space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("dashboard")}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{selectedContrato.nombre_contrato}</h1>
            <p className="text-[10px] text-zinc-500 font-mono">{selectedContrato.codigo_contrato}</p>
          </div>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button onClick={() => changeMes(-1)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"><ChevronLeft size={14} /></button>
          <span className="text-sm font-bold text-white min-w-[130px] text-center">{MESES_ES[mes - 1]} {anio}</span>
          <button onClick={() => changeMes(1)} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 pb-0">
        {([["diario","Registro Diario"],["resumen","Resumen Mes"],["planificacion","Planificación 12M"]] as [RegistroTab,string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setRegistroTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              registroTab === tab ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setView("auditoria")}
          className="ml-auto px-3 py-2 text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          <FileText size={11} /> Auditoría
        </button>
      </div>

      {/* ── TAB: RESUMEN ── */}
      {registroTab === "resumen" && (
        <div className="space-y-5 animate-fadeIn">
          {/* FTE + state breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FTE Card */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-5">
              <FTEGauge real={fteRealSeleccionado} meta={metaSeleccionada} size={88} />
              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">FTE Real {MESES_ES[mes-1]}</p>
                <p className="text-2xl font-bold text-white">{fteRealSeleccionado.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Meta: <span className="text-white font-bold">{metaSeleccionada.toFixed(1)}</span> FTE</p>
                <p className="text-xs text-zinc-500">Días hábiles: <span className="text-white font-bold">{diasHabilesSeleccionados}</span></p>
              </div>
            </div>

            {/* States breakdown */}
            <div className="md:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Distribución de Estados — {MESES_ES[mes-1]} {anio}</h3>
              <div className="space-y-2">
                {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => {
                  const count = estadoCountsMes[s] || 0;
                  const pct = mesRegistros.length > 0 ? Math.round((count / mesRegistros.length) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white ${ESTADO_CONFIG[s].bg}`}>
                        {ESTADO_CONFIG[s].shortLabel}
                      </span>
                      <span className="text-xs text-zinc-400 w-24">{ESTADO_CONFIG[s].label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className={`h-full rounded-full ${ESTADO_CONFIG[s].bg}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-zinc-300 font-bold w-8 text-right">{count}</span>
                      <span className="text-[10px] text-zinc-600 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Per-unit breakdown */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/40">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} className="text-blue-400" /> Desglose por Unidad
              </h3>
            </div>
            <div className="divide-y divide-zinc-800/60">
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
                  <div key={unidad.id_unidad} className="px-4 py-3 flex items-center gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200">{unidad.nombre}</p>
                      <p className="text-[10px] text-zinc-500">{workersInUnit.length} personas</p>
                    </div>
                    <div className="w-40">
                      <StateBar counts={unitCounts} total={unitRecords.length} />
                    </div>
                    <span className="text-xs text-zinc-400">FTE: <span className="text-white font-bold">{fteUnit}</span></span>
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
          <p className="text-xs text-zinc-500">Vista anual de asistencia — color dominante por mes. Click en un mes para ir al registro diario.</p>
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="border-collapse w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold text-zinc-500 uppercase sticky left-0 bg-zinc-900/80 z-10 min-w-[140px]">Trabajador</th>
                  {MESES_ES.map((m, i) => (
                    <th key={m} className="px-1 py-2.5 text-center text-[10px] font-bold text-zinc-500 uppercase min-w-[56px]">{m.slice(0,3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {selectedContrato.trabajadores_asignados.filter((a) => a.activo).map((w) => (
                  <tr key={w.id_asignacion} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="px-3 py-2 sticky left-0 bg-zinc-950 z-10 border-r border-zinc-800">
                      <p className="font-semibold text-zinc-200 text-[11px] truncate max-w-[130px]">{w.nombre}</p>
                      <p className="text-[9px] text-zinc-600 truncate">{w.nombre_unidad}</p>
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
                        <td key={mi} className="px-1 py-1.5 text-center">
                          <button
                            onClick={() => { setMes(m2); setRegistroTab("diario"); }}
                            className={`w-12 h-7 rounded text-[9px] font-bold transition-all ${
                              dominant
                                ? `${ESTADO_CONFIG[dominant as EstadoAsistencia].bg} text-white opacity-80 hover:opacity-100`
                                : isCurrentMes
                                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                                : "bg-zinc-800/40 text-zinc-600 hover:bg-zinc-800"
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
        <div className="space-y-4 animate-fadeIn">
          {/* Filters + FTE summary strip */}
          <div className="flex flex-wrap gap-3 items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/20">
            {/* FTE strip */}
            <div className="flex items-center gap-4">
              <FTEGauge real={fteRealSeleccionado} meta={metaSeleccionada} size={56} />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">FTE {MESES_ES[mes-1]}</p>
                <p className="text-sm font-bold text-white">{fteRealSeleccionado.toFixed(2)} <span className="text-zinc-500 text-xs">/ {metaSeleccionada.toFixed(1)}</span></p>
                <p className="text-[10px] text-zinc-500">{diasHabilesSeleccionados} días hábiles</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <Filter size={13} className="text-zinc-500" />
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1 px-2.5 focus:outline-none focus:border-blue-600">
                <option value="unidad">Agrupar por Unidad</option>
                <option value="nivel">Agrupar por Nivel</option>
                <option value="sexo">Agrupar por Sexo</option>
                <option value="modalidad">Agrupar por Modalidad</option>
              </select>
              <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1 px-2.5 focus:outline-none focus:border-blue-600">
                <option value="Todos">Todos los Sexos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1 px-2.5 focus:outline-none focus:border-blue-600">
                <option value="Todos">Todos los Niveles</option>
                {["Operativo","Supervisión","Jefatura","Gerencia"].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 items-center text-[10px] text-zinc-500">
            <span className="font-bold text-zinc-400">Estados:</span>
            {(Object.keys(ESTADO_CONFIG) as EstadoAsistencia[]).map((s) => (
              <span key={s} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${ESTADO_BADGE[s]}`}>
                <span className="font-bold">{ESTADO_CONFIG[s].shortLabel}</span> {ESTADO_CONFIG[s].label}
              </span>
            ))}
            <span className="ml-2 text-zinc-600">↑ Click en celda para cambiar estado</span>
          </div>

          {/* Attendance table */}
          <div className="rounded-xl border border-zinc-800 overflow-x-auto">
            <table className="border-collapse text-[11px]" style={{ minWidth: "max-content" }}>
              <thead>
                {/* Day numbers */}
                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                  <th className="px-3 py-2 text-left text-[10px] font-bold text-zinc-500 uppercase sticky left-0 z-20 bg-zinc-900 min-w-[160px] border-r border-zinc-800">
                    Trabajador
                  </th>
                  {dias.map((d) => {
                    const dow = getDayOfWeek(anio, mes, d);
                    const isWE = dow === 0 || dow === 6;
                    const isToday = dateStr(anio, mes, d) === todayStr;
                    return (
                      <th
                        key={d}
                        className={`w-8 py-2 text-center font-bold ${
                          isToday ? "text-blue-400 bg-blue-500/10" : isWE ? "text-zinc-700" : "text-zinc-500"
                        }`}
                      >
                        {d}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-right text-[10px] font-bold text-zinc-500 sticky right-0 bg-zinc-900 border-l border-zinc-800">
                    Días ✓
                  </th>
                </tr>
                {/* Day of week */}
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="sticky left-0 z-20 bg-zinc-950 border-r border-zinc-800" />
                  {dias.map((d) => {
                    const dow = getDayOfWeek(anio, mes, d);
                    const isWE = dow === 0 || dow === 6;
                    return (
                      <th key={d} className={`w-8 py-1 text-center text-[9px] ${isWE ? "text-zinc-800" : "text-zinc-600"}`}>
                        {DIAS_SEMANA_SHORT[dow]}
                      </th>
                    );
                  })}
                  <th className="sticky right-0 bg-zinc-950 border-l border-zinc-800" />
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800/40">
                {Object.entries(groupedWorkers).map(([groupName, workers]) => (
                  <React.Fragment key={groupName}>
                    {/* Group header */}
                    <tr className="bg-zinc-900/60">
                      <td colSpan={dias.length + 2} className="px-3 py-1.5 sticky left-0">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 size={10} /> {groupName}
                          <span className="text-zinc-600 font-normal ml-1">({workers.length} personas)</span>
                        </span>
                      </td>
                    </tr>

                    {/* Worker rows */}
                    {workers.map((w) => {
                      const workedDays = dias.filter((d) => {
                        const dow = getDayOfWeek(anio, mes, d);
                        if (dow === 0 || dow === 6) return false;
                        const st = registroMap.get(`${selectedContratoId}|${w.id_trabajador}|${dateStr(anio,mes,d)}`);
                        return st ? ESTADO_CONFIG[st].contabiliza : false;
                      }).length;

                      return (
                        <tr key={w.id_asignacion} className="hover:bg-zinc-900/20 transition-colors group">
                          <td className="px-3 py-1.5 sticky left-0 z-10 bg-zinc-950 group-hover:bg-zinc-900/30 border-r border-zinc-800 transition-colors">
                            <p className="font-semibold text-zinc-200 truncate max-w-[145px]">{w.nombre}</p>
                            <p className="text-[9px] text-zinc-600">{w.nombre_cargo}</p>
                          </td>

                          {dias.map((d) => {
                            const fecha = dateStr(anio, mes, d);
                            const dow = getDayOfWeek(anio, mes, d);
                            const isWE = dow === 0 || dow === 6;
                            const isToday = fecha === todayStr;
                            const estado = registroMap.get(`${selectedContratoId}|${w.id_trabajador}|${fecha}`) ?? null;
                            const cfg = estado ? ESTADO_CONFIG[estado] : null;

                            return (
                              <td
                                key={d}
                                onClick={() => !isWE && handleCellClick(w.id_trabajador, w.id_asignacion, w.nombre, fecha)}
                                title={cfg ? cfg.label : isWE ? "Fin de semana" : "Sin registro"}
                                className={`w-8 py-1 text-center transition-all ${
                                  isWE
                                    ? "bg-zinc-900/20 cursor-default"
                                    : isToday
                                    ? "ring-1 ring-inset ring-blue-500/30 bg-blue-500/5 cursor-pointer hover:ring-blue-400"
                                    : "cursor-pointer hover:bg-zinc-800/40"
                                }`}
                              >
                                {estado && !isWE && (
                                  <span className={`inline-flex items-center justify-center w-6 h-5 rounded text-[9px] font-bold text-white ${cfg!.bg}`}>
                                    {cfg!.shortLabel}
                                  </span>
                                )}
                                {!estado && isWE && (
                                  <span className="text-zinc-800 text-[9px]">·</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-3 py-1.5 text-right sticky right-0 bg-zinc-950 group-hover:bg-zinc-900/30 border-l border-zinc-800 transition-colors">
                            <span className="font-bold text-zinc-200">{workedDays}</span>
                            <span className="text-zinc-600 text-[9px]"> d</span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {trabajadoresContrato.length === 0 && (
                  <tr>
                    <td colSpan={dias.length + 2} className="px-4 py-12 text-center text-zinc-500 text-sm">
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
