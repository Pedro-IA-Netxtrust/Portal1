"use client";

import React, { useState, useEffect } from "react";
import { useInventarioStore, type Producto, type Bodega, type Compra, type InventarioLote } from "@/store/inventario-store";
import { useProveedoresStore } from "@/store/proveedores-store";
import { useContratosStore } from "@/store/contratos-store";
import { useEppStore } from "@/store/epp-store";
import { 
  Package, Plus, Settings2, ShieldAlert, History, Library, 
  Warehouse, FileText, Check, AlertTriangle, HelpCircle, ArrowRight,
  TrendingUp, CircleDollarSign, PlusCircle, Trash2, Calendar, Search
} from "lucide-react";

export default function InventarioPage() {
  // Stores
  const { 
    productos, bodegas, compras, lotes, loading,
    fetchInventarioData, addProducto, addBodega, addCompra, getProductosBajoStockCritico 
  } = useInventarioStore();
  const { proveedores, fetchProveedores } = useProveedoresStore();
  const { contratos, fetchContratos } = useContratosStore();
  const { entregas, fetchEntregas } = useEppStore();

  // Estados de control
  const [activeTab, setActiveTab] = useState<"stock" | "compras" | "catalogo" | "bodegas" | "historial">("stock");
  const [isSaved, setIsSaved] = useState(false);

  // Formulario Producto
  const [prodNombre, setProdNombre] = useState("");
  const [prodCategoria, setProdCategoria] = useState("EPP");
  const [prodDesc, setProdDesc] = useState("");
  const [prodUnidad, setProdUnidad] = useState("Unidad");
  const [prodCritico, setProdCritico] = useState<number>(5);

  // Formulario Bodega
  const [bodNombre, setBodNombre] = useState("");
  const [bodUbicacion, setBodUbicacion] = useState("");

  // Formulario Compra (Header)
  const [compProveedor, setCompProveedor] = useState("");
  const [compFactura, setCompFactura] = useState("");
  const [compFecha, setCompFecha] = useState(new Date().toISOString().split("T")[0]);
  const [compMonto, setCompMonto] = useState<number>(0);
  const [compObs, setCompObs] = useState("");

  // Formulario Compra (Detalle Rows)
  const [compRows, setCompRows] = useState<Omit<InventarioLote, "id_lote" | "id_compra" | "cantidad_actual">[]>([
    { id_producto: "", id_bodega: "", talla: "Estándar", opcion: "Estándar", cantidad_inicial: 1, precio_unitario: 0 }
  ]);

  // Filtros Historial Central
  const [filterContrato, setFilterContrato] = useState("");
  const [filterTrabajador, setFilterTrabajador] = useState("");
  const [filterBodega, setFilterBodega] = useState("");

  // Cargar datos
  useEffect(() => {
    fetchInventarioData();
    fetchProveedores();
    fetchContratos();
    fetchEntregas();
  }, [fetchInventarioData, fetchProveedores, fetchContratos, fetchEntregas]);

  // Auto-calcular monto total de compra sumando filas
  useEffect(() => {
    const total = compRows.reduce((sum, row) => sum + (row.cantidad_inicial * row.precio_unitario), 0);
    setCompMonto(total);
  }, [compRows]);

  // Manejar fila de compra
  const addRow = () => {
    setCompRows(prev => [...prev, { id_producto: "", id_bodega: "", talla: "Estándar", opcion: "Estándar", cantidad_inicial: 1, precio_unitario: 0 }]);
  };

  const removeRow = (index: number) => {
    if (compRows.length === 1) return;
    setCompRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateRow = (index: number, field: string, value: any) => {
    setCompRows(prev => prev.map((row, idx) => {
      if (idx !== index) return row;
      return { ...row, [field]: value };
    }));
  };

  // Enviar Producto
  const handleSaveProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre) return;

    const success = await addProducto({
      nombre: prodNombre,
      categoria: prodCategoria,
      descripcion: prodDesc,
      unidad_medida: prodUnidad,
      stock_critico: prodCritico,
      activo: true
    });

    if (success) {
      setProdNombre("");
      setProdDesc("");
      setProdCritico(5);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    }
  };

  // Enviar Bodega
  const handleSaveBodega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodNombre) return;

    const success = await addBodega({
      nombre: bodNombre,
      ubicacion: bodUbicacion,
      activa: true
    });

    if (success) {
      setBodNombre("");
      setBodUbicacion("");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    }
  };

  // Enviar Compra
  const handleSaveCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compFactura || compRows.some(r => !r.id_producto || !r.id_bodega)) {
      alert("Por favor rellena la cabecera y define el producto y bodega para todas las filas.");
      return;
    }

    const success = await addCompra(
      {
        id_proveedor: compProveedor || undefined,
        numero_factura: compFactura,
        fecha_compra: compFecha,
        monto_total: compMonto,
        observaciones: compObs
      },
      compRows
    );

    if (success) {
      setCompFactura("");
      setCompProveedor("");
      setCompObs("");
      setCompRows([{ id_producto: "", id_bodega: "", talla: "Estándar", opcion: "Estándar", cantidad_inicial: 1, precio_unitario: 0 }]);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
    }
  };

  // Calcular alertas de Stock Crítico
  const bajoStockList = getProductosBajoStockCritico();

  // Desglosar lotes para mostrar stock actual agrupado
  // Bodega -> Producto -> Talla -> Variante -> Stock actual
  interface StockDisplayItem {
    id_producto: string;
    nombre_producto: string;
    id_bodega: string;
    nombre_bodega: string;
    talla: string;
    opcion: string;
    cantidad: number;
  }

  const stockList: StockDisplayItem[] = [];
  lotes.forEach(l => {
    if (l.cantidad_actual === 0) return;
    const prod = productos.find(p => p.id_producto === l.id_producto);
    const bod = bodegas.find(b => b.id_bodega === l.id_bodega);
    
    // Buscar si ya existe este item agrupado
    const existing = stockList.find(s => 
      s.id_producto === l.id_producto &&
      s.id_bodega === l.id_bodega &&
      s.talla === l.talla &&
      s.opcion === l.opcion
    );

    if (existing) {
      existing.cantidad += l.cantidad_actual;
    } else {
      stockList.push({
        id_producto: l.id_producto,
        nombre_producto: prod?.nombre || "Producto desconocido",
        id_bodega: l.id_bodega,
        nombre_bodega: bod?.nombre || "Bodega desconocida",
        talla: l.talla,
        opcion: l.opcion,
        cantidad: l.cantidad_actual
      });
    }
  });

  // Generar datos planos para el Historial Central de Asignaciones
  interface HistoryFlatItem {
    id_entrega: string;
    fecha: string;
    trabajador_nombre: string;
    trabajador_rut: string;
    contrato_nombre: string;
    contrato_id: string;
    producto_nombre: string;
    cantidad: number;
    talla: string;
    opcion: string;
    entregado_por: string;
    observaciones: string;
  }

  const historyFlat: HistoryFlatItem[] = [];
  entregas.forEach(ent => {
    const contrRef = contratos.find(c => c.id_contrato === ent.id_contrato);
    
    ent.items.forEach(item => {
      const prodRef = productos.find(p => p.id_producto === item.id_producto);
      historyFlat.push({
        id_entrega: ent.id_entrega,
        fecha: ent.fecha_entrega,
        trabajador_nombre: "Cargando...", // se resolverá dinámicamente si es posible
        trabajador_rut: "",
        contrato_nombre: contrRef?.nombre_contrato || "Sin Contrato",
        contrato_id: ent.id_contrato || "",
        producto_nombre: prodRef?.nombre || "EPP",
        cantidad: item.cantidad,
        talla: item.talla,
        opcion: item.opcion,
        entregado_por: ent.entregado_por || "N/A",
        observaciones: ent.observaciones || ""
      });
    });
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Warehouse className="text-violet-500" size={26} />
            Inventario de Bodega y EPP
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Gestión del catálogo de productos, registro de facturas de compras y control de niveles críticos de stock
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 bg-zinc-950 p-1 rounded-xl w-fit gap-1">
        {[
          { id: "stock", label: "Stock Disponible", icon: Package },
          { id: "compras", label: "Ingreso de Compras", icon: CircleDollarSign },
          { id: "catalogo", label: "Catálogo Productos", icon: Library },
          { id: "bodegas", label: "Bodegas", icon: Warehouse },
          { id: "historial", label: "Historial Salidas", icon: History }
        ].map(tab => {
          const ActiveIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                  : "text-zinc-500 hover:text-zinc-355 hover:bg-zinc-900/40"
              }`}
            >
              <ActiveIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alertas de Stock Crítico */}
      {bajoStockList.length > 0 && activeTab === "stock" && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 flex items-start gap-3.5 animate-fadeIn">
          <AlertTriangle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-bold uppercase text-red-400 tracking-wider">¡Alerta de Stock Crítico!</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Los siguientes productos están por debajo del límite mínimo establecido a nivel global:
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {bajoStockList.map(item => (
                <span 
                  key={item.producto.id_producto}
                  className="text-[10px] bg-red-950/40 border border-red-800/40 text-red-300 font-bold px-3 py-1 rounded-lg flex items-center gap-1.5"
                >
                  {item.producto.nombre}: <strong className="text-white">{item.stockTotal}</strong> / {item.producto.stock_critico} {item.producto.unidad_medida}s
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl min-h-[500px]">
        
        {/* 1. STOCK DISPONIBLE */}
        {activeTab === "stock" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Existencias en Bodegas</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Control de saldos por variante, talla y almacén de faena</p>
              </div>
            </div>

            {stockList.length === 0 ? (
              <div className="py-20 text-center text-zinc-650 italic text-xs border border-dashed border-zinc-900 rounded-xl space-y-2">
                <p>No hay stock de productos en ninguna bodega.</p>
                <p className="text-[10px] font-normal">Ve a la pestaña &ldquo;Ingreso de Compras&rdquo; para cargar tu primera factura.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400 border-collapse divide-y divide-zinc-900">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pl-3">Bodega</th>
                      <th className="pb-3">Producto</th>
                      <th className="pb-3">Talla</th>
                      <th className="pb-3">Variante (Color/Marca)</th>
                      <th className="pb-3 text-right pr-3">Stock Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {stockList.map((item, idx) => {
                      const prodRef = productos.find(p => p.id_producto === item.id_producto);
                      const isCritical = prodRef ? getProductosBajoStockCritico().some(b => b.producto.id_producto === item.id_producto) : false;
                      
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3.5 pl-3 font-semibold text-zinc-350">{item.nombre_bodega}</td>
                          <td className="py-3.5 flex items-center gap-2 font-bold text-white">
                            {item.nombre_producto}
                            {isCritical && (
                              <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">
                                STOCK BAJO
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 font-mono text-zinc-350">{item.talla}</td>
                          <td className="py-3.5 text-zinc-500">{item.opcion}</td>
                          <td className="py-3.5 text-right pr-3 font-black text-white">
                            <span className={`px-2 py-0.5 rounded font-mono ${isCritical ? "text-red-400 bg-red-950/20" : "text-emerald-400 bg-emerald-950/10"}`}>
                              {item.cantidad}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. INGRESO DE COMPRAS */}
        {activeTab === "compras" && (
          <form onSubmit={handleSaveCompra} className="space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Registrar Factura de Compra</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Ingreso coordinado de múltiples lotes de productos asociados a un documento tributario</p>
            </div>

            {/* Header Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Número de Factura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: FAC-9908"
                  value={compFactura}
                  onChange={e => setCompFactura(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Proveedor</label>
                <select
                  value={compProveedor}
                  onChange={e => setCompProveedor(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                >
                  <option value="">Selecciona un proveedor (opcional)...</option>
                  {proveedores.map(p => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre} ({p.rut})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Fecha de Compra</label>
                <input
                  type="date"
                  required
                  value={compFecha}
                  onChange={e => setCompFecha(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Monto Total de Compra</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-zinc-650 font-bold font-mono">$</span>
                  <input
                    type="text"
                    disabled
                    value={compMonto.toLocaleString("es-CL")}
                    className="w-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 rounded-lg p-3 pl-7 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Observaciones Generales</label>
              <textarea
                rows={2}
                placeholder="Añade notas sobre el pedido o condiciones de despacho..."
                value={compObs}
                onChange={e => setCompObs(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Details Form Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalle de Productos a Cargar</h4>
                <button
                  type="button"
                  onClick={addRow}
                  className="px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-violet-600/20 transition-all cursor-pointer"
                >
                  <PlusCircle size={12} /> Agregar Producto
                </button>
              </div>

              <div className="space-y-3">
                {compRows.map((row, index) => (
                  <div 
                    key={index}
                    className="grid grid-cols-12 gap-3.5 bg-zinc-900/20 border border-zinc-850 p-4 rounded-xl items-end relative hover:border-zinc-800 transition-all"
                  >
                    {/* Seleccionar Producto - 3 Cols */}
                    <div className="col-span-12 md:col-span-3 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Producto</label>
                      <select
                        required
                        value={row.id_producto}
                        onChange={e => updateRow(index, "id_producto", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                      >
                        <option value="" disabled>Selecciona producto...</option>
                        {productos.map(p => (
                          <option key={p.id_producto} value={p.id_producto}>
                            {p.nombre} ({p.categoria})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seleccionar Bodega - 3 Cols */}
                    <div className="col-span-12 md:col-span-3 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Bodega de Destino</label>
                      <select
                        required
                        value={row.id_bodega}
                        onChange={e => updateRow(index, "id_bodega", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                      >
                        <option value="" disabled>Selecciona bodega...</option>
                        {bodegas.map(b => (
                          <option key={b.id_bodega} value={b.id_bodega}>
                            {b.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Talla - 1.5 Cols */}
                    <div className="col-span-4 md:col-span-1.5 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Talla</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 41, M"
                        value={row.talla}
                        onChange={e => updateRow(index, "talla", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500 text-center font-mono"
                      />
                    </div>

                    {/* Opcion - 1.5 Cols */}
                    <div className="col-span-4 md:col-span-1.5 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Variante</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Negro, 3M"
                        value={row.opcion}
                        onChange={e => updateRow(index, "opcion", e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    {/* Cantidad - 1.5 Cols */}
                    <div className="col-span-4 md:col-span-1 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Cant.</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={row.cantidad_inicial}
                        onChange={e => updateRow(index, "cantidad_inicial", parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500 text-center font-bold"
                      />
                    </div>

                    {/* Precio Unitario - 1.5 Cols */}
                    <div className="col-span-6 md:col-span-1.5 space-y-1">
                      <label className="text-[9px] text-zinc-500 font-semibold uppercase block">Precio Unit.</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={row.precio_unitario}
                        onChange={e => updateRow(index, "precio_unitario", parseInt(e.target.value) || 0)}
                        className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500 font-mono text-right"
                      />
                    </div>

                    {/* Acciones - 0.5 Cols */}
                    <div className="col-span-6 md:col-span-0.5 flex justify-end pb-2">
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={compRows.length === 1}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isSaved}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check size={14} /> ¡Compra Guardada!
                  </>
                ) : (
                  <>
                    <CircleDollarSign size={13} /> Registrar Compra y Lotes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3. CATALOGO DE PRODUCTOS */}
        {activeTab === "catalogo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulario Crear - 4 Cols */}
            <form onSubmit={handleSaveProducto} className="lg:col-span-4 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Plus size={14} className="text-violet-400" /> Crear Nuevo Producto
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lentes de Seguridad 3M"
                  value={prodNombre}
                  onChange={e => setProdNombre(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Categoría</label>
                <select
                  value={prodCategoria}
                  onChange={e => setProdCategoria(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                >
                  <option value="EPP">EPP (Equipo Protección Personal)</option>
                  <option value="Herramientas">Herramientas</option>
                  <option value="Insumos">Insumos de Oficina</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Unidad de Medida</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Par, Unidad, Caja"
                  value={prodUnidad}
                  onChange={e => setProdUnidad(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Stock Crítico Mínimo</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={prodCritico}
                  onChange={e => setProdCritico(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Detalla especificaciones técnicas o normativas..."
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSaved}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check size={14} /> ¡Producto Creado!
                  </>
                ) : (
                  <>
                    <Library size={13} /> Guardar Producto
                  </>
                )}
              </button>
            </form>

            {/* Listado Catálogo - 8 Cols */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900 pb-2">
                Catálogo de Productos Activos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productos.map(p => (
                  <div 
                    key={p.id_producto}
                    className="bg-zinc-900/25 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-800 transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-white">{p.nombre}</h4>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded">
                          {p.categoria}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">{p.descripcion || "Sin descripción disponible."}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 mt-3 text-[10px]">
                      <span className="text-zinc-500">Unidad: <strong className="text-zinc-350">{p.unidad_medida}</strong></span>
                      <span className="text-zinc-500">Stock Crítico: <strong className="text-red-400 font-mono">{p.stock_critico}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 4. BODEGAS */}
        {activeTab === "bodegas" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formulario Crear - 4 Cols */}
            <form onSubmit={handleSaveBodega} className="lg:col-span-4 bg-zinc-900/10 border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-2">
                <Plus size={14} className="text-violet-400" /> Crear Nueva Bodega
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nombre de la Bodega</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bodega Faena 3"
                  value={bodNombre}
                  onChange={e => setBodNombre(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Ubicación / Faena</label>
                <input
                  type="text"
                  placeholder="Ej: Antofagasta Sector Sur"
                  value={bodUbicacion}
                  onChange={e => setBodUbicacion(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSaved}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <Check size={14} /> ¡Bodega Creada!
                  </>
                ) : (
                  <>
                    <Warehouse size={13} /> Guardar Bodega
                  </>
                )}
              </button>
            </form>

            {/* Listado Bodegas - 8 Cols */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900 pb-2">
                Bodegas Habilitadas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bodegas.map(b => (
                  <div 
                    key={b.id_bodega}
                    className="bg-zinc-900/25 border border-zinc-850 p-4 rounded-xl flex items-center justify-between hover:border-zinc-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-violet-400">
                        <Warehouse size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{b.nombre}</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{b.ubicacion || "Sin dirección física."}</p>
                      </div>
                    </div>
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      ACTIVA
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 5. HISTORIAL CENTRAL SALIDAS */}
        {activeTab === "historial" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Reporte de Asignaciones y Salidas</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Historial consolidado de entrega de EPP en base a stock retirado de bodegas</p>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/15 border border-zinc-900 p-4 rounded-2xl">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Filtrar por Contrato</label>
                <select
                  value={filterContrato}
                  onChange={e => setFilterContrato(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Todos los contratos...</option>
                  {contratos.map(c => (
                    <option key={c.id_contrato} value={c.id_contrato}>
                      {c.nombre_contrato}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Filtrar por Bodega de Salida</label>
                <select
                  value={filterBodega}
                  onChange={e => setFilterBodega(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Todas las bodegas...</option>
                  {bodegas.map(b => (
                    <option key={b.id_bodega} value={b.id_bodega}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Buscar por Operador (Entregó)</label>
                <input
                  type="text"
                  placeholder="Nombre de quien entregó..."
                  value={filterTrabajador}
                  onChange={e => setFilterTrabajador(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 text-xs text-white rounded p-2 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* List Table */}
            {historyFlat.length === 0 ? (
              <div className="py-20 text-center text-zinc-650 italic text-xs">
                No hay registros de salidas de EPP disponibles.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400 border-collapse divide-y divide-zinc-900">
                  <thead>
                    <tr className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pl-3">Fecha</th>
                      <th className="pb-3">Contrato</th>
                      <th className="pb-3">Producto</th>
                      <th className="pb-3">Talla/Color</th>
                      <th className="pb-3 text-right">Cantidad</th>
                      <th className="pb-3 pl-6">Entregado Por</th>
                      <th className="pb-3 pr-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {historyFlat
                      .filter(item => {
                        if (filterContrato && item.contrato_id !== filterContrato) return false;
                        if (filterTrabajador && !item.entregado_por.toLowerCase().includes(filterTrabajador.toLowerCase())) return false;
                        return true;
                      })
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3.5 pl-3 font-mono text-zinc-350">{new Date(item.fecha).toLocaleDateString("es-CL", { timeZone: "UTC" })}</td>
                          <td className="py-3.5 font-bold text-zinc-200">{item.contrato_nombre}</td>
                          <td className="py-3.5 font-black text-white">{item.producto_nombre}</td>
                          <td className="py-3.5 font-mono text-zinc-500">{item.talla} / {item.opcion}</td>
                          <td className="py-3.5 text-right font-bold text-emerald-400 font-mono pr-2">{item.cantidad}</td>
                          <td className="py-3.5 pl-6 text-zinc-350">{item.entregado_por}</td>
                          <td className="py-3.5 text-right pr-3">
                            <button
                              onClick={() => {
                                if (confirm("¿Estás seguro de que deseas eliminar este registro de asignación? Se descontará o liberará el historial.")) {
                                  // delete EPP
                                }
                              }}
                              className="p-1 rounded text-zinc-650 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
