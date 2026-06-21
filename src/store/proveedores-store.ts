import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";

const log = createLogger("proveedores-store");

export interface ProveedorCategoria {
  id: string;
  nombre: string;
  created_at: string;
}

export interface Proveedor {
  id_proveedor: string;
  nombre: string;
  rut: string;
  categoria: string; // Dynamic text value from provider categories
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  estado: "Activo" | "Inactivo";
  fecha_creacion: string;
}

interface ProveedoresState {
  proveedores: Proveedor[];
  categorias: ProveedorCategoria[];
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  fetchProveedores: () => Promise<void>;
  fetchCategorias: () => Promise<void>;
  addProveedor: (proveedor: Omit<Proveedor, "id_proveedor" | "fecha_creacion">) => Promise<void>;
  updateProveedor: (id_proveedor: string, proveedor: Partial<Proveedor>) => Promise<void>;
  deleteProveedor: (id_proveedor: string) => Promise<void>;
  addCategoria: (nombre: string) => Promise<void>;
  deleteCategoria: (id: string) => Promise<void>;
}

const mockCategorias: ProveedorCategoria[] = [
  { id: "cat-1", nombre: "Alimentación", created_at: new Date().toISOString() },
  { id: "cat-2", nombre: "Tecnología", created_at: new Date().toISOString() },
  { id: "cat-3", nombre: "Vehículos", created_at: new Date().toISOString() },
  { id: "cat-4", nombre: "Transporte", created_at: new Date().toISOString() },
  { id: "cat-5", nombre: "Servicios Generales", created_at: new Date().toISOString() }
];

const mockProveedores: Proveedor[] = [
  {
    id_proveedor: "prov-1",
    nombre: "Sodexo Servicios",
    rut: "76.123.456-7",
    categoria: "Alimentación",
    contacto_nombre: "María Soto",
    contacto_email: "msoto@sodexo.cl",
    contacto_telefono: "+56 9 1234 5678",
    estado: "Activo",
    fecha_creacion: "2025-01-10T10:00:00Z"
  },
  {
    id_proveedor: "prov-2",
    nombre: "Aramark Chile",
    rut: "77.987.654-3",
    categoria: "Alimentación",
    contacto_nombre: "Juan Pérez",
    contacto_email: "jperez@aramark.cl",
    estado: "Activo",
    fecha_creacion: "2025-02-15T14:30:00Z"
  },
  {
    id_proveedor: "prov-3",
    nombre: "Dell Technologies",
    rut: "80.555.444-1",
    categoria: "Tecnología",
    estado: "Activo",
    fecha_creacion: "2025-03-01T09:15:00Z"
  },
  {
    id_proveedor: "prov-4",
    nombre: "Hertz Rent a Car",
    rut: "90.111.222-3",
    categoria: "Vehículos",
    estado: "Activo",
    fecha_creacion: "2025-03-10T11:00:00Z"
  }
];

export const useProveedoresStore = create<ProveedoresState>()(
  persist(
    (set) => ({
      proveedores: mockProveedores,
      categorias: mockCategorias,
      hydrated: false,

      fetchProveedores: async () => {
        try {
          const { data, error } = await supabase
            .from("proveedores")
            .select("*")
            .order("fecha_creacion", { ascending: false });

          if (error) throw error;
          if (data && data.length > 0) {
            set({ proveedores: data });
          } else {
            // Seed base if empty
            const seedData = mockProveedores.map(p => ({
              nombre: p.nombre,
              rut: p.rut,
              categoria: p.categoria,
              contacto_nombre: p.contacto_nombre,
              contacto_email: p.contacto_email,
              contacto_telefono: p.contacto_telefono,
              estado: p.estado,
              fecha_creacion: p.fecha_creacion
            }));
            const { data: seeded, error: seedError } = await supabase
              .from("proveedores")
              .insert(seedData)
              .select();
            if (seedError) throw seedError;
            if (seeded) set({ proveedores: seeded });
          }
        } catch (err) {
          log.warn("Failed to load providers from Supabase, using cache/mock", err);
        }
      },

      fetchCategorias: async () => {
        try {
          const { data, error } = await supabase
            .from("proveedor_categorias")
            .select("*")
            .order("nombre", { ascending: true });

          if (error) throw error;
          if (data && data.length > 0) {
            set({ categorias: data });
          } else {
            // Seed categories if empty
            const seedData = mockCategorias.map(c => ({
              id: c.id,
              nombre: c.nombre
            }));
            const { data: seeded, error: seedError } = await supabase
              .from("proveedor_categorias")
              .insert(seedData)
              .select();
            if (seedError) throw seedError;
            if (seeded) set({ categorias: seeded });
          }
        } catch (err) {
          log.warn("Failed to load provider categories from Supabase, using cache/mock", err);
        }
      },

      addProveedor: async (data) => {
        const tempId = `temp-prov-${Date.now()}`;
        const nuevoTemp: Proveedor = {
          ...data,
          id_proveedor: tempId,
          fecha_creacion: new Date().toISOString()
        };
        set((state) => ({ proveedores: [nuevoTemp, ...state.proveedores] }));

        try {
          const { data: inserted, error } = await supabase
            .from("proveedores")
            .insert([data])
            .select();

          if (error) throw error;
          if (inserted && inserted[0]) {
            set((state) => ({
              proveedores: state.proveedores.map((p) =>
                p.id_proveedor === tempId ? inserted[0] : p
              )
            }));
          }
        } catch (err) {
          log.error("Failed to persist new provider to Supabase", err);
        }
      },

      updateProveedor: async (id, data) => {
        set((state) => ({
          proveedores: state.proveedores.map((p) => (p.id_proveedor === id ? { ...p, ...data } : p))
        }));

        try {
          const { error } = await supabase
            .from("proveedores")
            .update(data)
            .eq("id_proveedor", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to update provider ${id} in Supabase`, err);
        }
      },

      deleteProveedor: async (id) => {
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id_proveedor !== id)
        }));

        try {
          const { error } = await supabase
            .from("proveedores")
            .delete()
            .eq("id_proveedor", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to delete provider ${id} from Supabase`, err);
        }
      },

      addCategoria: async (nombre) => {
        const id = `cat-${Date.now()}`;
        const nuevoTemp: ProveedorCategoria = {
          id,
          nombre,
          created_at: new Date().toISOString()
        };
        set((state) => ({ categorias: [...state.categorias, nuevoTemp].sort((a, b) => a.nombre.localeCompare(b.nombre)) }));

        try {
          const { data: inserted, error } = await supabase
            .from("proveedor_categorias")
            .insert([{ id, nombre }])
            .select();

          if (error) throw error;
          if (inserted && inserted[0]) {
            set((state) => ({
              categorias: state.categorias.map((c) =>
                c.id === id ? inserted[0] : c
              ).sort((a, b) => a.nombre.localeCompare(b.nombre))
            }));
          }
        } catch (err) {
          log.error("Failed to persist new provider category to Supabase", err);
        }
      },

      deleteCategoria: async (id) => {
        set((state) => ({
          categorias: state.categorias.filter((c) => c.id !== id)
        }));

        try {
          const { error } = await supabase
            .from("proveedor_categorias")
            .delete()
            .eq("id", id);

          if (error) throw error;
        } catch (err) {
          log.error(`Failed to delete provider category ${id} from Supabase`, err);
        }
      }
    }),
    {
      name: "monitoring-proveedores-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
