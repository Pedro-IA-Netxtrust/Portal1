"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  User,
  Calendar,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Ban,
  AlertTriangle,
  Send,
  Lock
} from "lucide-react";
import {
  useSolicitudesStore,
  type EstadoSolicitud,
  type PayloadVacaciones,
  type PayloadPermisoConGoce,
  type PayloadCambioEquipo,
  type PayloadCambioTurno,
  type PayloadTeletrabajo,
  type PayloadLicenciaMedica
} from "@/store/solicitudes-store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoSolicitud, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Pendiente:     { label: "Pendiente",    color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",    icon: Clock },
  "En Revisión": { label: "En Revisión", color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",      icon: RefreshCw },
  Aprobada:      { label: "Aprobada",    color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  Rechazada:     { label: "Rechazada",   color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20",        icon: XCircle },
  Cancelada:     { label: "Cancelada",   color: "text-zinc-500",    bg: "bg-zinc-500/10 border-zinc-500/20",      icon: XCircle }
};

const TIPO_EMOJI: Record<string, string> = {
  Vacaciones: "🏖️", "Permiso con Goce": "✅", "Permiso sin Goce": "📋",
  "Cambio de Equipo": "💻", "Cambio de Turno": "🔄", Teletrabajo: "🏠",
  "Licencia Médica": "🏥", Otro: "📌"
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500 font-medium">{label}</span>
      <span className="text-sm text-zinc-200">{value || "—"}</span>
    </div>
  );
}

// ─── Payload Renderers ────────────────────────────────────────────────────────

function PayloadVacacionesView({ p }: { p: PayloadVacaciones }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <InfoRow label="Fecha inicio" value={formatDate(p.fecha_inicio)} />
      <InfoRow label="Fecha fin"    value={formatDate(p.fecha_fin)} />
      <InfoRow label="Días hábiles" value={`${p.dias_habiles} días`} />
      {p.motivo && <div className="col-span-full"><InfoRow label="Motivo" value={p.motivo} /></div>}
    </div>
  );
}

function PayloadCambioEquipoView({ p }: { p: PayloadCambioEquipo }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <InfoRow label="Tipo de equipo"  value={p.tipo_equipo} />
      <InfoRow label="Motivo"          value={p.motivo} />
      <InfoRow label="Activo actual"   value={p.activo_actual} />
      <div className="col-span-full"><InfoRow label="Descripción" value={p.descripcion_solicitud} /></div>
    </div>
  );
}

function PayloadCambioTurnoView({ p }: { p: PayloadCambioTurno }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <InfoRow label="Turno actual"     value={p.turno_actual} />
      <InfoRow label="Turno solicitado" value={p.turno_solicitado} />
      <InfoRow label="Fecha efectiva"   value={formatDate(p.fecha_efectiva)} />
      <div className="col-span-full"><InfoRow label="Motivo" value={p.motivo} /></div>
    </div>
  );
}

function PayloadTeletrabajoView({ p }: { p: PayloadTeletrabajo }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <InfoRow label="Fecha inicio" value={formatDate(p.fecha_inicio)} />
      <InfoRow label="Fecha fin"    value={p.fecha_fin ? formatDate(p.fecha_fin) : "Indefinido"} />
      <InfoRow label="Modalidad"    value={p.modalidad} />
      <InfoRow label="Días"         value={p.dias_semana.join(", ")} />
      <div className="col-span-full"><InfoRow label="Motivo" value={p.motivo} /></div>
    </div>
  );
}

function PayloadLicenciaView({ p }: { p: PayloadLicenciaMedica }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <InfoRow label="Fecha inicio" value={formatDate(p.fecha_inicio)} />
      <InfoRow label="Días"         value={`${p.dias} días`} />
      <InfoRow label="Tipo"         value={p.tipo} />
      {p.numero_licencia && <InfoRow label="N° Licencia" value={p.numero_licencia} />}
    </div>
  );
}

function PayloadRenderer({ tipo, payload }: { tipo: string; payload: any }) {
  if (tipo === "Vacaciones")         return <PayloadVacacionesView   p={payload} />;
  if (tipo === "Permiso con Goce" || tipo === "Permiso sin Goce") return <PayloadVacacionesView p={payload} />;
  if (tipo === "Cambio de Equipo")   return <PayloadCambioEquipoView p={payload} />;
  if (tipo === "Cambio de Turno")    return <PayloadCambioTurnoView  p={payload} />;
  if (tipo === "Teletrabajo")        return <PayloadTeletrabajoView  p={payload} />;
  if (tipo === "Licencia Médica")    return <PayloadLicenciaView     p={payload} />;
  return <p className="text-sm text-zinc-300">{payload?.descripcion ?? "Sin detalles."}</p>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DetalleSolicitudPage() {
  const params = useParams();
  const router = useRouter();
  const { solicitudes, comentarios, updateEstado, cancelarSolicitud, addComentario } = useSolicitudesStore();

  const solicitud = solicitudes.find(s => s.id_solicitud === params.id);
  const solComentarios = comentarios.filter(c => c.id_solicitud === params.id)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const [comentario, setComentario] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [accionActiva, setAccionActiva] = useState<"aprobar" | "rechazar" | null>(null);

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Solicitud no encontrada.
      </div>
    );
  }

  const cfg = ESTADO_CONFIG[solicitud.estado];
  const Icon = cfg.icon;
  const puedeActuar = solicitud.estado === "Pendiente" || solicitud.estado === "En Revisión";
  const emoji = TIPO_EMOJI[solicitud.tipo] ?? "📌";

  const handleAprobar = () => {
    updateEstado(solicitud.id_solicitud, "Aprobada", { observaciones, nombre_revisor: "Operador General" });
    setAccionActiva(null);
  };

  const handleRechazar = () => {
    if (!motivoRechazo.trim()) return;
    updateEstado(solicitud.id_solicitud, "Rechazada", { motivo_rechazo: motivoRechazo, nombre_revisor: "Operador General" });
    setAccionActiva(null);
  };

  const handleEnRevision = () => {
    updateEstado(solicitud.id_solicitud, "En Revisión", { nombre_revisor: "Operador General" });
  };

  const handleCancelar = () => {
    cancelarSolicitud(solicitud.id_solicitud);
  };

  const handleComentario = () => {
    if (!comentario.trim()) return;
    addComentario({
      id_solicitud: solicitud.id_solicitud,
      autor: "Operador General",
      texto: comentario,
      es_resolucion: false
    });
    setComentario("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push("/solicitudes")} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl">{emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-zinc-500">{solicitud.codigo_solicitud}</span>
                {solicitud.prioridad === "Urgente" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">⚡ URGENTE</span>
                )}
              </div>
              <h1 className="text-lg font-bold text-white truncate">{solicitud.asunto}</h1>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detalles del payload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-300">Detalles de la Solicitud</h2>
            </div>
            <PayloadRenderer tipo={solicitud.tipo} payload={solicitud.payload} />
          </div>

          {/* Observaciones de resolución */}
          {(solicitud.observaciones || solicitud.motivo_rechazo) && (
            <div className={`border rounded-xl p-4 ${solicitud.estado === "Aprobada" ? "bg-emerald-950/30 border-emerald-500/20" : "bg-red-950/30 border-red-500/20"}`}>
              <div className="flex items-center gap-2 mb-2">
                {solicitud.estado === "Aprobada"
                  ? <CheckCircle2 size={15} className="text-emerald-400" />
                  : <XCircle size={15} className="text-red-400" />}
                <span className={`text-sm font-semibold ${solicitud.estado === "Aprobada" ? "text-emerald-400" : "text-red-400"}`}>
                  {solicitud.estado === "Aprobada" ? "Aprobada" : "Rechazada"} por {solicitud.nombre_revisor}
                </span>
                <span className="text-xs text-zinc-500 ml-auto">{formatDateTime(solicitud.fecha_resolucion)}</span>
              </div>
              {solicitud.observaciones && <p className="text-sm text-zinc-300">{solicitud.observaciones}</p>}
              {solicitud.motivo_rechazo && <p className="text-sm text-zinc-300">{solicitud.motivo_rechazo}</p>}
            </div>
          )}

          {/* Acciones de resolución */}
          {puedeActuar && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-violet-400" />
                <h2 className="text-sm font-semibold text-zinc-300">Acciones</h2>
              </div>

              {accionActiva === null && (
                <div className="flex flex-wrap gap-2">
                  {solicitud.estado === "Pendiente" && (
                    <button onClick={handleEnRevision} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 rounded-lg text-sm font-medium transition-all">
                      <RefreshCw size={14} /> Poner En Revisión
                    </button>
                  )}
                  <button onClick={() => setAccionActiva("aprobar")} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 rounded-lg text-sm font-medium transition-all">
                    <CheckCircle2 size={14} /> Aprobar
                  </button>
                  <button onClick={() => setAccionActiva("rechazar")} className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 rounded-lg text-sm font-medium transition-all">
                    <XCircle size={14} /> Rechazar
                  </button>
                  <button onClick={handleCancelar} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm font-medium transition-all">
                    <Ban size={14} /> Cancelar solicitud
                  </button>
                </div>
              )}

              {accionActiva === "aprobar" && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-400">¿Observaciones adicionales? (opcional)</p>
                  <textarea
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    rows={2}
                    placeholder="Ej: Coordinar con jefatura directa..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setAccionActiva(null)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:border-zinc-600 transition-all">Cancelar</button>
                    <button onClick={handleAprobar} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all">
                      ✓ Confirmar Aprobación
                    </button>
                  </div>
                </div>
              )}

              {accionActiva === "rechazar" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1.5 block">Motivo del rechazo <span className="text-red-400">*</span></label>
                    <textarea
                      value={motivoRechazo}
                      onChange={e => setMotivoRechazo(e.target.value)}
                      rows={2}
                      placeholder="Indica el motivo del rechazo..."
                      className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-all resize-none"
                    />
                  </div>
                  {!motivoRechazo.trim() && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                      <AlertTriangle size={12} /> El motivo es obligatorio para rechazar.
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setAccionActiva(null)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:border-zinc-600 transition-all">Cancelar</button>
                    <button onClick={handleRechazar} disabled={!motivoRechazo.trim()} className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all">
                      ✕ Confirmar Rechazo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comentarios */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-300">Comentarios ({solComentarios.length})</h2>
            </div>

            {solComentarios.length === 0 && (
              <p className="text-xs text-zinc-600 py-3 text-center">Sin comentarios aún.</p>
            )}

            <div className="space-y-3">
              {solComentarios.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
                    {c.autor.charAt(0)}
                  </div>
                  <div className="flex-1 bg-zinc-800/50 rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-300">{c.autor}</span>
                      <span className="text-[10px] text-zinc-600">{formatDateTime(c.fecha)}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            {solicitud.estado !== "Cancelada" && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleComentario()}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-all"
                />
                <button onClick={handleComentario} className="p-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Solicitante */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Solicitante</h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                {solicitud.nombre_solicitante.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{solicitud.nombre_solicitante}</p>
                <p className="text-xs text-zinc-500">{solicitud.area}</p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fechas</h3>
            <div className="space-y-2">
              <InfoRow label="Creación"   value={formatDateTime(solicitud.fecha_creacion)} />
              <InfoRow label="Revisión"   value={formatDateTime(solicitud.fecha_revision)} />
              <InfoRow label="Resolución" value={formatDateTime(solicitud.fecha_resolucion)} />
            </div>
          </div>

          {/* Revisor */}
          {solicitud.nombre_revisor && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Revisado por</h3>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-violet-400" />
                <span className="text-sm text-zinc-200">{solicitud.nombre_revisor}</span>
              </div>
            </div>
          )}

          {/* Estado */}
          {!puedeActuar && (
            <div className={`border rounded-xl p-4 flex items-center gap-2 ${cfg.bg}`}>
              <Lock size={14} className={cfg.color} />
              <span className={`text-sm font-medium ${cfg.color}`}>Solicitud {cfg.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
