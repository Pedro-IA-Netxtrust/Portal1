import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { useAuditoriaStore } from "@/store/auditoria-store";

const log = createLogger("inventario-store");

export interface Bodega {
  id_bodega: string;
  nombre: string;
  ubicacion?: string;
  activa: boolean;
}

export interface Producto {
  id_producto: string;
  nombre: string;
  categoria: string; // EPP, Herramientas, Insumos
  descripcion?: string;
  unidad_medida: string; // Par, Unidad, Caja
  stock_critico: number;
  activo: boolean;
}

export interface Compra {
  id_compra: string;
  id_proveedor?: string;
  numero_factura: string;
  fecha_compra: string; // YYYY-MM-DD
  monto_total: number;
  observaciones?: string;
  fecha_creacion?: string;
}

export interface InventarioLote {
  id_lote: string;
  id_compra: string;
  id_producto: string;
  id_bodega: string;
  talla: string;
  opcion: string; // Variante: Color, marca, etc.
  cantidad_inicial: number;
  cantidad_actual: number;
  precio_unitario: number;
  fecha_compra?: string; // Denormalizado para ordenamiento local fácil
}

export interface DescuentoInventario {
  id_descuento: string;
  id_item_entrega: string;
  id_lote: string;
  cantidad: number;
  created_at?: string;
}

interface InventarioState {
  productos: Producto[];
  bodegas: Bodega[];
  compras: Compra[];
  lotes: InventarioLote[];
  descuentos: DescuentoInventario[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;

  fetchInventarioData: () => Promise<void>;
  addProducto: (p: Omit<Producto, "id_producto">) => Promise<boolean>;
  addBodega: (b: Omit<Bodega, "id_bodega">) => Promise<boolean>;
  addCompra: (
    compra: Omit<Compra, "id_compra" | "fecha_creacion">,
    items: Omit<InventarioLote, "id_lote" | "id_compra" | "cantidad_actual">[]
  ) => Promise<boolean>;
  descontarStockFIFO: (
    id_producto: string,
    talla: string,
    opcion: string,
    id_bodega: string,
    cantidadADescontar: number,
    id_item_entrega: string
  ) => Promise<{ exito: boolean; detalleDescuentos: Omit<DescuentoInventario, "id_descuento">[] }>;
  
  // Helpers para reportes
  getStockDisponible: (id_producto: string, talla: string, opcion: string, id_bodega?: string) => number;
  getProductosBajoStockCritico: () => { producto: Producto; stockTotal: number }[];
}

// ─────────────────────────────────────────────────────────────
//  Datos Semilla / Mock para fallback
// ─────────────────────────────────────────────────────────────

const mockBodegas: Bodega[] = [
  { id_bodega: "b-1", nombre: "Bodega Central", ubicacion: "Santiago Oficina", activa: true },
  { id_bodega: "b-2", nombre: "Bodega Faena Escondida", ubicacion: "Antofagasta Faena", activa: true },
  { id_bodega: "b-3", nombre: "Bodega Obra Arauco", ubicacion: "Concepción Planta", activa: true }
];

const mockProductos: Producto[] = [
  { id_producto: "p-1", nombre: "Zapatos de Seguridad", categoria: "EPP", descripcion: "Calzado de seguridad punta de acero reforzado", unidad_medida: "Par", stock_critico: 10, activo: true },
  { id_producto: "p-2", nombre: "Casco de Seguridad", categoria: "EPP", descripcion: "Casco de seguridad dieléctrico de alto impacto", unidad_medida: "Unidad", stock_critico: 8, activo: true },
  { id_producto: "p-3", nombre: "Geólogo", categoria: "EPP", descripcion: "Chaleco geólogo con cintas reflectantes", unidad_medida: "Unidad", stock_critico: 12, activo: true },
  { id_producto: "p-4", nombre: "Lentes de Seguridad", categoria: "EPP", descripcion: "Lentes transparentes con protección UV y antiempaño", unidad_medida: "Unidad", stock_critico: 15, activo: true },
  { id_producto: "p-5", nombre: "Guantes de Nitrilo", categoria: "EPP", descripcion: "Guantes de trabajo antideslizantes de nitrilo", unidad_medida: "Par", stock_critico: 20, activo: true },
  { id_producto: "p-6", nombre: "Chaqueta Térmica", categoria: "EPP", descripcion: "Chaqueta impermeable de invierno con reflectores", unidad_medida: "Unidad", stock_critico: 5, activo: true },
  { id_producto: "p-7", nombre: "Laptop HP ProBook", categoria: "Insumos", descripcion: "Laptop corporativo HP", unidad_medida: "Unidad", stock_critico: 2, activo: true }
];

const mockCompras: Compra[] = [
  { id_compra: "comp-1", id_proveedor: "prov-1", numero_factura: "FAC-10029", fecha_compra: "2026-06-01", monto_total: 450000, observaciones: "Abastecimiento inicial invierno" },
  { id_compra: "comp-2", id_proveedor: "prov-3", numero_factura: "FAC-22045", fecha_compra: "2026-06-08", monto_total: 180000, observaciones: "Reposición rápida de cascos y lentes" }
];

const mockLotes: InventarioLote[] = [
  // Lotes Compra 1 (FAC-10029)
  { id_lote: "lote-1", id_compra: "comp-1", id_producto: "p-1", id_bodega: "b-1", talla: "42", opcion: "Negro", cantidad_inicial: 15, cantidad_actual: 15, precio_unitario: 18000, fecha_compra: "2026-06-01" },
  { id_lote: "lote-2", id_compra: "comp-1", id_producto: "p-1", id_bodega: "b-2", talla: "41", opcion: "Negro", cantidad_inicial: 10, cantidad_actual: 10, precio_unitario: 18000, fecha_compra: "2026-06-01" },
  { id_lote: "lote-3", id_compra: "comp-1", id_producto: "p-2", id_bodega: "b-1", talla: "Estándar", opcion: "Amarillo", cantidad_inicial: 20, cantidad_actual: 20, precio_unitario: 5000, fecha_compra: "2026-06-01" },
  { id_lote: "lote-4", id_compra: "comp-1", id_producto: "p-6", id_bodega: "b-1", talla: "L", opcion: "Azul Térmico", cantidad_inicial: 8, cantidad_actual: 8, precio_unitario: 35000, fecha_compra: "2026-06-01" },
  
  // Lotes Compra 2 (FAC-22045)
  { id_lote: "lote-5", id_compra: "comp-2", id_producto: "p-2", id_bodega: "b-1", talla: "Estándar", opcion: "Amarillo", cantidad_inicial: 10, cantidad_actual: 10, precio_unitario: 4800, fecha_compra: "2026-06-08" },
  { id_lote: "lote-6", id_compra: "comp-2", id_producto: "p-4", id_bodega: "b-2", talla: "M", opcion: "Claro", cantidad_inicial: 30, cantidad_actual: 30, precio_unitario: 2200, fecha_compra: "2026-06-08" }
];

// ─────────────────────────────────────────────────────────────
//  Store Implementation
// ─────────────────────────────────────────────────────────────

export const useInventarioStore = create<InventarioState>()(
  persist(
    (set, get) => ({
      productos: mockProductos,
      bodegas: mockBodegas,
      compras: mockCompras,
      lotes: mockLotes,
      descuentos: [],
      loading: false,
      hydrated: false,

      fetchInventarioData: async () => {
        set({ loading: true });
        try {
          // 1. Cargar bodegas
          const { data: bData, error: bErr } = await supabase.from("bodegas").select("*");
          if (bErr) throw bErr;

          // 2. Cargar productos
          const { data: pData, error: pErr } = await supabase.from("productos").select("*");
          if (pErr) throw pErr;

          // 3. Cargar compras
          const { data: cData, error: cErr } = await supabase.from("epp_compras").select("*");
          if (cErr) throw cErr;

          // 4. Cargar lotes (inventario)
          const { data: lData, error: lErr } = await supabase.from("epp_inventario_lotes").select("*");
          if (lErr) throw lErr;

          // 5. Cargar descuentos
          const { data: dData, error: dErr } = await supabase.from("epp_descuentos_inventario").select("*");
          if (dErr) throw dErr;

          // Mapear campos fecha_compra denormalizados a los lotes para ordenamiento local fácil
          const lotesConFecha = (lData || []).map(lot => {
            const compraRef = (cData || []).find(c => c.id_compra === lot.id_compra);
            return {
              ...lot,
              fecha_compra: compraRef ? compraRef.fecha_compra : "2026-01-01"
            };
          });

          set({
            bodegas: bData || mockBodegas,
            productos: pData || mockProductos,
            compras: cData || mockCompras,
            lotes: lData && lData.length > 0 ? lotesConFecha : mockLotes,
            descuentos: dData || []
          });

        } catch (err) {
          log.warn("Fallback a datos locales o cache", err);
        } finally {
          set({ loading: false });
        }
      },

      addProducto: async (p) => {
        const tempId = `prod-temp-${Date.now()}`;
        const nuevoProd: Producto = { ...p, id_producto: tempId };
        
        set(state => ({ productos: [...state.productos, nuevoProd] }));

        try {
          const { data, error } = await supabase
            .from("productos")
            .insert([p])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set(state => ({
              productos: state.productos.map(item => item.id_producto === tempId ? data[0] : item)
            }));
          }
          return true;
        } catch (err) {
          log.error("Error al crear producto en Supabase", err);
          return true; // Continuamos local
        }
      },

      addBodega: async (b) => {
        const tempId = `bod-temp-${Date.now()}`;
        const nuevaBod: Bodega = { ...b, id_bodega: tempId };
        
        set(state => ({ bodegas: [...state.bodegas, nuevaBod] }));

        try {
          const { data, error } = await supabase
            .from("bodegas")
            .insert([b])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set(state => ({
              bodegas: state.bodegas.map(item => item.id_bodega === tempId ? data[0] : item)
            }));
          }
          return true;
        } catch (err) {
          log.error("Error al crear bodega en Supabase", err);
          return true; // Continuamos local
        }
      },

      addCompra: async (compra, items) => {
        const tempCompraId = `comp-temp-${Date.now()}`;
        
        // 1. Crear objetos locales optimistas
        const nuevaCompraLocal: Compra = {
          ...compra,
          id_compra: tempCompraId,
          fecha_creacion: new Date().toISOString()
        };

        const nuevosLotesLocales: InventarioLote[] = items.map((it, idx) => ({
          ...it,
          id_lote: `lote-temp-${idx}-${Date.now()}`,
          id_compra: tempCompraId,
          cantidad_actual: it.cantidad_inicial,
          fecha_compra: compra.fecha_compra
        }));

        set(state => ({
          compras: [nuevaCompraLocal, ...state.compras],
          lotes: [...nuevosLotesLocales, ...state.lotes]
        }));

        try {
          // 2. Insertar cabecera compra
          const { data: dataCompra, error: errorCompra } = await supabase
            .from("epp_compras")
            .insert([{
              id_proveedor: compra.id_proveedor || null,
              numero_factura: compra.numero_factura,
              fecha_compra: compra.fecha_compra,
              monto_total: compra.monto_total,
              observaciones: compra.observaciones || null
            }])
            .select();

          if (errorCompra) throw errorCompra;
          if (!dataCompra || dataCompra.length === 0) throw new Error("No se pudo obtener el id de compra.");

          const realCompraId = dataCompra[0].id_compra;

          // 3. Insertar lotes asociados
          const lotesDb = items.map(it => ({
            id_compra: realCompraId,
            id_producto: it.id_producto,
            id_bodega: it.id_bodega,
            talla: it.talla,
            opcion: it.opcion || 'Estándar',
            cantidad_inicial: it.cantidad_inicial,
            cantidad_actual: it.cantidad_inicial, // inicialmente inicial = actual
            precio_unitario: it.precio_unitario
          }));

          const { data: dataLotes, error: errorLotes } = await supabase
            .from("epp_inventario_lotes")
            .insert(lotesDb)
            .select();

          if (errorLotes) throw errorLotes;

          // 4. Mapear respuesta real
          const lotesConFecha = (dataLotes || []).map(l => ({
            ...l,
            fecha_compra: compra.fecha_compra
          }));

          set(state => ({
            compras: state.compras.map(c => c.id_compra === tempCompraId ? dataCompra[0] : c),
            lotes: state.lotes.filter(l => l.id_compra !== tempCompraId).concat(lotesConFecha)
          }));

          // Auditar acción
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: realCompraId,
            nombre_entidad: `Factura ${compra.numero_factura}`,
            detalle: `Ingreso de compra por Factura ${compra.numero_factura}. Productos agregados al stock: ${items.length} lotes.`
          });

          return true;

        } catch (err) {
          log.error("Error al persistir la compra en Supabase", err);
          
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: tempCompraId,
            nombre_entidad: `Factura ${compra.numero_factura} (Local)`,
            detalle: `Ingreso de compra local/offline por Factura ${compra.numero_factura}.`
          });

          return true; // Continuamos local
        }
      },

      descontarStockFIFO: async (id_producto, talla, opcion, id_bodega, cantidadADescontar, id_item_entrega) => {
        const state = get();
        
        // 1. Filtrar los lotes disponibles activos para el producto exacto
        const lotesCandidatos = state.lotes
          .filter(l => 
            l.id_producto === id_producto &&
            l.talla.toLowerCase() === talla.toLowerCase() &&
            l.opcion.toLowerCase() === opcion.toLowerCase() &&
            l.id_bodega === id_bodega &&
            l.cantidad_actual > 0
          )
          // Ordenar por fecha_compra ascendente (FIFO)
          .sort((a, b) => {
            const dateA = a.fecha_compra ? new Date(a.fecha_compra).getTime() : 0;
            const dateB = b.fecha_compra ? new Date(b.fecha_compra).getTime() : 0;
            return dateA - dateB;
          });

        // Calcular stock disponible total
        const totalDisponible = lotesCandidatos.reduce((sum, l) => sum + l.cantidad_actual, 0);
        if (totalDisponible < cantidadADescontar) {
          log.error("Stock insuficiente para descontar", { solicitado: cantidadADescontar, disponible: totalDisponible });
          return { exito: false, detalleDescuentos: [] };
        }

        let cantidadRestante = cantidadADescontar;
        const lotesModificados: InventarioLote[] = [];
        const descuentosGenerados: Omit<DescuentoInventario, "id_descuento">[] = [];

        // Algoritmo FIFO
        for (const lote of lotesCandidatos) {
          if (cantidadRestante <= 0) break;

          const aDescontar = Math.min(lote.cantidad_actual, cantidadRestante);
          const loteModificado = {
            ...lote,
            cantidad_actual: lote.cantidad_actual - aDescontar
          };

          lotesModificados.push(loteModificado);
          descuentosGenerados.push({
            id_item_entrega: id_item_entrega,
            id_lote: lote.id_lote,
            cantidad: aDescontar
          });

          cantidadRestante -= aDescontar;
        }

        // Actualizar Zustand localmente
        set(currState => {
          const nuevosLotes = currState.lotes.map(l => {
            const mod = lotesModificados.find(m => m.id_lote === l.id_lote);
            return mod ? mod : l;
          });
          const nuevosDescuentos = [...currState.descuentos, ...descuentosGenerados.map((d, i) => ({
            ...d,
            id_descuento: `desc-temp-${i}-${Date.now()}`
          }))];
          return {
            lotes: nuevosLotes,
            descuentos: nuevosDescuentos
          };
        });

        // Persistir en Supabase
        try {
          // Actualizar cada lote en la BD
          for (const lm of lotesModificados) {
            if (!lm.id_lote.startsWith("lote-temp-")) {
              await supabase
                .from("epp_inventario_lotes")
                .update({ cantidad_actual: lm.cantidad_actual })
                .eq("id_lote", lm.id_lote);
            }
          }

          // Insertar los registros de trazabilidad de descuentos
          const descuentosDb = descuentosGenerados.map(d => ({
            id_item_item: d.id_item_entrega, // FK en DB
            id_lote: d.id_lote,
            cantidad: d.cantidad
          }));

          const { data, error } = await supabase
            .from("epp_descuentos_inventario")
            .insert(descuentosDb)
            .select();

          if (error) throw error;
          
          if (data) {
            set(currState => ({
              descuentos: currState.descuentos.map(d => {
                const match = data.find(db => db.id_lote === d.id_lote && db.id_item_item === d.id_item_entrega);
                return match ? { ...d, id_descuento: match.id_descuento } : d;
              })
            }));
          }

        } catch (dbErr) {
          log.warn("Error al persistir el descuento FIFO en Supabase", dbErr);
        }

        return { exito: true, detalleDescuentos: descuentosGenerados };
      },

      getStockDisponible: (id_producto, talla, opcion, id_bodega) => {
        const state = get();
        const lotesFiltrados = state.lotes.filter(l => 
          l.id_producto === id_producto &&
          l.talla.toLowerCase() === talla.toLowerCase() &&
          l.opcion.toLowerCase() === opcion.toLowerCase() &&
          (id_bodega === undefined || l.id_bodega === id_bodega)
        );
        return lotesFiltrados.reduce((sum, l) => sum + l.cantidad_actual, 0);
      },

      getProductosBajoStockCritico: () => {
        const state = get();
        const result: { producto: Producto; stockTotal: number }[] = [];

        state.productos.forEach(p => {
          if (!p.activo) return;
          
          // Suma acumulada de todas las bodegas
          const stockTotal = state.lotes
            .filter(l => l.id_producto === p.id_producto)
            .reduce((sum, l) => sum + l.cantidad_actual, 0);

          if (stockTotal < p.stock_critico) {
            result.push({ producto: p, stockTotal });
          }
        });

        return result;
      }
    }),
    {
      name: "monitoring-inventario-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
