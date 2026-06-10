import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

export interface EppItem {
  id_item: string;
  id_entrega: string;
  elemento: string;
  cantidad: number;
  talla?: string;
  opcion?: string;
}

export interface EppEntrega {
  id_entrega: string;
  id_trabajador: string;
  fecha_entrega: string; // YYYY-MM-DD
  recibido_por?: string;
  observaciones?: string;
  fecha_creacion?: string;
  items: EppItem[];
}

interface EppState {
  entregas: EppEntrega[];
  loading: boolean;
  
  fetchEntregas: () => Promise<void>;
  addEntrega: (
    entrega: Omit<EppEntrega, "id_entrega" | "items" | "fecha_creacion">,
    items: Omit<EppItem, "id_item" | "id_entrega">[]
  ) => Promise<boolean>;
  deleteEntrega: (id_entrega: string) => Promise<boolean>;
}

// Datos semilla de prueba para cuando estemos offline
const mockEntregas: EppEntrega[] = [
  {
    id_entrega: "ent-1",
    id_trabajador: "44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6", // Josépedro Abbott (o cualquier ID del mockup)
    fecha_entrega: "2026-06-01",
    recibido_por: "Josépedro Abbott",
    observaciones: "Entrega inicial de terreno de invierno",
    fecha_creacion: "2026-06-01T10:00:00Z",
    items: [
      { id_item: "item-1", id_entrega: "ent-1", elemento: "Zapatos", cantidad: 1, talla: "42", opcion: "Negro" },
      { id_item: "item-2", id_entrega: "ent-1", elemento: "Chaqueta", cantidad: 1, talla: "L", opcion: "Azul Térmico" },
      { id_item: "item-3", id_entrega: "ent-1", elemento: "Casco", cantidad: 1, talla: "Estándar", opcion: "Amarillo" }
    ]
  },
  {
    id_entrega: "ent-2",
    id_trabajador: "3313c7df-7cdd-43e0-8bbf-71826154e560", // Natalia Arias
    fecha_entrega: "2026-06-05",
    recibido_por: "Natalia Arias",
    observaciones: "Reposición de lentes dañados",
    fecha_creacion: "2026-06-05T14:30:00Z",
    items: [
      { id_item: "item-4", id_entrega: "ent-2", elemento: "Lentes", cantidad: 2, talla: "M", opcion: "Claro Antiempaño" }
    ]
  }
];

export const useEppStore = create<EppState>()(
  persist(
    (set, get) => ({
      entregas: mockEntregas,
      loading: false,

      fetchEntregas: async () => {
        set({ loading: true });
        try {
          // Consultar la cabecera e incluir los items mediante join
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
          } else {
            // Si no hay datos, pero ya está en DB (vacío real), o si falló, mantenemos el mockup
            // Si data es array vacío [], significa que en DB no hay nada
            if (data && data.length === 0) {
              set({ entregas: [] });
            }
          }
        } catch (err) {
          console.warn("[epp-store] Offline o error al cargar de Supabase, usando datos locales:", err);
          // Mantiene los datos cacheados en localStorage / mockEntregas
        } finally {
          set({ loading: false });
        }
      },

      addEntrega: async (entrega, items) => {
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

        // Actualizar localmente inmediatamente (Optimistic)
        set(state => ({ entregas: [nuevaEntregaLocal, ...state.entregas] }));

        try {
          // 1. Insertar cabecera
          const { data: dataEntrega, error: errorEntrega } = await supabase
            .from("epp_entregas")
            .insert([{
              id_trabajador: entrega.id_trabajador,
              fecha_entrega: entrega.fecha_entrega,
              recibido_por: entrega.recibido_por || null,
              observaciones: entrega.observaciones || null
            }])
            .select();

          if (errorEntrega) throw errorEntrega;
          if (!dataEntrega || dataEntrega.length === 0) throw new Error("No se pudo obtener el id de entrega.");

          const realEntregaId = dataEntrega[0].id_entrega;

          // 2. Insertar items
          const itemsDb = items.map(it => ({
            id_entrega: realEntregaId,
            elemento: it.elemento,
            cantidad: it.cantidad,
            talla: it.talla || null,
            opcion: it.opcion || null
          }));

          const { data: dataItems, error: errorItems } = await supabase
            .from("epp_entrega_items")
            .insert(itemsDb)
            .select();

          if (errorItems) throw errorItems;

          // 3. Actualizar con los IDs reales de la BD
          const finalEntrega: EppEntrega = {
            ...dataEntrega[0],
            items: dataItems || []
          };

          set(state => ({
            entregas: state.entregas.map(e => e.id_entrega === tempId ? finalEntrega : e)
          }));

          // Registrar en auditoría
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: realEntregaId,
            nombre_entidad: `Entrega EPP - ${entrega.fecha_entrega}`,
            detalle: `Entrega de EPP registrada. Elementos: ${items.map(i => `${i.elemento} (x${i.cantidad})`).join(", ")}.`
          });

          return true;
        } catch (err) {
          console.error("[epp-store] Error al persistir entrega en Supabase:", err);
          
          // Registrar en auditoría local
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Alta",
            id_entidad: tempId,
            nombre_entidad: `Entrega EPP (Local) - ${entrega.fecha_entrega}`,
            detalle: `Entrega de EPP registrada offline/local. Elementos: ${items.map(i => `${i.elemento} (x${i.cantidad})`).join(", ")}.`
          });

          return true; // Retorna true para continuar localmente
        }
      },

      deleteEntrega: async (id_entrega) => {
        // Guardar copia antes de borrar por si hay que revertir
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

          // Registrar en auditoría
          await useAuditoriaStore.getState().registrar({
            modulo: "Control",
            accion: "Baja",
            id_entidad: id_entrega,
            nombre_entidad: `Entrega EPP Eliminada`,
            detalle: `Se eliminó el registro de entrega de EPP con ID ${id_entrega} del historial.`
          });

          return true;
        } catch (err) {
          console.error("[epp-store] Error al borrar entrega en Supabase:", err);
          // Revertir localmente si falló
          set({ entregas: anterior });
          return false;
        }
      }
    }),
    {
      name: "monitoring-epp-storage"
    }
  )
);
