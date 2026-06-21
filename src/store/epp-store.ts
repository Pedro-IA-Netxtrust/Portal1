import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { useAuditoriaStore } from "@/store/auditoria-store";
import { useInventarioStore } from "@/store/inventario-store";

const log = createLogger("epp-store");

export interface EppItem {
  id_item: string;
  id_entrega: string;
  id_producto: string;
  cantidad: number;
  talla: string;
  opcion: string;
}

export interface EppEntrega {
  id_entrega: string;
  id_trabajador: string;
  id_contrato?: string | null;
  fecha_entrega: string; // YYYY-MM-DD
  recibido_por?: string;
  entregado_por?: string; // Nombre del operador/encargado
  observaciones?: string;
  fecha_creacion?: string;
  items: EppItem[];
}

interface EppState {
  entregas: EppEntrega[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  
  fetchEntregas: () => Promise<void>;
  addEntrega: (
    entrega: Omit<EppEntrega, "id_entrega" | "items" | "fecha_creacion">,
    items: Omit<EppItem, "id_item" | "id_entrega">[],
    id_bodega: string // Bodega de origen del descuento
  ) => Promise<boolean>;
  deleteEntrega: (id_entrega: string) => Promise<boolean>;
}

// Datos semilla de prueba adaptados al catálogo relacional
const mockEntregas: EppEntrega[] = [
  {
    id_entrega: "ent-1",
    id_trabajador: "44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6", // Josépedro Abbott
    id_contrato: "temp-c-1", // Contrato mock
    fecha_entrega: "2026-06-01",
    recibido_por: "Josépedro Abbott",
    entregado_por: "Administrador Central",
    observaciones: "Entrega inicial de terreno de invierno",
    fecha_creacion: "2026-06-01T10:00:00Z",
    items: [
      { id_item: "item-1", id_entrega: "ent-1", id_producto: "p-1", cantidad: 1, talla: "42", opcion: "Negro" }, // Zapatos
      { id_item: "item-2", id_entrega: "ent-1", id_producto: "p-6", cantidad: 1, talla: "L", opcion: "Azul Térmico" }, // Chaqueta
      { id_item: "item-3", id_entrega: "ent-1", id_producto: "p-2", cantidad: 1, talla: "Estándar", opcion: "Amarillo" } // Casco
    ]
  },
  {
    id_entrega: "ent-2",
    id_trabajador: "3313c7df-7cdd-43e0-8bbf-71826154e560", // Natalia Arias
    id_contrato: "temp-c-1",
    fecha_entrega: "2026-06-05",
    recibido_por: "Natalia Arias",
    entregado_por: "Administrador Central",
    observaciones: "Reposición de lentes dañados",
    fecha_creacion: "2026-06-05T14:30:00Z",
    items: [
      { id_item: "item-4", id_entrega: "ent-2", id_producto: "p-4", cantidad: 2, talla: "M", opcion: "Claro" } // Lentes
    ]
  }
];

export const useEppStore = create<EppState>()(
  persist(
    (set, get) => ({
      entregas: mockEntregas,
      loading: false,
      hydrated: false,

      fetchEntregas: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("epp_entregas")
            .select(`
              *,
              items: epp_entrega_items(*)
            `)
            .order("fecha_entrega", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            set({ entregas: data as EppEntrega[] });
          } else if (data && data.length === 0) {
            set({ entregas: [] });
          }
        } catch (err) {
          log.warn("Offline o error al cargar de Supabase, usando cache", err);
        } finally {
          set({ loading: false });
        }
      },

      addEntrega: async (entrega, items, id_bodega) => {
        const tempId = `ent-temp-${Date.now()}`;
        
        // Crear representación local optimista
        const itemsLocales: EppItem[] = items.map((it, idx) => ({
          ...it,
          id_item: `item-temp-${idx}-${Date.now()}`,
          id_entrega: tempId
        }));
        
        const nuevaEntregaLocal: EppEntrega = {
          ...entrega,
          id_entrega: tempId,
          fecha_creacion: new Date().toISOString(),
          items: itemsLocales
        };

        // 1. Añadir localmente optimista (sin rollback: el catch externo
        //    deja la entrega local; la consistencia con Supabase se reconcilia
        //    en el siguiente fetchEntregas).
        set(state => ({ entregas: [nuevaEntregaLocal, ...state.entregas] }));

        try {
          // 2. Insertar cabecera entrega en Supabase
          const { data: dataEntrega, error: errorEntrega } = await supabase
            .from("epp_entregas")
            .insert([{
              id_trabajador: entrega.id_trabajador,
              id_contrato: entrega.id_contrato || null,
              fecha_entrega: entrega.fecha_entrega,
              recibido_por: entrega.recibido_por || null,
              entregado_por: entrega.entregado_por || null,
              observaciones: entrega.observaciones || null
            }])
            .select();

          if (errorEntrega) throw errorEntrega;
          if (!dataEntrega || dataEntrega.length === 0) throw new Error("No se pudo obtener el id de entrega.");

          const realEntregaId = dataEntrega[0].id_entrega;

          // 3. Insertar items del detalle
          const itemsDb = items.map(it => ({
            id_entrega: realEntregaId,
            id_producto: it.id_producto,
            cantidad: it.cantidad,
            talla: it.talla,
            opcion: it.opcion
          }));

          const { data: dataItems, error: errorItems } = await supabase
            .from("epp_entrega_items")
            .insert(itemsDb)
            .select();

          if (errorItems) throw errorItems;

          // 4. Descontar del inventario lote por lote (FIFO)
          // Hacemos el descuento local y remoto por cada item
          for (const dbItem of (dataItems || [])) {
            const resultDescuento = await useInventarioStore.getState().descontarStockFIFO(
              dbItem.id_producto,
              dbItem.talla,
              dbItem.opcion,
              id_bodega,
              dbItem.cantidad,
              dbItem.id_item
            );
            if (!resultDescuento.exito) {
              log.warn("Alerta de descuento stock incompleta", { id_producto: dbItem.id_producto });
            }
          }

          // 5. Consolidar estado local
          const finalEntrega: EppEntrega = {
            ...dataEntrega[0],
            items: dataItems || []
          };

          set(state => ({
            entregas: state.entregas.map(e => e.id_entrega === tempId ? finalEntrega : e)
          }));

          // Auditoría
          const inventarioStore = useInventarioStore.getState();
          const itemsDesc = items.map(i => {
            const p = inventarioStore.productos.find(pr => pr.id_producto === i.id_producto);
            return `${p?.nombre || "Producto"} (${i.talla}/${i.opcion}) x${i.cantidad}`;
          }).join(", ");

          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: realEntregaId,
            nombre_entidad: `Entrega EPP - ${entrega.fecha_entrega}`,
            detalle: `EPP entregado al trabajador. Bodega Origen: ${id_bodega}. Elementos: ${itemsDesc}. Entregado por: ${entrega.entregado_por || "No especificado"}.`
          });

          return true;
        } catch (err) {
          log.error("Error en la transaccion de entrega", err);
          
          // Revertir estado si falló en Supabase (o dejar local si estamos forzando modo simulación local)
          // Para robustez y soporte local completo, permitimos descuento offline en los stores locales:
          const inventarioStore = useInventarioStore.getState();
          for (const localItem of itemsLocales) {
            await inventarioStore.descontarStockFIFO(
              localItem.id_producto,
              localItem.talla,
              localItem.opcion,
              id_bodega,
              localItem.cantidad,
              localItem.id_item
            );
          }

          // Registrar en auditoría local
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: tempId,
            nombre_entidad: `Entrega EPP (Local) - ${entrega.fecha_entrega}`,
            detalle: `Entrega de EPP registrada localmente. Bodega: ${id_bodega}.`
          });

          return true;
        }
      },

      deleteEntrega: async (id_entrega) => {
        const anterior = get().entregas;
        
        set(state => ({
          entregas: state.entregas.filter(e => e.id_entrega !== id_entrega)
        }));

        try {
          if (!id_entrega.startsWith("ent-temp-") && !id_entrega.startsWith("ent-")) {
            const { error } = await supabase
              .from("epp_entregas")
              .delete()
              .eq("id_entrega", id_entrega);
            if (error) throw error;
          }

          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Baja",
            id_entidad: id_entrega,
            nombre_entidad: `Entrega EPP Eliminada`,
            detalle: `Se eliminó el registro de entrega de EPP con ID ${id_entrega} del historial.`
          });

          return true;
        } catch (err) {
          log.error("Error al borrar entrega", err);
          set({ entregas: anterior });
          return false;
        }
      }
    }),
    {
      name: "monitoring-epp-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
