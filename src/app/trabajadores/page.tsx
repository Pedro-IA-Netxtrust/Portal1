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
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Administración de Trabajadores</h1>
          <p className="text-sm text-text-soft mt-1 font-medium">
            Fase 1: Módulo de registro centralizado con semáforos de control e identificaciones internacionales.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Registrar Trabajador
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>
          <div>
            <span className="label">TOTAL TRABAJADORES</span>
            <span className="value text-2xl">{totalCount}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="label">CONTRATO INDEFINIDO</span>
            <span className="value text-2xl">
              {trabajadores.filter(t => t.tipo_contrato === "Indefinido").length}
            </span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Globe size={24} />
          </div>
          <div>
            <span className="label">PERSONAL EXTRANJERO</span>
            <span className="value text-2xl">
              {trabajadores.filter(t => t.tipo_identificacion !== "RUT").length}
            </span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className={`p-3 rounded-xl ${activeAlarms > 0 ? "bg-danger/15 text-danger animate-pulse" : "bg-bg-alt text-text-muted"}`}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="label">EXÁMENES VENCIDOS</span>
            <span className="value text-2xl">{activeAlarms}</span>
          </div>
        </div>
      </div>

      {/* Live Search & Filter Bar */}
      <div className="card flex flex-wrap gap-4 items-center mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por Nombre, RUT, DNI o Cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Nationality Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-soft" />
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="select py-2 px-3 text-sm min-h-0"
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
              className="select py-2 px-3 text-sm min-h-0"
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
              className="select py-2 px-3 text-sm min-h-0"
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
              className="select py-2 px-3 text-sm min-h-0"
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
              className="select py-2 px-3 text-sm min-h-0"
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
                  className="card group hover:border-primary/40 flex flex-col justify-between p-5"
                >
                  <div className="space-y-4">
                    {/* Identity header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bg-alt border border-border flex items-center justify-center text-text-soft font-bold text-lg shadow-sm">
                          {trabajador.nombre_1[0]}{trabajador.apellido_paterno[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-text text-sm group-hover:text-primary transition-colors">
                            {trabajador.nombre_1} {trabajador.apellido_paterno} {trabajador.apellido_materno}
                          </h3>
                          <p className="text-[11px] text-text-muted font-bold mt-0.5 uppercase tracking-wider">{trabajador.tipo_identificacion}: {trabajador.numero_identificacion}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {hasAlarms && (
                          <span className="badge bg-danger/10 text-danger border border-danger/20 animate-pulse text-[9px] py-0.5 px-1.5">
                            <ShieldAlert size={10} />
                            Alerta
                          </span>
                        )}
                        {hasMissingData && (
                          <span className="badge bg-warning/10 text-warning border border-warning/20 text-[9px] py-0.5 px-1.5" title={`Campos faltantes: ${missingFields.join(", ")}`}>
                            <AlertTriangle size={10} />
                            Faltantes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-2 text-xs text-text-soft pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-text-muted font-bold uppercase text-[9px] tracking-wider">CARGO</span>
                        <span className="text-text font-bold">{trabajador.cargo || "No registrado"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-text-muted font-bold uppercase text-[9px] tracking-wider">CORREO</span>
                        <a href={`mailto:${trabajador.email_corporativo}`} className="hover:text-primary hover:underline truncate font-medium">
                          {trabajador.email_corporativo}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-text-muted font-bold uppercase text-[9px] tracking-wider">CELULAR</span>
                        <span className="font-medium">{trabajador.celular_personal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
                    <span className={`badge ${
                      trabajador.modalidad_trabajo === "Híbrido" 
                        ? "badge-blue" 
                        : trabajador.modalidad_trabajo === "Teletrabajo"
                        ? "bg-purple-500/10 text-purple-400"
                        : "badge-orange"
                    }`}>
                      {trabajador.modalidad_trabajo}
                    </span>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewDetails(trabajador)}
                        title="Ver Ficha Completa"
                        className="p-1.5 rounded-lg bg-surface border border-border text-text-soft hover:text-text hover:bg-surface-2 transition-all shadow-sm"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleEdit(trabajador.id_trabajador)}
                        title="Editar Trabajador"
                        className="p-1.5 rounded-lg bg-surface border border-border text-text-soft hover:text-text hover:bg-surface-2 transition-all shadow-sm"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(trabajador.id_trabajador, `${trabajador.nombre_1} ${trabajador.apellido_paterno}`)}
                        title="Eliminar Ficha"
                        className="p-1.5 rounded-lg bg-surface border border-border text-text-soft hover:text-danger hover:bg-danger/10 hover:border-danger/20 transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTrabajadores.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-border border-dashed rounded-2xl space-y-3 bg-surface/50">
                <Users className="mx-auto text-text-muted" size={40} />
                <h4 className="text-text font-bold text-base">No se encontraron fichas de trabajadores</h4>
                <p className="text-sm text-text-soft font-medium">Pruebe ajustando el buscador o los filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Apartado de Datos Faltantes (Right Column) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-warning" size={18} />
                <h3 className="font-bold text-text text-sm">Fichas Incompletas</h3>
              </div>
              <span className="badge badge-orange">
                {trabajadoresConDatosFaltantes.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
              {trabajadoresConDatosFaltantes.map((t) => {
                const faltantes = getDatosFaltantes(t);
                return (
                  <div 
                    key={t.id_trabajador} 
                    className="p-3.5 rounded-xl bg-surface-2 border border-border hover:border-primary/30 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 
                          onClick={() => handleViewDetails(t)}
                          className="text-xs font-bold text-text hover:text-primary cursor-pointer transition-colors truncate"
                          title={`Ver detalles de ${t.nombre_1} ${t.apellido_paterno}`}
                        >
                          {t.nombre_1} {t.apellido_paterno}
                        </h4>
                        <p className="text-[10px] font-bold text-text-muted mt-0.5 truncate uppercase tracking-wider">{t.cargo || "Sin cargo"}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleEdit(t.id_trabajador)}
                        className="p-1.5 rounded-md hover:bg-surface border border-transparent hover:border-border text-text-soft hover:text-text transition-all"
                        title="Completar datos"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
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
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-bg-alt border border-border text-text-soft flex items-center gap-1 uppercase tracking-wider"
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
                <div className="text-center py-8 text-text-soft space-y-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-text">¡Todo al día!</p>
                  <p className="text-xs text-text-soft font-medium leading-relaxed px-2">Todas las fichas tienen sus datos esenciales completos.</p>
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
