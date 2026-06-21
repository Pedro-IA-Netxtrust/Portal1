"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useReunionesStore, Reunion, ReunionAsistencia } from "@/store/reuniones-store";
import { useContratosStore } from "@/store/contratos-store";
import { useMandantesStore } from "@/store/mandantes-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import {
  Users,
  Calendar,
  ClipboardCheck,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Building2,
  FileText,
  Eye,
  ArrowLeft,
  Check,
  UserCheck
} from "lucide-react";

// Mapeo de estados legibles y sus colores correspondientes
const ESTADO_CONFIG = {
  presente: { label: "Presente", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  ausente: { label: "Ausente", bg: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" },
  otra_reunion: { label: "Otra Reunión", bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", dot: "bg-purple-400" },
  computador_compartido: { label: "Comp. Compartido", bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", dot: "bg-cyan-400" },
  no_aplica: { label: "No Aplica", bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-400" },
  vacaciones: { label: "Vacaciones", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400" },
  otro: { label: "Otro", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-400" },
};

type ViewMode = "list" | "create" | "detail" | "take_attendance";

export default function ReunionesPage() {
  const { reuniones, fetchReuniones, crearReunion, eliminarReunion, fetchAsistencias, registrarAsistenciaProgramada } = useReunionesStore(
    useShallow((s) => ({
      reuniones: s.reuniones,
      fetchReuniones: s.fetchReuniones,
      crearReunion: s.crearReunion,
      eliminarReunion: s.eliminarReunion,
      fetchAsistencias: s.fetchAsistencias,
      registrarAsistenciaProgramada: s.registrarAsistenciaProgramada,
    }))
  );
  const { contratos, fetchContratos } = useContratosStore(
    useShallow((s) => ({ contratos: s.contratos, fetchContratos: s.fetchContratos }))
  );
  const mandantes = useMandantesStore((s) => s.mandantes);
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );

  const [view, setView] = useState<ViewMode>("list");
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [selectedReunionForAttendance, setSelectedReunionForAttendance] = useState<Reunion | null>(null);
  const [selectedAsistencias, setSelectedAsistencias] = useState<ReunionAsistencia[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form states
  const [tema, setTema] = useState("");
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "contratos" | "mandantes">("todos");
  const [contratosSeleccionados, setContratosSeleccionados] = useState<string[]>([]);
  const [mandantesSeleccionados, setMandantesSeleccionados] = useState<string[]>([]);
  const [asistenciaInput, setAsistenciaInput] = useState<Record<string, { estado: ReunionAsistencia["estado"]; observacion: string }>>({});
  const [busquedaTrabajador, setBusquedaTrabajador] = useState("");
  const [searchTermMeetings, setSearchTermMeetings] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroConvocatoria, setFiltroConvocatoria] = useState("Todos");
  const [creationTab, setCreationTab] = useState<"realizada" | "programada">("realizada");
  const [observacion, setObservacion] = useState("");

  // Advanced Filters
  const [filtroContrato, setFiltroContrato] = useState("Todos");
  const [filtroMandante, setFiltroMandante] = useState("Todos");
  const [filtroAsistenciaMin, setFiltroAsistenciaMin] = useState("Todos");
  const [filtroTrabajadorId, setFiltroTrabajadorId] = useState("Todos");

  useEffect(() => {
    fetchReuniones();
    fetchContratos();
    fetchTrabajadores();
  }, [fetchReuniones, fetchContratos, fetchTrabajadores]);

  const dashboardStats = useMemo(() => {
    const totalReuniones = reuniones.length;
    const realizadas = reuniones.filter(r => r.estado === "realizada");
    const programadas = reuniones.filter(r => r.estado === "programada");
    
    let totalAsistencias = 0;
    let totalPresentes = 0;
    let totalAusentes = 0;
    
    realizadas.forEach(r => {
      const asist = r.reuniones_asistencia || [];
      totalAsistencias += asist.length;
      totalPresentes += asist.filter(a => a.estado === "presente").length;
      totalAusentes += asist.filter(a => a.estado === "ausente").length;
    });
    
    const promedioAsistencia = totalAsistencias > 0 
      ? Math.round((totalPresentes / totalAsistencias) * 100) 
      : 0;
      
    const otros = totalAsistencias - totalPresentes - totalAusentes;
    
    return {
      totalReuniones,
      realizadas: realizadas.length,
      programadas: programadas.length,
      promedioAsistencia,
      presentes: totalPresentes,
      ausentes: totalAusentes,
      otros
    };
  }, [reuniones]);

  // Contratos activos y mandantes activos
  const activeContratos = useMemo(() => contratos.filter(c => c.estado === "Activo"), [contratos]);
  const activeMandantes = useMemo(() => mandantes.filter(m => m.activo), [mandantes]);

  // Lista de trabajadores activos asignados
  const trabajadoresAsignadosActivos = useMemo(() => {
    const map = new Map<string, { id_trabajador: string; nombre: string; rut?: string; contrato_nombre: string; mandante_nombre: string }>();
    
    contratos
      .filter(c => c.estado === "Activo")
      .forEach(c => {
        const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
        c.trabajadores_asignados
          .filter(ta => ta.activo)
          .forEach(ta => {
            if (!map.has(ta.id_trabajador)) {
              map.set(ta.id_trabajador, {
                id_trabajador: ta.id_trabajador,
                nombre: ta.nombre,
                rut: ta.rut,
                contrato_nombre: c.nombre_contrato,
                mandante_nombre: mandante?.nombre || "N/A"
              });
            }
          });
      });

    return Array.from(map.values());
  }, [contratos, mandantes]);

  // Filtrar convocados para la nueva reunión
  const convocados = useMemo(() => {
    if (filtroTipo === "todos") {
      return trabajadoresAsignadosActivos;
    }
    if (filtroTipo === "contratos") {
      const set = new Set(contratosSeleccionados);
      const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
      contratos
        .filter(c => set.has(c.id_contrato))
        .forEach(c => {
          const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
          c.trabajadores_asignados
            .filter(ta => ta.activo)
            .forEach(ta => {
              listMap.set(ta.id_trabajador, {
                id_trabajador: ta.id_trabajador,
                nombre: ta.nombre,
                rut: ta.rut,
                contrato_nombre: c.nombre_contrato,
                mandante_nombre: mandante?.nombre || "N/A"
              });
            });
        });
      return Array.from(listMap.values());
    }
    if (filtroTipo === "mandantes") {
      const set = new Set(mandantesSeleccionados);
      const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
      contratos
        .filter(c => set.has(c.id_mandante))
        .forEach(c => {
          const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
          c.trabajadores_asignados
            .filter(ta => ta.activo)
            .forEach(ta => {
              listMap.set(ta.id_trabajador, {
                id_trabajador: ta.id_trabajador,
                nombre: ta.nombre,
                rut: ta.rut,
                contrato_nombre: c.nombre_contrato,
                mandante_nombre: mandante?.nombre || "N/A"
              });
            });
        });
      return Array.from(listMap.values());
    }
    return [];
  }, [filtroTipo, contratosSeleccionados, mandantesSeleccionados, trabajadoresAsignadosActivos, contratos, mandantes]);

  const filteredReuniones = useMemo(() => {
    return reuniones.filter(r => {
      const q = searchTermMeetings.toLowerCase();
      const matchSearch = !q.trim() || 
        r.tema.toLowerCase().includes(q) ||
        r.fecha.toLowerCase().includes(q) ||
        r.filtro_tipo.toLowerCase().includes(q) ||
        (r.observacion && r.observacion.toLowerCase().includes(q));

      const matchDateInicio = !fechaInicio || r.fecha >= fechaInicio;
      const matchDateFin = !fechaFin || r.fecha <= fechaFin;

      const matchConv = filtroConvocatoria === "Todos" || r.filtro_tipo === filtroConvocatoria;

      // Filter by specific Contract
      let matchContrato = true;
      if (filtroContrato !== "Todos") {
        if (r.filtro_tipo === "todos") {
          matchContrato = true;
        } else if (r.filtro_tipo === "contratos") {
          matchContrato = r.contratos_filtrados?.includes(filtroContrato) || false;
        } else if (r.filtro_tipo === "mandantes") {
          const cObj = contratos.find(c => c.id_contrato === filtroContrato);
          matchContrato = cObj ? r.mandantes_filtrados?.includes(cObj.id_mandante) : false;
        }
      }

      // Filter by specific Mandante
      let matchMandante = true;
      if (filtroMandante !== "Todos") {
        if (r.filtro_tipo === "todos") {
          matchMandante = true;
        } else if (r.filtro_tipo === "contratos") {
          matchMandante = r.contratos_filtrados?.some(cid => {
            const cObj = contratos.find(c => c.id_contrato === cid);
            return cObj?.id_mandante === filtroMandante;
          }) || false;
        } else if (r.filtro_tipo === "mandantes") {
          matchMandante = r.mandantes_filtrados?.includes(filtroMandante) || false;
        }
      }

      // Filter by Attendance %
      let matchAsistenciaRange = true;
      if (filtroAsistenciaMin !== "Todos") {
        if (r.estado === "programada") {
          matchAsistenciaRange = false;
        } else {
          const asist = r.reuniones_asistencia || [];
          const total = asist.length;
          const presentes = asist.filter(a => a.estado === "presente").length;
          const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
          
          if (filtroAsistenciaMin === "<50") matchAsistenciaRange = pct < 50;
          else if (filtroAsistenciaMin === "<75") matchAsistenciaRange = pct < 75;
          else if (filtroAsistenciaMin === "75-90") matchAsistenciaRange = pct >= 75 && pct <= 90;
          else if (filtroAsistenciaMin === ">90") matchAsistenciaRange = pct > 90;
        }
      }

      // Filter by Worker participation
      let matchTrabajador = true;
      if (filtroTrabajadorId !== "Todos") {
        const asist = r.reuniones_asistencia || [];
        const enAsist = asist.some(a => a.id_trabajador === filtroTrabajadorId);
        if (enAsist) {
          matchTrabajador = true;
        } else if (r.estado === "programada") {
          const wAsignado = trabajadoresAsignadosActivos.find(t => t.id_trabajador === filtroTrabajadorId);
          if (!wAsignado) {
            matchTrabajador = false;
          } else {
            if (r.filtro_tipo === "todos") {
              matchTrabajador = true;
            } else if (r.filtro_tipo === "contratos") {
              const cObj = contratos.find(c => c.nombre_contrato === wAsignado.contrato_nombre);
              matchTrabajador = cObj ? r.contratos_filtrados?.includes(cObj.id_contrato) : false;
            } else if (r.filtro_tipo === "mandantes") {
              const mObj = mandantes.find(m => m.nombre === wAsignado.mandante_nombre);
              matchTrabajador = mObj ? r.mandantes_filtrados?.includes(mObj.id_mandante) : false;
            }
          }
        } else {
          matchTrabajador = false;
        }
      }

      return matchSearch && matchDateInicio && matchDateFin && matchConv && matchContrato && matchMandante && matchAsistenciaRange && matchTrabajador;
    });
  }, [reuniones, searchTermMeetings, fechaInicio, fechaFin, filtroConvocatoria, filtroContrato, filtroMandante, filtroAsistenciaMin, filtroTrabajadorId, contratos, mandantes, trabajadoresAsignadosActivos]);

  const convocadosProgramados = useMemo(() => {
    if (!selectedReunionForAttendance) return [];
    const ft = selectedReunionForAttendance.filtro_tipo;
    if (ft === "todos") {
      return trabajadoresAsignadosActivos;
    }
    if (ft === "contratos") {
      const set = new Set(selectedReunionForAttendance.contratos_filtrados || []);
      const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
      contratos
        .filter(c => set.has(c.id_contrato))
        .forEach(c => {
          const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
          c.trabajadores_asignados
            .filter(ta => ta.activo)
            .forEach(ta => {
              listMap.set(ta.id_trabajador, {
                id_trabajador: ta.id_trabajador,
                nombre: ta.nombre,
                rut: ta.rut,
                contrato_nombre: c.nombre_contrato,
                mandante_nombre: mandante?.nombre || "N/A"
              });
            });
        });
      return Array.from(listMap.values());
    }
    if (ft === "mandantes") {
      const set = new Set(selectedReunionForAttendance.mandantes_filtrados || []);
      const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
      contratos
        .filter(c => set.has(c.id_mandante))
        .forEach(c => {
          const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
          c.trabajadores_asignados
            .filter(ta => ta.activo)
            .forEach(ta => {
              listMap.set(ta.id_trabajador, {
                id_trabajador: ta.id_trabajador,
                nombre: ta.nombre,
                rut: ta.rut,
                contrato_nombre: c.nombre_contrato,
                mandante_nombre: mandante?.nombre || "N/A"
              });
            });
        });
      return Array.from(listMap.values());
    }
    return [];
  }, [selectedReunionForAttendance, trabajadoresAsignadosActivos, contratos, mandantes]);

  // Inicializar estados de asistencia cuando cambian los convocados
  useEffect(() => {
    const nuevoInput: typeof asistenciaInput = {};
    convocados.forEach(c => {
      nuevoInput[c.id_trabajador] = {
        estado: "presente",
        observacion: ""
      };
    });
    setAsistenciaInput(nuevoInput);
  }, [convocados]);

  // Convocados filtrados por búsqueda
  const convocadosFiltrados = useMemo(() => {
    if (!busquedaTrabajador.trim()) return convocados;
    const q = busquedaTrabajador.toLowerCase();
    return convocados.filter(c => 
      c.nombre.toLowerCase().includes(q) || 
      (c.rut && c.rut.toLowerCase().includes(q))
    );
  }, [convocados, busquedaTrabajador]);

  // Ver detalle de una reunión
  const handleVerDetalle = async (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setView("detail");
    setLoadingDetail(true);
    const asist = await fetchAsistencias(reunion.id_reunion);
    setSelectedAsistencias(asist);
    setLoadingDetail(false);
  };

  // Marcar todos los convocados como Presente
  const handleMarcarTodosPresente = () => {
    const actualizado = { ...asistenciaInput };
    convocados.forEach(c => {
      actualizado[c.id_trabajador] = {
        ...actualizado[c.id_trabajador],
        estado: "presente"
      };
    });
    setAsistenciaInput(actualizado);
  };

  // Guardar reunión y asistencia
  const handleGuardarReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema.trim()) {
      alert("Por favor ingrese el tema de la reunión.");
      return;
    }
    if (convocados.length === 0) {
      alert("No hay trabajadores convocados en el filtro seleccionado.");
      return;
    }

    const rData = {
      tema,
      fecha,
      filtro_tipo: filtroTipo,
      contratos_filtrados: filtroTipo === "contratos" ? contratosSeleccionados : [],
      mandantes_filtrados: filtroTipo === "mandantes" ? mandantesSeleccionados : [],
      estado: creationTab,
      observacion: creationTab === "programada" && observacion.trim() ? observacion : null,
      creado_por: "Operador General"
    };

    const asistList = convocados.map(c => {
      const input = asistenciaInput[c.id_trabajador] || { estado: "presente", observacion: "" };
      return {
        id_trabajador: c.id_trabajador,
        estado: input.estado,
        observacion: input.observacion || undefined,
        editado_por: "Operador General"
      };
    });

    const success = await crearReunion(rData, creationTab === "realizada" ? asistList : []);
    if (success) {
      // Limpiar y volver
      setTema("");
      setFecha(new Date().toISOString().split("T")[0]);
      setFiltroTipo("todos");
      setContratosSeleccionados([]);
      setMandantesSeleccionados([]);
      setObservacion("");
      setCreationTab("realizada");
      setView("list");
    } else {
      alert("Hubo un error al guardar la reunión.");
    }
  };

  // Eliminar reunión
  const handleEliminarReunion = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar esta reunión y sus registros de asistencia?")) {
      await eliminarReunion(id);
    }
  };

  const handleExportarHistorialCSV = () => {
    if (filteredReuniones.length === 0) return;
    
    let csvContent = "Fecha,Tema / Reunión,Estado,Observación,Filtro Convocatoria,Total Convocados,Presentes,Ausentes,Otros,% Asistencia,Creado Por\n";
    filteredReuniones.forEach(r => {
      const conv = r.filtro_tipo === "todos" 
        ? "Toda la Dotación" 
        : r.filtro_tipo === "contratos" 
        ? `${r.contratos_filtrados?.length || 0} Contratos`
        : `${r.mandantes_filtrados?.length || 0} Mandantes`;
        
      const asist = r.reuniones_asistencia || [];
      const total = asist.length;
      const presentes = asist.filter(a => a.estado === "presente").length;
      const ausentes = asist.filter(a => a.estado === "ausente").length;
      const otros = total - presentes - ausentes;
      const pct = total > 0 ? `${Math.round((presentes / total) * 100)}%` : "—";
      const estadoStr = r.estado === "programada" ? "Programada" : "Realizada";
      const obs = r.observacion ? `"${r.observacion.replace(/"/g, '""')}"` : "";

      csvContent += `${r.fecha},"${r.tema.replace(/"/g, '""')}",${estadoStr},${obs},${conv},${r.estado === 'programada' ? '—' : total},${r.estado === 'programada' ? '—' : presentes},${r.estado === 'programada' ? '—' : ausentes},${r.estado === 'programada' ? '—' : otros},${r.estado === 'programada' ? '—' : pct},${r.creado_por}\n`;
    });
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_reuniones.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportarConsolidadoCSV = () => {
    if (filteredReuniones.length === 0) return;
    
    let csvContent = "Fecha Reunión,Tema Reunión,Estado Reunión,Nombre Trabajador,Identificación,Estado Asistencia,Observación Trabajador,Contrato Trabajador,Mandante Trabajador\n";
    
    filteredReuniones.forEach(r => {
      const asist = r.reuniones_asistencia || [];
      asist.forEach(a => {
        const w = trabajadores.find(t => t.id_trabajador === a.id_trabajador);
        const name = w ? `"${w.nombre_1} ${w.apellido_paterno}"` : "Cargando...";
        const iden = w ? `"${w.numero_identificacion}"` : "—";
        const estado = ESTADO_CONFIG[a.estado]?.label || a.estado;
        const obs = a.observacion ? `"${a.observacion.replace(/"/g, '""')}"` : "";
        
        const matchingWorkerInfo = trabajadoresAsignadosActivos.find(t => t.id_trabajador === a.id_trabajador);
        const contrato = matchingWorkerInfo ? `"${matchingWorkerInfo.contrato_nombre}"` : "—";
        const mandante = matchingWorkerInfo ? `"${matchingWorkerInfo.mandante_nombre}"` : "—";
        
        csvContent += `${r.fecha},"${r.tema.replace(/"/g, '""')}",${r.estado === 'programada' ? 'Programada' : 'Realizada'},${name},${iden},${estado},${obs},${contrato},${mandante}\n`;
      });
    });
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asistencias_consolidadas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportarAsistenciaCSV = () => {
    if (!selectedReunion || selectedAsistencias.length === 0) return;
    
    let csvContent = "Nombre Trabajador,Identificación,Estado,Observación,Contrato,Mandante\n";
    selectedAsistencias.forEach(a => {
      const w = trabajadores.find(t => t.id_trabajador === a.id_trabajador);
      const name = w ? `"${w.nombre_1} ${w.apellido_paterno}"` : "Cargando...";
      const iden = w ? `"${w.numero_identificacion}"` : "—";
      const estado = ESTADO_CONFIG[a.estado]?.label || a.estado;
      const obs = a.observacion ? `"${a.observacion.replace(/"/g, '""')}"` : "";
      
      const matchingWorkerInfo = trabajadoresAsignadosActivos.find(t => t.id_trabajador === a.id_trabajador);
      const contrato = matchingWorkerInfo ? `"${matchingWorkerInfo.contrato_nombre}"` : "—";
      const mandante = matchingWorkerInfo ? `"${matchingWorkerInfo.mandante_nombre}"` : "—";
      
      csvContent += `${name},${iden},${estado},${obs},${contrato},${mandante}\n`;
    });
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asistencia_reunion_${selectedReunion.tema.replace(/\s+/g, '_')}_${selectedReunion.fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsPorContrato = useMemo(() => {
    if (selectedAsistencias.length === 0) return [];
    const agrupado: Record<string, { total: number; presentes: number }> = {};
    
    selectedAsistencias.forEach(a => {
      const w = trabajadoresAsignadosActivos.find(t => t.id_trabajador === a.id_trabajador);
      const cName = w ? w.contrato_nombre : "Sin Contrato / Otro";
      if (!agrupado[cName]) {
        agrupado[cName] = { total: 0, presentes: 0 };
      }
      agrupado[cName].total += 1;
      if (a.estado === "presente") {
        agrupado[cName].presentes += 1;
      }
    });

    return Object.entries(agrupado).map(([nombre, item]) => ({
      nombre,
      total: item.total,
      presentes: item.presentes,
      porcentaje: Math.round((item.presentes / item.total) * 100)
    })).sort((a, b) => b.porcentaje - a.porcentaje);
  }, [selectedAsistencias, trabajadoresAsignadosActivos]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pt-4 pb-12">
      {/* ── HEADER ── */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <ClipboardCheck className="text-primary" size={32} />
            Asistencia a Reuniones
          </h1>
          <p className="text-sm font-semibold text-text-soft mt-1">
            Registro, convocatoria y control de asistencias por grupos de contratos, mandantes o dotación completa.
          </p>
        </div>
        
        {view === "list" && (
          <button
            onClick={() => setView("create")}
            className="btn btn-accent py-2 text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Nueva Reunión
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════
          VIEW: LISTA DE REUNIONES
          ════════════════════════════════════════════════════════════════════════════ */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="stat-box flex items-center gap-3.5 p-4 rounded-xl bg-surface border border-border">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Total Reuniones</span>
                <span className="text-lg font-bold text-text">{dashboardStats.totalReuniones}</span>
              </div>
            </div>

            <div className="stat-box flex items-center gap-3.5 p-4 rounded-xl bg-surface border border-border">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Realizadas</span>
                <span className="text-lg font-bold text-text">{dashboardStats.realizadas}</span>
              </div>
            </div>

            <div className="stat-box flex items-center gap-3.5 p-4 rounded-xl bg-surface border border-border">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Programadas</span>
                <span className="text-lg font-bold text-text">{dashboardStats.programadas}</span>
              </div>
            </div>

            <div className="stat-box flex items-center gap-3.5 p-4 rounded-xl bg-surface border border-border">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Asistencia Prom.</span>
                <span className="text-lg font-bold text-text">{dashboardStats.promedioAsistencia}%</span>
              </div>
            </div>

            <div className="stat-box flex items-center gap-3.5 p-4 rounded-xl bg-surface border border-border col-span-2 lg:col-span-1">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Presentes / Ausentes</span>
                <span className="text-xs font-bold text-text block mt-1">
                  P: {dashboardStats.presentes} | A: {dashboardStats.ausentes}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card space-y-4">
            {/* Fila 1: Filtros de Búsqueda y Convocatoria */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search input */}
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-soft" />
                <input
                  type="text"
                  value={searchTermMeetings}
                  onChange={(e) => setSearchTermMeetings(e.target.value)}
                  placeholder="Buscar reunión por tema u observación..."
                  className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 pl-9 pr-4 text-xs font-semibold placeholder:text-text-soft focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Convocatoria type filter */}
              <div className="w-[180px]">
                <select
                  value={filtroConvocatoria}
                  onChange={(e) => setFiltroConvocatoria(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="Todos">Todas las Convocatorias</option>
                  <option value="todos">Toda la Dotación</option>
                  <option value="contratos">Por Contratos</option>
                  <option value="mandantes">Por Mandantes</option>
                </select>
              </div>

              {/* Date Start */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider text-nowrap">Desde</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-medium"
                />
              </div>

              {/* Date End */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider text-nowrap">Hasta</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-medium"
                />
              </div>
            </div>

            {/* Fila 2: Filtros Avanzados (Contrato, Mandante, Asistencia, Trabajador) y Botones de Exportar */}
            <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border/50">
              {/* Filtro Contrato */}
              <div className="w-[200px]">
                <select
                  value={filtroContrato}
                  onChange={(e) => setFiltroContrato(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="Todos">Todos los Contratos</option>
                  {activeContratos.map(c => (
                    <option key={c.id_contrato} value={c.id_contrato}>{c.nombre_contrato}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Mandante */}
              <div className="w-[200px]">
                <select
                  value={filtroMandante}
                  onChange={(e) => setFiltroMandante(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="Todos">Todos los Mandantes</option>
                  {activeMandantes.map(m => (
                    <option key={m.id_mandante} value={m.id_mandante}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Asistencia Mínima */}
              <div className="w-[180px]">
                <select
                  value={filtroAsistenciaMin}
                  onChange={(e) => setFiltroAsistenciaMin(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="Todos">Toda la Asistencia</option>
                  <option value="<50">Baja Asistencia (&lt; 50%)</option>
                  <option value="<75">Media-Baja Asistencia (&lt; 75%)</option>
                  <option value="75-90">Media-Alta Asistencia (75% - 90%)</option>
                  <option value=">90">Alta Asistencia (&gt; 90%)</option>
                </select>
              </div>

              {/* Filtro Trabajador */}
              <div className="w-[200px]">
                <select
                  value={filtroTrabajadorId}
                  onChange={(e) => setFiltroTrabajadorId(e.target.value)}
                  className="w-full bg-surface-2 border border-border text-text text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="Todos">Todos los Trabajadores</option>
                  {trabajadores.map(t => (
                    <option key={t.id_trabajador} value={t.id_trabajador}>
                      {t.nombre_1} {t.apellido_paterno}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones de Exportar agrupados a la derecha */}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleExportarHistorialCSV}
                  className="btn btn-secondary py-2 px-3.5 text-xs font-bold"
                  disabled={filteredReuniones.length === 0}
                  title="Exportar listado de reuniones filtradas"
                >
                  Exportar Historial CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportarConsolidadoCSV}
                  className="btn btn-secondary py-2 px-3.5 text-xs font-bold"
                  disabled={filteredReuniones.length === 0}
                  title="Exportar reporte de asistencia detallado de todas las reuniones filtradas"
                >
                  Exportar Asistencias CSV
                </button>
              </div>
            </div>
          </div>

          <div className="table-shell">
            <div className="px-5 py-4 border-b border-border bg-surface flex items-center justify-between">
              <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Historial de Reuniones
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-2 border-b border-border">
                  <tr>
                    {["Fecha", "Tema / Reunión", "Estado", "Convocatoria", "Asistencia / Convocados", "Detalle Asistencia", "Creado Por", "Acciones"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-[11px] font-bold text-text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReuniones.map((reunion) => {
                    const totalFiltro = 
                      reunion.filtro_tipo === "todos" 
                        ? "Toda la Dotación" 
                        : reunion.filtro_tipo === "contratos" 
                        ? `${reunion.contratos_filtrados?.length || 0} Contratos`
                        : `${reunion.mandantes_filtrados?.length || 0} Mandantes`;

                    const asist = reunion.reuniones_asistencia || [];
                    const total = asist.length;
                    const presentes = asist.filter(a => a.estado === "presente").length;
                    const ausentes = asist.filter(a => a.estado === "ausente").length;
                    const otros = total - presentes - ausentes;
                    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;

                    return (
                      <tr key={reunion.id_reunion} className="hover:bg-surface-2 transition-colors">
                        <td className="px-5 py-4 text-text font-semibold whitespace-nowrap">
                          {reunion.fecha}
                        </td>
                        <td className="px-5 py-4 text-text font-bold max-w-xs truncate" title={reunion.tema}>
                          <div className="flex flex-col">
                            <span>{reunion.tema}</span>
                            {reunion.observacion && (
                              <span className="text-[10px] text-text-soft font-normal truncate mt-0.5">
                                Nota: {reunion.observacion}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            reunion.estado === "programada"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {reunion.estado === "programada" ? "Programada" : "Realizada"}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            reunion.filtro_tipo === "todos"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : reunion.filtro_tipo === "contratos"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {totalFiltro}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-text font-semibold">
                          {reunion.estado === "programada" ? (
                            <span className="text-text-muted text-xs italic">Pendiente</span>
                          ) : (
                            <span className={`${porcentaje >= 80 ? "text-emerald-400" : porcentaje >= 50 ? "text-amber-400" : "text-red-400"}`}>
                              {porcentaje}% <span className="text-text-muted font-normal text-xs">({presentes}/{total})</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {reunion.estado === "programada" ? (
                            <span className="text-text-muted text-xs italic">—</span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded" title="Presentes">P: {presentes}</span>
                              <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded" title="Ausentes">A: {ausentes}</span>
                              {otros > 0 && (
                                <span className="px-1.5 py-0.5 bg-zinc-500/10 text-zinc-400 rounded" title="Otros Estados">O: {otros}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-text-soft font-semibold whitespace-nowrap">
                          {reunion.creado_por}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {reunion.estado === "programada" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  // Iniciar asistencia de reunión programada
                                  setSelectedReunionForAttendance(reunion);
                                  const ft = reunion.filtro_tipo;
                                  let convList: typeof trabajadoresAsignadosActivos = [];
                                  if (ft === "todos") {
                                    convList = trabajadoresAsignadosActivos;
                                  } else if (ft === "contratos") {
                                    const set = new Set(reunion.contratos_filtrados || []);
                                    const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
                                    contratos
                                      .filter(c => set.has(c.id_contrato))
                                      .forEach(c => {
                                        const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
                                        c.trabajadores_asignados
                                          .filter(ta => ta.activo)
                                          .forEach(ta => {
                                            listMap.set(ta.id_trabajador, {
                                              id_trabajador: ta.id_trabajador,
                                              nombre: ta.nombre,
                                              rut: ta.rut,
                                              contrato_nombre: c.nombre_contrato,
                                              mandante_nombre: mandante?.nombre || "N/A"
                                            });
                                          });
                                      });
                                    convList = Array.from(listMap.values());
                                  } else if (ft === "mandantes") {
                                    const set = new Set(reunion.mandantes_filtrados || []);
                                    const listMap = new Map<string, typeof trabajadoresAsignadosActivos[0]>();
                                    contratos
                                      .filter(c => set.has(c.id_mandante))
                                      .forEach(c => {
                                        const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
                                        c.trabajadores_asignados
                                          .filter(ta => ta.activo)
                                          .forEach(ta => {
                                            listMap.set(ta.id_trabajador, {
                                              id_trabajador: ta.id_trabajador,
                                              nombre: ta.nombre,
                                              rut: ta.rut,
                                              contrato_nombre: c.nombre_contrato,
                                              mandante_nombre: mandante?.nombre || "N/A"
                                            });
                                          });
                                      });
                                    convList = Array.from(listMap.values());
                                  }
                                  
                                  const nuevoInput: typeof asistenciaInput = {};
                                  convList.forEach(c => {
                                    nuevoInput[c.id_trabajador] = {
                                      estado: "presente",
                                      observacion: ""
                                    };
                                  });
                                  setAsistenciaInput(nuevoInput);
                                  setView("take_attendance");
                                }}
                                className="p-1.5 rounded-lg border border-sky-500/20 bg-surface text-sky-400 hover:text-sky-300 hover:bg-sky-500/5 transition-colors"
                                title="Tomar Asistencia"
                              >
                                <ClipboardCheck size={15} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleVerDetalle(reunion)}
                                className="p-1.5 rounded-lg border border-border bg-surface text-text-soft hover:text-text hover:bg-surface-2 transition-colors"
                                title="Ver Detalle"
                              >
                                <Eye size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEliminarReunion(reunion.id_reunion)}
                              className="p-1.5 rounded-lg border border-red-500/20 bg-surface text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredReuniones.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-text-soft text-sm font-medium italic">
                        {searchTermMeetings.trim() ? "No se encontraron reuniones que coincidan con la búsqueda." : "No hay reuniones registradas. Presione \"Nueva Reunión\" para registrar la primera."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          VIEW: CREAR REUNIÓN Y REGISTRAR ASISTENCIA
          ════════════════════════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════════════════════
          VIEW: CREAR REUNIÓN Y REGISTRAR ASISTENCIA
          ════════════════════════════════════════════════════════════════════════════ */}
      {view === "create" && (
        <form onSubmit={handleGuardarReunion} className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView("list")}
              className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-text">Nueva Reunión</h2>
              <p className="text-xs text-text-soft font-semibold mt-0.5">
                {creationTab === "realizada" 
                  ? "Ingresa los datos, convoca por filtros y marca la asistencia inmediata."
                  : "Planifica una reunión anticipadamente para registrar su asistencia después."}
              </p>
            </div>
          </div>

          {/* Selector de pestañas para Modo de Creación */}
          <div className="flex gap-4 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setCreationTab("realizada")}
              className={`pb-2 text-xs font-bold border-b-2 transition-all uppercase tracking-wider ${
                creationTab === "realizada"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Registrar Realizada
            </button>
            <button
              type="button"
              onClick={() => setCreationTab("programada")}
              className={`pb-2 text-xs font-bold border-b-2 transition-all uppercase tracking-wider ${
                creationTab === "programada"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Programar Anticipada
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Datos / Filtros */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">1. Datos de la Reunión</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-soft">Tema de la Reunión</label>
                  <input
                    type="text"
                    required
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ej. Charla de Seguridad de Inicio de Turno"
                    className="w-full bg-surface border border-border text-text rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-soft">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-surface border border-border text-text rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {creationTab === "programada" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-soft">Observación (Opcional)</label>
                    <textarea
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Instrucciones, notas pre-reunión o comentarios..."
                      rows={3}
                      className="w-full bg-surface border border-border text-text rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="card space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">2. Filtros de Convocatoria</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["todos", "contratos", "mandantes"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFiltroTipo(t)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all uppercase tracking-wider ${
                        filtroTipo === t
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface border-border text-text-muted hover:bg-surface-2"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Sub-filtros por Contratos */}
                {filtroTipo === "contratos" && (
                  <div className="space-y-3 bg-surface-2 p-3.5 rounded-xl border border-border">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <FileText size={14} className="text-primary" /> Seleccionar Contratos
                    </label>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {activeContratos.map((c) => {
                        const isChecked = contratosSeleccionados.includes(c.id_contrato);
                        return (
                          <label key={c.id_contrato} className="flex items-center gap-3 text-xs font-semibold text-text-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setContratosSeleccionados(prev =>
                                  isChecked
                                    ? prev.filter(id => id !== c.id_contrato)
                                    : [...prev, c.id_contrato]
                                );
                              }}
                              className="rounded border-border text-primary focus:ring-0 bg-surface w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-text font-bold block truncate">{c.nombre_contrato}</span>
                              <span className="text-[10px] text-text-muted font-mono">{c.codigo_contrato}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-filtros por Mandantes */}
                {filtroTipo === "mandantes" && (
                  <div className="space-y-3 bg-surface-2 p-3.5 rounded-xl border border-border">
                    <label className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Building2 size={14} className="text-primary" /> Seleccionar Mandantes
                    </label>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {activeMandantes.map((m) => {
                        const isChecked = mandantesSeleccionados.includes(m.id_mandante);
                        return (
                          <label key={m.id_mandante} className="flex items-center gap-3 text-xs font-semibold text-text-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setMandantesSeleccionados(prev =>
                                  isChecked
                                    ? prev.filter(id => id !== m.id_mandante)
                                    : [...prev, m.id_mandante]
                                );
                              }}
                              className="rounded border-border text-primary focus:ring-0 bg-surface w-4 h-4 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-text font-bold block truncate">{m.nombre}</span>
                              <span className="text-[10px] text-text-muted font-mono">{m.rut}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Asistencia / Mensaje Programación */}
            <div className="lg:col-span-2 space-y-4">
              {creationTab === "programada" ? (
                <div className="card flex flex-col items-center justify-center text-center p-12 h-full min-h-[350px] border border-dashed border-border/85">
                  <div className="p-4 rounded-full bg-sky-500/10 text-sky-400 mb-4 animate-pulse">
                    <Calendar size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-text">Reunión en Planificación Anticipada</h3>
                  <p className="text-sm text-text-soft max-w-md mt-2 font-medium">
                    Estás programando una reunión para el <strong className="text-text font-bold">{fecha}</strong>.
                  </p>
                  <p className="text-xs text-text-muted max-w-sm mt-3 leading-relaxed">
                    Hay <strong className="text-text font-bold">{convocados.length} trabajadores convocados</strong> bajo el filtro seleccionado. La asistencia no se registra ahora; podrás tomarla directamente desde el historial cuando se lleve a cabo.
                  </p>
                  
                  <div className="flex gap-3 mt-8 pt-6 border-t border-border/50 w-full justify-end">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="btn btn-secondary py-2 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={convocados.length === 0}
                      className="btn btn-accent py-2 text-xs flex items-center gap-1.5"
                    >
                      <Check size={15} /> Programar Reunión Anticipada
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-text flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        3. Registro de Asistencia
                      </h3>
                      <p className="text-[11px] text-text-soft mt-0.5 font-semibold">
                        {convocados.length} convocados en total.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleMarcarTodosPresente}
                        className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
                      >
                        <UserCheck size={14} /> Todos Presentes
                      </button>
                    </div>
                  </div>

                  {/* Filtro rápido de búsqueda de trabajador */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-soft" />
                    <input
                      type="text"
                      value={busquedaTrabajador}
                      onChange={(e) => setBusquedaTrabajador(e.target.value)}
                      placeholder="Buscar convocado por nombre o RUT..."
                      className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 pl-9 pr-4 text-xs font-semibold placeholder:text-text-soft focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  {/* Tabla de Convocados */}
                  <div className="border border-border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-surface-2 border-b border-border sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Trabajador</th>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Estado Asistencia</th>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Observación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {convocadosFiltrados.map((c) => {
                          const inputVal = asistenciaInput[c.id_trabajador] || { estado: "presente", observacion: "" };
                          
                          return (
                            <tr key={c.id_trabajador} className="hover:bg-surface-2 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-text">{c.nombre}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{c.contrato_nombre}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(ESTADO_CONFIG).map(([k, cfg]) => {
                                    const isActive = inputVal.estado === k;
                                    return (
                                      <button
                                        key={k}
                                        type="button"
                                        onClick={() => {
                                          setAsistenciaInput(prev => ({
                                            ...prev,
                                            [c.id_trabajador]: {
                                              ...prev[c.id_trabajador],
                                              estado: k as ReunionAsistencia["estado"]
                                            }
                                          }));
                                        }}
                                        className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                          isActive
                                            ? `${cfg.bg} scale-105 shadow-sm`
                                            : "bg-surface border-border text-text-muted hover:text-text hover:bg-surface-2"
                                        }`}
                                        title={cfg.label}
                                      >
                                        {cfg.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  placeholder="Observaciones..."
                                  value={inputVal.observacion}
                                  onChange={(e) => {
                                    setAsistenciaInput(prev => ({
                                      ...prev,
                                      [c.id_trabajador]: {
                                        ...prev[c.id_trabajador],
                                        observacion: e.target.value
                                      }
                                    }));
                                  }}
                                  className="w-full bg-surface-2 border border-border text-text rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-primary transition-colors font-medium"
                                />
                              </td>
                            </tr>
                          );
                        })}
                        {convocadosFiltrados.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-12 text-center text-text-soft font-semibold italic">
                              No se encontraron trabajadores convocados en el filtro o búsqueda actual.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="btn btn-secondary py-2 text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={convocados.length === 0}
                      className="btn btn-accent py-2 text-xs flex items-center gap-1.5"
                    >
                      <Check size={15} /> Guardar Reunión y Asistencia
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          VIEW: TOMAR ASISTENCIA A REUNIÓN PROGRAMADA
          ════════════════════════════════════════════════════════════════════════════ */}
      {view === "take_attendance" && selectedReunionForAttendance && (
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const asistList = convocadosProgramados.map(c => {
              const input = asistenciaInput[c.id_trabajador] || { estado: "presente", observacion: "" };
              return {
                id_trabajador: c.id_trabajador,
                estado: input.estado,
                observacion: input.observacion || undefined,
                editado_por: "Operador General"
              };
            });
            const success = await registrarAsistenciaProgramada(selectedReunionForAttendance.id_reunion, asistList);
            if (success) {
              setView("list");
              setSelectedReunionForAttendance(null);
            } else {
              alert("Hubo un error al registrar la asistencia.");
            }
          }} 
          className="space-y-6 animate-fadeIn"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setView("list");
                setSelectedReunionForAttendance(null);
              }}
              className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-text">Registrar Asistencia</h2>
              <p className="text-xs text-text-soft font-semibold mt-0.5">Completar asistencia de la reunión planificada.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="card space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">Detalles de Planificación</h3>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div>
                    <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Reunión / Tema</span>
                    <span className="text-text text-sm font-bold block bg-surface-2 p-3 rounded-lg border border-border">
                      {selectedReunionForAttendance.tema}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Fecha Programada</span>
                      <span className="text-text font-bold block bg-surface-2 p-3 rounded-lg border border-border">
                        {selectedReunionForAttendance.fecha}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Convocatoria</span>
                      <span className="text-text font-bold block bg-surface-2 p-3 rounded-lg border border-border uppercase tracking-wider text-[10px]">
                        {selectedReunionForAttendance.filtro_tipo}
                      </span>
                    </div>
                  </div>

                  {selectedReunionForAttendance.observacion && (
                    <div>
                      <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Observación Inicial</span>
                      <span className="text-text font-medium block bg-surface-2 p-3 rounded-lg border border-border whitespace-pre-wrap">
                        {selectedReunionForAttendance.observacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="card space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-text flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      Listado de Convocados
                    </h3>
                    <p className="text-[11px] text-text-soft mt-0.5 font-semibold">
                      {convocadosProgramados.length} trabajadores convocados.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const actualizado = { ...asistenciaInput };
                      convocadosProgramados.forEach(c => {
                        actualizado[c.id_trabajador] = {
                          ...actualizado[c.id_trabajador],
                          estado: "presente"
                        };
                      });
                      setAsistenciaInput(actualizado);
                    }}
                    className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"
                  >
                    <UserCheck size={14} /> Todos Presentes
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-soft" />
                  <input
                    type="text"
                    value={busquedaTrabajador}
                    onChange={(e) => setBusquedaTrabajador(e.target.value)}
                    placeholder="Buscar convocado por nombre o RUT..."
                    className="w-full bg-surface-2 border border-border text-text rounded-lg py-2 pl-9 pr-4 text-xs font-semibold placeholder:text-text-soft focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="border border-border rounded-xl overflow-hidden max-h-[450px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-surface-2 border-b border-border sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Trabajador</th>
                        <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Estado Asistencia</th>
                        <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Observación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {convocadosProgramados
                        .filter(c => {
                          if (!busquedaTrabajador.trim()) return true;
                          const q = busquedaTrabajador.toLowerCase();
                          return c.nombre.toLowerCase().includes(q) || (c.rut && c.rut.toLowerCase().includes(q));
                        })
                        .map((c) => {
                          const inputVal = asistenciaInput[c.id_trabajador] || { estado: "presente", observacion: "" };
                          return (
                            <tr key={c.id_trabajador} className="hover:bg-surface-2 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-text">{c.nombre}</p>
                                <p className="text-[10px] text-text-muted mt-0.5">{c.contrato_nombre}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(ESTADO_CONFIG).map(([k, cfg]) => {
                                    const isActive = inputVal.estado === k;
                                    return (
                                      <button
                                        key={k}
                                        type="button"
                                        onClick={() => {
                                          setAsistenciaInput(prev => ({
                                            ...prev,
                                            [c.id_trabajador]: {
                                              ...prev[c.id_trabajador],
                                              estado: k as ReunionAsistencia["estado"]
                                            }
                                          }));
                                        }}
                                        className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                                          isActive
                                            ? `${cfg.bg} scale-105 shadow-sm`
                                            : "bg-surface border-border text-text-muted hover:text-text hover:bg-surface-2"
                                        }`}
                                        title={cfg.label}
                                      >
                                        {cfg.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  placeholder="Observaciones..."
                                  value={inputVal.observacion}
                                  onChange={(e) => {
                                    setAsistenciaInput(prev => ({
                                      ...prev,
                                      [c.id_trabajador]: {
                                        ...prev[c.id_trabajador],
                                        observacion: e.target.value
                                      }
                                    }));
                                  }}
                                  className="w-full bg-surface-2 border border-border text-text rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-primary transition-colors font-medium"
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setView("list");
                      setSelectedReunionForAttendance(null);
                    }}
                    className="btn btn-secondary py-2 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-accent py-2 text-xs flex items-center gap-1.5"
                  >
                    <Check size={15} /> Guardar Asistencia y Finalizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════
          VIEW: DETALLE DE REUNIÓN
          ════════════════════════════════════════════════════════════════════════════ */}
      {view === "detail" && selectedReunion && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("list")}
              className="p-2.5 rounded-xl border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-all shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-text">Detalle de Asistencia a la Reunión</h2>
              <p className="text-xs text-text-soft font-semibold mt-0.5">{selectedReunion.fecha} • Creado por {selectedReunion.creado_por}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resumen / Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">Datos Generales</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Reunión / Tema</span>
                    <span className="text-text text-sm font-bold block bg-surface-2 p-3 rounded-lg border border-border">{selectedReunion.tema}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Fecha</span>
                      <span className="text-text font-bold block bg-surface-2 p-3 rounded-lg border border-border">{selectedReunion.fecha}</span>
                    </div>
                    <div>
                      <span className="text-text-soft block text-[10px] uppercase font-bold tracking-wider mb-1">Filtro Aplicado</span>
                      <span className="text-text font-bold block bg-surface-2 p-3 rounded-lg border border-border uppercase tracking-wider text-[10px]">
                        {selectedReunion.filtro_tipo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="card space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">Estadísticas de Asistencia</h3>
                </div>

                {loadingDetail ? (
                  <p className="text-center py-6 text-xs text-text-soft font-semibold animate-pulse">Cargando métricas...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div>
                        <span className="text-emerald-400 font-bold block text-xl">
                          {selectedAsistencias.filter(a => a.estado === "presente").length}
                        </span>
                        <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Presentes</span>
                      </div>
                      <CheckCircle className="text-emerald-400" size={24} />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div>
                        <span className="text-red-400 font-bold block text-xl">
                          {selectedAsistencias.filter(a => a.estado === "ausente").length}
                        </span>
                        <span className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider">Ausentes</span>
                      </div>
                      <XCircle className="text-red-400" size={24} />
                    </div>

                    <div className="p-4 rounded-xl bg-surface-2 border border-border">
                      <span className="text-text-soft block text-[10px] font-bold uppercase tracking-wider mb-2">Distribución de estados</span>
                      <div className="space-y-2 text-xs font-semibold">
                        {Object.entries(
                          selectedAsistencias.reduce((acc, a) => {
                            acc[a.estado] = (acc[a.estado] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([est, count]) => {
                          const cfg = ESTADO_CONFIG[est as ReunionAsistencia["estado"]] || { label: est, dot: "bg-zinc-400" };
                          return (
                            <div key={est} className="flex justify-between items-center">
                              <span className="flex items-center gap-2 text-text-soft">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                              <strong className="text-text">{count}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desglose por Contrato */}
              <div className="card space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="font-bold text-sm text-text">Desglose por Contrato</h3>
                </div>
                {loadingDetail ? (
                  <p className="text-center py-6 text-xs text-text-soft font-semibold animate-pulse">Cargando...</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {statsPorContrato.map((sc) => (
                      <div key={sc.nombre} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-text-soft truncate max-w-[170px]" title={sc.nombre}>{sc.nombre}</span>
                          <span className="text-text font-bold">{sc.presentes}/{sc.total} ({sc.porcentaje}%)</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: `${sc.porcentaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {statsPorContrato.length === 0 && (
                      <p className="text-xs text-text-muted italic text-center py-4">No hay datos por contrato.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Listado de Asistencia Grabada */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card space-y-4">
                <div className="border-b border-border pb-3 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-text flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Lista de Asistentes
                  </h3>
                  <button
                    type="button"
                    onClick={handleExportarAsistenciaCSV}
                    className="btn btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
                    disabled={selectedAsistencias.length === 0}
                  >
                    Exportar Asistencia CSV
                  </button>
                </div>

                {loadingDetail ? (
                  <div className="py-24 text-center">
                    <Clock className="mx-auto text-primary animate-pulse mb-3" size={32} />
                    <p className="text-xs text-text-soft font-bold">Cargando listado de asistencia...</p>
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-surface-2 border-b border-border sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Trabajador</th>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">RUT</th>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-left font-bold text-text-muted uppercase tracking-wider">Observación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedAsistencias.map((a) => {
                          const w = trabajadores.find(t => t.id_trabajador === a.id_trabajador);
                          const cfg = ESTADO_CONFIG[a.estado] || { label: a.estado, bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" };

                          return (
                            <tr key={a.id} className="hover:bg-surface-2 transition-colors">
                              <td className="px-4 py-3 font-bold text-text">
                                {w ? `${w.nombre_1} ${w.apellido_paterno}` : "Cargando..."}
                              </td>
                              <td className="px-4 py-3 font-mono text-text-soft font-semibold whitespace-nowrap">
                                {w?.numero_identificacion || "—"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-text-soft font-semibold max-w-xs truncate">
                                {a.observacion || <span className="text-text-muted italic">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
