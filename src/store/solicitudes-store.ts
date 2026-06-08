import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

/** Genera un codigo de solicitud unico basado en anio + timestamp parcial */
function generarCodigoSolicitud(): string {
  const anio = new Date().getFullYear();
  const sufijo = Date.now().toString(36).toUpperCase().slice(-5);
  return `SOL-${anio}-${sufijo}`;
}

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export type TipoSolicitud =
  | "Vacaciones"
  | "Permiso con Goce"
  | "Permiso sin Goce"
  | "Cambio de Equipo"
  | "Cambio de Turno"
  | "Teletrabajo"
  | "Licencia Médica"
  | "Otro";

export type EstadoSolicitud =
  | "Pendiente"
  | "En Revisión"
  | "Aprobada"
  | "Rechazada"
  | "Cancelada";

export type PrioridadSolicitud = "Normal" | "Urgente";

// ─── Payloads específicos por tipo ───────────────────────────────────────────

export interface PayloadVacaciones {
  fecha_inicio: string;
  fecha_fin: string;
  dias_habiles: number;
  motivo?: string;
}

export interface PayloadPermisoConGoce {
  fecha_inicio: string;
  fecha_fin: string;
  dias_habiles: number;
  motivo: string;
}

export interface PayloadPermisoSinGoce {
  fecha_inicio: string;
  fecha_fin: string;
  dias_habiles: number;
  motivo: string;
}

export interface PayloadCambioEquipo {
  tipo_equipo: "Notebook" | "Monitor" | "Teclado" | "Mouse" | "Auriculares" | "Teléfono" | "Otro";
  descripcion_solicitud: string;
  motivo: "Falla" | "Obsolescencia" | "Nuevo Ingreso" | "Actualización";
  activo_actual?: string; // código/serie del equipo actual
  adjunto_informe?: string;
}

export interface PayloadCambioTurno {
  turno_actual: string;
  turno_solicitado: string;
  fecha_efectiva: string;
  motivo: string;
}

export interface PayloadTeletrabajo {
  fecha_inicio: string;
  fecha_fin?: string;
  modalidad: "Permanente" | "Temporal";
  dias_semana: string[]; // ["Lunes", "Miércoles"]
  motivo: string;
}

export interface PayloadLicenciaMedica {
  fecha_inicio: string;
  dias: number;
  tipo: "Común" | "Reposo Maternal" | "Accidente Laboral";
  numero_licencia?: string;
}

export interface PayloadOtro {
  descripcion: string;
}

export type PayloadSolicitud =
  | PayloadVacaciones
  | PayloadPermisoConGoce
  | PayloadPermisoSinGoce
  | PayloadCambioEquipo
  | PayloadCambioTurno
  | PayloadTeletrabajo
  | PayloadLicenciaMedica
  | PayloadOtro;

// ─── Solicitud principal ──────────────────────────────────────────────────────

export interface ComentarioSolicitud {
  id: string;
  id_solicitud: string;
  autor: string;
  texto: string;
  es_resolucion: boolean;
  fecha: string;
}

export interface Solicitud {
  id_solicitud: string;
  codigo_solicitud: string;
  tipo: TipoSolicitud;
  estado: EstadoSolicitud;
  prioridad: PrioridadSolicitud;
  id_trabajador_solicitante: string;
  nombre_solicitante: string;
  area: string;
  asunto: string;
  payload: PayloadSolicitud;
  id_revisor?: string;
  nombre_revisor?: string;
  fecha_creacion: string;
  fecha_revision?: string;
  fecha_resolucion?: string;
  motivo_rechazo?: string;
  observaciones?: string;
}

// ─────────────────────────────────────────────
//  Mock data
// ─────────────────────────────────────────────

const ahora = new Date();
const ayer = new Date(ahora.getTime() - 86400000);
const hace3dias = new Date(ahora.getTime() - 3 * 86400000);

const mockSolicitudes: Solicitud[] = [
  {
    id_solicitud: "sol-1",
    codigo_solicitud: "SOL-2026-0001",
    tipo: "Vacaciones",
    estado: "Pendiente",
    prioridad: "Normal",
    id_trabajador_solicitante: "t-1",
    nombre_solicitante: "Andrés Muñoz",
    area: "Operaciones",
    asunto: "Solicitud de vacaciones anuales — julio 2026",
    payload: {
      fecha_inicio: "2026-07-07",
      fecha_fin: "2026-07-18",
      dias_habiles: 10,
      motivo: "Vacaciones de invierno familiares."
    } as PayloadVacaciones,
    fecha_creacion: ayer.toISOString()
  },
  {
    id_solicitud: "sol-2",
    codigo_solicitud: "SOL-2026-0002",
    tipo: "Cambio de Equipo",
    estado: "En Revisión",
    prioridad: "Urgente",
    id_trabajador_solicitante: "t-2",
    nombre_solicitante: "Valentina Gómez",
    area: "Operaciones",
    asunto: "Reemplazo de notebook por falla en pantalla",
    payload: {
      tipo_equipo: "Notebook",
      descripcion_solicitud: "La pantalla presenta líneas horizontales que dificultan el trabajo.",
      motivo: "Falla",
      activo_actual: "NB-2024-014"
    } as PayloadCambioEquipo,
    id_revisor: "admin-1",
    nombre_revisor: "Jefatura TI",
    fecha_creacion: hace3dias.toISOString(),
    fecha_revision: ayer.toISOString()
  },
  {
    id_solicitud: "sol-3",
    codigo_solicitud: "SOL-2026-0003",
    tipo: "Permiso con Goce",
    estado: "Aprobada",
    prioridad: "Normal",
    id_trabajador_solicitante: "t-1",
    nombre_solicitante: "Andrés Muñoz",
    area: "Operaciones",
    asunto: "Permiso para trámite médico — 2 días",
    payload: {
      fecha_inicio: "2026-06-02",
      fecha_fin: "2026-06-03",
      dias_habiles: 2,
      motivo: "Trámite médico urgente familiar."
    } as PayloadPermisoConGoce,
    id_revisor: "admin-1",
    nombre_revisor: "RRHH",
    fecha_creacion: hace3dias.toISOString(),
    fecha_revision: ayer.toISOString(),
    fecha_resolucion: ayer.toISOString(),
    observaciones: "Aprobado. Coordinar con jefatura directa."
  }
];

const mockComentarios: ComentarioSolicitud[] = [
  {
    id: "csol-1",
    id_solicitud: "sol-2",
    autor: "Jefatura TI",
    texto: "Se solicitó revisión del activo al área de soporte. Se asignará equipo de reemplazo mientras dure la evaluación.",
    es_resolucion: false,
    fecha: ayer.toISOString()
  }
];

// ─────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────

interface SolicitudesState {
  solicitudes: Solicitud[];
  comentarios: ComentarioSolicitud[];
  fetchSolicitudes: () => Promise<void>;
  addSolicitud: (
    s: Omit<Solicitud, "id_solicitud" | "codigo_solicitud" | "fecha_creacion" | "estado">
  ) => Promise<void>;
  updateEstado: (
    id: string,
    estado: EstadoSolicitud,
    opts?: { motivo_rechazo?: string; observaciones?: string; nombre_revisor?: string }
  ) => Promise<void>;
  cancelarSolicitud: (id: string) => Promise<void>;
  addComentario: (c: Omit<ComentarioSolicitud, "id" | "fecha">) => Promise<void>;
  deleteSolicitud: (id: string) => Promise<void>;
}

function mapDbToSolicitud(db: Record<string, unknown>): Solicitud {
  return {
    id_solicitud: db.id_solicitud as string,
    codigo_solicitud: (db.codigo_solicitud as string) ?? "",
    tipo: db.tipo as TipoSolicitud,
    estado: db.estado as EstadoSolicitud,
    prioridad: db.prioridad as PrioridadSolicitud,
    id_trabajador_solicitante: db.id_trabajador_solicitante as string,
    nombre_solicitante: db.nombre_solicitante as string,
    area: db.area as string,
    asunto: db.asunto as string,
    payload: (db.payload as PayloadSolicitud) || ({} as PayloadSolicitud),
    id_revisor: db.id_revisor as string | undefined,
    nombre_revisor: db.nombre_revisor as string | undefined,
    fecha_creacion: db.fecha_creacion as string,
    fecha_revision: db.fecha_revision as string | undefined,
    fecha_resolucion: db.fecha_resolucion as string | undefined,
    motivo_rechazo: db.motivo_rechazo as string | undefined,
    observaciones: db.observaciones as string | undefined,
  };
}

function mapDbToComentario(db: Record<string, unknown>): ComentarioSolicitud {
  return {
    id: db.id as string,
    id_solicitud: db.id_solicitud as string,
    autor: db.autor as string,
    texto: db.texto as string,
    es_resolucion: db.es_resolucion as boolean,
    fecha: db.fecha as string,
  };
}

export const useSolicitudesStore = create<SolicitudesState>()(
  persist(
    (set, get) => ({
      solicitudes: mockSolicitudes,
      comentarios: mockComentarios,

      fetchSolicitudes: async () => {
        try {
          const { data: reqData, error: reqError } = await supabase
            .from("solicitudes")
            .select("*")
            .order("fecha_creacion", { ascending: false });

          if (reqError) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[browser] Supabase no tiene tabla solicitudes, usando mock", reqError.message);
            }
            return;
          }

          const { data: comData, error: comError } = await supabase
            .from("solicitud_comentarios")
            .select("*")
            .order("fecha", { ascending: true });

          if (comError && process.env.NODE_ENV === "development") {
            console.warn("[browser] Supabase no tiene solicitud_comentarios, ignorando comentarios remotos");
          }

          if (reqData && reqData.length > 0) {
            set({
              solicitudes: reqData.map(mapDbToSolicitud),
              comentarios: (comData || []).map(mapDbToComentario)
            });
          } else if (process.env.NODE_ENV !== "production") {
            // Seed base solo en desarrollo
            const seededSolicitudes: Solicitud[] = [];
            const seededComments: ComentarioSolicitud[] = [];

            for (const mockSol of mockSolicitudes) {
              const dbInsert = {
                tipo: mockSol.tipo,
                estado: mockSol.estado,
                prioridad: mockSol.prioridad,
                id_trabajador_solicitante: mockSol.id_trabajador_solicitante,
                nombre_solicitante: mockSol.nombre_solicitante,
                area: mockSol.area,
                asunto: mockSol.asunto,
                payload: mockSol.payload,
                id_revisor: mockSol.id_revisor,
                nombre_revisor: mockSol.nombre_revisor,
                observaciones: mockSol.observaciones,
                motivo_rechazo: mockSol.motivo_rechazo,
                fecha_creacion: mockSol.fecha_creacion,
                fecha_revision: mockSol.fecha_revision,
                fecha_resolucion: mockSol.fecha_resolucion,
              };

              const { data: createdSol, error: insertError } = await supabase
                .from("solicitudes")
                .insert([dbInsert])
                .select();

              if (insertError) break;
              if (createdSol && createdSol[0]) {
                const dbSol = createdSol[0];
                seededSolicitudes.push(mapDbToSolicitud(dbSol));

                const mockComs = mockComentarios.filter(
                  (c) => c.id_solicitud === mockSol.id_solicitud
                );
                for (const mockCom of mockComs) {
                  const comInsert = {
                    id_solicitud: dbSol.id_solicitud,
                    autor: mockCom.autor,
                    texto: mockCom.texto,
                    es_resolucion: mockCom.es_resolucion,
                    fecha: mockCom.fecha,
                  };
                  const { data: createdCom } = await supabase
                    .from("solicitud_comentarios")
                    .insert([comInsert])
                    .select();
                  if (createdCom && createdCom[0]) {
                    seededComments.push(mapDbToComentario(createdCom[0]));
                  }
                }
              }
            }
            if (seededSolicitudes.length > 0) {
              set({ solicitudes: seededSolicitudes, comentarios: seededComments });
            }
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[browser] Error al cargar/seed solicitudes:", err);
          }
        }
      },

      addSolicitud: async (s) => {
        const tempId = `temp-sol-${Date.now()}`;
        const codigo = generarCodigoSolicitud();
        const fechaCreacion = new Date().toISOString();
        const nuevoTemp: Solicitud = {
          ...s,
          id_solicitud: tempId,
          codigo_solicitud: codigo,
          estado: "Pendiente",
          fecha_creacion: fechaCreacion
        };

        set((state) => ({ solicitudes: [...state.solicitudes, nuevoTemp] }));

        try {
          const dbInsert = {
            tipo: s.tipo,
            estado: "Pendiente",
            prioridad: s.prioridad,
            id_trabajador_solicitante: s.id_trabajador_solicitante,
            nombre_solicitante: s.nombre_solicitante,
            area: s.area,
            asunto: s.asunto,
            payload: s.payload,
          };

          const { data, error } = await supabase
            .from("solicitudes")
            .insert([dbInsert])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              solicitudes: state.solicitudes.map((item) =>
                item.id_solicitud === tempId ? mapDbToSolicitud(data[0]) : item
              )
            }));
            useAuditoriaStore.getState().registrar({
              modulo: "Solicitudes",
              accion: "Alta",
              id_entidad: data[0].id_solicitud,
              nombre_entidad: s.asunto,
              detalle: `Solicitud ${codigo} creada por ${s.nombre_solicitante}. Tipo: ${s.tipo}.`,
            });
          }
        } catch (err) {
          console.error("Failed to persist request to Supabase:", err);
        }
      },

      updateEstado: async (id, estado, opts = {}) => {
        const ahora = new Date().toISOString();
        set((state) => ({
          solicitudes: state.solicitudes.map((s) => {
            if (s.id_solicitud !== id) return s;
            return {
              ...s,
              estado,
              motivo_rechazo: opts.motivo_rechazo ?? s.motivo_rechazo,
              observaciones: opts.observaciones ?? s.observaciones,
              nombre_revisor: opts.nombre_revisor ?? s.nombre_revisor,
              fecha_resolucion: ["Aprobada", "Rechazada"].includes(estado) ? ahora : s.fecha_resolucion,
              fecha_revision:
                estado === "En Revisión" && !s.fecha_revision ? ahora : s.fecha_revision
            };
          })
        }));

        try {
          const updateFields: any = {
            status: estado
          };
          if (opts.motivo_rechazo !== undefined) updateFields.rejection_reason = opts.motivo_rechazo;
          if (opts.observaciones !== undefined) updateFields.resolution_note = opts.observaciones;
          if (opts.nombre_revisor !== undefined) updateFields.current_assignee_name = opts.nombre_revisor;
          
          if (["Aprobada", "Rechazada"].includes(estado)) {
            updateFields.resolved_at = ahora;
          }
          if (estado === "En Revisión") {
            updateFields.reviewed_at = ahora;
          }

          const { error } = await supabase
            .from("solicitudes")
            .update(updateFields)
            .eq("id_solicitud", id);

          if (error) throw error;

          const sol = get().solicitudes.find((s) => s.id_solicitud === id);
          if (sol) {
            useAuditoriaStore.getState().registrar({
              modulo: "Solicitudes",
              accion: "Modificacion",
              id_entidad: id,
              nombre_entidad: sol.asunto,
              detalle: `Estado de solicitud actualizado a "${estado}".${opts?.motivo_rechazo ? ` Motivo: ${opts.motivo_rechazo}` : ""}`,
            });
          }
        } catch (err) {
          console.error(`Failed to update request state in Supabase:`, err);
        }
      },

      cancelarSolicitud: async (id) => {
        set((state) => ({
          solicitudes: state.solicitudes.map((s) =>
            s.id_solicitud === id ? { ...s, estado: "Cancelada" } : s
          )
        }));

        try {
          const { error } = await supabase
            .from("solicitudes")
            .update({ estado: "Cancelada", fecha_resolucion: new Date().toISOString() })
            .eq("id_solicitud", id);

          if (error) throw error;
        } catch (err) {
          console.error(`Failed to cancel request ${id} in Supabase:`, err);
        }
      },

      addComentario: async (c) => {
        const tempId = `temp-com-${Date.now()}`;
        const nuevoTemp: ComentarioSolicitud = {
          ...c,
          id: tempId,
          fecha: new Date().toISOString()
        };

        set((state) => ({ comentarios: [...state.comentarios, nuevoTemp] }));

        try {
          const comInsert = {
            ticket_request_id: c.id_solicitud,
            user_id: "00000000-0000-0000-0000-000000000003",
            author_name: c.autor,
            comment: c.texto,
            is_resolution: c.es_resolucion
          };

          const { data, error } = await supabase
            .from("solicitud_comentarios")
            .insert([comInsert])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              comentarios: state.comentarios.map((item) =>
                item.id === tempId ? mapDbToComentario(data[0]) : item
              )
            }));
          }
        } catch (err) {
          console.error("Failed to persist request comment to Supabase:", err);
        }
      },

      deleteSolicitud: async (id) => {
        set((state) => ({
          solicitudes: state.solicitudes.filter((s) => s.id_solicitud !== id),
          comentarios: state.comentarios.filter((c) => c.id_solicitud !== id)
        }));

        try {
          const { error } = await supabase
            .from("solicitudes")
            .delete()
            .eq("id_solicitud", id);

          if (error) throw error;
        } catch (err) {
          console.error(`Failed to delete request ${id} from Supabase:`, err);
        }
      }
    }),
    { name: "monitoring-solicitudes-storage" }
  )
);
