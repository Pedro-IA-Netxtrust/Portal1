import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CategoriaProveedor = "Alimentación" | "Tecnología" | "Vehículos" | "Transporte" | "Servicios Generales";

export interface Proveedor {
  id_proveedor: string;
  nombre: string;
  rut: string;
  categoria: CategoriaProveedor;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  estado: "Activo" | "Inactivo";
  fecha_creacion: string;
}

interface ProveedoresState {
  proveedores: Proveedor[];
  addProveedor: (proveedor: Omit<Proveedor, "id_proveedor" | "fecha_creacion">) => void;
  updateProveedor: (id_proveedor: string, proveedor: Partial<Proveedor>) => void;
  deleteProveedor: (id_proveedor: string) => void;
}

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
      addProveedor: (data) =>
        set((state) => ({
          proveedores: [
            ...state.proveedores,
            {
              ...data,
              id_proveedor: `prov-${Date.now()}`,
              fecha_creacion: new Date().toISOString(),
            },
          ],
        })),
      updateProveedor: (id, data) =>
        set((state) => ({
          proveedores: state.proveedores.map((p) => (p.id_proveedor === id ? { ...p, ...data } : p)),
        })),
      deleteProveedor: (id) =>
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id_proveedor !== id),
        })),
    }),
    {
      name: "monitoring-proveedores",
    }
  )
);
