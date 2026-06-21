"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Link2,
  LogIn,
  X,
  Clock,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  useAuditoriaStore,
  type EntradaAuditoria,
  type ModuloAuditoria,
  type TipoAccion,
  type FiltrosAuditoria,
} from "@/store/auditoria-store";

// ─────────────────────────────────────────────────────────────
//  Config de colores y etiquetas por tipo de accion
// ─────────────────────────────────────────────────────────────

const ACCION_CONFIG: Record<
  TipoAccion,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  Alta: {
    label: "Alta",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-400",
    icon: <Plus size={12} />,
  },
  Modificacion: {
    label: "Modificacion",
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    icon: <Pencil size={12} />,
  },
  Baja: {
    label: "Baja",
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    icon: <Trash2 size={12} />,
  },
  Asignacion: {
    label: "Asignacion",
    bg: "bg-violet-500/10 border-violet-500/20",
    text: "text-violet-400",
    icon: <Link2 size={12} />,
  },
  Cierre: {
    label: "Cierre",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    text: "text-zinc-400",
    icon: <X size={12} />,
  },
  Consulta: {
    label: "Consulta",
    bg: "bg-sky-500/10 border-sky-500/20",
    text: "text-sky-400",
    icon: <Search size={12} />,
  },
  Acceso: {
    label: "Acceso",
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    icon: <LogIn size={12} />,
  },
  Error: {
    label: "Error",
    bg: "bg-red-600/10 border-red-600/20",
    text: "text-red-500",
    icon: <AlertTriangle size={12} />,
  },
};

const MODULOS: ModuloAuditoria[] = [
  "Trabajadores",
  "Contratos",
  "Tickets",
  "Solicitudes",
  "Control",
  "Activos",
  "Asistencia",
  "Comunicaciones",
  "Usuarios",
  "Sistema",
];

const ACCIONES: TipoAccion[] = [
  "Alta",
  "Modificacion",
  "Baja",
  "Consulta",
  "Asignacion",
  "Cierre",
  "Error",
  "Acceso",
];

const POR_PAGINA = 20;

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatFecha(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportarCSV(entradas: EntradaAuditoria[]): void {
  const headers = [
    "Fecha",
    "Modulo",
    "Accion",
    "Entidad",
    "ID Entidad",
    "Detalle",
    "Usuario",
  ];
  const rows = entradas.map((e) => [
    formatFecha(e.fecha_at),
    e.modulo,
    e.accion,
    `"${e.nombre_entidad.replace(/"/g, '""')}"`,
    e.id_entidad,
    `"${e.detalle.replace(/"/g, '""')}"`,
    e.usuario,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
//  Componente Badge de accion
// ─────────────────────────────────────────────────────────────

function AccionBadge({ accion }: { accion: TipoAccion }) {
  const cfg = ACCION_CONFIG[accion] || {
    label: (accion as string) || "Evento",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    text: "text-zinc-400",
    icon: <Clock size={12} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────────────────────

export default function AuditoriaPage() {
  const { entradas, cargando, fetchAuditoria } = useAuditoriaStore(
    useShallow((s) => ({ entradas: s.entradas, cargando: s.cargando, fetchAuditoria: s.fetchAuditoria }))
  );

  const [busqueda, setBusqueda] = useState("");
  const [moduloFiltro, setModuloFiltro] = useState<ModuloAuditoria | "">("");
  const [accionFiltro, setAccionFiltro] = useState<TipoAccion | "">("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(0);
  const [entradaDetalle, setEntradaDetalle] = useState<EntradaAuditoria | null>(
    null
  );

  // Cargar desde Supabase al montar
  useEffect(() => {
    const filtros: FiltrosAuditoria = {};
    if (moduloFiltro) filtros.modulo = moduloFiltro;
    if (accionFiltro) filtros.accion = accionFiltro;
    if (fechaDesde) filtros.fecha_desde = new Date(fechaDesde).toISOString();
    if (fechaHasta) filtros.fecha_hasta = new Date(fechaHasta + "T23:59:59").toISOString();
    fetchAuditoria(filtros, 0);
  }, [fetchAuditoria, moduloFiltro, accionFiltro, fechaDesde, fechaHasta]);

  // Filtrado local en texto (sobre los ya cargados)
  const entradasFiltradas = useMemo(() => {
    let resultado = entradas;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.nombre_entidad.toLowerCase().includes(q) ||
          e.detalle.toLowerCase().includes(q) ||
          e.usuario.toLowerCase().includes(q) ||
          e.id_entidad.toLowerCase().includes(q)
      );
    }

    return resultado;
  }, [entradas, busqueda]);

  // Paginacion local
  const totalPaginas = Math.max(1, Math.ceil(entradasFiltradas.length / POR_PAGINA));
  const entradasPagina = entradasFiltradas.slice(
    pagina * POR_PAGINA,
    pagina * POR_PAGINA + POR_PAGINA
  );

  const limpiarFiltros = useCallback(() => {
    setBusqueda("");
    setModuloFiltro("");
    setAccionFiltro("");
    setFechaDesde("");
    setFechaHasta("");
    setPagina(0);
  }, []);

  const hayFiltros =
    !!busqueda || !!moduloFiltro || !!accionFiltro || !!fechaDesde || !!fechaHasta;

  // Contadores por modulo (de entradas en memoria)
  const contadorPorModulo = useMemo(() => {
    const m: Record<string, number> = {};
    entradas.forEach((e) => {
      m[e.modulo] = (m[e.modulo] ?? 0) + 1;
    });
    return m;
  }, [entradas]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <section className="hero-shell">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="hero-kicker">
              <History size={16} />
              <span>Trazabilidad del Sistema</span>
            </div>
            <h1 className="hero-title">Auditoria Operativa</h1>
            <p className="hero-copy">
              Registro cronologico de todas las acciones realizadas en el
              sistema. Cada alta, baja, modificacion y asignacion queda
              registrada con su contexto completo.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                const filtros: FiltrosAuditoria = {};
                if (moduloFiltro) filtros.modulo = moduloFiltro;
                if (accionFiltro) filtros.accion = accionFiltro;
                fetchAuditoria(filtros, 0);
              }}
              disabled={cargando}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} className={cargando ? "animate-spin" : ""} />
              Sincronizar
            </button>
            <button
              onClick={() => exportarCSV(entradasFiltradas)}
              disabled={entradasFiltradas.length === 0}
              className="btn btn-accent flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      {/* Tarjetas de resumen por modulo */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MODULOS.filter((m) => (contadorPorModulo[m] ?? 0) > 0).map((mod) => (
          <button
            key={mod}
            onClick={() => {
              setModuloFiltro(mod === moduloFiltro ? "" : mod);
              setPagina(0);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              moduloFiltro === mod
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-surface border-border hover:border-primary/30 hover:bg-primary/5 text-text"
            }`}
          >
            <div className="text-xl font-black">{contadorPorModulo[mod] ?? 0}</div>
            <div className="text-xs font-semibold text-text-soft mt-0.5">{mod}</div>
          </button>
        ))}

        {entradas.length === 0 && !cargando && (
          <div className="col-span-full text-center py-4 text-sm text-text-soft">
            Sin entradas en cache local. Sincroniza con Supabase.
          </div>
        )}
      </section>

      {/* Filtros */}
      <section className="card">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Busqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-text-soft block mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-soft"
              />
              <input
                type="text"
                className="input pl-8 text-sm"
                placeholder="Nombre, detalle, usuario, ID..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(0);
                }}
              />
            </div>
          </div>

          {/* Modulo */}
          <div className="min-w-[160px]">
            <label className="text-xs font-semibold text-text-soft block mb-1">
              Modulo
            </label>
            <select
              className="input text-sm"
              value={moduloFiltro}
              onChange={(e) => {
                setModuloFiltro(e.target.value as ModuloAuditoria | "");
                setPagina(0);
              }}
            >
              <option value="">Todos</option>
              {MODULOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Accion */}
          <div className="min-w-[150px]">
            <label className="text-xs font-semibold text-text-soft block mb-1">
              Tipo de Accion
            </label>
            <select
              className="input text-sm"
              value={accionFiltro}
              onChange={(e) => {
                setAccionFiltro(e.target.value as TipoAccion | "");
                setPagina(0);
              }}
            >
              <option value="">Todas</option>
              {ACCIONES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="text-xs font-semibold text-text-soft block mb-1">
              Desde
            </label>
            <input
              type="date"
              className="input text-sm"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPagina(0);
              }}
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="text-xs font-semibold text-text-soft block mb-1">
              Hasta
            </label>
            <input
              type="date"
              className="input text-sm"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPagina(0);
              }}
            />
          </div>

          {/* Limpiar */}
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="btn btn-secondary text-sm flex items-center gap-1.5 self-end"
            >
              <X size={14} />
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* Tabla */}
      <section className="card">
        <div className="card-header border-b border-border pb-4 mb-0 flex items-center justify-between">
          <h2 className="card-title flex items-center gap-2">
            <Filter size={18} />
            Registro de Eventos
          </h2>
          <span className="text-xs text-text-soft font-semibold">
            {entradasFiltradas.length} evento(s) encontrado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-alt/50">
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider">
                  Modulo
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider">
                  Accion
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider">
                  Entidad
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider hidden lg:table-cell">
                  Detalle
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-text-soft uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-text-soft text-sm"
                  >
                    <RefreshCw
                      size={20}
                      className="animate-spin mx-auto mb-2"
                    />
                    Cargando historial...
                  </td>
                </tr>
              )}

              {!cargando && entradasPagina.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="space-y-3">
                      <History
                        size={40}
                        className="mx-auto text-text-soft opacity-30"
                      />
                      <p className="text-text-soft font-semibold">
                        {hayFiltros
                          ? "No hay eventos que coincidan con los filtros."
                          : "El registro de auditoria esta vacio."}
                      </p>
                      {hayFiltros && (
                        <button
                          onClick={limpiarFiltros}
                          className="text-primary text-xs font-bold hover:underline"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!cargando &&
                entradasPagina.map((entrada) => (
                  <tr
                    key={entrada.id}
                    className="border-b border-border/50 hover:bg-bg-alt/50 transition-colors cursor-pointer"
                    onClick={() => setEntradaDetalle(entrada)}
                  >
                    {/* Fecha */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-soft font-medium whitespace-nowrap">
                        <Clock size={12} className="shrink-0" />
                        {formatFecha(entrada.fecha_at)}
                      </div>
                    </td>

                    {/* Modulo */}
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-text-soft bg-bg-alt border border-border px-2 py-0.5 rounded">
                        {entrada.modulo}
                      </span>
                    </td>

                    {/* Accion */}
                    <td className="py-3 px-4">
                      <AccionBadge accion={entrada.accion} />
                    </td>

                    {/* Entidad */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text text-sm">
                        {entrada.nombre_entidad}
                      </div>
                      <div className="text-[10px] text-text-soft font-mono mt-0.5">
                        {entrada.id_entidad.slice(0, 20)}
                        {entrada.id_entidad.length > 20 ? "..." : ""}
                      </div>
                    </td>

                    {/* Detalle (oculto en movil) */}
                    <td className="py-3 px-4 hidden lg:table-cell max-w-xs">
                      <p className="text-xs text-text-soft truncate">
                        {entrada.detalle}
                      </p>
                    </td>

                    {/* Usuario */}
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-text">
                        {entrada.usuario}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4 px-2">
            <span className="text-xs text-text-soft font-medium">
              Pagina {pagina + 1} de {totalPaginas}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagina === 0}
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                disabled={pagina >= totalPaginas - 1}
                onClick={() =>
                  setPagina((p) => Math.min(totalPaginas - 1, p + 1))
                }
                className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal de detalle */}
      {entradaDetalle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEntradaDetalle(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AccionBadge accion={entradaDetalle.accion} />
                  <span className="text-xs font-bold text-text-soft bg-bg-alt border border-border px-2 py-0.5 rounded">
                    {entradaDetalle.modulo}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text mt-2">
                  {entradaDetalle.nombre_entidad}
                </h3>
              </div>
              <button
                onClick={() => setEntradaDetalle(null)}
                className="p-2 rounded-lg hover:bg-bg-alt text-text-soft hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-text-soft font-semibold w-28 shrink-0">
                  Fecha:
                </span>
                <span className="text-text font-medium">
                  {formatFecha(entradaDetalle.fecha_at)}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-soft font-semibold w-28 shrink-0">
                  ID Entidad:
                </span>
                <span className="text-text font-mono text-xs bg-bg-alt border border-border px-2 py-0.5 rounded break-all">
                  {entradaDetalle.id_entidad}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-soft font-semibold w-28 shrink-0">
                  Usuario:
                </span>
                <span className="text-text font-bold">
                  {entradaDetalle.usuario}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-soft font-semibold w-28 shrink-0">
                  Detalle:
                </span>
                <p className="text-text leading-relaxed">
                  {entradaDetalle.detalle}
                </p>
              </div>

              {entradaDetalle.meta &&
                Object.keys(entradaDetalle.meta).length > 0 && (
                  <div className="mt-4">
                    <span className="text-text-soft font-semibold text-xs uppercase tracking-wider block mb-2">
                      Datos modificados
                    </span>
                    <pre className="bg-bg-alt border border-border rounded-xl p-3 text-xs text-text-soft overflow-x-auto max-h-48">
                      {JSON.stringify(entradaDetalle.meta, null, 2)}
                    </pre>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
