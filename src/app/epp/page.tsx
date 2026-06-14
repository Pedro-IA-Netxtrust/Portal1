"use client";

import React, { useState, useEffect } from "react";
import { useEppStore, type EppItem } from "@/store/epp-store";
import { useInventarioStore } from "@/store/inventario-store";
import { useMandantesStore } from "@/store/mandantes-store";
import { useContratosStore } from "@/store/contratos-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { 
  Shield, Plus, Search, Calendar, User, Eye, Trash2, 
  Check, X, FileText, Info, ShieldAlert, Award, Package, ClipboardCheck, Sparkles,
  Building2, ChevronDown, ChevronRight, UserCheck, AlertCircle
} from "lucide-react";

export default function EppPage() {
  // Stores
  const { mandantes } = useMandantesStore();
  const { contratos, fetchContratos } = useContratosStore();
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { entregas, fetchEntregas, addEntrega, deleteEntrega } = useEppStore();
  const { productos, bodegas, lotes, fetchInventarioData, getStockDisponible } = useInventarioStore();

  // Estados de control
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string | null>(null);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Árbol colapsable
  const [expandedMandantes, setExpandedMandantes] = useState<Record<string, boolean>>({});
  const [expandedContratos, setExpandedContratos] = useState<Record<string, boolean>>({});

  // Formulario Nueva Entrega
  const [formBodegaId, setFormBodegaId] = useState("");
  const [formFecha, setFormFecha] = useState(new Date().toISOString().split("T")[0]);
  const [formRecibidoPor, setFormRecibidoPor] = useState("");
  const [formEntregadoPor, setFormEntregadoPor] = useState("Administrador General");
  const [formObservaciones, setFormObservaciones] = useState("");

  // Items marcados para entregar
  const [selectedItems, setSelectedItems] = useState<Record<string, {
    checked: boolean;
    cantidad: number;
    talla: string;
    opcion: string;
  }>>({});

  // Cargar datos iniciales
  useEffect(() => {
    // Nota: mandantes-store no tiene fetch, usa mock persistido, contratos y inventario sí
    fetchContratos();
    fetchTrabajadores();
    fetchEntregas();
    fetchInventarioData();
  }, [fetchContratos, fetchTrabajadores, fetchEntregas, fetchInventarioData]);

  // Inicializar estado del modal
  useEffect(() => {
    if (showNewDeliveryModal) {
      // Filtrar sólo productos categorizados como EPP
      const eppProducts = productos.filter(p => p.categoria === "EPP" && p.activo);
      const initialItems: typeof selectedItems = {};
      
      eppProducts.forEach(prod => {
        // Encontrar primera talla/opción con stock en la base para sugerir por defecto
        const loteConStock = lotes.find(l => l.id_producto === prod.id_producto && l.cantidad_actual > 0);
        initialItems[prod.id_producto] = {
          checked: false,
          cantidad: 1,
          talla: loteConStock?.talla || "M",
          opcion: loteConStock?.opcion || "Estándar"
        };
      });
      setSelectedItems(initialItems);

      // Cargar bodega por defecto (la primera activa)
      if (bodegas.length > 0 && !formBodegaId) {
        setFormBodegaId(bodegas[0].id_bodega);
      }

      // Resolver quién recibe
      if (selectedTrabajadorId) {
        const t = trabajadores.find(tr => tr.id_trabajador === selectedTrabajadorId);
        if (t) setFormRecibidoPor(`${t.nombre_1} ${t.apellido_paterno}`);
      } else {
        setFormRecibidoPor("");
      }
      setFormFecha(new Date().toISOString().split("T")[0]);
      setFormObservaciones("");
    }
  }, [showNewDeliveryModal, selectedTrabajadorId, productos, lotes, bodegas, trabajadores]);

  const toggleMandante = (id: string) => {
    setExpandedMandantes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleContrato = (id: string) => {
    setExpandedContratos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleItemCheck = (id_producto: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [id_producto]: {
        ...prev[id_producto],
        checked: !prev[id_producto].checked
      }
    }));
  };

  const handleItemValueChange = (id_producto: string, field: "cantidad" | "talla" | "opcion", value: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [id_producto]: {
        ...prev[id_producto],
        [field]: value
      }
    }));
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrabajadorId || !formBodegaId) return;

    const itemsToSave = Object.entries(selectedItems)
      .filter(([_, data]) => data.checked)
      .map(([id_producto, data]) => ({
        id_producto,
        cantidad: data.cantidad,
        talla: data.talla,
        opcion: data.opcion
      }));

    if (itemsToSave.length === 0) {
      alert("Por favor selecciona al menos un elemento de EPP para asignar.");
      return;
    }

    // Validar stock antes de guardar
    for (const item of itemsToSave) {
      const stockDisp = getStockDisponible(item.id_producto, item.talla, item.opcion, formBodegaId);
      if (stockDisp < item.cantidad) {
        const prodName = productos.find(p => p.id_producto === item.id_producto)?.nombre || "EPP";
        alert(`Stock insuficiente para ${prodName} (Talla: ${item.talla}, Variante: ${item.opcion}). Solicitado: ${item.cantidad}, Disponible: ${stockDisp}.`);
        return;
      }
    }

    const success = await addEntrega(
      {
        id_trabajador: selectedTrabajadorId,
        id_contrato: selectedContratoId,
        fecha_entrega: formFecha,
        recibido_por: formRecibidoPor,
        entregado_por: formEntregadoPor,
        observaciones: formObservaciones
      },
      itemsToSave,
      formBodegaId
    );

    if (success) {
      setIsSaved(true);
      // Recargar datos de inventario para refrescar el stock en el frontend
      fetchInventarioData();
      setTimeout(() => {
        setIsSaved(false);
        setShowNewDeliveryModal(false);
      }, 1500);
    }
  };

  // Encontrar datos de selección activa
  const activeTrabajador = trabajadores.find(t => t.id_trabajador === selectedTrabajadorId);
  const activeContrato = contratos.find(c => c.id_contrato === selectedContratoId);
  const activeMandante = activeContrato ? mandantes.find(m => m.id_mandante === activeContrato.id_mandante) : null;
  const activeDeliveries = entregas.filter(e => e.id_trabajador === selectedTrabajadorId);

  // Estadísticas EPP
  const totalDeliveries = entregas.length;
  const uniqueWorkers = new Set(entregas.map(e => e.id_trabajador)).size;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="text-emerald-500" size={26} />
            Entrega e Historial de EPP
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Asignación de equipamiento de seguridad organizado por Mandante, Contrato y Trabajador
          </p>
        </div>
        {selectedTrabajadorId && (
          <button
            onClick={() => setShowNewDeliveryModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer animate-fadeIn"
          >
            <Plus size={15} strokeWidth={3} /> Registrar Nueva Entrega
          </button>
        )}
      </div>

      {/* Main Splits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Accordion Tree Left Directory - 5 Cols */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[650px]">
          {/* Header Search */}
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 space-y-3">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 size={13} className="text-zinc-400" /> Directorio Mandante / Contrato
            </h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-zinc-650" size={14} />
              <input
                type="text"
                placeholder="Buscar personal asignado..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg pl-9 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Tree Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-none">
            {mandantes.length === 0 ? (
              <div className="text-center text-zinc-600 text-xs italic py-10">Cargando mandantes...</div>
            ) : (
              mandantes.map(mand => {
                const mandContratos = contratos.filter(c => c.id_mandante === mand.id_mandante);
                const isMandExpanded = expandedMandantes[mand.id_mandante];
                
                return (
                  <div key={mand.id_mandante} className="space-y-1">
                    {/* Mandante Row */}
                    <button
                      onClick={() => toggleMandante(mand.id_mandante)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-zinc-850 hover:border-zinc-800 text-left transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-black text-white flex items-center gap-2">
                        <Building2 size={13} className="text-violet-400" />
                        {mand.nombre}
                      </span>
                      {isMandExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {/* Contratos Under Mandante */}
                    {isMandExpanded && (
                      <div className="pl-4 border-l border-zinc-900 space-y-1.5 mt-1 animate-fadeIn">
                        {mandContratos.length === 0 ? (
                          <p className="text-[10px] text-zinc-600 italic pl-3">Sin contratos registrados.</p>
                        ) : (
                          mandContratos.map(contr => {
                            const isContrExpanded = expandedContratos[contr.id_contrato];
                            const activeWorkers = contr.trabajadores_asignados.filter(w => {
                              if (!w.activo) return false;
                              if (searchTerm) {
                                return w.nombre.toLowerCase().includes(searchTerm.toLowerCase());
                              }
                              return true;
                            });

                            return (
                              <div key={contr.id_contrato} className="space-y-1">
                                {/* Contrato Row */}
                                <button
                                  onClick={() => toggleContrato(contr.id_contrato)}
                                  className="w-full flex items-center justify-between p-1.5 rounded text-left hover:bg-zinc-900/30 text-zinc-350 cursor-pointer"
                                >
                                  <span className="text-[11px] font-bold truncate flex items-center gap-1.5">
                                    <FileText size={12} className="text-zinc-500" />
                                    {contr.nombre_contrato}
                                  </span>
                                  {isContrExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>

                                {/* Workers Under Contrato */}
                                {isContrExpanded && (
                                  <div className="pl-4 border-l border-zinc-900/50 space-y-1 mt-0.5 animate-fadeIn">
                                    {activeWorkers.length === 0 ? (
                                      <p className="text-[9px] text-zinc-650 italic pl-3">No hay trabajadores activos.</p>
                                    ) : (
                                      activeWorkers.map(w => {
                                        const isSelected = selectedTrabajadorId === w.id_trabajador;
                                        return (
                                          <button
                                            key={w.id_asignacion}
                                            onClick={() => {
                                              setSelectedTrabajadorId(w.id_trabajador);
                                              setSelectedContratoId(contr.id_contrato);
                                            }}
                                            className={`w-full flex items-center justify-between p-2 rounded text-left text-[11px] transition-all cursor-pointer ${
                                              isSelected
                                                ? "bg-emerald-600/15 border-l-2 border-emerald-500 text-white font-bold"
                                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                                            }`}
                                          >
                                            <span className="truncate flex items-center gap-1.5">
                                              <UserCheck size={11} className={isSelected ? "text-emerald-400" : "text-zinc-500"} />
                                              {w.nombre}
                                            </span>
                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* History and Delivery Form - 7 Cols */}
        <div className="lg:col-span-7">
          {activeTrabajador ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl overflow-hidden min-h-[650px] flex flex-col">
              {/* Profile Header */}
              <div className="p-6 border-b border-zinc-900 bg-zinc-900/10 space-y-3">
                <div>
                  <h2 className="text-base font-black text-white">
                    {activeTrabajador.nombre_1} {activeTrabajador.nombre_2 || ""} {activeTrabajador.apellido_paterno} {activeTrabajador.apellido_materno}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">RUT: {activeTrabajador.numero_identificacion || "N/A"}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-zinc-900/60 text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-550 block text-[8px] uppercase tracking-wider font-bold">Mandante:</span>
                    <strong className="text-zinc-200">{activeMandante?.nombre || "Sin Mandante"}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-550 block text-[8px] uppercase tracking-wider font-bold">Contrato Vigente:</span>
                    <strong className="text-zinc-200">{activeContrato?.nombre_contrato || "Sin Contrato"}</strong>
                  </div>
                </div>
              </div>

              {/* Logs */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <FileText size={13} className="text-zinc-500" /> Registro de Asignaciones
                </h3>

                {activeDeliveries.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 p-6 border border-dashed border-zinc-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-650">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400">Sin historial de entregas</h4>
                      <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed max-w-[240px] mx-auto">
                        Este trabajador no registra entregas de EPP. Haz clic en &ldquo;Registrar Nueva Entrega&rdquo; para asignarle equipamiento disponible en bodega.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDeliveries.map(delivery => (
                      <div 
                        key={delivery.id_entrega} 
                        className="bg-zinc-900/20 border border-zinc-850 rounded-xl overflow-hidden"
                      >
                        {/* Delivery Header */}
                        <div className="bg-zinc-900/40 px-4 py-3 border-b border-zinc-850 flex justify-between items-center flex-wrap gap-2 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                              <Calendar size={12} className="text-zinc-500" />
                              {new Date(delivery.fecha_entrega).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                            </div>
                            {delivery.entregado_por && (
                              <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-750 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                Entregó: {delivery.entregado_por}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("¿Estás seguro de que deseas eliminar este registro de entrega?")) {
                                deleteEntrega(delivery.id_entrega);
                              }
                            }}
                            className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Items Grid */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {delivery.items.map(item => {
                              const prodRef = productos.find(p => p.id_producto === item.id_producto);
                              return (
                                <div 
                                  key={item.id_item}
                                  className="bg-zinc-950/40 border border-zinc-850 rounded-lg p-2.5 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-zinc-200 block">{prodRef?.nombre || "EPP"}</span>
                                    <span className="text-[9px] text-zinc-550 font-mono mt-0.5">Talla: {item.talla} / {item.opcion}</span>
                                  </div>
                                  <span className="font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded text-[10px] font-mono">
                                    x{item.cantidad}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Notes */}
                          {delivery.observaciones && (
                            <div className="bg-zinc-950/25 border border-zinc-850/50 p-2.5 rounded-lg text-[10px] text-zinc-500 flex items-start gap-1.5">
                              <Info size={12} className="flex-shrink-0 mt-0.5" />
                              <p className="leading-relaxed">{delivery.observaciones}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl p-8 text-center min-h-[650px] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historial por Contrato</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-[280px] leading-relaxed mx-auto">
                  Selecciona un trabajador en la jerarquía de contratos de la izquierda para poder asignarle EPP y revisar sus entregas activas.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* NEW ASSIGNMENT MODAL */}
      {showNewDeliveryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <form 
            onSubmit={handleSaveDelivery}
            className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="text-emerald-500" size={15} /> Asignar Equipamiento de Seguridad
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewDeliveryModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Bodega origen */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Bodega de Origen</label>
                  <select
                    required
                    value={formBodegaId}
                    onChange={e => setFormBodegaId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
                  >
                    <option value="" disabled>Selecciona bodega...</option>
                    {bodegas.map(b => (
                      <option key={b.id_bodega} value={b.id_bodega}>{b.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Fecha de Entrega</label>
                  <input
                    type="date"
                    required
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                {/* Entregado por */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Entregado Por (Abierto)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Administrador Bodega"
                    value={formEntregadoPor}
                    onChange={e => setFormEntregadoPor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Recibido por */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Recibido Por (Firma)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre trabajador"
                    value={formRecibidoPor}
                    onChange={e => setFormRecibidoPor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

              </div>

              {/* Items Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Elementos EPP Disponibles
                  </h4>
                  <span className="text-[9px] text-zinc-550 font-medium">
                    (Valida stock real en la bodega seleccionada)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos
                    .filter(p => p.categoria === "EPP" && p.activo)
                    .map(prod => {
                      const itemState = selectedItems[prod.id_producto] || { checked: false, cantidad: 1, talla: "M", opcion: "Estándar" };
                      
                      // Cargar stock disponible en bodega seleccionada
                      const stockDisp = getStockDisponible(prod.id_producto, itemState.talla, itemState.opcion, formBodegaId);
                      const isOutOfStock = itemState.checked && (stockDisp < itemState.cantidad);

                      return (
                        <div 
                          key={prod.id_producto}
                          className={`p-3.5 rounded-xl border flex flex-col gap-3.5 transition-all ${
                            itemState.checked
                              ? isOutOfStock 
                                ? "bg-red-500/5 border-red-500/30" 
                                : "bg-emerald-600/5 border-emerald-500/40"
                              : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-850"
                          }`}
                        >
                          {/* Checkbox selector */}
                          <button
                            type="button"
                            onClick={() => handleItemCheck(prod.id_producto)}
                            className="flex items-center justify-between w-full text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                itemState.checked
                                  ? isOutOfStock ? "bg-red-500 border-red-500" : "bg-emerald-600 border-emerald-500"
                                  : "bg-zinc-950 border-zinc-800 text-transparent"
                              }`}>
                                <Check size={11} strokeWidth={3} />
                              </div>
                              <span className="text-xs font-bold text-white">{prod.nombre}</span>
                            </div>
                            
                            {/* Stock Indicator */}
                            {itemState.checked && (
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isOutOfStock ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400"}`}>
                                Stock Bodega: {stockDisp}
                              </span>
                            )}
                          </button>

                          {/* Row inputs */}
                          {itemState.checked && (
                            <div className="grid grid-cols-12 gap-2 mt-1 border-t border-zinc-900/60 pt-2.5 animate-fadeIn">
                              {/* Cantidad */}
                              <div className="col-span-3 space-y-1">
                                <label className="text-[9px] text-zinc-550 font-semibold uppercase block">Cant.</label>
                                <input
                                  type="number"
                                  min={1}
                                  required
                                  value={itemState.cantidad}
                                  onChange={e => handleItemValueChange(prod.id_producto, "cantidad", parseInt(e.target.value) || 1)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500 text-center font-bold font-mono"
                                />
                              </div>

                              {/* Talla */}
                              <div className="col-span-4 space-y-1">
                                <label className="text-[9px] text-zinc-550 font-semibold uppercase block">Talla</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Talla"
                                  value={itemState.talla}
                                  onChange={e => handleItemValueChange(prod.id_producto, "talla", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500 text-center font-mono"
                                />
                              </div>

                              {/* Opcion / Color */}
                              <div className="col-span-5 space-y-1">
                                <label className="text-[9px] text-zinc-550 font-semibold uppercase block">Color/Variante</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Detalle"
                                  value={itemState.opcion}
                                  onChange={e => handleItemValueChange(prod.id_producto, "opcion", e.target.value)}
                                  className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Insufficient Stock Warning Alert */}
                          {isOutOfStock && (
                            <div className="flex items-center gap-1.5 text-[9px] text-red-400 mt-1 bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
                              <AlertCircle size={12} className="flex-shrink-0" />
                              <span>Cantidad solicitada excede stock disponible en bodega.</span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                  Observaciones de Asignación
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalla firmas, estado de entrega, reemplazos, etc..."
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-900/10">
              <button
                type="button"
                onClick={() => setShowNewDeliveryModal(false)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaved}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer animate-fadeIn"
              >
                {isSaved ? (
                  <>
                    <Check size={14} /> ¡Guardado con Éxito!
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Asignar EPP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
