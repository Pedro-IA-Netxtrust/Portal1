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
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <Laptop className="text-primary" size={32} />
            Inventario de Notebooks
          </h1>
          <p className="text-sm text-text-soft mt-2 font-medium">
            Administra los equipos portátiles y computadores corporativos asignados a tu personal de faena.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Registrar Notebook
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Laptop size={24} />
          </div>
          <div>
            <span className="label">TOTAL NOTEBOOKS</span>
            <span className="value text-2xl">{totalNotebooks}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="label">ASIGNADOS</span>
            <span className="value text-2xl">{notebooksAsignados}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="text-primary" size={24} />
          </div>
          <div>
            <span className="label">DISPONIBLES</span>
            <span className="value text-2xl">{notebooksDisponibles}</span>
          </div>
        </div>

        <div className="stat-box flex items-center gap-4">
          <div className="p-3 rounded-xl bg-bg-alt text-text-muted">
            <Layers size={24} />
          </div>
          <div>
            <span className="label">DE BAJA</span>
            <span className="value text-2xl">{notebooksBaja}</span>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por Marca, Modelo, Nº Serie o Trabajador Asignado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Notebooks Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNotebooks.map((activo) => (
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
                    : "bg-danger/10 text-danger border border-danger/20"
                }`}>
                  {activo.estado}
                </span>
              </div>

              {/* Licencias Activas (Badges) */}
              {activo.detalles_adicionales.licencias && activo.detalles_adicionales.licencias.filter(l => l.activa).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activo.detalles_adicionales.licencias.filter(l => l.activa).map(l => {
                    let colorClass = "bg-bg-alt text-text-soft border border-border";
                    if (l.tipo === "Office") colorClass = "badge-blue";
                    if (l.tipo === "Antivirus") colorClass = "bg-danger/10 text-danger border border-danger/20";
                    if (l.tipo === "Sistema Operativo") colorClass = "bg-success/10 text-success border border-success/20";
                    if (l.tipo === "Diseño") colorClass = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

                    return (
                      <span key={l.id} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colorClass}`} title={`${l.nombre} (${l.version || ''})`}>
                        {l.nombre}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Hardware details card */}
              <div className="p-3 bg-surface-2 rounded-xl border border-border text-xs text-text-soft space-y-2">
                <div className="flex justify-between py-0.5">
                  <span className="font-medium">Número de Serie</span>
                  <strong className="text-text font-mono tracking-wider">{activo.identificador_unico}</strong>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-medium">Procesador</span>
                  <strong className="text-text">
                    {activo.detalles_adicionales.procesador || "—"}
                  </strong>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-medium">RAM / SSD</span>
                  <strong className="text-text">
                    {activo.detalles_adicionales.ram_gb} GB RAM / {activo.detalles_adicionales.almacenamiento_gb} GB SSD
                  </strong>
                </div>
              </div>

              {/* Assignment details */}
              {activo.estado === "Asignado" && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2.5 text-xs font-medium">
                  <User size={14} className="text-primary" />
                  <span className="text-text-soft">Poseído por: <strong className="text-primary">{getAssignedWorkerName(activo.id_trabajador_asignado)}</strong></span>
                </div>
              )}

              {/* Toggle Detalle Adicional */}
              <button
                onClick={() => toggleExpand(activo.id_activo)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text-soft hover:text-text text-[11px] font-bold transition-all cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <ShoppingCart size={12} />
                  Detalles de Compra y Software
                </span>
                {expandedActivos[activo.id_activo] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Panel Colapsable de Detalles */}
              {expandedActivos[activo.id_activo] && (
                <div className="p-3.5 bg-surface-2 border border-border rounded-xl space-y-4 animate-slideDown text-xs text-text-soft">
                  {/* Bloque Compra */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border pb-1.5">
                      Adquisición y Garantía
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[10px] font-bold text-text-muted">Proveedor</span>
                        <span className="text-text font-semibold">{activo.detalles_adicionales.proveedor || "No registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-text-muted">Nº Factura / OC</span>
                        <span className="text-text font-semibold font-mono">{activo.detalles_adicionales.numero_factura_oc || "No registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-text-muted">Fecha de Compra</span>
                        <span className="text-text font-semibold">
                          {activo.detalles_adicionales.fecha_compra 
                            ? new Date(activo.detalles_adicionales.fecha_compra).toLocaleDateString("es-CL", { timeZone: "UTC" }) 
                            : "No registrada"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-text-muted">Valor de Compra</span>
                        <span className="text-text font-semibold">
                          {activo.detalles_adicionales.valor_compra 
                            ? `${activo.detalles_adicionales.moneda || "CLP"} ${Number(activo.detalles_adicionales.valor_compra).toLocaleString("es-CL")}` 
                            : "No registrado"}
                        </span>
                      </div>
                    </div>
                    {activo.detalles_adicionales.fecha_vencimiento_garantia && (
                      <div className="pt-2 flex items-center justify-between border-t border-border mt-2">
                        <span className="text-[10px] font-bold text-text-muted">Vencimiento Garantía</span>
                        <span className={`font-semibold ${
                          new Date(activo.detalles_adicionales.fecha_vencimiento_garantia) < new Date() 
                            ? "text-danger" 
                            : "text-success"
                        }`}>
                          {new Date(activo.detalles_adicionales.fecha_vencimiento_garantia).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                          {new Date(activo.detalles_adicionales.fecha_vencimiento_garantia) < new Date() && " (Vencida)"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bloque Licencias */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border pb-1.5">
                      Licencias de Software Asociadas
                    </span>
                    {!activo.detalles_adicionales.licencias || activo.detalles_adicionales.licencias.length === 0 ? (
                      <span className="text-text-muted block text-center font-medium italic py-2">Sin licencias registradas</span>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {activo.detalles_adicionales.licencias.map((lic) => (
                          <div 
                            key={lic.id} 
                            className={`p-2.5 rounded-lg border text-[10px] space-y-1.5 ${
                              lic.activa 
                                ? "bg-surface border-border" 
                                : "bg-bg border-border opacity-60"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-text text-xs">{lic.nombre}</span>
                              <span className={`badge ${
                                lic.activa 
                                  ? "bg-success/10 text-success border-success/20" 
                                  : "bg-bg-alt text-text-muted border-border"
                              }`}>
                                {lic.activa ? "Activa" : "Inactiva"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-medium text-text-soft">
                              <span>Tipo: {lic.tipo} {lic.version ? `(${lic.version})` : ""}</span>
                              {lic.fecha_vencimiento && (
                                <span>Vence: {new Date(lic.fecha_vencimiento).toLocaleDateString("es-CL", { timeZone: "UTC" })}</span>
                              )}
                            </div>
                            {lic.clave_producto && (
                              <div className="bg-bg border border-border rounded px-2 py-1 font-mono text-[10px] text-text-soft flex items-center justify-between mt-1.5">
                                <span className="truncate pr-1">Clave: {lic.clave_producto}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(lic.clave_producto || "");
                                    alert("Clave copiada al portapapeles!");
                                  }}
                                  className="text-[9px] text-primary hover:text-primary-hover font-sans cursor-pointer underline select-none flex-shrink-0 font-bold"
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
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
              {activo.estado === "Baja" ? (
                <span className="badge badge-outline uppercase">De baja</span>
              ) : (
                <button
                  onClick={() => handleOpenAssign(activo)}
                  className={`btn py-1.5 min-h-0 text-xs px-3 ${
                    activo.estado === "Asignado"
                      ? "bg-warning/10 text-warning hover:bg-warning hover:text-bg"
                      : "btn-secondary"
                  }`}
                >
                  {activo.estado === "Asignado" ? (
                    <>
                      <RefreshCw size={12} />
                      Devolver Recurso
                    </>
                  ) : (
                    <>
                      <UserCheck size={12} />
                      Asignar Recurso
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
        ))}

        {filteredNotebooks.length === 0 && (
          <div className="col-span-2 p-12 text-center border border-border border-dashed rounded-2xl space-y-3 bg-surface/50">
            <Layers className="mx-auto text-text-muted" size={40} />
            <h4 className="text-text font-bold text-base">No se encontraron laptops registradas</h4>
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
