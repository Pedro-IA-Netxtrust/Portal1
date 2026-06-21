"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  Calendar,
  User,
  Briefcase,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSolicitudesStore, type Solicitud, type EstadoSolicitud, type TipoSolicitud } from "@/store/solicitudes-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoSolicitud, { label: string; color: string; icon: React.ElementType }> = {
  Pendiente:    { label: "Pendiente",    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",   icon: Clock },
  "En Revisión":{ label: "En Revisión", color: "text-blue-400 bg-blue-400/10 border-blue-400/20",      icon: RefreshCw },
  Aprobada:     { label: "Aprobada",    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  Rechazada:    { label: "Rechazada",   color: "text-red-400 bg-red-400/10 border-red-400/20",          icon: XCircle },
  Cancelada:    { label: "Cancelada",   color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",       icon: XCircle }
};

const TIPO_EMOJI: Record<TipoSolicitud, string> = {
  Vacaciones:          "🏖️",
  "Permiso con Goce":  "✅",
  "Permiso sin Goce":  "📋",
  "Cambio de Equipo":  "💻",
  "Cambio de Turno":   "🔄",
  Teletrabajo:         "🏠",
  "Licencia Médica":   "🏥",
  Otro:                "📌"
};

const TIPOS: TipoSolicitud[] = [
  "Vacaciones", "Permiso con Goce", "Permiso sin Goce",
  "Cambio de Equipo", "Cambio de Turno", "Teletrabajo",
  "Licencia Médica", "Otro"
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="stat-box flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <span className="label">{label}</span>
        <span className="value text-2xl">{value}</span>
      </div>
    </div>
  );
}

function SolicitudCard({ solicitud }: { solicitud: Solicitud }) {
  const cfg = ESTADO_CONFIG[solicitud.estado];
  const Icon = cfg.icon;
  const emoji = TIPO_EMOJI[solicitud.tipo];

  return (
    <Link
      href={`/solicitudes/${solicitud.id_solicitud}`}
      className="card group hover:border-primary/40 block p-5"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-bg-alt border border-border flex items-center justify-center text-2xl flex-shrink-0 mt-0.5 shadow-sm">
            {emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-text-muted">{solicitud.codigo_solicitud}</span>
              {solicitud.prioridad === "Urgente" && (
                <span className="badge bg-danger/10 text-danger border border-danger/20">
                  URGENTE
                </span>
              )}
            </div>
            <p className="text-base font-bold text-text group-hover:text-primary transition-colors truncate">{solicitud.asunto}</p>
            <p className="text-xs text-text-soft font-bold tracking-wide uppercase mt-1">{solicitud.tipo}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <span className={`badge ${cfg.color}`}>
            <Icon size={14} />
            {cfg.label}
          </span>
          <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-5 text-xs text-text-soft font-medium">
        <span className="flex items-center gap-1.5">
          <User size={14} />
          {solicitud.nombre_solicitante}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={14} />
          {solicitud.area}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Calendar size={14} />
          {formatDate(solicitud.fecha_creacion)}
        </span>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SolicitudesPage() {
  const solicitudes = useSolicitudesStore((s) => s.solicitudes);
  const fetchSolicitudes = useSolicitudesStore((s) => s.fetchSolicitudes);
  const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | "Todos">("Todos");
  const [filtroTipo, setFiltroTipo] = useState<TipoSolicitud | "Todos">("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const stats = useMemo(() => ({
    pendientes:   solicitudes.filter(s => s.estado === "Pendiente").length,
    enRevision:   solicitudes.filter(s => s.estado === "En Revisión").length,
    aprobadas:    solicitudes.filter(s => s.estado === "Aprobada").length,
    rechazadas:   solicitudes.filter(s => s.estado === "Rechazada").length,
  }), [solicitudes]);

  const filtered = useMemo(() => {
    return solicitudes
      .filter(s => filtroEstado === "Todos" || s.estado === filtroEstado)
      .filter(s => filtroTipo === "Todos" || s.tipo === filtroTipo)
      .filter(s =>
        busqueda === "" ||
        s.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.nombre_solicitante.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.codigo_solicitud.toLowerCase().includes(busqueda.toLowerCase())
      )
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  }, [solicitudes, filtroEstado, filtroTipo, busqueda]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pt-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <ClipboardList size={32} className="text-primary" />
            Solicitudes Internas
          </h1>
          <p className="text-sm text-text-soft mt-2 font-medium">
            Gestión de vacaciones, permisos, cambios de equipo y más
          </p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          Nueva Solicitud
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="PENDIENTES"   value={stats.pendientes} icon={Clock}       color="bg-warning/10 text-warning" />
        <StatCard label="EN REVISIÓN"  value={stats.enRevision} icon={RefreshCw}   color="bg-primary/10 text-primary" />
        <StatCard label="APROBADAS"    value={stats.aprobadas}  icon={CheckCircle2} color="bg-success/10 text-success" />
        <StatCard label="RECHAZADAS"   value={stats.rechazadas} icon={XCircle}     color="bg-danger/10 text-danger" />
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-sm text-text-soft font-bold uppercase tracking-wider">
          <Filter size={16} />
          Filtros
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por código, asunto o solicitante..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Estado */}
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value as EstadoSolicitud | "Todos")}
            className="select py-2 px-3 text-sm min-h-0"
          >
            <option value="Todos">Todos los estados</option>
            {(["Pendiente", "En Revisión", "Aprobada", "Rechazada", "Cancelada"] as EstadoSolicitud[]).map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {/* Tipo */}
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value as TipoSolicitud | "Todos")}
            className="select py-2 px-3 text-sm min-h-0"
          >
            <option value="Todos">Todos los tipos</option>
            {TIPOS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="badge badge-outline">
            {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center border border-border border-dashed rounded-2xl space-y-3 bg-surface/50">
            <AlertCircle size={40} className="text-text-muted mx-auto" />
            <h4 className="text-text font-bold text-base">No se encontraron solicitudes</h4>
            <p className="text-sm text-text-soft font-medium">Intente con otros filtros de búsqueda.</p>
            <button
              onClick={() => { setFiltroEstado("Todos"); setFiltroTipo("Todos"); setBusqueda(""); }}
              className="mt-4 btn btn-secondary py-2 min-h-0 text-sm px-4 inline-flex mx-auto"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(s => <SolicitudCard key={s.id_solicitud} solicitud={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
