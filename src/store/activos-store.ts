import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import type { TipoActivo, EstadoActivo } from "@/lib/enums";

const log = createLogger("activos-store");

export interface LicenciaSoftware {
  id: string;
  nombre: string; // Ej: "Microsoft Office 365", "Windows 11 Pro", "Norton Antivirus"
  tipo: "Office" | "Antivirus" | "Sistema Operativo" | "Diseño" | "Otro";
  version?: string;
  clave_producto?: string;
  fecha_vencimiento?: string;
  activa: boolean;
}

export interface Activo {
  id_activo: string;
  tipo: TipoActivo;
  marca: string;
  modelo: string;
  identificador_unico: string; // Patente para vehículos, Nº Serie para notebooks
  estado: EstadoActivo;
  id_trabajador_asignado: string | null; // NULL if Disponible
  fecha_asignacion?: string;
  detalles_adicionales: {
    // Para Vehículos
    kilometraje_actual?: number;
    vencimiento_revision_tecnica?: string;
    tipo_combustible?: "Diésel" | "Bencina" | "Híbrido" | "Eléctrico";
    // Para Notebooks (Hardware)
    procesador?: string;
    ram_gb?: number;
    almacenamiento_gb?: number;
    // Compra / Adquisición
    fecha_compra?: string;
    proveedor?: string;
    numero_factura_oc?: string;
    valor_compra?: number;
    moneda?: "CLP" | "USD";
    fecha_vencimiento_garantia?: string;
    // Licencias
    licencias?: LicenciaSoftware[];
  };
}

interface ActivosState {
  activos: Activo[];
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  fetchActivos: () => Promise<void>;
  addActivo: (a: Omit<Activo, "id_activo">) => Promise<void>;
  updateActivo: (id: string, updatedFields: Partial<Activo>) => Promise<void>;
  deleteActivo: (id: string) => Promise<void>;
  assignActivo: (id: string, idTrabajador: string, fecha: string) => Promise<void>;
  returnActivo: (id: string) => Promise<void>;
}

const mockActivos: Activo[] = [
  {
    id_activo: "a-1",
    tipo: "Notebook",
    marca: "Lenovo",
    modelo: "ThinkPad T14 Gen 3",
    identificador_unico: "LNV-87564921",
    estado: "Asignado",
    id_trabajador_asignado: "t-1", // Asignado a Andrés Muñoz
    fecha_asignacion: "2026-01-10",
    detalles_adicionales: {
      procesador: "Intel Core i7-1260P",
      ram_gb: 16,
      almacenamiento_gb: 512,
      fecha_compra: "2025-05-15",
      proveedor: "PC Factory Mayorista",
      numero_factura_oc: "FAC-88921",
      valor_compra: 890000,
      moneda: "CLP",
      fecha_vencimiento_garantia: "2028-05-15",
      licencias: [
        {
          id: "lic-1",
          nombre: "Microsoft 365 Copilot",
          tipo: "Office",
          version: "Enterprise",
          clave_producto: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
          fecha_vencimiento: "2027-05-15",
          activa: true
        },
        {
          id: "lic-2",
          nombre: "Kaspersky Endpoint Security",
          tipo: "Antivirus",
          version: "v12.2",
          clave_producto: "KASP-9920-A19",
          fecha_vencimiento: "2026-12-31",
          activa: true
        }
      ]
    }
  },
  {
    id_activo: "a-2",
    tipo: "Notebook",
    marca: "Apple",
    modelo: "MacBook Pro 14 M3",
    identificador_unico: "APL-MBP99201",
    estado: "Disponible",
    id_trabajador_asignado: null,
    detalles_adicionales: {
      procesador: "Apple M3 Pro",
      ram_gb: 18,
      almacenamiento_gb: 512,
      fecha_compra: "2025-11-20",
      proveedor: "Recom Chile S.A.",
      numero_factura_oc: "OC-55421",
      valor_compra: 2199,
      moneda: "USD",
      fecha_vencimiento_garantia: "2026-11-20",
      licencias: [
        {
          id: "lic-3",
          nombre: "Adobe Creative Cloud",
          tipo: "Diseño",
          version: "2026 suite",
          clave_producto: "ADOBE-CC-2026-USER",
          fecha_vencimiento: "2026-11-20",
          activa: true
        }
      ]
    }
  },
  {
    id_activo: "a-3",
    tipo: "Vehículo",
    marca: "Toyota",
    modelo: "Hilux 4x4 Double Cab",
    identificador_unico: "SW-PK-92", // Patente chilena
    estado: "Disponible",
    id_trabajador_asignado: null,
    detalles_adicionales: {
      kilometraje_actual: 45200,
      vencimiento_revision_tecnica: "2027-04-15",
      tipo_combustible: "Diésel"
    }
  },
  {
    id_activo: "a-4",
    tipo: "Vehículo",
    marca: "Mitsubishi",
    modelo: "L200 Katana",
    identificador_unico: "TY-DL-41",
    estado: "En Mantención",
    id_trabajador_asignado: null,
    detalles_adicionales: {
      kilometraje_actual: 89000,
      vencimiento_revision_tecnica: "2026-05-12", // Vencido/Por vencer
      tipo_combustible: "Diésel"
    }
  }
];

export const useActivosStore = create<ActivosState>()(
  persist(
    (set) => ({
      activos: mockActivos,
      hydrated: false,

      fetchActivos: async () => {
        try {
          const { data, error } = await supabase
            .from("activos")
            .select("*")
            .order("created_at", { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            set({ activos: data });
          } else {
            // Seed base if cloud DB is completely empty
            const seedData = mockActivos.map(a => ({
              tipo: a.tipo,
              marca: a.marca,
              modelo: a.modelo,
              identificador_unico: a.identificador_unico,
              estado: a.estado,
              id_trabajador_asignado: a.id_trabajador_asignado,
              fecha_asignacion: a.fecha_asignacion,
              detalles_adicionales: a.detalles_adicionales
            }));

            const { data: seeded, error: seedError } = await supabase
              .from("activos")
              .insert(seedData)
              .select();

            if (seedError) throw seedError;
            if (seeded) set({ activos: seeded });
          }
        } catch (err) {
          log.error("Failed to load assets from Supabase", err);
        }
      },

      addActivo: async (a) => {
        const tempId = `temp-a-${Date.now()}`;
        const nuevoTemp = { ...a, id_activo: tempId } as Activo;
        set((state) => ({ activos: [...state.activos, nuevoTemp] }));

        try {
          const { data, error } = await supabase
            .from("activos")
            .insert([a])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              activos: state.activos.map((item) => 
                item.id_activo === tempId ? data[0] : item
              )
            }));
          }
        } catch (err) {
          log.error("Failed to persist new asset to Supabase", err);
        }
      },

      updateActivo: async (id, updatedFields) => {
        set((state) => ({
          activos: state.activos.map((a) => 
            a.id_activo === id ? { ...a, ...updatedFields } : a
          )
        }));

        try {
          const { error } = await supabase
            .from("activos")
            .update(updatedFields)
            .eq("id_activo", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to update asset ${id} in Supabase`, err);
        }
      },

      deleteActivo: async (id) => {
        set((state) => ({
          activos: state.activos.filter((a) => a.id_activo !== id)
        }));

        try {
          const { error } = await supabase
            .from("activos")
            .delete()
            .eq("id_activo", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to delete asset ${id} from Supabase`, err);
        }
      },

      assignActivo: async (id, idTrabajador, fecha) => {
        set((state) => ({
          activos: state.activos.map((a) => 
            a.id_activo === id ? { 
              ...a, 
              estado: "Asignado", 
              id_trabajador_asignado: idTrabajador, 
              fecha_asignacion: fecha 
            } : a
          )
        }));

        try {
          const { error } = await supabase
            .from("activos")
            .update({
              estado: "Asignado",
              id_trabajador_asignado: idTrabajador,
              fecha_asignacion: fecha
            })
            .eq("id_activo", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to assign asset ${id} in Supabase`, err);
        }
      },

      returnActivo: async (id) => {
        set((state) => ({
          activos: state.activos.map((a) => 
            a.id_activo === id ? { 
              ...a, 
              estado: "Disponible", 
              id_trabajador_asignado: null, 
              fecha_asignacion: undefined 
            } : a
          )
        }));

        try {
          const { error } = await supabase
            .from("activos")
            .update({
              estado: "Disponible",
              id_trabajador_asignado: null,
              fecha_asignacion: null
            })
            .eq("id_activo", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to return asset ${id} in Supabase`, err);
        }
      }
    }),
    {
      name: "monitoring-activos-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
