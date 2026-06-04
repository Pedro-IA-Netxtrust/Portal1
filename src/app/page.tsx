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
        <Activity className="mx-auto text-blue-500 animate-pulse" size={48} />
        <p className="text-zinc-500 text-sm font-semibold">Cargando Tablero Operativo Unificado...</p>
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
      color: "from-blue-500 to-indigo-500", 
      link: "/trabajadores" 
    },
    { 
      name: "Contratos Activos", 
      value: String(contratosActivos), 
      icon: FileText, 
      change: `${contratos.length - contratosActivos} cerrados o en prep.`, 
      color: "from-purple-500 to-pink-500", 
      link: "/contratos" 
    },
    { 
      name: "Alertas de Vencimiento", 
      value: String(alertas.length), 
      icon: AlertTriangle, 
      change: `${alertasCriticasCount} vencidos / ${alertasAdvertenciaCount} por vencer`, 
      color: alertas.length > 0 ? "from-amber-500 to-red-500 animate-pulse" : "from-emerald-500 to-teal-500", 
      link: "/control" 
    },
    { 
      name: "Tickets Soporte TI", 
      value: String(ticketsAbiertos), 
      icon: Ticket, 
      change: "Soporte activo pendiente", 
      color: "from-cyan-500 to-blue-500", 
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
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950 p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-blue-600/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles size={12} />
              <span>Control Operativo Inteligente</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Portal Monitoring SPA
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Bienvenido al centro de mando operativo unificado. Aquí tienes visibilidad en tiempo real de todos tus trabajadores, contratos, tickets TI y vigencias próximas a vencer.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/control"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              Registrar Habilitación
              <ArrowUpRight size={14} />
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
              className="block group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 shadow-md"
            >
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase truncate">
                  {metric.name}
                </span>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10 text-white shadow-sm transition-transform group-hover:scale-110`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{metric.value}</span>
                <span className="text-xs text-zinc-400 block mt-1">{metric.change}</span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Real-time Alerts: Próximos a Vencer (2/3 width) */}
        <section className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={alertas.length > 0 ? "text-amber-400 animate-bounce" : "text-zinc-500"} size={18} />
              <h2 className="text-lg font-bold text-white">⚠️ Alertas y Vencimientos Críticos</h2>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Próximos 30 días</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {alertas.map((alerta) => (
              <div 
                key={alerta.id}
                className={`p-4 rounded-lg border transition-all flex justify-between items-center gap-4 ${
                  alerta.urgencia === "CRITICA"
                    ? "bg-red-500/5 border-red-500/25 text-red-200" 
                    : "bg-amber-500/5 border-amber-500/20 text-amber-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      alerta.urgencia === "CRITICA" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {alerta.tipo.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-white">{alerta.item}</h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Responsable: <strong className="text-zinc-300">{alerta.responsable}</strong>
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className={`text-xs font-bold block ${
                    alerta.urgencia === "CRITICA" ? "text-red-400" : "text-amber-400"
                  }`}>
                    {alerta.dias_restantes < 0 
                      ? `Vencido hace ${Math.abs(alerta.dias_restantes)} días` 
                      : alerta.dias_restantes === 0
                      ? "Vence hoy"
                      : `Expira en ${alerta.dias_restantes} días`
                    }
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{alerta.fecha_vencimiento}</span>
                </div>
              </div>
            ))}

            {alertas.length === 0 && (
              <div className="p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-zinc-200 font-bold text-sm">¡Excelente cumplimiento operativo!</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Todas las licencias, revisiones técnicas de vehículos, cursos y exámenes médicos se encuentran al día.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Operational breakdown & urgent IT support (1/3 width) */}
        <div className="space-y-6">
          
          {/* IT Assets Allocations */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="text-blue-400" size={16} />
              Distribución de Activos
            </h2>
            
            <div className="space-y-4 text-xs">
              {/* Vehicles */}
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Car size={13} />
                    Flota de Vehículos
                  </span>
                  <strong className="text-white">{vehiculosAsignados} / {totalVehiculos} Asignados</strong>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${totalVehiculos > 0 ? (vehiculosAsignados / totalVehiculos) * 100 : 0}%` }}
                  ></div>
                </div>
                {vehiculosMantencion > 0 && (
                  <p className="text-[10px] text-amber-500 font-semibold">⚠️ {vehiculosMantencion} vehículo(s) en taller / mantenimiento.</p>
                )}
              </div>

              {/* Laptops */}
              <div className="space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Laptop size={13} />
                    Notebooks
                  </span>
                  <strong className="text-white">{notebooksAsignados} / {totalNotebooks} Asignados</strong>
                </div>
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full" 
                    style={{ width: `${totalNotebooks > 0 ? (notebooksAsignados / totalNotebooks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Urgent Support Tickets */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="text-cyan-400" size={16} />
                Soporte TI Crítico
              </h2>
              
              <div className="space-y-3">
                {tickets.filter(t => t.estado !== "Cerrado").slice(0, 3).map(tk => (
                  <div key={tk.id_ticket} className="p-2.5 rounded bg-zinc-950/60 border border-zinc-900 flex justify-between items-start gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase font-bold">{tk.codigo_ticket}</span>
                      <strong className="text-white block truncate max-w-[140px]">{tk.asunto}</strong>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Por: {getWorkerName(tk.id_trabajador_solicitante)}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      tk.prioridad === "Critica" || tk.prioridad === "Alta"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}>
                      {tk.prioridad}
                    </span>
                  </div>
                ))}

                {tickets.filter(t => t.estado !== "Cerrado").length === 0 && (
                  <p className="text-center py-4 text-[11px] text-zinc-600">No hay tickets de soporte abiertos.</p>
                )}
              </div>
            </div>

            <Link 
              href="/tickets" 
              className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-semibold group cursor-pointer"
            >
              Ver panel de Soporte TI
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
}
