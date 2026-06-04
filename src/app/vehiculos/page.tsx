"use client";

import React, { useState } from "react";
import { useActivosStore, Activo } from "@/store/activos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import ActivoForm from "@/components/custom/activo-form";
import ActivoAsignar from "@/components/custom/activo-asignar";
import { 
  Plus, 
  Search, 
  Car, 
  Layers, 
  UserCheck, 
  User, 
  Trash2,
  Edit3,
  RefreshCw,
  AlertTriangle,
  Settings
} from "lucide-react";

export default function VehiculosPage() {
  const { activos, deleteActivo } = useActivosStore();
  const { trabajadores } = useTrabajadoresStore();

  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedActivoId, setSelectedActivoId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignActivo, setAssignActivo] = useState<Activo | null>(null);

  // Handlers
  const handleEdit = (id: string) => {
    setSelectedActivoId(id);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivoId(null);
    setFormOpen(true);
  };

  const handleOpenAssign = (a: Activo) => {
    setAssignActivo(a);
    setAssignOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar el registro de ${name}?`)) {
      deleteActivo(id);
    }
  };

  // Helper: Get assigned worker name
  const getAssignedWorkerName = (idWorker: string | null) => {
    if (!idWorker) return "Sin asignar";
    const worker = trabajadores.find(t => t.id_trabajador === idWorker);
    return worker ? `${worker.nombre_1} ${worker.apellido_paterno}` : "Cargando...";
  };

  // Helper: Technical Review Expiration Alert
  const checkRevisionAlerta = (vencimiento?: string) => {
    if (!vencimiento) return null;
    const hoy = new Date();
    const rev = new Date(vencimiento);
    hoy.setHours(0,0,0,0);
    rev.setHours(0,0,0,0);

    const diff = rev.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Revisión Vencida", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    if (diffDays <= 30) return { text: `Expira en ${diffDays} días`, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return null;
  };

  // Filtering Logic (only Vehicles)
  const vehiculos = activos.filter(a => a.tipo === "Vehículo");
  const filteredVehiculos = vehiculos.filter((a) => {
    const searchString = `${a.marca} ${a.modelo} ${a.identificador_unico} ${getAssignedWorkerName(a.id_trabajador_asignado)}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalVehiculos = vehiculos.length;
  const vehiculosAsignados = vehiculos.filter(a => a.estado === "Asignado").length;
  const vehiculosDisponibles = vehiculos.filter(a => a.estado === "Disponible").length;
  const vehiculosMantencion = vehiculos.filter(a => a.estado === "En Mantención").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <Car className="text-primary" size={32} />
            Flota de Vehículos de Faena
          </h1>
          <p className="text-sm text-text-soft mt-2 font-medium">
            Administra camionetas, furgones y vehículos operativos asignados a transporte o faenas mineras.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Registrar Vehículo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Car size={24} />
          </div>
          <div>
            <span className="label">TOTAL VEHÍCULOS</span>
            <span className="value text-2xl">{totalVehiculos}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="label">ASIGNADOS</span>
            <span className="value text-2xl">{vehiculosAsignados}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="label">DISPONIBLES</span>
            <span className="value text-2xl">{vehiculosDisponibles}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className={`p-3 rounded-xl ${vehiculosMantencion > 0 ? "bg-warning/15 text-warning animate-pulse" : "bg-bg-alt text-text-muted"}`}>
            <Settings size={24} />
          </div>
          <div>
            <span className="label">EN TALLER / MANTENCIÓN</span>
            <span className="value text-2xl">{vehiculosMantencion}</span>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por Marca, Modelo, Patente o Trabajador Asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Vehicles Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVehiculos.map((activo) => {
          const revAlerta = checkRevisionAlerta(activo.detalles_adicionales.vencimiento_revision_tecnica);
          
          return (
            <div 
              key={activo.id_activo}
              className="card group hover:border-primary/40 flex flex-col justify-between p-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                      {activo.marca}
                    </span>
                    <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors mt-0.5">
                      {activo.modelo}
                    </h3>
                  </div>
                  <span className={`badge ${
                    activo.estado === "Disponible" 
                      ? "bg-success/10 text-success border border-success/20" 
                      : activo.estado === "Asignado"
                      ? "badge-blue"
                      : activo.estado === "En Mantención"
                      ? "bg-warning/10 text-warning border border-warning/20 animate-pulse"
                      : "bg-danger/10 text-danger border border-danger/20"
                  }`}>
                    {activo.estado}
                  </span>
                </div>

                {/* Automotriz details card */}
                <div className="p-3 bg-surface-2 rounded-xl border border-border text-xs text-text-soft space-y-2">
                  <div className="flex justify-between py-0.5">
                    <span className="font-medium">Patente</span>
                    <strong className="text-text font-mono tracking-wider">{activo.identificador_unico}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="font-medium">Kilometraje</span>
                    <strong className="text-text">
                      {activo.detalles_adicionales.kilometraje_actual?.toLocaleString("es-CL")} Km
                    </strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="font-medium">Combustible / RT</span>
                    <strong className="text-text">
                      {activo.detalles_adicionales.tipo_combustible} • RT: {activo.detalles_adicionales.vencimiento_revision_tecnica || "—"}
                    </strong>
                  </div>
                </div>

                {/* Expiration warning banner */}
                {revAlerta && (
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded border font-bold ${revAlerta.color} w-full animate-pulse`}>
                    <AlertTriangle size={12} />
                    Alerta Técnica: {revAlerta.text}
                  </span>
                )}

                {/* Assignment details */}
                {activo.estado === "Asignado" && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2.5 text-xs font-medium">
                    <User size={14} className="text-primary" />
                    <span className="text-text-soft">Asignado a: <strong className="text-primary">{getAssignedWorkerName(activo.id_trabajador_asignado)}</strong></span>
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
                {activo.estado === "Baja" ? (
                  <span className="badge badge-outline uppercase">De baja</span>
                ) : (
                  <button
                    onClick={() => handleOpenAssign(activo)}
                    className={`btn py-1.5 min-h-0 text-xs px-3 ${
                      activo.estado === "Asignado"
                        ? "bg-warning/10 text-warning hover:bg-warning hover:text-bg"
                        : activo.estado === "Disponible"
                        ? "btn-secondary"
                        : "opacity-50 cursor-not-allowed bg-surface-2 text-text-muted"
                    }`}
                    disabled={activo.estado === "En Mantención"}
                  >
                    {activo.estado === "Asignado" ? (
                      <>
                        <RefreshCw size={12} />
                        Devolver
                      </>
                    ) : (
                      <>
                        <UserCheck size={12} />
                        Asignar
                      </>
                    )}
                  </button>
                )}

                {/* CRUD triggers */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(activo.id_activo)}
                    title="Editar Ficha"
                    className="p-1.5 rounded-lg bg-surface border border-border text-text-soft hover:text-text hover:bg-surface-2 transition-all shadow-sm"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(activo.id_activo, `${activo.marca} ${activo.modelo}`)}
                    title="Eliminar Registro"
                    className="p-1.5 rounded-lg bg-surface border border-border text-text-soft hover:text-danger hover:bg-danger/10 hover:border-danger/20 transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVehiculos.length === 0 && (
          <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
            <Layers className="mx-auto text-zinc-700" size={32} />
            <h4 className="text-zinc-300 font-bold text-sm">No se encontraron vehículos registrados</h4>
          </div>
        )}
      </div>

      {/* Forms Modals */}
      {formOpen && (
        <ActivoForm 
          activoId={selectedActivoId || undefined} 
          defaultTipo="Vehículo"
          onClose={() => {
            setFormOpen(false);
            setSelectedActivoId(null);
          }} 
        />
      )}

      {assignOpen && assignActivo && (
        <ActivoAsignar 
          activo={assignActivo} 
          onClose={() => {
            setAssignOpen(false);
            setAssignActivo(null);
          }} 
        />
      )}
    </div>
  );
}
