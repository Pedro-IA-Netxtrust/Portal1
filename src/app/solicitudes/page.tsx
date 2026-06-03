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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
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
      className="group bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/40 hover:bg-zinc-900/80 transition-all duration-200 block"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
            {emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-500">{solicitud.codigo_solicitud}</span>
              {solicitud.prioridad === "Urgente" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                  URGENTE
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">{solicitud.asunto}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{solicitud.tipo}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
            <Icon size={11} />
            {cfg.label}
          </span>
          <ChevronRight size={16} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <User size={11} />
          {solicitud.nombre_solicitante}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={11} />
          {solicitud.area}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Calendar size={11} />
          {formatDate(solicitud.fecha_creacion)}
        </span>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SolicitudesPage() {
  const { solicitudes, fetchSolicitudes } = useSolicitudesStore();
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ClipboardList size={24} className="text-violet-400" />
              Solicitudes Internas
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Gestión de vacaciones, permisos, cambios de equipo y más
            </p>
          </div>
          <Link
            href="/solicitudes/nueva"
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-lg transition-all shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50"
          >
            <PlusCircle size={16} />
            Nueva Solicitud
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Pendientes"   value={stats.pendientes} icon={Clock}       color="bg-amber-400/10 text-amber-400" />
          <StatCard label="En Revisión"  value={stats.enRevision} icon={RefreshCw}   color="bg-blue-400/10 text-blue-400" />
          <StatCard label="Aprobadas"    value={stats.aprobadas}  icon={CheckCircle2} color="bg-emerald-400/10 text-emerald-400" />
          <StatCard label="Rechazadas"   value={stats.rechazadas} icon={XCircle}     color="bg-red-400/10 text-red-400" />
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <Filter size={15} />
            Filtros
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por código, asunto o solicitante..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value as EstadoSolicitud | "Todos")}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-all"
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
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-all"
            >
              <option value="Todos">Todos los tipos</option>
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-zinc-500">
              {filtered.length} solicitud{filtered.length !== 1 ? "es" : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-xl">
              <AlertCircle size={40} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No se encontraron solicitudes con los filtros aplicados</p>
              <button
                onClick={() => { setFiltroEstado("Todos"); setFiltroTipo("Todos"); setBusqueda(""); }}
                className="mt-3 text-sm text-violet-400 hover:text-violet-300 underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(s => <SolicitudCard key={s.id_solicitud} solicitud={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
