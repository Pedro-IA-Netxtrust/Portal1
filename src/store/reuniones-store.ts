import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";

const log = createLogger("reuniones-store");

export interface Reunion {
  id_reunion: string;
  tema: string;
  fecha: string;
  filtro_tipo: "todos" | "contratos" | "mandantes";
  contratos_filtrados: string[];
  mandantes_filtrados: string[];
  estado: "programada" | "realizada";
  observacion?: string | null;
  creado_por: string;
  created_at?: string;
  reuniones_asistencia?: {
    id_trabajador: string;
    estado: ReunionAsistencia["estado"];
    observacion?: string | null;
  }[];
}

export interface ReunionAsistencia {
  id?: string;
  id_reunion: string;
  id_trabajador: string;
  estado: "presente" | "ausente" | "otra_reunion" | "computador_compartido" | "no_aplica" | "vacaciones" | "otro";
  observacion?: string | null;
  editado_por?: string;
}

interface ReunionesState {
  reuniones: Reunion[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  fetchReuniones: () => Promise<void>;
  fetchAsistencias: (idReunion: string) => Promise<ReunionAsistencia[]>;
  crearReunion: (reunion: Omit<Reunion, "id_reunion">, asistencias: Omit<ReunionAsistencia, "id_reunion">[]) => Promise<string | null>;
  registrarAsistenciaProgramada: (idReunion: string, asistencias: Omit<ReunionAsistencia, "id_reunion">[]) => Promise<boolean>;
  eliminarReunion: (idReunion: string) => Promise<void>;
}

export const useReunionesStore = create<ReunionesState>()(
  persist(
    (set, get) => ({
      reuniones: [],
      loading: false,
      hydrated: false,

      fetchReuniones: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("reuniones")
            .select("*, reuniones_asistencia(id_trabajador, estado, observacion)")
            .order("fecha", { ascending: false });

          if (error) throw error;
          set({ reuniones: data || [] });
        } catch (err) {
          log.error("Error fetching reuniones", err);
        } finally {
          set({ loading: false });
        }
      },

      fetchAsistencias: async (idReunion) => {
        try {
          const { data, error } = await supabase
            .from("reuniones_asistencia")
            .select("*")
            .eq("id_reunion", idReunion);

          if (error) throw error;
          return data || [];
        } catch (err) {
          log.error(`Error fetching asistencias for reunion ${idReunion}`, err);
          return [];
        }
      },

      crearReunion: async (reunion, asistenciasList) => {
        try {
          // 1. Insertar la reunión
          const { data: rData, error: rError } = await supabase
            .from("reuniones")
            .insert([reunion])
            .select();

          if (rError) throw rError;
          if (!rData || !rData[0]) return null;

          const newReunionId = rData[0].id_reunion;

          // 2. Insertar las asistencias en lote (si existen)
          if (asistenciasList && asistenciasList.length > 0) {
            const asistenciasToInsert = asistenciasList.map(a => ({
              ...a,
              id_reunion: newReunionId
            }));

            const { error: aError } = await supabase
              .from("reuniones_asistencia")
              .insert(asistenciasToInsert);

            if (aError) throw aError;
          }

          // Actualizar estado local
          await get().fetchReuniones();

          return newReunionId;
        } catch (err) {
          log.error("Error creating reunion and asistencias", err);
          return null;
        }
      },

      registrarAsistenciaProgramada: async (idReunion, asistenciasList) => {
        try {
          // 1. Insertar las asistencias en lote
          const asistenciasToInsert = asistenciasList.map(a => ({
            ...a,
            id_reunion: idReunion
          }));

          const { error: aError } = await supabase
            .from("reuniones_asistencia")
            .insert(asistenciasToInsert);

          if (aError) throw aError;

          // 2. Actualizar el estado de la reunión a realizada
          const { error: rError } = await supabase
            .from("reuniones")
            .update({ estado: "realizada" })
            .eq("id_reunion", idReunion);

          if (rError) throw rError;

          // 3. Recargar reuniones localmente
          await get().fetchReuniones();

          return true;
        } catch (err) {
          log.error("Error registering attendance for scheduled meeting", err);
          return false;
        }
      },

      eliminarReunion: async (idReunion) => {
        try {
          const { error } = await supabase
            .from("reuniones")
            .delete()
            .eq("id_reunion", idReunion);

          if (error) throw error;
          set(state => ({
            reuniones: state.reuniones.filter(r => r.id_reunion !== idReunion)
          }));
        } catch (err) {
          log.error("Error deleting reunion", err);
        }
      }
    }),
    {
      name: "monitoring-reuniones-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
