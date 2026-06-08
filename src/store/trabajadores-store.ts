import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

export interface Trabajador {
  id_trabajador: string;
  
  // Identificación
  apellido_paterno: string;
  apellido_materno: string;
  nombre_1: string;
  nombre_2?: string;
  sexo: "M" | "F" | "Otro";
  fecha_nacimiento: string;
  ciudad_nacimiento?: string;
  nacionalidad: string;
  tipo_identificacion: "RUT" | "DNI" | "PASAPORTE";
  numero_identificacion: string;
  fecha_vencimiento_id?: string;
  estado_civil?: "Soltero" | "Casado" | "Divorciado" | "Viudo" | "Conviviente";

  // Contacto
  email_corporativo: string;
  email_personal?: string;
  celular_personal: string;
  telefono_emergencia?: string;
  nombre_contacto_emergencia?: string;
  parentesco_emergencia?: string;

  // Domicilio
  region?: string;
  ciudad?: string;
  comuna?: string;
  calle?: string;
  numero_domicilio?: string;
  departamento_casa?: string;

  // Nivel Educativo / Formación
  nivel_educativo?: string;
  profesion?: string;
  institucion_educativa?: string;
  fecha_titulacion?: string;

  // Previsión
  afp?: string;
  sistema_salud?: "Fonasa" | "Isapre";
  nombre_isapre?: string;
  valor_plan_uf?: number;

  // Bancario
  banco?: string;
  tipo_cuenta?: "Corriente" | "Vista" | "CuentaRUT" | "Ahorro";
  numero_cuenta?: string;

  // Laboral
  fecha_ingreso: string;
  tipo_contrato: "Indefinido" | "Plazo Fijo" | "Honorarios" | "Práctica";
  fecha_vencimiento_contrato?: string;
  cargo?: string;
  area_departamento?: string;
  modalidad_trabajo: "Presencial" | "Teletrabajo" | "Híbrido";

  // Operativo
  talla_chaqueta?: string;
  talla_polera?: string;
  calzado_seguridad?: string;
  chaleco_geologo?: string;
  respirador?: string;
  vencimiento_carnet?: string;
  vencimiento_altura_geo?: string;
  vencimiento_psicosensometrico?: string;
  vencimiento_licencia_conducir?: string;

  // Formación y Talento
  titulo_profesional?: string;
  mencion_titulo?: string;
  universidad_titulo?: string;
  postgrado_1?: string;
  mencion_postgrado_1?: string;
  universidad_postgrado_1?: string;
  cursos_certificaciones?: string; // Mantenido por compatibilidad legacy
  certificaciones_especificas?: string[]; // Array de píldoras/tags
  idiomas?: string[]; // Array de píldoras/tags
  anos_experiencia?: number;
  otras_habilidades?: string[]; // Array de píldoras/tags
  cv_actualizado?: boolean;
  fecha_actualizacion_cv?: string;
  cert_sap_lms?: boolean;
  cert_soma_lms?: boolean;
  cert_ti?: boolean;
}

interface TrabajadoresState {
  trabajadores: Trabajador[];
  fetchTrabajadores: () => Promise<void>;
  addTrabajador: (t: Omit<Trabajador, "id_trabajador">) => Promise<void>;
  updateTrabajador: (id: string, updatedFields: Partial<Trabajador>) => Promise<void>;
  deleteTrabajador: (id: string) => Promise<void>;
}

const mockTrabajadores: Omit<Trabajador, "id_trabajador">[] = [
  {
    apellido_paterno: "Muñoz",
    apellido_materno: "Reyes",
    nombre_1: "Andrés",
    nombre_2: "Felipe",
    sexo: "M",
    fecha_nacimiento: "1990-04-12",
    ciudad_nacimiento: "Santiago",
    nacionalidad: "Chilena",
    tipo_identificacion: "RUT",
    numero_identificacion: "17.489.125-K",
    estado_civil: "Casado",
    email_corporativo: "andres.munoz@monitoring.cl",
    email_personal: "andres.felipe@gmail.com",
    celular_personal: "+56987654321",
    region: "Metropolitana",
    ciudad: "Santiago",
    comuna: "Providencia",
    calle: "Av. Pedro de Valdivia",
    numero_domicilio: "1234",
    departamento_casa: "Depto 502",
    profesion: "Ingeniero Civil Industrial",
    institucion_educativa: "Universidad de Chile",
    afp: "Habitat",
    sistema_salud: "Isapre",
    nombre_isapre: "Colmena",
    valor_plan_uf: 4.5,
    banco: "Banco de Chile",
    tipo_cuenta: "Corriente",
    numero_cuenta: "1234567890",
    fecha_ingreso: "2023-03-01",
    tipo_contrato: "Indefinido",
    cargo: "Ingeniero Civil Operaciones",
    area_departamento: "Operaciones",
    modalidad_trabajo: "Híbrido",
    talla_chaqueta: "M",
    talla_polera: "M",
    calzado_seguridad: "41",
    vencimiento_carnet: "2029-05-15",
    vencimiento_altura_geo: "2027-10-12",
    vencimiento_psicosensometrico: "2026-08-20",
    vencimiento_licencia_conducir: "2028-11-04",
    titulo_profesional: "Ingeniero Civil Industrial",
    universidad_titulo: "Universidad de Chile",
    cert_sap_lms: true,
    cert_soma_lms: true,
    cert_ti: false
  },
  {
    apellido_paterno: "Gómez",
    apellido_materno: "Bermúdez",
    nombre_1: "Valentina",
    nombre_2: "Elena",
    sexo: "F",
    fecha_nacimiento: "1994-08-25",
    ciudad_nacimiento: "Caracas",
    nacionalidad: "Venezolana",
    tipo_identificacion: "DNI",
    numero_identificacion: "25.321.456",
    fecha_vencimiento_id: "2026-06-15",
    estado_civil: "Soltero",
    email_corporativo: "valentina.gomez@monitoring.cl",
    email_personal: "vale.gomez94@gmail.com",
    celular_personal: "+584123456789",
    region: "Metropolitana",
    ciudad: "Santiago",
    comuna: "Santiago Centro",
    calle: "Huérfanos",
    numero_domicilio: "980",
    departamento_casa: "Casa 4",
    profesion: "Geóloga",
    institucion_educativa: "Universidad Católica del Norte",
    afp: "ProVida",
    sistema_salud: "Fonasa",
    banco: "Banco Estado",
    tipo_cuenta: "Vista",
    numero_cuenta: "25321456",
    fecha_ingreso: "2024-05-01",
    tipo_contrato: "Plazo Fijo",
    fecha_vencimiento_contrato: "2026-08-30",
    cargo: "Técnico en Control de Calidad",
    area_departamento: "Operaciones",
    modalidad_trabajo: "Presencial",
    talla_chaqueta: "S",
    talla_polera: "S",
    calzado_seguridad: "37",
    vencimiento_carnet: "2026-06-15",
    vencimiento_altura_geo: "2026-05-10",
    vencimiento_psicosensometrico: "2027-01-14",
    titulo_profesional: "Técnico Químico",
    universidad_titulo: "Instituto Tecnológico Central",
    cert_sap_lms: true,
    cert_soma_lms: false,
    cert_ti: true
  }
];

export const useTrabajadoresStore = create<TrabajadoresState>()(
  persist(
    (set, get) => ({
      trabajadores: [],
      
      fetchTrabajadores: async () => {
        try {
          const { data, error } = await supabase
            .from("trabajadores")
            .select("*")
            .order("created_at", { ascending: true });

          if (error) throw new Error(error.message);

          if (data && data.length > 0) {
            set({ trabajadores: data });
          } else if (process.env.NODE_ENV !== "production") {
            // Seed base solo en desarrollo cuando la tabla esta vacia
            const { data: seeded, error: seedError } = await supabase
              .from("trabajadores")
              .insert(mockTrabajadores)
              .select();

            if (seedError) throw new Error(seedError.message);
            if (seeded) set({ trabajadores: seeded });
          }
        } catch (err) {
          console.error("Failed to load workers from Supabase, using localStorage cache:", err instanceof Error ? err.message : err);
          // LocalStorage fallback takes care of keeping the old offline list active
        }
      },

      addTrabajador: async (t) => {
        const tempId = `temp-${Date.now()}`;
        const tempWorker = { ...t, id_trabajador: tempId } as Trabajador;

        // Optimistic UI update
        set((state) => ({ trabajadores: [...state.trabajadores, tempWorker] }));

        try {
          const { data, error } = await supabase
            .from("trabajadores")
            .insert([t])
            .select();

          if (error) throw error;
          
          if (data && data[0]) {
            set((state) => ({
              trabajadores: state.trabajadores.map((item) =>
                item.id_trabajador === tempId ? data[0] : item
              )
            }));
            const w = data[0] as Trabajador;
            useAuditoriaStore.getState().registrar({
              modulo: "Trabajadores",
              accion: "Alta",
              id_entidad: w.id_trabajador,
              nombre_entidad: `${w.nombre_1} ${w.apellido_paterno}`,
              detalle: `Trabajador ${w.nombre_1} ${w.apellido_paterno} creado. RUT/ID: ${w.numero_identificacion}.`,
            });
          }
        } catch (err) {
          console.error("Failed to persist new worker to Supabase:", err);
        }
      },

      updateTrabajador: async (id, updatedFields) => {
        // Optimistic UI update
        set((state) => ({
          trabajadores: state.trabajadores.map((t) => 
            t.id_trabajador === id ? { ...t, ...updatedFields } : t
          )
        }));

        try {
          const { error } = await supabase
            .from("trabajadores")
            .update(updatedFields)
            .eq("id_trabajador", id);

          if (error) throw error;

          const w = get().trabajadores.find((t) => t.id_trabajador === id);
          if (w) {
            useAuditoriaStore.getState().registrar({
              modulo: "Trabajadores",
              accion: "Modificacion",
              id_entidad: id,
              nombre_entidad: `${w.nombre_1} ${w.apellido_paterno}`,
              detalle: `Datos actualizados: ${Object.keys(updatedFields).join(", ")}.`,
              meta: updatedFields as Record<string, unknown>,
            });
          }
        } catch (err) {
          console.error(`Failed to update worker ${id} in Supabase:`, err);
        }
      },

      deleteTrabajador: async (id) => {
        // Optimistic UI update
        set((state) => ({
          trabajadores: state.trabajadores.filter((t) => t.id_trabajador !== id)
        }));

        const wBorrado = get().trabajadores.find((t) => t.id_trabajador === id);

        try {
          const { error } = await supabase
            .from("trabajadores")
            .delete()
            .eq("id_trabajador", id);

          if (error) throw error;

          if (wBorrado) {
            useAuditoriaStore.getState().registrar({
              modulo: "Trabajadores",
              accion: "Baja",
              id_entidad: id,
              nombre_entidad: `${wBorrado.nombre_1} ${wBorrado.apellido_paterno}`,
              detalle: `Trabajador ${wBorrado.nombre_1} ${wBorrado.apellido_paterno} eliminado del sistema.`,
            });
          }
        } catch (err) {
          console.error(`Failed to delete worker ${id} from Supabase:`, err);
        }
      }
    }),
    {
      name: "monitoring-trabajadores-storage"
    }
  )
);
