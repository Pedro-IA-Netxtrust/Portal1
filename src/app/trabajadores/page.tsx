"use client";

import React, { useState } from "react";
import { useTrabajadoresStore, Trabajador } from "@/store/trabajadores-store";
import TrabajadorForm from "@/components/custom/trabajador-form";
import TrabajadorDetalle from "@/components/custom/trabajador-detalle";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  Globe, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  Eye, 
  Mail, 
  Phone,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

// Helper: Identificar datos faltantes esenciales
const getDatosFaltantes = (t: Trabajador): string[] => {
  const faltantes: string[] = [];
  
  // 1. Domicilio
  if (!t.region || !t.comuna || !t.calle || !t.numero_domicilio) {
    faltantes.push("Domicilio");
  }
  // 2. Contacto Emergencia
  if (!t.nombre_contacto_emergencia || (!t.celular_personal && !t.telefono_emergencia)) {
    faltantes.push("Contacto Emergencia");
  }
  // 3. Previsión y Salud
  if (!t.afp || !t.sistema_salud) {
    faltantes.push("Previsión/Salud");
  }
  // 4. Datos Bancarios
  if (!t.banco || !t.tipo_cuenta || !t.numero_cuenta) {
    faltantes.push("Datos Bancarios");
  }
  // 5. Tallas EPP
  if (!t.talla_chaqueta || !t.talla_polera || !t.calzado_seguridad) {
    faltantes.push("Tallas EPP");
  }
  
  return faltantes;
};

export default function TrabajadoresPage() {
  const { trabajadores, deleteTrabajador, fetchTrabajadores } = useTrabajadoresStore();

  React.useEffect(() => {
    fetchTrabajadores();
  }, [fetchTrabajadores]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState("Todas");
  const [selectedContract, setSelectedContract] = useState("Todos");
  const [selectedWorkMode, setSelectedWorkMode] = useState("Todas");
  const [selectedAlertStatus, setSelectedAlertStatus] = useState("Todos");
  const [selectedDataStatus, setSelectedDataStatus] = useState("Todos");

  // Modal / Sidebar Trigger State
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTrabajador, setDetailTrabajador] = useState<Trabajador | null>(null);

  // Helper: Open Edit Form
  const handleEdit = (id: string) => {
    setSelectedTrabajadorId(id);
    setFormOpen(true);
  };

  // Helper: Open Create Form
  const handleCreate = () => {
    setSelectedTrabajadorId(null);
    setFormOpen(true);
  };

  // Helper: Open Detailed Profile view
  const handleViewDetails = (t: Trabajador) => {
    setDetailTrabajador(t);
    setDetailOpen(true);
  };

  // Safe delete handler
  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar la ficha de ${name}?`)) {
      deleteTrabajador(id);
    }
  };

  // Calculate Expiration Badge for the listing preview
  const checkSemaforoAlerta = (t: Trabajador): boolean => {
    const dates = [
      t.tipo_identificacion === "RUT" ? t.vencimiento_carnet : t.fecha_vencimiento_id,
      t.vencimiento_licencia_conducir,
      t.vencimiento_altura_geo,
      t.vencimiento_psicosensometrico
    ].filter(Boolean) as string[];

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    return dates.some(dateStr => {
      const vDate = new Date(dateStr);
      vDate.setHours(0,0,0,0);
      return vDate.getTime() - hoy.getTime() < 0; // Expirado
    });
  };

  // Filter Logic
  const filteredTrabajadores = trabajadores.filter((t) => {
    const fullName = `${t.nombre_1} ${t.nombre_2 || ""} ${t.apellido_paterno} ${t.apellido_materno}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      t.numero_identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.cargo && t.cargo.toLowerCase().includes(searchTerm.toLowerCase()));

    const nationalityMatch = selectedNationality === "Todas" || t.nacionalidad === selectedNationality;
    const contractMatch = selectedContract === "Todos" || t.tipo_contrato === selectedContract;
    const workModeMatch = selectedWorkMode === "Todas" || t.modalidad_trabajo === selectedWorkMode;

    const hasAlarms = checkSemaforoAlerta(t);
    const alertMatch = 
      selectedAlertStatus === "Todos" || 
      (selectedAlertStatus === "Alerta" && hasAlarms) || 
      (selectedAlertStatus === "Al Dia" && !hasAlarms);

    const hasMissingData = getDatosFaltantes(t).length > 0;
    const dataMatch = 
      selectedDataStatus === "Todos" || 
      (selectedDataStatus === "Incompletos" && hasMissingData) || 
      (selectedDataStatus === "Completos" && !hasMissingData);

    return searchMatch && nationalityMatch && contractMatch && workModeMatch && alertMatch && dataMatch;
  });

  // Calculate quick indicators
  const totalCount = trabajadores.length;
  const activeAlarms = trabajadores.filter(t => checkSemaforoAlerta(t)).length;
  const uniqueNationalities = ["Todas", ...Array.from(new Set(trabajadores.map(t => t.nacionalidad)))];
  const uniqueContracts = ["Todos", "Indefinido", "Plazo Fijo", "Honorarios", "Práctica"];
  const trabajadoresConDatosFaltantes = trabajadores.filter(t => getDatosFaltantes(t).length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Administración de Trabajadores</h1>
          <p className="text-xs text-zinc-500">
            Fase 1: Módulo de registro centralizado con semáforos de control e identificaciones internacionales.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5"
        >
          <Plus size={16} />
          Registrar Trabajador
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">TOTAL TRABAJADORES</span>
            <span className="text-lg font-bold text-white">{totalCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">CONTRATO INDEFINIDO</span>
            <span className="text-lg font-bold text-white">
              {trabajadores.filter(t => t.tipo_contrato === "Indefinido").length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Globe size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">PERSONAL EXTRANJERO</span>
            <span className="text-lg font-bold text-white">
              {trabajadores.filter(t => t.tipo_identificacion !== "RUT").length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${activeAlarms > 0 ? "bg-red-500/15 text-red-400 animate-pulse" : "bg-zinc-800 text-zinc-400"}`}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">EXÁMENES/DOCS VENCIDOS</span>
            <span className="text-lg font-bold text-white">{activeAlarms}</span>
          </div>
        </div>
      </div>

      {/* Live Search & Filter Bar */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Nombre, RUT, DNI o Cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Nationality Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-zinc-500" />
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              {uniqueNationalities.map(n => (
                <option key={n} value={n}>{n === "Todas" ? "Todas las Nacionalidades" : n}</option>
              ))}
            </select>
          </div>

          {/* Contract Type Filter */}
          <div>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              {uniqueContracts.map(c => (
                <option key={c} value={c}>{c === "Todos" ? "Todos los Contratos" : c}</option>
              ))}
            </select>
          </div>

          {/* Modalidad de Trabajo Filter (Teletrabajo) */}
          <div>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="Todas">Todas las Modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Teletrabajo">Teletrabajo</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          {/* Alertas / Vencimientos Filter */}
          <div>
            <select
              value={selectedAlertStatus}
              onChange={(e) => setSelectedAlertStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="Todos">Todas las Alertas</option>
              <option value="Alerta">Con Vencimientos / Alertas</option>
              <option value="Al Dia">Vigente / Sin Alertas</option>
            </select>
          </div>

          {/* Completitud de Datos Filter */}
          <div>
            <select
              value={selectedDataStatus}
              onChange={(e) => setSelectedDataStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-600 transition-colors"
            >
              <option value="Todos">Todos los Estados de Ficha</option>
              <option value="Completos">Fichas Completas</option>
              <option value="Incompletos">Fichas Incompletas (Datos Faltantes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout containing Listing and the Missing Data section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main List Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTrabajadores.map((trabajador) => {
              const hasAlarms = checkSemaforoAlerta(trabajador);
              const missingFields = getDatosFaltantes(trabajador);
              const hasMissingData = missingFields.length > 0;
              
              return (
                <div 
                  key={trabajador.id_trabajador}
                  className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Identity header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-sm">
                          {trabajador.nombre_1[0]}{trabajador.apellido_paterno[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {trabajador.nombre_1} {trabajador.apellido_paterno} {trabajador.apellido_materno}
                          </h3>
                          <p className="text-xs text-zinc-500 uppercase">{trabajador.tipo_identificacion}: {trabajador.numero_identificacion}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {hasAlarms && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold animate-pulse">
                            <ShieldAlert size={10} />
                            Alerta Vencimiento
                          </span>
                        )}
                        {hasMissingData && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold" title={`Campos faltantes: ${missingFields.join(", ")}`}>
                            <AlertTriangle size={10} />
                            Datos Faltantes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-1.5 text-xs text-zinc-400 pt-1 border-t border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-zinc-600 font-bold uppercase text-[9px]">CARGO</span>
                        <span className="text-zinc-200 font-semibold">{trabajador.cargo || "No registrado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-zinc-600 font-bold uppercase text-[9px]">CORREO</span>
                        <a href={`mailto:${trabajador.email_corporativo}`} className="hover:text-white hover:underline truncate">
                          {trabajador.email_corporativo}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-zinc-600 font-bold uppercase text-[9px]">CELULAR</span>
                        <span>{trabajador.celular_personal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-zinc-800/40">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      trabajador.modalidad_trabajo === "Híbrido" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : trabajador.modalidad_trabajo === "Teletrabajo"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    }`}>
                      {trabajador.modalidad_trabajo}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleViewDetails(trabajador)}
                        title="Ver Ficha Completa"
                        className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        <Eye size={13} />
                      </button>
                      <button 
                        onClick={() => handleEdit(trabajador.id_trabajador)}
                        title="Editar Trabajador"
                        className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(trabajador.id_trabajador, `${trabajador.nombre_1} ${trabajador.apellido_paterno}`)}
                        title="Eliminar Ficha"
                        className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTrabajadores.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
                <Users className="mx-auto text-zinc-600" size={32} />
                <h4 className="text-zinc-300 font-bold text-sm">No se encontraron fichas de trabajadores</h4>
                <p className="text-xs text-zinc-500">Pruebe ajustando el buscador o los filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Apartado de Datos Faltantes (Right Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={16} />
                <h3 className="font-bold text-white text-sm">Fichas Incompletas</h3>
              </div>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
                {trabajadoresConDatosFaltantes.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
              {trabajadoresConDatosFaltantes.map((t) => {
                const faltantes = getDatosFaltantes(t);
                return (
                  <div 
                    key={t.id_trabajador} 
                    className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 
                          onClick={() => handleViewDetails(t)}
                          className="text-xs font-bold text-white hover:text-blue-400 cursor-pointer transition-colors truncate"
                          title={`Ver detalles de ${t.nombre_1} ${t.apellido_paterno}`}
                        >
                          {t.nombre_1} {t.apellido_paterno}
                        </h4>
                        <p className="text-[9px] text-zinc-500 truncate">{t.cargo || "Sin cargo"}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleEdit(t.id_trabajador)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Completar datos"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {faltantes.map((f) => {
                        let badgeIcon = "❓";
                        if (f === "Domicilio") badgeIcon = "🏠";
                        if (f === "Contacto Emergencia") badgeIcon = "📞";
                        if (f === "Previsión/Salud") badgeIcon = "🏥";
                        if (f === "Datos Bancarios") badgeIcon = "💳";
                        if (f === "Tallas EPP") badgeIcon = "👕";
                        
                        return (
                          <span 
                            key={f} 
                            className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center gap-1"
                            title={`Falta: ${f}`}
                          >
                            <span>{badgeIcon}</span>
                            <span>{f}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {trabajadoresConDatosFaltantes.length === 0 && (
                <div className="text-center py-8 text-zinc-500 space-y-2">
                  <CheckCircle2 className="mx-auto text-emerald-500" size={24} />
                  <p className="text-xs font-semibold text-zinc-300">¡Todo al día!</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed px-2">Todas las fichas tienen sus datos esenciales completos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {formOpen && (
        <TrabajadorForm 
          trabajadorId={selectedTrabajadorId || undefined} 
          onClose={() => {
            setFormOpen(false);
            setSelectedTrabajadorId(null);
          }} 
        />
      )}

      {detailOpen && detailTrabajador && (
        <TrabajadorDetalle 
          trabajador={detailTrabajador} 
          onClose={() => {
            setDetailOpen(false);
            setDetailTrabajador(null);
          }} 
        />
      )}
    </div>
  );
}
