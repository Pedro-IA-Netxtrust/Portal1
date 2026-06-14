"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  Ticket, 
  Cpu, 
  ArrowUpRight, 
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Car,
  Laptop,
  ArrowRight,
  Activity,
  ShieldCheck,
  Zap,
  TrendingUp
} from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useContratosStore } from "@/store/contratos-store";
import { useActivosStore } from "@/store/activos-store";
import { useControlStore } from "@/store/control-store";
import { useTicketsStore } from "@/store/tickets-store";
import { useSolicitudesStore } from "@/store/solicitudes-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useNotificacionesStore } from "@/store/notificaciones-store";
import { diasRestantes } from "@/lib/fechas";
import { esTicketAbierto, esTicketCerrado } from "@/lib/enums";

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

  // Selectores granulares: cada componente se suscribe sólo al slice que usa,
  // evitando re-renders por cambios en campos no relacionados del store.
  const trabajadores = useTrabajadoresStore((s) => s.trabajadores);
  const fetchTrabajadores = useTrabajadoresStore((s) => s.fetchTrabajadores);

  const contratos = useContratosStore((s) => s.contratos);
  const fetchContratos = useContratosStore((s) => s.fetchContratos);

  const activos = useActivosStore((s) => s.activos);
  const fetchActivos = useActivosStore((s) => s.fetchActivos);

  const examenes = useControlStore((s) => s.examenes);
  const cursos = useControlStore((s) => s.cursos);
  const catalogoExamenes = useControlStore((s) => s.catalogoExamenes);
  const catalogoCursos = useControlStore((s) => s.catalogoCursos);

  const tickets = useTicketsStore((s) => s.tickets);
  const fetchTickets = useTicketsStore((s) => s.fetchTickets);

  const fetchSolicitudes = useSolicitudesStore((s) => s.fetchSolicitudes);

  const ciclos = useCicloVidaStore((s) => s.ciclos);
  const fetchCiclos = useCicloVidaStore((s) => s.fetchCiclos);

  const fetchTareas = useOnboardingStore((s) => s.fetchTareas);
  const getProgressByTrabajador = useOnboardingStore(
    (s) => s.getProgressByTrabajador
  );

  const addNotification = useNotificacionesStore((s) => s.addNotification);

  useEffect(() => {
    setIsClient(true);
    fetchTrabajadores();
    fetchContratos();
    fetchActivos();
    fetchTickets();
    fetchSolicitudes();
    fetchCiclos();
    fetchTareas();
  }, [fetchTrabajadores, fetchContratos, fetchActivos, fetchTickets, fetchSolicitudes, fetchCiclos, fetchTareas]);

  // Generar notificaciones por vencimientos críticos. addNotification es idempotente
  // por id, así que las re-ejecuciones por cambios en stores no producen duplicados.
  useEffect(() => {
    if (trabajadores.length === 0 && activos.length === 0) return;

    // Trabajadores: licencia y carnet
    trabajadores.forEach((t) => {
      const nombre = `${t.nombre_1} ${t.apellido_paterno}`;
      const checks: { campo?: string | null; label: string }[] = [
        { campo: t.vencimiento_licencia_conducir, label: "Licencia de conducir" },
        { campo: t.vencimiento_carnet, label: "Carnet de identidad" },
        { campo: t.vencimiento_psicosensometrico, label: "Examen psicosensométrico" },
      ];
      checks.forEach(({ campo, label }) => {
        const dias = diasRestantes(campo);
        if (dias <= 7) {
          addNotification({
            id: `venc-${t.id_trabajador}-${label}`,
            titulo: dias < 0 ? `${label} vencido` : `${label} por vencer`,
            mensaje:
              dias < 0
                ? `${nombre}: ${label} venció hace ${Math.abs(dias)} días`
                : `${nombre}: ${label} vence en ${dias} días`,
            nivel: dias < 0 ? "critica" : "advertencia",
          });
        }
      });
    });

    // Vehículos: revisión técnica
    activos.forEach((a) => {
      const rt = a.detalles_adicionales?.vencimiento_revision_tecnica;
      if (a.tipo === "Vehículo" && rt) {
        const dias = diasRestantes(rt);
        if (dias <= 7) {
          addNotification({
            id: `venc-rt-${a.id_activo}`,
            titulo: dias < 0 ? "Revisión técnica vencida" : "Revisión técnica por vencer",
            mensaje: `${a.marca} ${a.modelo} (${a.identificador_unico}): ${
              dias < 0 ? `vencida hace ${Math.abs(dias)} días` : `vence en ${dias} días`
            }`,
            nivel: dias < 0 ? "critica" : "advertencia",
          });
        }
      }
    });
  }, [trabajadores, activos, addNotification]);

  // Helper: Get worker full name
  const getWorkerName = (idWorker: string) => {
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  // Compilación memoizada de alertas. Dedupe por id usando Map (O(1)) y orden
  // por urgencia ascendente (más vencido primero).
  // Importante: este hook DEBE declararse antes de cualquier early return para
  // respetar las reglas de los hooks de React.
  const alertas = useMemo<AlertaVencimiento[]>(() => {
    const mapa = new Map<string, AlertaVencimiento>();
    const push = (alert: AlertaVencimiento) => {
      if (!mapa.has(alert.id)) mapa.set(alert.id, alert);
    };

    // 1. Trabajadores: licencia, carnet, exámenes operacionales
    trabajadores.forEach(t => {
      const wName = `${t.nombre_1} ${t.apellido_paterno}`;

      const checks: { campo?: string | null; idSuffix: string; tipo: AlertaVencimiento["tipo"]; item: string }[] = [
        { campo: t.vencimiento_licencia_conducir, idSuffix: "lic", tipo: "Licencia", item: "Licencia de Conducir" },
        { campo: t.vencimiento_carnet, idSuffix: "car", tipo: "Identificación", item: `Cédula de Identidad (${t.tipo_identificacion})` },
        { campo: t.vencimiento_altura_geo, idSuffix: "alt", tipo: "Examen", item: "Examen Altura Geográfica" },
        { campo: t.vencimiento_psicosensometrico, idSuffix: "psi", tipo: "Examen", item: "Examen Psicosensométrico" },
      ];

      checks.forEach(({ campo, idSuffix, tipo, item }) => {
        if (!campo) return;
        const days = diasRestantes(campo);
        if (days <= 30) {
          push({
            id: `w-${idSuffix}-${t.id_trabajador}`,
            tipo,
            item,
            responsable: wName,
            fecha_vencimiento: campo,
            dias_restantes: days,
            urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA",
          });
        }
      });
    });

    // 2. Vehículos: revisión técnica (optional chaining seguro)
    activos.forEach(a => {
      const rt = a.detalles_adicionales?.vencimiento_revision_tecnica;
      if (a.tipo === "Vehículo" && rt) {
        const days = diasRestantes(rt);
        if (days <= 30) {
          push({
            id: `a-rt-${a.id_activo}`,
            tipo: "Vehículo",
            item: `Revisión Técnica - Patente: ${a.identificador_unico}`,
            responsable: `${a.marca} ${a.modelo}`,
            fecha_vencimiento: rt,
            dias_restantes: days,
            urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA",
          });
        }
      }
    });

    // 3. Exámenes registrados en Control Store
    examenes.forEach(e => {
      if (!e.fecha_vencimiento) return;
      const days = diasRestantes(e.fecha_vencimiento);
      if (days <= 30) {
        const cat = catalogoExamenes.find(c => c.id === e.id_examen_catalogo);
        push({
          id: `e-ctrl-${e.id}`,
          tipo: "Examen",
          item: cat?.nombre ?? "Examen",
          responsable: getWorkerName(e.id_trabajador),
          fecha_vencimiento: e.fecha_vencimiento,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA",
        });
      }
    });

    // 4. Cursos registrados en Control Store
    cursos.forEach(c => {
      if (!c.fecha_vencimiento) return;
      const days = diasRestantes(c.fecha_vencimiento);
      if (days <= 30) {
        const cat = catalogoCursos.find(cc => cc.id === c.id_curso_catalogo);
        push({
          id: `c-ctrl-${c.id}`,
          tipo: "Curso",
          item: cat?.nombre ?? "Curso",
          responsable: getWorkerName(c.id_trabajador),
          fecha_vencimiento: c.fecha_vencimiento,
          dias_restantes: days,
          urgencia: days < 0 ? "CRITICA" : "ADVERTENCIA",
        });
      }
    });

    return Array.from(mapa.values()).sort((a, b) => a.dias_restantes - b.dias_restantes);
    // `getWorkerName` cierra sobre `trabajadores`, ya incluido en deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trabajadores, activos, examenes, cursos, catalogoExamenes, catalogoCursos]);

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <Activity className="mx-auto text-brand-blue animate-pulse" size={48} />
        <p className="text-text-secondary text-sm font-semibold">Cargando Tablero Operativo Unificado...</p>
      </div>
    );
  }

  // Statistics calculation
  const totalTrabajadores = trabajadores.length;
  const contratosActivos = contratos.filter(c => c.estado === "Activo").length;
  const activosAsignados = activos.filter(a => a.estado === "Asignado").length;
  const ticketsAbiertos = tickets.filter(t => esTicketAbierto(t.estado)).length;
  
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
              href="/onboarding"
              className="btn btn-secondary text-sm"
            >
              <Zap size={18} />
              Dashboard Onboarding
            </Link>
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
                {tickets.filter(t => !esTicketCerrado(t.estado)).slice(0, 3).map(tk => (
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

                {tickets.filter(t => !esTicketCerrado(t.estado)).length === 0 && (
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

      {/* Section: Incorporaciones Activas */}
      {ciclos.some(c => c.estado_actual === "pre_incorporacion") && (
        <section className="card">
          <div className="card-header items-center border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <Zap className="text-amber-500" size={22} strokeWidth={2.5} />
              Incorporaciones en Proceso
            </h2>
            <span className="badge bg-amber-100 text-amber-900">
              {ciclos.filter(c => c.estado_actual === "pre_incorporacion").length} en curso
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ciclos
              .filter(c => c.estado_actual === "pre_incorporacion")
              .slice(0, 4)
              .map((ciclo) => {
                const t = trabajadores.find(tr => tr.id_trabajador === ciclo.id_trabajador);
                if (!t) return null;
                const progress = getProgressByTrabajador(ciclo.id_trabajador);

                return (
                  <Link
                    key={ciclo.id_trabajador}
                    href={`/trabajadores/${ciclo.id_trabajador}`}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all group"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="font-bold text-text text-sm group-hover:text-amber-900 transition-colors">
                          {t.nombre_1} {t.apellido_paterno}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{t.cargo || "Sin asignar"}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-amber-900">Progreso</span>
                          <span className="text-xs font-bold text-amber-900">{progress.porcentaje_total}%</span>
                        </div>
                        <div className="w-full bg-amber-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress.porcentaje_total}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-amber-900 font-semibold pt-2 border-t border-amber-200">
                        {progress.tareas_completadas}/{progress.tareas_total} tareas
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>

          {ciclos.filter(c => c.estado_actual === "pre_incorporacion").length > 4 && (
            <Link
              href="/trabajadores"
              className="mt-4 text-sm font-bold text-amber-700 hover:text-amber-900 flex items-center gap-2 transition-colors"
            >
              Ver todas las incorporaciones
              <ArrowRight size={16} />
            </Link>
          )}
        </section>
      )}

      {/* Section: Resumen de Cumplimiento */}
      {(ciclos.filter(c => c.estado_actual === "activo").length > 0 || 
        ciclos.filter(c => c.estado_actual === "pre_incorporacion").length > 0) && (
        <section className="card">
          <div className="card-header border-b border-border pb-4 mb-4">
            <h2 className="card-title flex items-center gap-2">
              <TrendingUp className="text-brand-blue" size={22} strokeWidth={2.5} />
              Resumen de Estado del Equipo
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Trabajadores"
              valor={trabajadores.length}
              icono={<Users size={20} />}
              color="bg-blue-100 text-blue-900"
            />
            <StatCard
              label="Activos Operando"
              valor={ciclos.filter(c => c.estado_actual === "activo").length}
              icono={<CheckCircle2 size={20} />}
              color="bg-emerald-100 text-emerald-900"
            />
            <StatCard
              label="En Incorporación"
              valor={ciclos.filter(c => c.estado_actual === "pre_incorporacion").length}
              icono={<Clock size={20} />}
              color="bg-amber-100 text-amber-900"
            />
            <StatCard
              label="Completitud Promedio"
              valor={
                ciclos.filter(c => c.estado_actual === "pre_incorporacion").length > 0
                  ? `${Math.round(
                      ciclos
                        .filter(c => c.estado_actual === "pre_incorporacion")
                        .reduce((sum, c) => sum + getProgressByTrabajador(c.id_trabajador).porcentaje_total, 0) /
                        ciclos.filter(c => c.estado_actual === "pre_incorporacion").length
                    )}%`
                  : "N/A"
              }
              icono={<TrendingUp size={20} />}
              color="bg-purple-100 text-purple-900"
            />
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  valor,
  icono,
  color,
}: {
  label: string;
  valor: string | number;
  icono: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-3 text-center`}>
      <div className="flex justify-center mb-2">{icono}</div>
      <p className="text-xs font-bold opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
