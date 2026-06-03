"use client";

import React, { useState, useEffect } from "react";
import { useTicketsStore, Ticket } from "@/store/tickets-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import TicketForm from "@/components/custom/ticket-form";
import TicketDetalle from "@/components/custom/ticket-detalle";
import { 
  Plus, 
  Search, 
  Ticket as TicketIcon, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Inbox,
  UserCheck
} from "lucide-react";

export default function TicketsPage() {
  const { tickets, fetchTickets } = useTicketsStore();
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();

  useEffect(() => {
    fetchTickets();
    fetchTrabajadores();
  }, [fetchTickets, fetchTrabajadores]);

  // Navigation and search states
  const [activeQueue, setActiveQueue] = useState<"Abierto" | "En Atencion" | "Cerrado">("Abierto");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Helper: Open ticket workspace
  const handleOpenWorkspace = (t: Ticket) => {
    setSelectedTicket(t);
    setDetailOpen(true);
  };

  // Helper: Get Requester Name
  const getRequesterName = (idWorker: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  // Helper: Calculate remaining SLA hours
  const getSlaHoursLeft = (limitStr: string, completed: boolean, closedDate?: string) => {
    const limit = new Date(limitStr).getTime();
    const target = closedDate ? new Date(closedDate).getTime() : Date.now();
    const remainingMs = limit - target;
    return Math.round(remainingMs / (1000 * 60 * 60));
  };

  // Filtering
  const filteredTickets = tickets.filter(t => {
    if (t.estado !== activeQueue) return false;

    const searchString = `${t.codigo_ticket} ${t.asunto} ${getRequesterName(t.id_trabajador_solicitante)} ${t.categoria}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.estado === "Abierto").length;
  const inAttentionCount = tickets.filter(t => t.estado === "En Atencion").length;
  const closedCount = tickets.filter(t => t.estado === "Cerrado").length;

  // SLA Compliance rate (very premium stat!)
  const closedTickets = tickets.filter(t => t.estado === "Cerrado");
  const compliedCount = closedTickets.filter(t => t.cumplio_sla_resolucion).length;
  const complianceRate = closedTickets.length > 0 
    ? Math.round((compliedCount / closedTickets.length) * 100) 
    : 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mesa de Soporte & Tickets TI</h1>
          <p className="text-xs text-zinc-500">
            Fase 4.5: Registra incidencias y administra los acuerdos de SLA de respuesta y resolución en tiempo real.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5"
        >
          <Plus size={16} />
          Abrir Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Inbox size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">BANDEJA DE ENTRADA</span>
            <span className="text-lg font-bold text-white">{openCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">EN ATENCIÓN (MIS ASIG.)</span>
            <span className="text-lg font-bold text-white">{inAttentionCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CUMPLIMIENTO SLA TI</span>
            <span className="text-lg font-bold text-white">{complianceRate}%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400">
            <TicketIcon size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">TICKETS RESUELTOS</span>
            <span className="text-lg font-bold text-white">{closedCount}</span>
          </div>
        </div>
      </div>

      {/* Queues Tabs Menu */}
      <div className="flex border-b border-zinc-800 space-x-6 bg-zinc-950 px-2 flex-shrink-0">
        <button
          onClick={() => setActiveQueue("Abierto")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "Abierto" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Inbox size={15} />
          Bandeja General ({openCount})
        </button>
        <button
          onClick={() => setActiveQueue("En Atencion")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "En Atencion" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <UserCheck size={15} />
          Mis Asignaciones ({inAttentionCount})
        </button>
        <button
          onClick={() => setActiveQueue("Cerrado")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "Cerrado" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <CheckCircle size={15} />
          Historial / Cerrados ({closedCount})
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Asunto, Código de Ticket, Solicitante o Categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => {
          const hoursLeft = getSlaHoursLeft(t.sla_resolucion_hasta, t.cumplio_sla_resolucion, t.fecha_cierre);
          const isOverdue = hoursLeft < 0;

          return (
            <div 
              key={t.id_ticket}
              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono">{t.codigo_ticket}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    t.prioridad === "Critica" 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                      : t.prioridad === "Alta"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {t.prioridad}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold">{t.tipo} • {t.categoria}</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                  {t.asunto}
                </h3>

                <div className="text-[10px] text-zinc-500 flex gap-3 flex-wrap">
                  <span>Solicitante: <strong className="text-zinc-300 font-medium">{getRequesterName(t.id_trabajador_solicitante)}</strong></span>
                  <span>•</span>
                  <span>Apertura: {new Date(t.fecha_creacion).toLocaleDateString()}</span>
                </div>
              </div>

              {/* SLA indicators & Workspace triggers */}
              <div className="flex items-center gap-4 flex-shrink-0 justify-between sm:justify-end">
                {t.estado !== "Cerrado" ? (
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold border ${
                    isOverdue 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : hoursLeft <= 8
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>
                    {isOverdue 
                      ? "SLA Vencido" 
                      : `${hoursLeft}h resolución`
                    }
                  </span>
                ) : (
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold border ${
                    t.cumplio_sla_resolucion
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {t.cumplio_sla_resolucion ? "SLA Cumplido" : "SLA Incumplido"}
                  </span>
                )}

                <button 
                  onClick={() => handleOpenWorkspace(t)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Eye size={12} />
                  Atender
                </button>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
            <Inbox className="mx-auto text-zinc-700" size={32} />
            <h4 className="text-zinc-300 font-bold text-sm">No hay tickets en esta cola</h4>
            <p className="text-xs text-zinc-500">Todo el trabajo está al día o no coincide con los filtros.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {formOpen && (
        <TicketForm 
          onClose={() => setFormOpen(false)} 
        />
      )}

      {detailOpen && selectedTicket && (
        <TicketDetalle 
          ticket={selectedTicket} 
          onClose={() => {
            setDetailOpen(false);
            setSelectedTicket(null);
          }} 
        />
      )}
    </div>
  );
}
