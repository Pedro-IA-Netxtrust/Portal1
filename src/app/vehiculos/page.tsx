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
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Car className="text-emerald-400" size={24} />
            Flota de Vehículos de Faena
          </h1>
          <p className="text-xs text-zinc-500">
            Administra camionetas, furgones y vehículos operativos asignados a transporte o faenas mineras.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Registrar Vehículo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Car size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">TOTAL VEHÍCULOS</span>
            <span className="text-lg font-bold text-white">{totalVehiculos}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">ASIGNADOS</span>
            <span className="text-lg font-bold text-white">{vehiculosAsignados}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <UserCheck className="text-blue-400" size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">DISPONIBLES</span>
            <span className="text-lg font-bold text-white">{vehiculosDisponibles}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${vehiculosMantencion > 0 ? "bg-amber-500/15 text-amber-400 animate-pulse" : "bg-zinc-800 text-zinc-400"}`}>
            <Settings size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">EN TALLER / MANTENCIÓN</span>
            <span className="text-lg font-bold text-white">{vehiculosMantencion}</span>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Marca, Modelo, Patente o Trabajador Asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
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
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">
                      {activo.marca}
                    </span>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors mt-0.5">
                      {activo.modelo}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activo.estado === "Disponible" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : activo.estado === "Asignado"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : activo.estado === "En Mantención"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {activo.estado}
                  </span>
                </div>

                {/* Automotriz details card */}
                <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/60 text-xs text-zinc-400 space-y-2">
                  <div className="flex justify-between py-0.5">
                    <span>Patente (Patente Única Nacional)</span>
                    <strong className="text-white font-mono">{activo.identificador_unico}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Kilometraje</span>
                    <strong className="text-white">
                      {activo.detalles_adicionales.kilometraje_actual?.toLocaleString("es-CL")} Km
                    </strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Combustible / RT</span>
                    <strong className="text-white">
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
                  <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-center gap-2.5 text-xs">
                    <User size={13} className="text-blue-400" />
                    <span className="text-zinc-400">Asignado a: <strong className="text-blue-400">{getAssignedWorkerName(activo.id_trabajador_asignado)}</strong></span>
                  </div>
                )}
              </div>

              {/* Actions footer */}
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-zinc-800/40">
                {activo.estado === "Baja" ? (
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">De baja</span>
                ) : (
                  <button
                    onClick={() => handleOpenAssign(activo)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 border cursor-pointer ${
                      activo.estado === "Asignado"
                        ? "bg-amber-600/10 border-amber-500/20 text-amber-400 hover:bg-amber-600 hover:text-white"
                        : activo.estado === "Disponible"
                        ? "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-400 cursor-not-allowed"
                    }`}
                    disabled={activo.estado === "En Mantención"}
                  >
                    {activo.estado === "Asignado" ? (
                      <>
                        <RefreshCw size={10} />
                        Devolver Vehículo
                      </>
                    ) : (
                      <>
                        <UserCheck size={10} />
                        Asignar Vehículo
                      </>
                    )}
                  </button>
                )}

                {/* CRUD triggers */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleEdit(activo.id_activo)}
                    title="Editar Ficha"
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button 
                    onClick={() => handleDelete(activo.id_activo, `${activo.marca} ${activo.modelo}`)}
                    title="Eliminar Registro"
                    className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
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
