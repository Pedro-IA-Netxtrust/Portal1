"use client";

import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Ticket, useTicketsStore } from "@/store/tickets-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useActivosStore } from "@/store/activos-store";
import { 
  X, 
  UserPlus,
  Cpu, 
  Send, 
  CheckCircle, 
  Lock,
} from "lucide-react";

interface TicketDetalleProps {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketDetalle({ ticket, onClose }: TicketDetalleProps) {
  const { assignTicket, closeTicket, comentarios, addComentario } = useTicketsStore(
    useShallow((s) => ({
      assignTicket: s.assignTicket,
      closeTicket: s.closeTicket,
      comentarios: s.comentarios,
      addComentario: s.addComentario,
    }))
  );
  const trabajadores = useTrabajadoresStore((s) => s.trabajadores);
  const activos = useActivosStore((s) => s.activos);

  // New comment state
  const [comentarioTexto, setComentarioTexto] = useState("");
  const [esComentarioInterno, setEsComentarioInterno] = useState(false);

  // Re-fetch the ticket from the store to keep states reactive
  const liveTicket = useTicketsStore(
    state => state.tickets.find(t => t.id_ticket === ticket.id_ticket) || ticket
  );

  // Fetch linked records
  const requester = trabajadores.find(t => t.id_trabajador === liveTicket.id_trabajador_solicitante);
  const asset = liveTicket.id_activo_relacionado 
    ? activos.find(a => a.id_activo === liveTicket.id_activo_relacionado)
    : null;
  const technician = liveTicket.id_tecnico_responsable
    ? trabajadores.find(t => t.id_trabajador === liveTicket.id_tecnico_responsable)
    : null;

  // Filter comments for this ticket
  const ticketComments = comentarios.filter(c => c.id_ticket === liveTicket.id_ticket)
    .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());

  // Helper: Format ISO Dates elegantly
  const formatFechaSoporte = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Helper: SLA Semaphores
  const getSlaIndicator = (limitStr: string, completed: boolean, closedDate?: string) => {
    const limit = new Date(limitStr).getTime();
    const now = closedDate ? new Date(closedDate).getTime() : new Date().getTime();
    const remainingMs = limit - now;
    const remainingHrs = Math.round(remainingMs / (1000 * 60 * 60));

    if (!completed || remainingMs < 0) {
      return { text: "Incumplido (Fuera de tiempo)", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    }
    if (closedDate) {
      return { text: "Cumplido a tiempo", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    if (remainingHrs <= 2) {
      return { text: `Alerta Crítica: ${remainingHrs}h restantes`, color: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" };
    }
    if (remainingHrs <= 8) {
      return { text: `Vence pronto: ${remainingHrs}h restantes`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    return { text: `${remainingHrs} horas restantes`, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const handleAssign = () => {
    // Andres Muñoz (t-1) as active technician
    assignTicket(liveTicket.id_ticket, "t-1");
    // Add auto commentary log
    addComentario({
      id_ticket: liveTicket.id_ticket,
      id_trabajador: "t-1",
      texto: "Mesa de Ayuda TI: El ticket ha sido asignado al técnico de soporte Andrés Muñoz.",
      es_interno: false
    });
  };

  const handleClose = () => {
    closeTicket(liveTicket.id_ticket);
    // Add auto commentary log
    addComentario({
      id_ticket: liveTicket.id_ticket,
      id_trabajador: "t-1",
      texto: "Mesa de Ayuda TI: El ticket ha sido resuelto y CERRADO formalmente.",
      es_interno: false
    });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentarioTexto.trim()) return;

    // Default author: if esComentarioInterno, author is technician Andres (t-1), else requester (t-2) or technician depending on state
    const authorId = esComentarioInterno ? "t-1" : (liveTicket.id_tecnico_responsable || "t-2");

    addComentario({
      id_ticket: liveTicket.id_ticket,
      id_trabajador: authorId,
      texto: comentarioTexto,
      es_interno: esComentarioInterno
    });

    setComentarioTexto("");
    setEsComentarioInterno(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-5xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row shadow-2xl overflow-hidden">
        
        {/* LEFT COLUMN: CRITICAL SPECS (SLA, REQUESTER, ASSETS) */}
        <div className="w-full md:w-[350px] border-r border-zinc-800 flex flex-col justify-between bg-zinc-900/10 flex-shrink-0">
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* Requester Profile */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Colaborador Solicitante</h3>
              <div className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
                  {requester ? `${requester.nombre_1[0]}${requester.apellido_paterno[0]}` : "—"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {requester ? `${requester.nombre_1} ${requester.apellido_paterno}` : "Cargando..."}
                  </h4>
                  <p className="text-[9px] text-zinc-500 truncate">{requester?.email_corporativo}</p>
                </div>
              </div>
            </div>

            {/* Linked Asset */}
            {asset && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Activo Vinculado</h3>
                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-zinc-900">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Cpu size={12} className="text-blue-500" />
                      {asset.marca} {asset.modelo}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono font-bold">{asset.identificador_unico}</span>
                  </div>
                  {asset.tipo === "Notebook" ? (
                    <p className="text-[10px] text-zinc-400">
                      RAM/SSD: {asset.detalles_adicionales.ram_gb}GB / {asset.detalles_adicionales.almacenamiento_gb}GB SSD
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-400">
                      Km: {asset.detalles_adicionales.kilometraje_actual?.toLocaleString("es-CL")} Km • RT: {asset.detalles_adicionales.vencimiento_revision_tecnica}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* SLA Semaphores */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Garantías de SLA (Acuerdos)</h3>
              
              <div className="space-y-2">
                {/* Response SLA */}
                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                    <span>SLA de Respuesta</span>
                    <span>Límite: {formatFechaSoporte(liveTicket.sla_respuesta_hasta)}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold block text-center ${
                    getSlaIndicator(liveTicket.sla_respuesta_hasta, liveTicket.cumplio_sla_respuesta, liveTicket.fecha_asignacion).color
                  }`}>
                    {getSlaIndicator(liveTicket.sla_respuesta_hasta, liveTicket.cumplio_sla_respuesta, liveTicket.fecha_asignacion).text}
                  </span>
                </div>

                {/* Resolution SLA */}
                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                    <span>SLA de Resolución</span>
                    <span>Límite: {formatFechaSoporte(liveTicket.sla_resolucion_hasta)}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold block text-center ${
                    getSlaIndicator(liveTicket.sla_resolucion_hasta, liveTicket.cumplio_sla_resolucion, liveTicket.fecha_cierre).color
                  }`}>
                    {getSlaIndicator(liveTicket.sla_resolucion_hasta, liveTicket.cumplio_sla_resolucion, liveTicket.fecha_cierre).text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Controllers */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 space-y-3 flex-shrink-0">
            {liveTicket.estado === "Abierto" && (
              <button
                type="button"
                onClick={handleAssign}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-blue-600/10"
              >
                <UserPlus size={14} />
                Asignarme Ticket (Tomar)
              </button>
            )}

            {liveTicket.estado === "En Atencion" && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-850 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                    T
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">Asignado a: <strong className="text-white">{technician ? technician.nombre_1 : "Andrés"}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg hover:shadow-emerald-600/10"
                >
                  <CheckCircle size={14} />
                  Marcar como Resuelto (Cerrar)
                </button>
              </div>
            )}

            {liveTicket.estado === "Cerrado" && (
              <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-center space-y-1">
                <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle size={14} />
                  Ticket Cerrado
                </span>
                <p className="text-[10px] text-zinc-500">Cierre: {formatFechaSoporte(liveTicket.fecha_cierre!)}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TICKET DETAILS FEED & SUPPORT CHAT */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {/* Header Specs */}
          <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{liveTicket.codigo_ticket}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  liveTicket.prioridad === "Critica" 
                    ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                    : liveTicket.prioridad === "Alta"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {liveTicket.prioridad}
                </span>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{liveTicket.tipo} / {liveTicket.categoria}</span>
              </div>
              <h2 className="text-sm font-bold text-zinc-200 mt-0.5">{liveTicket.asunto}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Incident Description & Chat Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950/20">
            {/* Initial description card */}
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 space-y-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Reporte Inicial</span>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">{liveTicket.descripcion}</p>
              <div className="text-[10px] text-zinc-500 pt-1.5 flex justify-between">
                <span>Abierto por: {requester?.nombre_1} {requester?.apellido_paterno}</span>
                <span>{formatFechaSoporte(liveTicket.fecha_creacion)}</span>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-4">
              {ticketComments.map((comment) => {
                const author = trabajadores.find(t => t.id_trabajador === comment.id_trabajador);
                const isITAuthor = comment.es_interno || author?.email_corporativo?.endsWith("@monitoring.cl");
                
                return (
                  <div 
                    key={comment.id_comentario}
                    className={`p-4 rounded-xl border transition-all animate-slideIn ${
                      comment.es_interno
                        ? "bg-amber-500/5 border-amber-500/20 shadow-md shadow-amber-500/[0.02]" // Internal TI yellow highlight!
                        : isITAuthor
                        ? "bg-zinc-900/30 border-zinc-850"
                        : "bg-zinc-900/60 border-zinc-850/80"
                    }`}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900/40 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${comment.es_interno ? "text-amber-400" : isITAuthor ? "text-blue-400" : "text-zinc-300"}`}>
                          {author ? `${author.nombre_1} ${author.apellido_paterno}` : "Soporte TI"}
                        </span>
                        
                        {comment.es_interno && (
                          <span className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                            <Lock size={8} />
                            Nota Interna TI
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500">{formatFechaSoporte(comment.fecha_creacion)}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.texto}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Chat box (Disabled if closed) */}
          {liveTicket.estado !== "Cerrado" ? (
            <form 
              onSubmit={handleSendComment}
              className="p-4 border-t border-zinc-800 bg-zinc-900/20 flex-shrink-0 space-y-3"
            >
              <div className="relative">
                <textarea
                  value={comentarioTexto}
                  onChange={(e) => setComentarioTexto(e.target.value)}
                  placeholder={esComentarioInterno ? "Escribir nota interna exclusiva para soporte TI..." : "Escribir respuesta al solicitante..."}
                  className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded-lg py-2 pl-3 pr-10 resize-none h-14 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!comentarioTexto.trim()}
                  className="absolute right-3.5 bottom-3.5 p-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>

              {/* Internal Note Toggle */}
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={esComentarioInterno}
                    onChange={(e) => setEsComentarioInterno(e.target.checked)}
                    className="w-3.5 h-3.5 text-amber-500 bg-zinc-950 border-zinc-850 rounded focus:ring-amber-500 focus:ring-2 focus:ring-offset-zinc-950"
                  />
                  <span className={esComentarioInterno ? "text-amber-400" : "text-zinc-400"}>
                    {esComentarioInterno ? "🔒 Publicar como Nota Interna TI" : "🔓 Publicar Comentario Público"}
                  </span>
                </label>
                <span className="text-[9px] text-zinc-500">Mesa de Ayuda TI</span>
              </div>
            </form>
          ) : (
            <div className="h-16 border-t border-zinc-800 bg-zinc-900/10 flex items-center justify-center text-xs text-zinc-500 italic">
              El ticket ha sido archivado en modo lectura tras su cierre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
