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
  const { examenes, cursos } = useControlStore();
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
        <Activity className="mx-auto text-monitoring-blue animate-pulse" size={48} />
        <p className="text-monitoring-gray text-sm font-semibold">Cargando Tablero Operativo Unificado...</p>
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
        addAlertUnique({
          id: `e-ctrl-${e.id}`,
          tipo: "Examen",
          item: e.tipo_examen,
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
        addAlertUnique({
          id: `c-ctrl-${c.id}`,
          tipo: "Curso",
          item: c.nombre_curso,
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
      color: "bg-monitoring-blue/10 text-monitoring-blue", 
      link: "/trabajadores" 
    },
    { 
      name: "Contratos Activos", 
      value: String(contratosActivos), 
      icon: FileText, 
      change: `${contratos.length - contratosActivos} cerrados o en prep.`, 
      color: "bg-monitoring-cyan/10 text-monitoring-cyan", 
      link: "/contratos" 
    },
    { 
      name: "Alertas de Vencimiento", 
      value: String(alertas.length), 
      icon: AlertTriangle, 
      change: `${alertasCriticasCount} vencidos / ${alertasAdvertenciaCount} por vencer`, 
      color: alertas.length > 0 ? "bg-monitoring-orange/10 text-monitoring-orange animate-pulse" : "bg-monitoring-gray/10 text-monitoring-gray", 
      link: "/control" 
    },
    { 
      name: "Tickets Soporte TI", 
      value: String(ticketsAbiertos), 
      icon: Ticket, 
      change: "Soporte activo pendiente", 
      color: "bg-monitoring-blue/10 text-monitoring-blue", 
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
      <section className="relative overflow-hidden rounded-[20px] border border-border bg-card p-8 shadow-level-2">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-monitoring-light text-monitoring-blue border border-border">
              <Sparkles size={14} />
              <span>Control Operativo Inteligente</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-monitoring-graphite md:text-4xl">
              Portal Monitoring SPA
            </h1>
            <p className="text-sm text-monitoring-gray max-w-xl font-medium">
              Bienvenido al centro de mando operativo unificado. Aquí tienes visibilidad en tiempo real de todos tus trabajadores, contratos, tickets TI y vigencias próximas a vencer.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/control"
              className="px-5 py-2.5 bg-monitoring-blue hover:bg-monitoring-blue/90 text-white rounded-lg text-sm font-bold transition-all shadow-level-1 flex items-center gap-2 cursor-pointer"
            >
              Registrar Habilitación
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Metrics Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link 
              key={metric.name}
              href={metric.link}
              className="block group rounded-xl border border-border bg-card p-6 hover:shadow-level-2 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <span className="text-monitoring-gray text-xs font-bold tracking-wider uppercase truncate">
                  {metric.name}
                </span>
                <div className={`p-2 rounded-lg ${metric.color} transition-transform group-hover:scale-110`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-monitoring-graphite tracking-tight">{metric.value}</span>
                <span className="text-xs text-monitoring-gray block mt-1 font-medium">{metric.change}</span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Alerts: Próximos a Vencer (2/3 width) */}
        <section className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-level-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className={alertas.length > 0 ? "text-monitoring-orange" : "text-monitoring-gray"} size={20} />
              <h2 className="text-lg font-bold text-monitoring-graphite">Alertas y Vencimientos Críticos</h2>
            </div>
            <span className="text-xs text-monitoring-gray font-bold uppercase tracking-wider bg-monitoring-light px-2.5 py-1 rounded">Próximos 30 días</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {alertas.map((alerta) => (
              <div 
                key={alerta.id}
                className={`p-4 rounded-lg border transition-all flex justify-between items-center gap-4 ${
                  alerta.urgencia === "CRITICA"
                    ? "bg-destructive/5 border-destructive/20" 
                    : "bg-monitoring-orange/5 border-monitoring-orange/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alerta.urgencia === "CRITICA" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-monitoring-orange/10 text-monitoring-orange border border-monitoring-orange/20"
                    }`}>
                      {alerta.tipo}
                    </span>
                    <h3 className="text-sm font-bold text-monitoring-graphite">{alerta.item}</h3>
                  </div>
                  <p className="text-xs text-monitoring-gray font-medium">
                    Responsable: <strong className="text-monitoring-graphite font-bold">{alerta.responsable}</strong>
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-sm font-bold block ${
                    alerta.urgencia === "CRITICA" ? "text-destructive" : "text-monitoring-orange"
                  }`}>
                    {alerta.dias_restantes < 0 
                      ? `Vencido hace ${Math.abs(alerta.dias_restantes)} días` 
                      : alerta.dias_restantes === 0
                      ? "Vence hoy"
                      : `Expira en ${alerta.dias_restantes} días`
                    }
                  </span>
                  <span className="text-[11px] text-monitoring-gray block mt-0.5 font-medium">{alerta.fecha_vencimiento}</span>
                </div>
              </div>
            ))}

            {alertas.length === 0 && (
              <div className="p-12 text-center border border-border border-dashed rounded-xl bg-monitoring-light/50">
                <div className="w-14 h-14 rounded-full bg-monitoring-blue/10 text-monitoring-blue flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-monitoring-graphite font-bold text-base">Cumplimiento Operativo Óptimo</h4>
                  <p className="text-sm text-monitoring-gray mt-1 max-w-sm mx-auto font-medium">
                    Todas las licencias, revisiones técnicas, cursos y exámenes se encuentran al día.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Operational breakdown & urgent IT support (1/3 width) */}
        <div className="space-y-8">
          
          {/* IT Assets Allocations */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-level-1">
            <h2 className="text-base font-bold text-monitoring-graphite flex items-center gap-2 mb-6">
              <Cpu className="text-monitoring-blue" size={18} />
              Distribución de Activos
            </h2>
            
            <div className="space-y-5 text-sm font-medium">
              {/* Vehicles */}
              <div className="space-y-2">
                <div className="flex justify-between text-monitoring-gray">
                  <span className="flex items-center gap-2">
                    <Car size={16} />
                    Flota de Vehículos
                  </span>
                  <strong className="text-monitoring-graphite">{vehiculosAsignados} / {totalVehiculos} Asignados</strong>
                </div>
                <div className="w-full bg-monitoring-light rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-monitoring-blue h-2 rounded-full" 
                    style={{ width: `${totalVehiculos > 0 ? (vehiculosAsignados / totalVehiculos) * 100 : 0}%` }}
                  ></div>
                </div>
                {vehiculosMantencion > 0 && (
                  <p className="text-[11px] text-monitoring-orange font-bold mt-1">⚠️ {vehiculosMantencion} vehículo(s) en mantenimiento.</p>
                )}
              </div>

              {/* Laptops */}
              <div className="space-y-2">
                <div className="flex justify-between text-monitoring-gray">
                  <span className="flex items-center gap-2">
                    <Laptop size={16} />
                    Notebooks
                  </span>
                  <strong className="text-monitoring-graphite">{notebooksAsignados} / {totalNotebooks} Asignados</strong>
                </div>
                <div className="w-full bg-monitoring-light rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-monitoring-cyan h-2 rounded-full" 
                    style={{ width: `${totalNotebooks > 0 ? (notebooksAsignados / totalNotebooks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Urgent Support Tickets */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-level-1 flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="text-base font-bold text-monitoring-graphite flex items-center gap-2">
                <Ticket className="text-monitoring-cyan" size={18} />
                Soporte TI Crítico
              </h2>
              
              <div className="space-y-3">
                {tickets.filter(t => t.estado !== "Cerrado").slice(0, 3).map(tk => (
                  <div key={tk.id_ticket} className="p-3 rounded-lg bg-monitoring-light border border-border flex justify-between items-start gap-3 text-sm">
                    <div>
                      <span className="text-[10px] text-monitoring-gray block uppercase font-bold tracking-wider">{tk.codigo_ticket}</span>
                      <strong className="text-monitoring-graphite block truncate max-w-[140px] font-bold">{tk.asunto}</strong>
                      <span className="text-[11px] text-monitoring-gray block mt-0.5 font-medium">Por: {getWorkerName(tk.id_trabajador_solicitante)}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                      tk.prioridad === "Critica" || tk.prioridad === "Alta"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-monitoring-gray/10 text-monitoring-gray border border-monitoring-gray/20"
                    }`}>
                      {tk.prioridad}
                    </span>
                  </div>
                ))}

                {tickets.filter(t => t.estado !== "Cerrado").length === 0 && (
                  <p className="text-center py-5 text-xs text-monitoring-gray font-medium">No hay tickets de soporte abiertos.</p>
                )}
              </div>
            </div>

            <Link 
              href="/tickets" 
              className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm text-monitoring-blue hover:text-monitoring-blue/80 font-bold group cursor-pointer"
            >
              Ver panel de Soporte TI
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
