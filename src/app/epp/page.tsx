"use client";

import React, { useState, useEffect } from "react";
import { useEppStore, type EppItem } from "@/store/epp-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { 
  Shield, Plus, Search, Calendar, User, Eye, Trash2, 
  Check, X, FileText, Info, ShieldAlert, Award, Package, ClipboardCheck, Sparkles 
} from "lucide-react";

// Lista de elementos de protección requeridos
const PREDEFINED_EPPS = [
  { id: "zapatos", name: "Zapatos", icon: "🥾", defaultTalla: "41", defaultOpcion: "Negro de Seguridad" },
  { id: "polera_manga_larga", name: "Polera manga larga", icon: "👕", defaultTalla: "L", defaultOpcion: "Azul Filtro UV" },
  { id: "camisa", name: "Camisa", icon: "👔", defaultTalla: "L", defaultOpcion: "Gris institucional" },
  { id: "geologo", name: "Geólogo", icon: "🦺", defaultTalla: "Única", defaultOpcion: "Naranja Reflectante" },
  { id: "casco", name: "Casco", icon: "🪖", defaultTalla: "Estándar", defaultOpcion: "Blanco Alto Impacto" },
  { id: "barbiquejo", name: "Barbiquejo", icon: "🎗️", defaultTalla: "Única", defaultOpcion: "Mentonera elástica" },
  { id: "arnes", name: "Arnés", icon: "🕸️", defaultTalla: "Estándar", defaultOpcion: "4 Puntas Anticaídas" },
  { id: "respirador", name: "Respirador", icon: "😷", defaultTalla: "M", defaultOpcion: "Doble Filtro Carbón" },
  { id: "fullface", name: "Fullface", icon: "👺", defaultTalla: "Estándar", defaultOpcion: "Filtro Multipropósito" },
  { id: "lentes", name: "Lentes", icon: "👓", defaultTalla: "M", defaultOpcion: "Transparentes Antiempaño" },
  { id: "guantes", name: "Guantes", icon: "🧤", defaultTalla: "10", defaultOpcion: "Cabrilla Reforzados" },
  { id: "tapones_auditivos", name: "Tapones auditivos", icon: "🧏", defaultTalla: "Estándar", defaultOpcion: "Silicona con Cordón" },
  { id: "chaqueta", name: "Chaqueta", icon: "🧥", defaultTalla: "L", defaultOpcion: "Térmica Impermeable" },
  { id: "blusa", name: "Blusa", icon: "👚", defaultTalla: "M", defaultOpcion: "Blanca institucional" }
];

export default function EppPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { entregas, loading, fetchEntregas, addEntrega, deleteEntrega } = useEppStore();

  // Estados de control
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string | null>(null);
  const [showNewDeliveryModal, setShowNewDeliveryModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Formulario de Nueva Entrega
  const [formTrabajadorId, setFormTrabajadorId] = useState("");
  const [formFecha, setFormFecha] = useState(new Date().toISOString().split("T")[0]);
  const [formRecibidoPor, setFormRecibidoPor] = useState("");
  const [formObservaciones, setFormObservaciones] = useState("");
  
  // Elementos marcados para entregar
  const [selectedItems, setSelectedItems] = useState<Record<string, {
    checked: boolean;
    cantidad: number;
    talla: string;
    opcion: string;
  }>>({});

  // Carga inicial
  useEffect(() => {
    fetchTrabajadores();
    fetchEntregas();
  }, [fetchTrabajadores, fetchEntregas]);

  // Inicializar estado del formulario de items cuando se abre el modal
  useEffect(() => {
    if (showNewDeliveryModal) {
      const initialItems: typeof selectedItems = {};
      PREDEFINED_EPPS.forEach(epp => {
        initialItems[epp.name] = {
          checked: false,
          cantidad: 1,
          talla: epp.defaultTalla,
          opcion: epp.defaultOpcion
        };
      });
      setSelectedItems(initialItems);
      // Auto-seleccionar el trabajador activo si ya estábamos viéndolo
      if (selectedTrabajadorId) {
        setFormTrabajadorId(selectedTrabajadorId);
        const t = trabajadores.find(tr => tr.id_trabajador === selectedTrabajadorId);
        if (t) setFormRecibidoPor(`${t.nombre_1} ${t.apellido_paterno}`);
      } else {
        setFormTrabajadorId("");
        setFormRecibidoPor("");
      }
      setFormFecha(new Date().toISOString().split("T")[0]);
      setFormObservaciones("");
    }
  }, [showNewDeliveryModal, selectedTrabajadorId, trabajadores]);

  // Manejar cambio en selección de trabajador en formulario
  const handleFormTrabajadorChange = (id: string) => {
    setFormTrabajadorId(id);
    const t = trabajadores.find(tr => tr.id_trabajador === id);
    if (t) {
      setFormRecibidoPor(`${t.nombre_1} ${t.apellido_paterno}`);
    } else {
      setFormRecibidoPor("");
    }
  };

  // Manejar check de un item
  const handleItemCheck = (name: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        checked: !prev[name].checked
      }
    }));
  };

  // Manejar cambio de valor de un item
  const handleItemValueChange = (name: string, field: "cantidad" | "talla" | "opcion", value: any) => {
    setSelectedItems(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value
      }
    }));
  };

  // Enviar entrega
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTrabajadorId) return;

    // Filtrar sólo los items marcados
    const itemsToSave = Object.entries(selectedItems)
      .filter(([_, data]) => data.checked)
      .map(([name, data]) => ({
        elemento: name,
        cantidad: data.cantidad,
        talla: data.talla,
        opcion: data.opcion
      }));

    if (itemsToSave.length === 0) {
      alert("Por favor selecciona al menos un EPP para entregar.");
      return;
    }

    const success = await addEntrega(
      {
        id_trabajador: formTrabajadorId,
        fecha_entrega: formFecha,
        recibido_por: formRecibidoPor,
        observaciones: formObservaciones
      },
      itemsToSave
    );

    if (success) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setShowNewDeliveryModal(false);
        // Si no había trabajador seleccionado, fijarlo para ver su historial recién creado
        if (!selectedTrabajadorId) {
          setSelectedTrabajadorId(formTrabajadorId);
        }
      }, 1500);
    }
  };

  // Filtrar trabajadores según búsqueda
  const filteredTrabajadores = trabajadores.filter(t => {
    const fullName = `${t.nombre_1} ${t.nombre_2 || ""} ${t.apellido_paterno} ${t.apellido_materno}`.toLowerCase();
    const rut = t.numero_identificacion?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || rut.includes(query);
  });

  // Estadísticas básicas
  const totalDeliveries = entregas.length;
  const uniqueWorkersWithEpp = new Set(entregas.map(e => e.id_trabajador)).size;
  const coveragePercentage = trabajadores.length > 0 
    ? Math.round((uniqueWorkersWithEpp / trabajadores.length) * 100) 
    : 0;

  const selectedTrabajador = trabajadores.find(t => t.id_trabajador === selectedTrabajadorId);
  const selectedTrabajadorDeliveries = entregas.filter(e => e.id_trabajador === selectedTrabajadorId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Shield className="text-emerald-500" size={26} />
            Entrega de EPP
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Registro, control de tallas y consulta de historial de Elementos de Protección Personal
          </p>
        </div>
        <button
          onClick={() => setShowNewDeliveryModal(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus size={15} strokeWidth={3} /> Registrar Nueva Entrega
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Package size={20} />
          </div>
          <div>
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Entregas Totales</h3>
            <p className="text-2xl font-black text-white mt-1">{totalDeliveries}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Personal con EPP</h3>
            <p className="text-2xl font-black text-white mt-1">{uniqueWorkersWithEpp} <span className="text-xs text-zinc-650 font-normal">de {trabajadores.length}</span></p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Cobertura de EPP</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{coveragePercentage}%</span>
              <div className="w-20 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${coveragePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Workers List - 5 Cols */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[650px]">
          {/* List Search Header */}
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 space-y-3">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <User size={13} className="text-zinc-400" /> Directorio de Trabajadores
            </h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-zinc-600" size={14} />
              <input
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg pl-9 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* List Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60 p-2 space-y-1">
            {filteredTrabajadores.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-xs italic">
                No se encontraron trabajadores
              </div>
            ) : (
              filteredTrabajadores.map(t => {
                const totalWorkerEntregas = entregas.filter(e => e.id_trabajador === t.id_trabajador).length;
                const isSelected = selectedTrabajadorId === t.id_trabajador;
                return (
                  <button
                    key={t.id_trabajador}
                    onClick={() => setSelectedTrabajadorId(t.id_trabajador)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center gap-4 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600/10 border-emerald-500/50 text-white"
                        : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">
                        {t.nombre_1} {t.apellido_paterno}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        RUT: {t.numero_identificacion || "N/A"}
                      </p>
                      {t.cargo && (
                        <p className="text-[9px] text-zinc-650 font-semibold mt-1 truncate">
                          {t.cargo}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {totalWorkerEntregas > 0 ? (
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                          {totalWorkerEntregas} {totalWorkerEntregas === 1 ? "entrega" : "entregas"}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-600 font-semibold px-2 py-0.5 rounded-full">
                          Sin EPP
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* EPP History and Detail - 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {selectedTrabajador ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl overflow-hidden min-h-[650px] flex flex-col">
              
              {/* Header de Trabajador Seleccionado */}
              <div className="p-6 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-base font-black text-white">
                    {selectedTrabajador.nombre_1} {selectedTrabajador.nombre_2 || ""} {selectedTrabajador.apellido_paterno} {selectedTrabajador.apellido_materno}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">
                    <span className="text-xs text-zinc-500 font-mono">
                      RUT: <strong className="text-zinc-350">{selectedTrabajador.numero_identificacion || "N/A"}</strong>
                    </span>
                    {selectedTrabajador.cargo && (
                      <span className="text-xs text-zinc-500">
                        Cargo: <strong className="text-zinc-350">{selectedTrabajador.cargo}</strong>
                      </span>
                    )}
                    {selectedTrabajador.email_corporativo && (
                      <span className="text-xs text-zinc-500 truncate max-w-xs">
                        Email: <strong className="text-zinc-350">{selectedTrabajador.email_corporativo}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowNewDeliveryModal(true)}
                  className="px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-emerald-600/20 transition-all cursor-pointer"
                >
                  <Plus size={12} strokeWidth={3} /> Nueva Entrega
                </button>
              </div>

              {/* Historial de Entregas List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <FileText size={13} className="text-zinc-500" /> Historial de Entregas Registradas
                </h3>

                {selectedTrabajadorDeliveries.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 p-6 border border-dashed border-zinc-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400">Sin historial de entregas</h4>
                      <p className="text-[10px] text-zinc-650 mt-1 leading-relaxed max-w-[240px] mx-auto">
                        Este trabajador aún no tiene Elementos de Protección Personal registrados. Haz clic en "Nueva Entrega" para registrar su primer equipamiento.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedTrabajadorDeliveries.map((delivery, index) => (
                      <div 
                        key={delivery.id_entrega} 
                        className="bg-zinc-900/20 border border-zinc-850 rounded-xl overflow-hidden shadow-sm hover:border-zinc-800 transition-all animate-fadeIn"
                      >
                        {/* Header de la tarjeta de entrega */}
                        <div className="bg-zinc-900/40 px-4 py-3 border-b border-zinc-850 flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
                              <Calendar size={12} className="text-zinc-500" />
                              {new Date(delivery.fecha_entrega).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                            </div>
                            {delivery.recibido_por && (
                              <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-750 px-2 py-0.5 rounded font-medium">
                                Recibe: {delivery.recibido_por}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("¿Estás seguro de que deseas eliminar este registro de entrega del historial?")) {
                                deleteEntrega(delivery.id_entrega);
                              }
                            }}
                            className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Items y detalles */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {delivery.items.map(item => (
                              <div 
                                key={item.id_item}
                                className="bg-zinc-950/40 border border-zinc-850 rounded-lg p-2.5 flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm">{PREDEFINED_EPPS.find(e => e.name === item.elemento)?.icon || "📦"}</span>
                                    <span className="font-bold text-zinc-200 truncate">{item.elemento}</span>
                                  </div>
                                  {item.opcion && (
                                    <p className="text-[9px] text-zinc-500 mt-0.5 truncate">{item.opcion}</p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                                    Cant: {item.cantidad}
                                  </span>
                                  {item.talla && (
                                    <p className="text-[9px] text-zinc-400 mt-1 font-mono">Talla: {item.talla}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Observaciones */}
                          {delivery.observaciones && (
                            <div className="bg-zinc-950/25 border border-zinc-850/50 p-2.5 rounded-lg text-[10px] text-zinc-400 flex items-start gap-1.5">
                              <Info size={12} className="flex-shrink-0 text-zinc-600 mt-0.5" />
                              <div>
                                <strong className="text-zinc-500 block uppercase text-[8px] tracking-wider font-bold">Observaciones:</strong>
                                <p className="mt-0.5 leading-relaxed">{delivery.observaciones}</p>
                              </div>
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
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Historial de EPP</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-[280px] leading-relaxed mx-auto">
                  Selecciona un trabajador de la lista de la izquierda para ver su ficha, registrar nuevas entregas o auditar su historial de equipamiento de seguridad.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* REGISTRAR NUEVA ENTREGA MODAL */}
      {showNewDeliveryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <form 
            onSubmit={handleSaveDelivery} 
            className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="text-emerald-500" size={15} /> Registrar Entrega de EPP
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewDeliveryModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Cabecera: Trabajador y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Seleccionar Trabajador */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Trabajador</label>
                  <select
                    required
                    value={formTrabajadorId}
                    onChange={e => handleFormTrabajadorChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="" disabled>Selecciona un trabajador...</option>
                    {trabajadores.map(t => (
                      <option key={t.id_trabajador} value={t.id_trabajador}>
                        {t.nombre_1} {t.apellido_paterno} ({t.numero_identificacion || "S/RUT"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Entrega */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Fecha de Entrega</label>
                  <input
                    type="date"
                    required
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 font-mono transition-all"
                  />
                </div>

                {/* Recibido Por */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Recibido Por (Firma/Nombre)</label>
                  <input
                    type="text"
                    placeholder="Ej: Andrés Felipe Muñoz"
                    value={formRecibidoPor}
                    onChange={e => setFormRecibidoPor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

              </div>

              {/* Grilla de EPPs para Seleccionar e Ingresar datos */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Elementos de Protección a Entregar
                  </h4>
                  <span className="text-[9px] text-zinc-500 font-medium">
                    (Marca el checkbox para activar el elemento y definir talla/cantidad)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PREDEFINED_EPPS.map(epp => {
                    const itemState = selectedItems[epp.name] || { checked: false, cantidad: 1, talla: "", opcion: "" };
                    return (
                      <div 
                        key={epp.id}
                        className={`p-3 rounded-xl border flex flex-col gap-3 transition-all ${
                          itemState.checked
                            ? "bg-emerald-600/5 border-emerald-500/40"
                            : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-850"
                        }`}
                      >
                        {/* Selector principal del EPP */}
                        <button
                          type="button"
                          onClick={() => handleItemCheck(epp.name)}
                          className="flex items-center justify-between w-full text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              itemState.checked
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-zinc-950 border-zinc-800 text-transparent"
                            }`}>
                              <Check size={11} strokeWidth={3} />
                            </div>
                            <span className="text-xs text-zinc-300">
                              <span className="text-base mr-2">{epp.icon}</span>
                              <strong className="text-white font-bold">{epp.name}</strong>
                            </span>
                          </div>
                        </button>

                        {/* Parámetros del EPP (sólo visibles si se activa) */}
                        {itemState.checked && (
                          <div className="grid grid-cols-12 gap-2 mt-1 border-t border-zinc-900/60 pt-2.5 animate-fadeIn">
                            {/* Cantidad - 3 Cols */}
                            <div className="col-span-3 space-y-1">
                              <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Cant.</label>
                              <input
                                type="number"
                                min={1}
                                required
                                value={itemState.cantidad}
                                onChange={e => handleItemValueChange(epp.name, "cantidad", parseInt(e.target.value) || 1)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500 text-center font-bold"
                              />
                            </div>

                            {/* Talla - 4 Cols */}
                            <div className="col-span-4 space-y-1">
                              <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Talla</label>
                              <input
                                type="text"
                                placeholder="Talla"
                                required
                                value={itemState.talla}
                                onChange={e => handleItemValueChange(epp.name, "talla", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500 font-mono text-center"
                              />
                            </div>

                            {/* Opción / Color - 5 Cols */}
                            <div className="col-span-5 space-y-1">
                              <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Color / Marca</label>
                              <input
                                type="text"
                                placeholder="Detalles"
                                value={itemState.opcion}
                                onChange={e => handleItemValueChange(epp.name, "opcion", e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded text-xs text-white p-1.5 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Observaciones generales */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                  Observaciones de Entrega
                </label>
                <textarea
                  rows={3}
                  placeholder="Añade notas sobre el estado del equipamiento, motivos de reposición o firmas..."
                  value={formObservaciones}
                  onChange={e => setFormObservaciones(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Modal Footer */}
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
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check size={14} /> ¡Guardado con Éxito!
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Registrar Entrega
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
