import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";
import type { EstadoTicket, PrioridadTicket } from "@/lib/enums";

export interface ComentarioTicket {
  id_comentario: string;
  id_ticket: string;
  id_trabajador: string; // Author
  texto: string;
  es_interno: boolean; // True if only visible to IT
  fecha_creacion: string;
}

export interface Ticket {
  id_ticket: string;
  codigo_ticket: string;
  id_trabajador_solicitante: string;
  id_activo_relacionado: string | null;
  tipo: "Incidencia" | "Requerimiento" | "Consulta";
  categoria: "Hardware" | "Software" | "Red" | "Accesos" | "Otros";
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  id_tecnico_responsable: string | null;
  asunto: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_asignacion?: string;
  fecha_cierre?: string;
  sla_respuesta_hasta: string;
  sla_resolucion_hasta: string;
  cumplio_sla_respuesta: boolean;
  cumplio_sla_resolucion: boolean;
}

interface TicketsState {
  tickets: Ticket[];
  comentarios: ComentarioTicket[];
  fetchTickets: () => Promise<void>;
  addTicket: (t: Omit<Ticket, "id_ticket" | "codigo_ticket" | "fecha_creacion" | "sla_respuesta_hasta" | "sla_resolucion_hasta" | "cumplio_sla_respuesta" | "cumplio_sla_resolucion" | "estado">) => Promise<void>;
  updateTicket: (id: string, updatedFields: Partial<Ticket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  assignTicket: (id: string, idTecnico: string) => Promise<void>;
  closeTicket: (id: string) => Promise<void>;
  addComentario: (c: Omit<ComentarioTicket, "id_comentario" | "fecha_creacion">) => Promise<void>;
}

// SLA Rule calculator helper
const calcularSlaLimites = (prioridad: string, categoria: string, fechaCreacion: Date) => {
  let horasRespuesta = 24;
  let horasResolucion = 72;

  if (prioridad === "Critica") {
    if (categoria === "Red") {
      horasRespuesta = 2;
      horasResolucion = 8;
    } else if (categoria === "Software") {
      horasRespuesta = 4;
      horasResolucion = 12;
    } else if (categoria === "Hardware") {
      horasRespuesta = 4;
      horasResolucion = 24;
    }
  } else if (prioridad === "Alta") {
    if (categoria === "Hardware") {
      horasRespuesta = 8;
      horasResolucion = 48;
    } else if (categoria === "Software") {
      horasRespuesta = 8;
      horasResolucion = 24;
    }
  } else if (prioridad === "Media") {
    if (categoria === "Hardware") {
      horasRespuesta = 24;
      horasResolucion = 72;
    } else if (categoria === "Software") {
      horasRespuesta = 24;
      horasResolucion = 48;
    }
  } else if (prioridad === "Baja") {
    horasRespuesta = 48;
    horasResolucion = 120;
  }

  const respDate = new Date(fechaCreacion.getTime() + horasRespuesta * 60 * 60 * 1000);
  const resoDate = new Date(fechaCreacion.getTime() + horasResolucion * 60 * 60 * 1000);

  return {
    sla_respuesta_hasta: respDate.toISOString(),
    sla_resolucion_hasta: resoDate.toISOString()
  };
};

/** Genera un codigo de ticket unico basado en anio + timestamp parcial */
function generarCodigoTicket(): string {
  const anio = new Date().getFullYear();
  const sufijo = Date.now().toString(36).toUpperCase().slice(-5);
  return `IT-${anio}-${sufijo}`;
}

const mockTickets: Ticket[] = [
  {
    id_ticket: "tk-1",
    codigo_ticket: "IT-2026-0001",
    id_trabajador_solicitante: "t-1", // Andrés
    id_activo_relacionado: null,
    tipo: "Incidencia",
    categoria: "Red",
    prioridad: "Critica",
    estado: "Abierto",
    id_tecnico_responsable: null,
    asunto: "Caída de enlace VPN en Faena Minera",
    descripcion: "No logramos conectar la pasarela local con la red corporativa. Bloquea el envío de reportes de calidad.",
    fecha_creacion: new Date(Date.now() - 3600000).toISOString(), // Hace 1 hora
    sla_respuesta_hasta: new Date(Date.now() + 3600000).toISOString(), // 1 hora restante
    sla_resolucion_hasta: new Date(Date.now() + 25200000).toISOString(), // 7 horas restantes
    cumplio_sla_respuesta: true,
    cumplio_sla_resolucion: true
  },
  {
    id_ticket: "tk-2",
    codigo_ticket: "IT-2026-0002",
    id_trabajador_solicitante: "t-2", // Valentina
    id_activo_relacionado: "a-2",
    tipo: "Requerimiento",
    categoria: "Software",
    prioridad: "Media",
    estado: "En Atencion",
    id_tecnico_responsable: "t-1", // Andrés como técnico
    asunto: "Instalación de entorno de desarrollo",
    descripcion: "Requiero privilegios y software de Docker, Node.js y VS Code para realizar pruebas de calidad del sistema.",
    fecha_creacion: new Date(Date.now() - 72000000).toISOString(), // Hace 20 horas
    fecha_asignacion: new Date(Date.now() - 70000000).toISOString(),
    sla_respuesta_hasta: new Date(Date.now() + 14400000).toISOString(),
    sla_resolucion_hasta: new Date(Date.now() + 100800000).toISOString(),
    cumplio_sla_respuesta: true,
    cumplio_sla_resolucion: true
  }
];

const mockComentarios: ComentarioTicket[] = [
  {
    id_comentario: "c-1",
    id_ticket: "tk-2",
    id_trabajador: "t-1",
    texto: "Hola Valentina, tomé tu requerimiento. Cuéntame si necesitas alguna versión específica de Node.",
    es_interno: false,
    fecha_creacion: new Date(Date.now() - 68000000).toISOString()
  },
  {
    id_comentario: "c-2",
    id_ticket: "tk-2",
    id_trabajador: "t-2",
    texto: "Hola Andrés, idealmente Node.js v20 (LTS) y la última estable de Docker Desktop por favor.",
    es_interno: false,
    fecha_creacion: new Date(Date.now() - 65000000).toISOString()
  },
  {
    id_comentario: "c-3",
    id_ticket: "tk-2",
    id_trabajador: "t-1",
    texto: "[TI Note] Se requiere habilitar bypass temporal de privilegios mediante comando sudo local ya que es equipo macOS.",
    es_interno: true, // Nota interna de soporte TI!
    fecha_creacion: new Date(Date.now() - 64000000).toISOString()
  }
];

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: mockTickets,
      comentarios: mockComentarios,
      
      fetchTickets: async () => {
        try {
          const { data: tkData, error: tkError } = await supabase
            .from("tickets")
            .select("*")
            .order("fecha_creacion", { ascending: false });

          // Table doesn't exist in Supabase yet → use local mock silently
          if (tkError) {
            // Only log in development so the console stays clean in prod
            if (process.env.NODE_ENV === "development") {
              console.warn("[tickets-store] Supabase no disponible, usando datos locales.", tkError.message);
            }
            // Keep whatever is already in the persisted store (or mock defaults)
            return;
          }

          const { data: comData, error: comError } = await supabase
            .from("ticket_comentarios")
            .select("*")
            .order("fecha_creacion", { ascending: true });

          if (comError) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[tickets-store] Error cargando comentarios, usando datos locales.", comError.message);
            }
            return;
          }

          if (tkData && tkData.length > 0) {
            set({ tickets: tkData, comentarios: comData || [] });
          } else {
            // Cloud DB exists but is empty → seed with mock data
            const seededTickets: Ticket[] = [];
            const seededComments: ComentarioTicket[] = [];

            for (const mockTk of mockTickets) {
              const { id_ticket, ...dbInsertFields } = mockTk;
              const { data: createdTks, error: createError } = await supabase
                .from("tickets")
                .insert([dbInsertFields])
                .select();

              if (createError) {
                if (process.env.NODE_ENV === "development") {
                  console.warn("[tickets-store] No se pudo hacer seed:", createError.message);
                }
                break;
              }

              if (createdTks && createdTks[0]) {
                const dbTk = createdTks[0];
                seededTickets.push(dbTk);

                const mockComs = mockComentarios.filter(c => c.id_ticket === mockTk.id_ticket);
                if (mockComs.length > 0) {
                  const dbComs = mockComs.map(c => ({
                    id_ticket: dbTk.id_ticket,
                    id_trabajador: c.id_trabajador,
                    texto: c.texto,
                    es_interno: c.es_interno,
                    fecha_creacion: c.fecha_creacion
                  }));

                  const { data: createdComs, error: comCreateError } = await supabase
                    .from("ticket_comentarios")
                    .insert(dbComs)
                    .select();

                  if (!comCreateError && createdComs) {
                    seededComments.push(...createdComs);
                  }
                }
              }
            }

            if (seededTickets.length > 0) {
              set({ tickets: seededTickets, comentarios: seededComments });
            }
          }
        } catch (err) {
          // Network error or unexpected failure → stay silent, keep local data
          if (process.env.NODE_ENV === "development") {
            console.warn("[tickets-store] Error de red al conectar con Supabase:", err);
          }
        }
      },

      addTicket: async (t) => {
        const tempId = `temp-tk-${Date.now()}`;
        const codigo = generarCodigoTicket();
        const fechaCreacion = new Date();
        const { sla_respuesta_hasta, sla_resolucion_hasta } = calcularSlaLimites(t.prioridad, t.categoria, fechaCreacion);
 
        const nuevoTemp: Ticket = {
          ...t,
          id_ticket: tempId,
          codigo_ticket: codigo,
          estado: "Abierto",
          fecha_creacion: fechaCreacion.toISOString(),
          sla_respuesta_hasta,
          sla_resolucion_hasta,
          cumplio_sla_respuesta: true,
          cumplio_sla_resolucion: true
        };
 
        set((state) => ({ tickets: [...state.tickets, nuevoTemp] }));
 
        try {
          const dbInsert = {
            codigo_ticket: codigo,
            id_trabajador_solicitante: t.id_trabajador_solicitante,
            id_activo_relacionado: t.id_activo_relacionado,
            tipo: t.tipo,
            categoria: t.categoria,
            prioridad: t.prioridad,
            estado: "Abierto",
            id_tecnico_responsable: t.id_tecnico_responsable,
            asunto: t.asunto,
            descripcion: t.descripcion,
            fecha_creacion: fechaCreacion.toISOString(),
            sla_respuesta_hasta,
            sla_resolucion_hasta,
            cumplio_sla_respuesta: true,
            cumplio_sla_resolucion: true
          };
 
          const { data, error } = await supabase
            .from("tickets")
            .insert([dbInsert])
            .select();
 
          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              tickets: state.tickets.map((item) =>
                item.id_ticket === tempId ? data[0] : item
              )
            }));
            useAuditoriaStore.getState().registrar({
              modulo: "Tickets",
              accion: "Alta",
              id_entidad: data[0].id_ticket,
              nombre_entidad: t.asunto,
              detalle: `Ticket ${data[0].codigo_ticket} creado. Prioridad: ${t.prioridad}. Categoria: ${t.categoria}.`,
            });
          }
        } catch (err) {
          console.error("Failed to persist ticket to Supabase:", err);
        }
      },

      updateTicket: async (id, updatedFields) => {
        set((state) => ({
          tickets: state.tickets.map((t) => 
            t.id_ticket === id ? { ...t, ...updatedFields } : t
          )
        }));
 
        try {
          const { error } = await supabase
            .from("tickets")
            .update(updatedFields)
            .eq("id_ticket", id);
 
          if (error) throw error;
        } catch (err) {
          console.error(`Failed to update ticket ${id} in Supabase:`, err);
        }
      },

      deleteTicket: async (id) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id_ticket !== id),
          comentarios: state.comentarios.filter((c) => c.id_ticket !== id)
        }));
 
        try {
          const { error } = await supabase
            .from("tickets")
            .delete()
            .eq("id_ticket", id);
 
          if (error) throw error;
        } catch (err) {
          console.error(`Failed to delete ticket ${id} from Supabase:`, err);
        }
      },

      assignTicket: async (id, idTecnico) => {
        const ahora = new Date();
        // Calcular si llego a tiempo ANTES de mutar el estado
        const ticketActual = get().tickets.find((t) => t.id_ticket === id);
        const respondidoATiempo = ticketActual
          ? ahora.getTime() < new Date(ticketActual.sla_respuesta_hasta).getTime()
          : true;

        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id_ticket === id) {
              return {
                ...t,
                estado: "En Atencion",
                id_tecnico_responsable: idTecnico,
                fecha_asignacion: ahora.toISOString(),
                cumplio_sla_respuesta: respondidoATiempo
              };
            }
            return t;
          })
        }));
 
        try {
          const { error } = await supabase
            .from("tickets")
            .update({
              estado: "En Atencion",
              id_tecnico_responsable: idTecnico,
              fecha_asignacion: ahora.toISOString(),
              cumplio_sla_respuesta: respondidoATiempo
            })
            .eq("id_ticket", id);
 
          if (error) throw error;

          if (ticketActual) {
            useAuditoriaStore.getState().registrar({
              modulo: "Tickets",
              accion: "Asignacion",
              id_entidad: id,
              nombre_entidad: ticketActual.asunto,
              detalle: `Ticket ${ticketActual.codigo_ticket} asignado a tecnico ${idTecnico}. SLA respuesta: ${respondidoATiempo ? "cumplido" : "incumplido"}.`,
            });
          }
        } catch (err) {
          console.error(`Failed to assign ticket ${id} in Supabase:`, err);
        }
      },

      closeTicket: async (id) => {
        const ahora = new Date();
        // Calcular si se resolvio a tiempo ANTES de mutar el estado
        const ticketActual = get().tickets.find((t) => t.id_ticket === id);
        const resueltoATiempo = ticketActual
          ? ahora.getTime() < new Date(ticketActual.sla_resolucion_hasta).getTime()
          : true;

        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id_ticket === id) {
              return {
                ...t,
                estado: "Cerrado",
                fecha_cierre: ahora.toISOString(),
                cumplio_sla_resolucion: resueltoATiempo
              };
            }
            return t;
          })
        }));
 
        try {
          const { error } = await supabase
            .from("tickets")
            .update({
              estado: "Cerrado",
              fecha_cierre: ahora.toISOString(),
              cumplio_sla_resolucion: resueltoATiempo
            })
            .eq("id_ticket", id);
 
          if (error) throw error;

          if (ticketActual) {
            useAuditoriaStore.getState().registrar({
              modulo: "Tickets",
              accion: "Cierre",
              id_entidad: id,
              nombre_entidad: ticketActual.asunto,
              detalle: `Ticket ${ticketActual.codigo_ticket} cerrado. SLA resolucion: ${resueltoATiempo ? "cumplido" : "incumplido"}.`,
            });
          }
        } catch (err) {
          console.error(`Failed to close ticket ${id} in Supabase:`, err);
        }
      },

      addComentario: async (c) => {
        const tempId = `temp-com-${Date.now()}`;
        const nuevoTemp: ComentarioTicket = {
          ...c,
          id_comentario: tempId,
          fecha_creacion: new Date().toISOString()
        };
 
        set((state) => ({ comentarios: [...state.comentarios, nuevoTemp] }));
 
        try {
          const { data, error } = await supabase
            .from("ticket_comentarios")
            .insert([{
              id_ticket: c.id_ticket,
              id_trabajador: c.id_trabajador,
              texto: c.texto,
              es_interno: c.es_interno
            }])
            .select();
 
          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              comentarios: state.comentarios.map((item) =>
                item.id_comentario === tempId ? data[0] : item
              )
            }));
          }
        } catch (err) {
          console.error("Failed to persist ticket comment to Supabase:", err);
        }
      }
    }),
    {
      name: "monitoring-tickets-storage"
    }
  )
);
