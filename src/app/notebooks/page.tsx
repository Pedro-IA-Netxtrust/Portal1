"use client";

import React, { useState } from "react";
import { useActivosStore, Activo } from "@/store/activos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import ActivoForm from "@/components/custom/activo-form";
import ActivoAsignar from "@/components/custom/activo-asignar";
import { 
  Plus, 
  Search, 
  Cpu, 
  Layers, 
  UserCheck, 
  User, 
  Trash2,
  Edit3,
  RefreshCw,
  Laptop,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from "lucide-react";

export default function NotebooksPage() {
  const { activos, deleteActivo } = useActivosStore();
  const { trabajadores } = useTrabajadoresStore();

  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedActivoId, setSelectedActivoId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignActivo, setAssignActivo] = useState<Activo | null>(null);
  const [expandedActivos, setExpandedActivos] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedActivos(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Filtering Logic (only Notebooks)
  const notebooks = activos.filter(a => a.tipo === "Notebook");
  const filteredNotebooks = notebooks.filter((a) => {
    const searchString = `${a.marca} ${a.modelo} ${a.identificador_unico} ${getAssignedWorkerName(a.id_trabajador_asignado)}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Stats
  const totalNotebooks = notebooks.length;
  const notebooksAsignados = notebooks.filter(a => a.estado === "Asignado").length;
  const notebooksDisponibles = notebooks.filter(a => a.estado === "Disponible").length;
  const notebooksBaja = notebooks.filter(a => a.estado === "Baja").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Laptop className="text-blue-400" size={24} />
            Inventario de Notebooks
          </h1>
          <p className="text-xs text-zinc-500">
            Administra los equipos portátiles y computadores corporativos asignados a tu personal de faena.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={16} />
          Registrar Notebook
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Laptop size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">TOTAL NOTEBOOKS</span>
            <span className="text-lg font-bold text-white">{totalNotebooks}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">ASIGNADOS</span>
            <span className="text-lg font-bold text-white">{notebooksAsignados}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="text-emerald-400" size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">DISPONIBLES</span>
            <span className="text-lg font-bold text-white">{notebooksDisponibles}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">DE BAJA</span>
            <span className="text-lg font-bold text-white">{notebooksBaja}</span>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por Marca, Modelo, Nº Serie o Trabajador Asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Notebooks Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotebooks.map((activo) => (
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
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {activo.estado}
                </span>
              </div>

              {/* Licencias Activas (Badges) */}
              {activo.detalles_adicionales.licencias && activo.detalles_adicionales.licencias.filter(l => l.activa).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {activo.detalles_adicionales.licencias.filter(l => l.activa).map(l => {
                    let colorClass = "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50";
                    if (l.tipo === "Office") colorClass = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                    if (l.tipo === "Antivirus") colorClass = "bg-red-500/10 text-red-400 border border-red-500/20";
                    if (l.tipo === "Sistema Operativo") colorClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    if (l.tipo === "Diseño") colorClass = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

                    return (
                      <span key={l.id} className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`} title={`${l.nombre} (${l.version || ''})`}>
                        {l.nombre}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Hardware details card */}
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/60 text-xs text-zinc-400 space-y-2">
                <div className="flex justify-between py-0.5">
                  <span>Número de Serie</span>
                  <strong className="text-white font-mono">{activo.identificador_unico}</strong>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Procesador</span>
                  <strong className="text-white">
                    {activo.detalles_adicionales.procesador || "—"}
                  </strong>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>RAM / SSD</span>
                  <strong className="text-white">
                    {activo.detalles_adicionales.ram_gb} GB RAM / {activo.detalles_adicionales.almacenamiento_gb} GB SSD
                  </strong>
                </div>
              </div>

              {/* Assignment details */}
              {activo.estado === "Asignado" && (
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-center gap-2.5 text-xs">
                  <User size={13} className="text-blue-400" />
                  <span className="text-zinc-400">Poseído por: <strong className="text-blue-400">{getAssignedWorkerName(activo.id_trabajador_asignado)}</strong></span>
                </div>
              )}

              {/* Toggle Detalle Adicional */}
              <button
                onClick={() => toggleExpand(activo.id_activo)}
                className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold transition-all cursor-pointer select-none"
              >
                <span className="flex items-center gap-1">
                  <ShoppingCart size={10} />
                  Detalles de Compra y Software
                </span>
                {expandedActivos[activo.id_activo] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {/* Panel Colapsable de Detalles */}
              {expandedActivos[activo.id_activo] && (
                <div className="p-3 bg-zinc-950/85 border border-zinc-850 rounded-lg space-y-4 animate-slideDown text-[11px] text-zinc-400">
                  {/* Bloque Compra */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block border-b border-zinc-850 pb-1">
                      Adquisición y Garantía
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[9px] text-zinc-500">Proveedor</span>
                        <span className="text-zinc-200 font-semibold">{activo.detalles_adicionales.proveedor || "No registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-zinc-500">Nº Factura / OC</span>
                        <span className="text-zinc-200 font-semibold font-mono">{activo.detalles_adicionales.numero_factura_oc || "No registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-zinc-500">Fecha de Compra</span>
                        <span className="text-zinc-200 font-semibold">
                          {activo.detalles_adicionales.fecha_compra 
                            ? new Date(activo.detalles_adicionales.fecha_compra).toLocaleDateString("es-CL", { timeZone: "UTC" }) 
                            : "No registrada"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-zinc-500">Valor de Compra</span>
                        <span className="text-zinc-200 font-semibold">
                          {activo.detalles_adicionales.valor_compra 
                            ? `${activo.detalles_adicionales.moneda || "CLP"} ${Number(activo.detalles_adicionales.valor_compra).toLocaleString("es-CL")}` 
                            : "No registrado"}
                        </span>
                      </div>
                    </div>
                    {activo.detalles_adicionales.fecha_vencimiento_garantia && (
                      <div className="pt-1 flex items-center justify-between border-t border-zinc-850/50 mt-1">
                        <span className="text-[9px] text-zinc-500">Vencimiento Garantía</span>
                        <span className={`font-semibold ${
                          new Date(activo.detalles_adicionales.fecha_vencimiento_garantia) < new Date() 
                            ? "text-red-400" 
                            : "text-emerald-400"
                        }`}>
                          {new Date(activo.detalles_adicionales.fecha_vencimiento_garantia).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                          {new Date(activo.detalles_adicionales.fecha_vencimiento_garantia) < new Date() && " (Vencida)"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bloque Licencias */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block border-b border-zinc-850 pb-1">
                      Licencias de Software Asociadas
                    </span>
                    {!activo.detalles_adicionales.licencias || activo.detalles_adicionales.licencias.length === 0 ? (
                      <span className="text-zinc-600 block text-center italic py-1">Sin licencias registradas</span>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {activo.detalles_adicionales.licencias.map((lic) => (
                          <div 
                            key={lic.id} 
                            className={`p-2 rounded border text-[10px] space-y-1 ${
                              lic.activa 
                                ? "bg-zinc-900/60 border-zinc-800" 
                                : "bg-zinc-950/40 border-zinc-900 opacity-60"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">{lic.nombre}</span>
                              <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${
                                lic.activa 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-zinc-800 text-zinc-500"
                              }`}>
                                {lic.activa ? "Activa" : "Inactiva"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-500">
                              <span>Tipo: {lic.tipo} {lic.version ? `(${lic.version})` : ""}</span>
                              {lic.fecha_vencimiento && (
                                <span>Vence: {new Date(lic.fecha_vencimiento).toLocaleDateString("es-CL", { timeZone: "UTC" })}</span>
                              )}
                            </div>
                            {lic.clave_producto && (
                              <div className="bg-zinc-950 border border-zinc-900 rounded px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 flex items-center justify-between mt-1">
                                <span className="truncate pr-1">Clave: {lic.clave_producto}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(lic.clave_producto || "");
                                    alert("Clave copiada al portapapeles!");
                                  }}
                                  className="text-[8px] text-blue-400 hover:text-blue-300 font-sans cursor-pointer underline select-none flex-shrink-0"
                                >
                                  Copiar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                      : "bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {activo.estado === "Asignado" ? (
                    <>
                      <RefreshCw size={10} />
                      Devolver Recurso
                    </>
                  ) : (
                    <>
                      <UserCheck size={10} />
                      Asignar Recurso
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
        ))}

        {filteredNotebooks.length === 0 && (
          <div className="col-span-2 p-12 text-center border border-zinc-800 border-dashed rounded-xl space-y-2">
            <Layers className="mx-auto text-zinc-700" size={32} />
            <h4 className="text-zinc-300 font-bold text-sm">No se encontraron laptops registradas</h4>
          </div>
        )}
      </div>

      {/* Forms Modals */}
      {formOpen && (
        <ActivoForm 
          activoId={selectedActivoId || undefined} 
          defaultTipo="Notebook"
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
// Helper check mock just to keep page validation happy
const CheckCircle2 = ({ className, size }: { className?: string; size?: number }) => (
  <span className={className}>✓</span>
);
