import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";

const log = createLogger("trabajadores-sap-store");

export interface TrabajadorSAP {
  id_trabajador: string;
  correo_adc_codelco: string | null;
  aprobacion_correo_adc_codelco: string | null;
  solicitud_cuenta_realizada_codelco: string | null;
  cuenta_correo_activa_codelco: boolean;
  ticket_codelco: string | null;
  correo_adc_sap: string | null;
  aprobacion_correo_adc_sap: string | null;
  solicitud_cuenta_sap: string | null;
  cuenta_sap_activa: boolean;
  ticket_sap: string | null;
  correo_adc_perfiles_sap: string | null;
  aprobacion_correo_adc_perfiles_sap: string | null;
  solicitud_perfiles_roles_sap: string | null;
  ticket_perfiles_sap: string | null;
  perfiles_sap_activos: boolean;
  requiere_datamart: boolean;
  correo_adc_datamart: string | null;
  aprobacion_correo_adc_datamart: string | null;
  solicitud_datamart: string | null;
  datamart_activo: boolean;
  ticket_datamart: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TrabajadoresSAPState {
  sapList: TrabajadorSAP[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  fetchSAPData: () => Promise<void>;
  upsertSAPData: (id_trabajador: string, fields: Partial<Omit<TrabajadorSAP, "id_trabajador">>) => Promise<void>;
}

export const useTrabajadoresSAPStore = create<TrabajadoresSAPState>()(
  persist(
    (set, get) => ({
      sapList: [],
      loading: false,
      hydrated: false,

      fetchSAPData: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("trabajadores_sap")
            .select("*");

          if (error) throw error;
          set({ sapList: data || [] });
        } catch (err) {
          log.error("Error fetching trabajadores SAP", err);
        } finally {
          set({ loading: false });
        }
      },

      upsertSAPData: async (id_trabajador, fields) => {
        const currentList = get().sapList;
        const exists = currentList.some(item => item.id_trabajador === id_trabajador);
        
        let newRecord: TrabajadorSAP;
        if (exists) {
          newRecord = {
            ...currentList.find(item => item.id_trabajador === id_trabajador)!,
            ...fields
          };
          set({
            sapList: currentList.map(item => item.id_trabajador === id_trabajador ? newRecord : item)
          });
        } else {
          newRecord = {
            id_trabajador,
            correo_adc_codelco: null,
            aprobacion_correo_adc_codelco: null,
            solicitud_cuenta_realizada_codelco: null,
            cuenta_correo_activa_codelco: false,
            ticket_codelco: null,
            correo_adc_sap: null,
            aprobacion_correo_adc_sap: null,
            solicitud_cuenta_sap: null,
            cuenta_sap_activa: false,
            ticket_sap: null,
            correo_adc_perfiles_sap: null,
            aprobacion_correo_adc_perfiles_sap: null,
            solicitud_perfiles_roles_sap: null,
            ticket_perfiles_sap: null,
            perfiles_sap_activos: false,
            requiere_datamart: false,
            correo_adc_datamart: null,
            aprobacion_correo_adc_datamart: null,
            solicitud_datamart: null,
            datamart_activo: false,
            ticket_datamart: null,
            ...fields
          };
          set({ sapList: [...currentList, newRecord] });
        }

        try {
          const { error } = await supabase
            .from("trabajadores_sap")
            .upsert({ id_trabajador, ...fields })
            .select();

          if (error) throw error;
        } catch (err) {
          log.error(`Error upserting trabajadores SAP for worker ${id_trabajador}`, err);
        }
      }
    }),
    {
      name: "monitoring-trabajadores-sap-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
