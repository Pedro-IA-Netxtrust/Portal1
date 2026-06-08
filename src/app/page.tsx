"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  Ticket, 
  Cpu, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Car,
  Laptop,
  ArrowRight,
  Activity,
  ShieldCheck
} from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useContratosStore } from "@/store/contratos-store";
import { useActivosStore } from "@/store/activos-store";
import { useControlStore } from "@/store/control-store";
import { useTicketsStore } from "@/store/tickets-store";
import { useSolicitudesStore } from "@/store/solicitudes-store";

interface AlertaVencimiento {
  id: string;
  tipo: "Examen" | "Curso" | "Vehículo" | "Licencia" | "Identificación";
  item: string;
  responsable: string;
  fecha_vencimiento: string;
  dias_restantes: number;
  urgencia: "CRITICA" | "ADVERTENCIA";
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // Load stores
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { contratos, fetchContratos } = useContratosStore();
  const { activos, fetchActivos } = useActivosStore();
  const { examenes, cursos, catalogoExamenes, catalogoCursos } = useControlStore();
  const { tickets, fetchTickets } = useTicketsStore();
  const { fetchSolicitudes } = useSolicitudesStore();

  useEffect(() => {
    setIsClient(true);
    fetchTrabajadores();
    fetchContratos();
    fetchActivos();
    fetchTickets();
    fetchSolicitudes();
  }, [fetchTrabajadores, fetchContratos, fetchActivos, fetchTickets, fetchSolicitudes]);

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <Activity className="mx-auto text-brand-blue animate-pulse" size={48} />
        <p className="text-text-secondary text-sm font-semibold">Cargando Tablero Operativo Unificado...</p>
      </div>
    );
  }

  // Helper: Get worker full name
  const getWorkerName = (idWorker: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  // Helper: Calculate remaining days
  const getDaysRemaining = (dateStr?: string | null) => {
    if (!dateStr) return 999;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limit = new Date(dateStr);
    limit.setHours(0, 0, 0, 0);
    const diffTime = limit.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Dynamic alerts list
  const alertas: AlertaVencimiento[] = [];

  const addAlertUnique = (alert: AlertaVencimiento) => {
    const exists = alertas.some(a => a.item === alert.item && a.responsable === alert.responsable);
    if (!exists) {
      alertas.push(alert);
    }
  };

  // 1. Scan Workers for Licencias and Carnet
  trabajadores.forEach(t => {
    const wName = `${t.nombre_1} ${t.apellido_paterno}`;
    
    if (t.vencimiento_licencia_conducir) {
      const days = getDaysRemaining(t.vencimiento_licencia_conducir);
      if (days <= 30) {
        addAlertUnique({
          id: `w-lic-${t.id_trabajador}`,
          tipo: "Licencia",
          item: "Licencia de Conducir",
          responsable: wName,
          fecha_vencimiento: t.vencimiento_licencia_conducir,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }

    if (t.vencimiento_carnet) {
      const days = getDaysRemaining(t.vencimiento_carnet);
      if (days <= 30) {
        addAlertUnique({
          id: `w-car-${t.id_trabajador}`,
          tipo: "Identificación",
          item: `Cédula de Identidad (${t.tipo_identificacion})`,
          responsable: wName,
          fecha_vencimiento: t.vencimiento_carnet,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }

    if (t.vencimiento_altura_geo) {
      const days = getDaysRemaining(t.vencimiento_altura_geo);
      if (days <= 30) {
        addAlertUnique({
          id: `w-alt-${t.id_trabajador}`,
          tipo: "Examen",
          item: "Examen Altura Geográfica",
          responsable: wName,
          fecha_vencimiento: t.vencimiento_altura_geo,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }

    if (t.vencimiento_psicosensometrico) {
      const days = getDaysRemaining(t.vencimiento_psicosensometrico);
      if (days <= 30) {
        addAlertUnique({
          id: `w-psi-${t.id_trabajador}`,
          tipo: "Examen",
          item: "Examen Psicosensométrico",
          responsable: wName,
          fecha_vencimiento: t.vencimiento_psicosensometrico,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }
  });

  // 2. Scan Vehicles for Revision Tecnica
  activos.forEach(a => {
    if (a.tipo === "Vehículo" && a.detalles_adicionales.vencimiento_revision_tecnica) {
      const days = getDaysRemaining(a.detalles_adicionales.vencimiento_revision_tecnica);
      if (days <= 30) {
        addAlertUnique({
          id: `a-rt-${a.id_activo}`,
          tipo: "Vehículo",
          item: `Revisión Técnica - Patente: ${a.identificador_unico}`,
          responsable: `${a.marca} ${a.modelo}`,
          fecha_vencimiento: a.detalles_adicionales.vencimiento_revision_tecnica,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }
  });

  // 3. Scan registered exams & courses in Control Store
  examenes.forEach(e => {
    if (e.fecha_vencimiento) {
      const days = getDaysRemaining(e.fecha_vencimiento);
      if (days <= 30) {
        const cat = catalogoExamenes.find(c => c.id === e.id_examen_catalogo);
        addAlertUnique({
          id: `e-ctrl-${e.id}`,
          tipo: "Examen",
          item: cat?.nombre ?? "Examen",
          responsable: getWorkerName(e.id_trabajador),
          fecha_vencimiento: e.fecha_vencimiento,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }
  });

  cursos.forEach(c => {
    if (c.fecha_vencimiento) {
      const days = getDaysRemaining(c.fecha_vencimiento);
      if (days <= 30) {
        const cat = catalogoCursos.find(cat => cat.id === c.id_curso_catalogo);
        addAlertUnique({
          id: `c-ctrl-${c.id}`,
          tipo: "Curso",
          item: cat?.nombre ?? "Curso",
          responsable: getWorkerName(c.id_trabajador),
          fecha_vencimiento: c.fecha_vencimiento,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA"
        });
      }
    }
  });

  // Sort alerts: most expired/urgent first
  alertas.sort((a, b) => a.dias_restantes - b.dias_restantes);

  // Statistics calculation
  const totalTrabajadores = trabajadores.length;
  const contratosActivos = contratos.filter(c => c.estado === "Activo").length;
  const activosAsignados = activos.filter(a => a.estado === "Asignado").length;
  const ticketsAbiertos = tickets.filter(t => t.estado === "Abierto" || t.estado === "En Atencion").length;
  
  const alertasCriticasCount = alertas.filter(a => a.urgencia === "CRITICA").length;
  const alertasAdvertenciaCount = alertas.filter(a => a.urgencia === "ADVERTENCIA").length;

  const metrics = [
    { 
      name: "Dotación Operativa", 
      value: String(totalTrabajadores), 
      icon: Users, 
      change: "Colaboradores registrados", 
      color: "bg-brand-blue/10 text-brand-blue", 
      link: "/trabajadores" 
    },
    { 
      name: "Contratos Activos", 
      value: String(contratosActivos), 
      icon: FileText, 
      change: `${contratos.length - contratosActivos} cerrados o en prep.`, 
      color: "bg-brand-blue/10 text-brand-blue", 
      link: "/contratos" 
    },
    { 
      name: "Alertas de Vencimiento", 
      value: String(alertas.length), 
      icon: AlertTriangle, 
      change: `${alertasCriticasCount} vencidos / ${alertasAdvertenciaCount} por vencer`, 
      color: alertas.length > 0 ? "bg-warning/10 text-warning animate-pulse" : "bg-text-secondary/10 text-text-secondary", 
      link: "/control" 
    },
    { 
      name: "Tickets Soporte TI", 
      value: String(ticketsAbiertos), 
      icon: Ticket, 
      change: "Soporte activo pendiente", 
      color: "bg-brand-blue/10 text-brand-blue", 
      link: "/tickets" 
    },
  ];

  // Assets metrics breakdown
  const totalVehiculos = activos.filter(a => a.tipo === "Vehículo").length;
  const vehiculosMantencion = activos.filter(a => a.tipo === "Vehículo" && a.estado === "En Mantención").length;
  const vehiculosAsignados = activos.filter(a => a.tipo === "Vehículo" && a.estado === "Asignado").length;

  const totalNotebooks = activos.filter(a => a.tipo === "Notebook").length;
  const notebooksAsignados = activos.filter(a => a.tipo === "Notebook" && a.estado === "Asignado").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <section className="hero-shell">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="hero-kicker">
              <Sparkles size={16} />
              <span>Control Operativo Avanzado</span>
            </div>
            <h1 className="hero-title">
              Portal Monitoring SPA
            </h1>
            <p className="hero-copy">
              Bienvenido al centro de mando operativo unificado. Aquí tienes visibilidad en tiempo real de todos tus trabajadores, contratos, tickets de TI y la matriz de vigencias próxima a vencer.
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/control"
              className="btn btn-accent text-sm"
            >
              Registrar Habilitación
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Metrics Grid */}
      <section className="stats-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link 
              key={metric.name}
              href={metric.link}
              className="stat-box group block no-underline"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="label">
                  {metric.name}
                </span>
                <div className="text-primary transition-transform group-hover:scale-110">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className="value">{metric.value}</div>
              <div className="meta flex items-center gap-1.5">
                {metric.change}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Alerts: Próximos a Vencer (2/3 width) */}
        <section className="lg:col-span-2 card">
          <div className="card-header items-center border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <AlertTriangle className={alertas.length > 0 ? "text-warning" : "text-text-soft"} size={22} strokeWidth={2.5} />
              Alertas y Vencimientos Críticos
            </h2>
            <span className="badge badge-orange">Próximos 30 días</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {alertas.map((alerta) => (
              <div 
                key={alerta.id}
                className={`p-4 rounded-xl border transition-all flex justify-between items-center gap-4 ${
                  alerta.urgencia === "CRITICA"
                    ? "bg-danger/5 border-danger/20" 
                    : "bg-warning/5 border-warning/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alerta.urgencia === "CRITICA" ? "bg-danger/10 text-danger border border-danger/20" : "bg-warning/10 text-warning border border-warning/20"
                    }`}>
                      {alerta.tipo}
                    </span>
                    <h3 className="text-sm font-bold text-text">{alerta.item}</h3>
                  </div>
                  <p className="text-xs text-text-soft font-medium">
                    Responsable: <strong className="text-text font-bold">{alerta.responsable}</strong>
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold block ${
                    alerta.urgencia === "CRITICA" ? "text-danger" : "text-warning"
                  }`}>
                    {alerta.dias_restantes < 0 
                      ? `Vencido hace ${Math.abs(alerta.dias_restantes)} días` 
                      : alerta.dias_restantes === 0
                      ? "Vence hoy"
                      : `Expira en ${alerta.dias_restantes} días`
                    }
                  </span>
                  <span className="text-[11px] text-text-muted block mt-0.5 font-medium">{alerta.fecha_vencimiento}</span>
                </div>
              </div>
            ))}

            {alertas.length === 0 && (
              <div className="p-12 text-center border border-border border-dashed rounded-2xl bg-bg-alt/50">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-text font-bold text-base">Cumplimiento Operativo Óptimo</h4>
                  <p className="text-sm text-text-soft mt-1 max-w-sm mx-auto font-medium">
                    Todas las licencias, revisiones técnicas, cursos y exámenes se encuentran al día.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Operational breakdown & urgent IT support (1/3 width) */}
        <div className="space-y-6">
          
          {/* IT Assets Allocations */}
          <section className="card card-accent-top">
            <div className="card-header border-b border-border pb-4 mb-4">
              <h2 className="card-title flex items-center gap-2">
                <Cpu size={20} strokeWidth={2.5} />
                Distribución de Activos
              </h2>
            </div>
            
            <div className="space-y-5 text-sm font-medium">
              {/* Vehicles */}
              <div className="space-y-2">
                <div className="flex justify-between text-text-soft">
                  <span className="flex items-center gap-2">
                    <Car size={18} />
                    Flota de Vehículos
                  </span>
                  <strong className="text-text">{vehiculosAsignados} / {totalVehiculos} Asignados</strong>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${totalVehiculos > 0 ? (vehiculosAsignados / totalVehiculos) * 100 : 0}%` }}
                  ></div>
                </div>
                {vehiculosMantencion > 0 && (
                  <p className="text-[11px] text-warning font-bold mt-1">⚠️ {vehiculosMantencion} vehículo(s) en mantenimiento.</p>
                )}
              </div>

              {/* Laptops */}
              <div className="space-y-2">
                <div className="flex justify-between text-text-soft">
                  <span className="flex items-center gap-2">
                    <Laptop size={18} />
                    Notebooks
                  </span>
                  <strong className="text-text">{notebooksAsignados} / {totalNotebooks} Asignados</strong>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${totalNotebooks > 0 ? (notebooksAsignados / totalNotebooks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Urgent Support Tickets */}
          <section className="card flex flex-col justify-between">
            <div className="space-y-5">
              <div className="card-header border-b border-border pb-4 mb-4">
                <h2 className="card-title flex items-center gap-2">
                  <Ticket size={20} strokeWidth={2.5} />
                  Soporte TI Crítico
                </h2>
              </div>
              
              <div className="space-y-3">
                {tickets.filter(t => t.estado !== "Cerrado").slice(0, 3).map(tk => (
                  <div key={tk.id_ticket} className="p-3.5 rounded-xl bg-bg-alt border border-border flex justify-between items-start gap-3 text-sm">
                    <div>
                      <span className="text-[10px] text-text-soft block uppercase font-bold tracking-wider">{tk.codigo_ticket}</span>
                      <strong className="text-text block truncate max-w-[140px] font-bold">{tk.asunto}</strong>
                      <span className="text-[11px] text-text-soft block mt-0.5 font-medium">Por: {getWorkerName(tk.id_trabajador_solicitante)}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase ${
                      tk.prioridad === "Critica" || tk.prioridad === "Alta"
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : "bg-text-soft/10 text-text-soft border border-text-soft/20"
                    }`}>
                      {tk.prioridad}
                    </span>
                  </div>
                ))}

                {tickets.filter(t => t.estado !== "Cerrado").length === 0 && (
                  <p className="text-center py-5 text-xs text-text-soft font-medium">No hay tickets de soporte abiertos.</p>
                )}
              </div>
            </div>

            <div className="card-footer pb-0 mb-0 mt-4">
              <Link 
                href="/tickets" 
                className="w-full flex items-center justify-between text-sm text-primary hover:text-primary-hover font-bold group cursor-pointer"
              >
                Ver panel de Soporte TI
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
