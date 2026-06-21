"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTicketsStore, Ticket } from "@/store/tickets-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import TicketForm from "@/components/custom/ticket-form";
import TicketDetalle from "@/components/custom/ticket-detalle";
import { 
  Plus, 
  Search, 
  Ticket as TicketIcon, 
  CheckCircle,
  Eye,
  Inbox,
  UserCheck
} from "lucide-react";

export default function TicketsPage() {
  const { tickets, fetchTickets } = useTicketsStore(
    useShallow((s) => ({ tickets: s.tickets, fetchTickets: s.fetchTickets }))
  );
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );

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
    const now = closedDate ? new Date(closedDate).getTime() : new Date().getTime();
    const remainingMs = limit - now;
    return Math.round(remainingMs / (1000 * 60 * 60));
  };

  // Filtering
  const filteredTickets = tickets.filter(t => {
    if (t.estado !== activeQueue) return false;

    const searchString = `${t.codigo_ticket} ${t.asunto} ${getRequesterName(t.id_trabajador_solicitante)} ${t.categoria}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Stats
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Mesa de Soporte & Tickets TI</h1>
          <p className="text-sm text-text-soft mt-1 font-medium">
            Fase 4.5: Registra incidencias y administra los acuerdos de SLA de respuesta y resolución en tiempo real.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Abrir Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Inbox size={24} />
          </div>
          <div>
            <span className="label">BANDEJA DE ENTRADA</span>
            <span className="value text-2xl">{openCount}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10 text-warning">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="label">EN ATENCIÓN (MIS ASIG.)</span>
            <span className="value text-2xl">{inAttentionCount}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="label">CUMPLIMIENTO SLA TI</span>
            <span className="value text-2xl">{complianceRate}%</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-bg-alt text-text-muted">
            <TicketIcon size={24} />
          </div>
          <div>
            <span className="label">TICKETS RESUELTOS</span>
            <span className="value text-2xl">{closedCount}</span>
          </div>
        </div>
      </div>

      {/* Queues Tabs Menu */}
      <div className="flex border-b border-border space-x-6 px-2 flex-shrink-0">
        <button
          onClick={() => setActiveQueue("Abierto")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "Abierto" ? "border-primary text-primary" : "border-transparent text-text-soft hover:text-text"
          }`}
        >
          <Inbox size={16} />
          Bandeja General ({openCount})
        </button>
        <button
          onClick={() => setActiveQueue("En Atencion")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "En Atencion" ? "border-primary text-primary" : "border-transparent text-text-soft hover:text-text"
          }`}
        >
          <UserCheck size={16} />
          Mis Asignaciones ({inAttentionCount})
        </button>
        <button
          onClick={() => setActiveQueue("Cerrado")}
          className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeQueue === "Cerrado" ? "border-primary text-primary" : "border-transparent text-text-soft hover:text-text"
          }`}
        >
          <CheckCircle size={16} />
          Historial / Cerrados ({closedCount})
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por Asunto, Código de Ticket, Solicitante o Categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((t) => {
          const hoursLeft = getSlaHoursLeft(t.sla_resolucion_hasta, t.cumplio_sla_resolucion, t.fecha_cierre);
          const isOverdue = hoursLeft < 0;

          return (
            <div 
              key={t.id_ticket}
              className="card p-5 hover:border-primary/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-text font-mono">{t.codigo_ticket}</span>
                  <span className={`badge ${
                    t.prioridad === "Critica" 
                      ? "bg-danger/10 text-danger border border-danger/20" 
                      : t.prioridad === "Alta"
                      ? "badge-orange"
                      : "badge-blue"
                  }`}>
                    {t.prioridad}
                  </span>
                  <span className="text-xs text-text-soft font-bold tracking-wide uppercase">{t.tipo} • {t.categoria}</span>
                </div>

                <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors truncate">
                  {t.asunto}
                </h3>

                <div className="text-xs text-text-soft font-medium flex gap-3 flex-wrap">
                  <span>Solicitante: <strong className="text-text font-bold">{getRequesterName(t.id_trabajador_solicitante)}</strong></span>
                  <span>•</span>
                  <span>Apertura: {new Date(t.fecha_creacion).toLocaleDateString()}</span>
                </div>
              </div>

              {/* SLA indicators & Workspace triggers */}
              <div className="flex items-center gap-5 flex-shrink-0 justify-between sm:justify-end">
                {t.estado !== "Cerrado" ? (
                  <span className={`badge ${
                    isOverdue 
                      ? "bg-danger/10 border-danger/20 text-danger" 
                      : hoursLeft <= 8
                      ? "badge-orange"
                      : "badge-outline"
                  }`}>
                    {isOverdue 
                      ? "SLA Vencido" 
                      : `${hoursLeft}h resolución`
                    }
                  </span>
                ) : (
                  <span className={`badge ${
                    t.cumplio_sla_resolucion
                      ? "bg-success/10 border-success/20 text-success"
                      : "bg-danger/10 border-danger/20 text-danger"
                  }`}>
                    {t.cumplio_sla_resolucion ? "SLA Cumplido" : "SLA Incumplido"}
                  </span>
                )}

                <button 
                  onClick={() => handleOpenWorkspace(t)}
                  className="btn btn-secondary py-2 min-h-0 text-xs px-4"
                >
                  <Eye size={14} />
                  Atender
                </button>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="p-12 text-center border border-border border-dashed rounded-2xl space-y-3 bg-surface/50">
            <Inbox className="mx-auto text-text-muted" size={40} />
            <h4 className="text-text font-bold text-base">No hay tickets en esta cola</h4>
            <p className="text-sm text-text-soft font-medium">Todo el trabajo está al día o no coincide con los filtros.</p>
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
