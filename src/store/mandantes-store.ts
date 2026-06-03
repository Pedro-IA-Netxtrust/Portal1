import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Mandante {
  id_mandante: string;
  rut: string;
  nombre: string;
  razon_social: string;
  rubro?: string;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  activo: boolean;
  created_at: string;
}

interface MandantesState {
  mandantes: Mandante[];
  addMandante: (m: Omit<Mandante, "id_mandante" | "created_at">) => void;
  updateMandante: (id: string, fields: Partial<Mandante>) => void;
  deleteMandante: (id: string) => void;
}

const mockMandantes: Mandante[] = [
  {
    id_mandante: "m-1",
    rut: "76.430.211-5",
    nombre: "Minera Escondida",
    razon_social: "Minera Escondida Limitada",
    rubro: "Minería",
    contacto_nombre: "Roberto Díaz Fuentes",
    contacto_email: "roberto.diaz@mel.cl",
    contacto_telefono: "+56 9 8765 4321",
    activo: true,
    created_at: new Date("2025-11-01").toISOString()
  },
  {
    id_mandante: "m-2",
    rut: "93.458.000-0",
    nombre: "Celulosa Arauco",
    razon_social: "Celulosa Arauco y Constitución S.A.",
    rubro: "Forestal",
    contacto_nombre: "María Ríos Contreras",
    contacto_email: "mrios@arauco.cl",
    contacto_telefono: "+56 9 7654 3210",
    activo: true,
    created_at: new Date("2025-09-15").toISOString()
  },
  {
    id_mandante: "m-3",
    rut: "12.345.678-9",
    nombre: "Monitoring SPA",
    razon_social: "Monitoring Servicios Profesionales SPA",
    rubro: "Servicios Profesionales",
    contacto_nombre: "Carlos Vergara",
    contacto_email: "cvergara@monitoring.cl",
    contacto_telefono: "+56 9 6543 2109",
    activo: true,
    created_at: new Date("2026-01-01").toISOString()
  },
  {
    id_mandante: "m-4",
    rut: "61.704.000-K",
    nombre: "Codelco",
    razon_social: "Corporación Nacional del Cobre de Chile",
    rubro: "Minería del Cobre",
    contacto_nombre: "Isabel Moreno Rivas",
    contacto_email: "imoreno@codelco.cl",
    contacto_telefono: "+56 9 5432 1098",
    activo: true,
    created_at: new Date("2026-02-01").toISOString()
  },
  {
    id_mandante: "m-5",
    rut: "96.806.980-2",
    nombre: "Anglo American",
    razon_social: "Anglo American Chile Limitada",
    rubro: "Minería",
    contacto_nombre: "Patricio Salazar",
    contacto_email: "psalazar@angloamerican.com",
    contacto_telefono: "+56 9 4321 0987",
    activo: true,
    created_at: new Date("2026-03-10").toISOString()
  },
  {
    id_mandante: "m-6",
    rut: "89.862.200-2",
    nombre: "Aguas Andinas",
    razon_social: "Aguas Andinas S.A.",
    rubro: "Servicios Sanitarios",
    contacto_nombre: "Paula Vásquez",
    contacto_email: "pvasquez@aguasandinas.cl",
    activo: false,
    created_at: new Date("2025-07-20").toISOString()
  }
];

export const useMandantesStore = create<MandantesState>()(
  persist(
    (set) => ({
      mandantes: mockMandantes,

      addMandante: (m) =>
        set((state) => ({
          mandantes: [
            ...state.mandantes,
            {
              ...m,
              id_mandante: `m-${Date.now()}`,
              created_at: new Date().toISOString()
            }
          ]
        })),

      updateMandante: (id, fields) =>
        set((state) => ({
          mandantes: state.mandantes.map((m) =>
            m.id_mandante === id ? { ...m, ...fields } : m
          )
        })),

      deleteMandante: (id) =>
        set((state) => ({
          mandantes: state.mandantes.filter((m) => m.id_mandante !== id)
        }))
    }),
    { name: "monitoring-mandantes-v2-storage" }
  )
);
