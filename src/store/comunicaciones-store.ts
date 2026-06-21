import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { useAuditoriaStore } from "@/store/auditoria-store";

const log = createLogger("comunicaciones-store");

export type TipoComunicacion = 
  | "Cumpleaños" 
  | "Aniversario" 
  | "Reconocimiento" 
  | "Bienvenida" 
  | "Recordatorio" 
  | "Condolencias";

export interface Plantilla {
  id: string;
  nombre: string;
  tipo: TipoComunicacion;
  color_primario: string;
  color_secundario: string;
  mensaje_por_defecto: string;
}

export interface Comunicado {
  id: string;
  id_trabajador: string;
  nombre_trabajador: string;
  tipo: TipoComunicacion;
  mensaje: string;
  estado: "Borrador" | "Enviado" | "Impreso";
  fecha_generacion: string;
}

interface ComunicacionesState {
  plantillas: Plantilla[];
  historial: Comunicado[];
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  fetchHistorial: () => Promise<void>;
  addComunicado: (c: Omit<Comunicado, "id" | "fecha_generacion">) => Promise<void>;
  updateEstadoComunicado: (id: string, estado: "Borrador" | "Enviado" | "Impreso") => Promise<void>;
}

const mockPlantillas: Plantilla[] = [
  {
    id: "pl-1",
    nombre: "Cumpleaños Corporativo",
    tipo: "Cumpleaños",
    color_primario: "#1A418C",
    color_secundario: "#F29100",
    mensaje_por_defecto: "¡Feliz Cumpleaños! En este día tan especial queremos agradecerte por tu compromiso y desearte un año lleno de éxitos y alegrías."
  },
  {
    id: "pl-2",
    nombre: "Aniversario Laboral",
    tipo: "Aniversario",
    color_primario: "#10b981", // Emerald
    color_secundario: "#1A418C",
    mensaje_por_defecto: "¡Feliz Aniversario! Gracias por formar parte de nuestra gran familia. Tu esfuerzo diario hace la diferencia."
  },
  {
    id: "pl-3",
    nombre: "Trabajador Destacado",
    tipo: "Reconocimiento",
    color_primario: "#F29100",
    color_secundario: "#1A418C",
    mensaje_por_defecto: "Queremos hacer un reconocimiento especial por tu destacada labor y cumplimiento de metas. ¡Sigue así!"
  },
  {
    id: "pl-4",
    nombre: "Bienvenida Oficial",
    tipo: "Bienvenida",
    color_primario: "#3b82f6", // Blue
    color_secundario: "#F29100",
    mensaje_por_defecto: "¡Bienvenido/a al equipo! Estamos muy emocionados de contar contigo y te deseamos el mayor de los éxitos en tu nuevo cargo."
  }
];

export const useComunicacionesStore = create<ComunicacionesState>()(
  persist(
    (set) => ({
      plantillas: mockPlantillas,
      historial: [],
      hydrated: false,

      fetchHistorial: async () => {
        try {
          const { data, error } = await supabase
            .from("comunicados")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            if (process.env.NODE_ENV === "development") log.warn("Supabase no tiene tabla comunicados, usando mock", error);
            return;
          }

          if (data) {
            set({
              historial: data.map(d => ({
                id: d.id,
                id_trabajador: d.id_trabajador,
                nombre_trabajador: d.nombre_trabajador,
                tipo: d.tipo,
                mensaje: d.mensaje,
                estado: d.estado,
                fecha_generacion: d.created_at
              }))
            });
          }
        } catch (err) {
          log.error("Failed to load comunicados", err);
        }
      },

      addComunicado: async (c) => {
        const tempId = `com-${Date.now()}`;
        const nuevo: Comunicado = {
          ...c,
          id: tempId,
          fecha_generacion: new Date().toISOString()
        };

        set(state => ({ historial: [nuevo, ...state.historial] }));

        try {
          const dbInsert = {
            id_trabajador: c.id_trabajador,
            nombre_trabajador: c.nombre_trabajador,
            tipo: c.tipo,
            mensaje: c.mensaje,
            estado: c.estado
          };
          const { data, error } = await supabase
            .from("comunicados")
            .insert([dbInsert])
            .select();

          if (error) {
            if (process.env.NODE_ENV === "development") log.warn("Error insertando comunicado", error);
            return;
          }

          // Reemplazar temp ID con el UUID real de Supabase
          if (data && data[0]) {
            set(state => ({
              historial: state.historial.map(h =>
                h.id === tempId
                  ? { ...h, id: data[0].id, fecha_generacion: data[0].created_at ?? h.fecha_generacion }
                  : h
              )
            }));
            useAuditoriaStore.getState().registrar({
              modulo: "Comunicaciones",
              accion: "Alta",
              id_entidad: data[0].id,
              nombre_entidad: `${c.tipo} — ${c.nombre_trabajador}`,
              detalle: `Comunicado de tipo "${c.tipo}" generado para ${c.nombre_trabajador}.`,
            });
          }
        } catch (err) {
          log.error("Failed to insert comunicado", err);
        }
      },

      updateEstadoComunicado: async (id, estado) => {
        set(state => ({
          historial: state.historial.map(c => c.id === id ? { ...c, estado } : c)
        }));

        try {
          // Los IDs locales temporales empiezan con "com-".
          // Los UUIDs reales de Supabase NO empiezan con "com-", por lo que
          // si el ID NO empieza con "com-" es un UUID real y debemos persistirlo.
          if (!id.startsWith("com-")) {
            const { error } = await supabase
              .from("comunicados")
              .update({ estado })
              .eq("id", id);
            if (error) throw error;
          }
        } catch (err) {
          log.error("Failed to update status", err);
        }
      }
    }),
    {
      name: "monitoring-comunicaciones-store",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
