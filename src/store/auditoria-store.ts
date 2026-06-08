import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────

export type ModuloAuditoria =
  | "Trabajadores"
  | "Contratos"
  | "Tickets"
  | "Solicitudes"
  | "Control"
  | "Activos"
  | "Asistencia"
  | "Comunicaciones"
  | "Usuarios"
  | "Sistema";

export type TipoAccion =
  | "Alta"
  | "Baja"
  | "Modificacion"
  | "Consulta"
  | "Asignacion"
  | "Cierre"
  | "Error"
  | "Acceso";

export interface EntradaAuditoria {
  id: string;
  modulo: ModuloAuditoria;
  accion: TipoAccion;
  /** ID del registro afectado (trabajador, ticket, contrato, etc.) */
  id_entidad: string;
  /** Nombre o descripcion breve del registro afectado */
  nombre_entidad: string;
  /** Descripcion detallada de lo que cambio */
  detalle: string;
  /** Usuario que ejecuto la accion */
  usuario: string;
  /** ISO timestamp */
  fecha_at: string;
  /** Metadata extra opcional (antes/despues de campos modificados) */
  meta?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
//  Filtros de busqueda
// ─────────────────────────────────────────────────────────────

export interface FiltrosAuditoria {
  modulo?: ModuloAuditoria;
  accion?: TipoAccion;
  usuario?: string;
  id_entidad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  texto?: string;
}

// ─────────────────────────────────────────────────────────────
//  Estado del store
// ─────────────────────────────────────────────────────────────

const MAX_ENTRADAS_MEMORIA = 1000;
const USUARIO_DEFAULT = "Operador General";

interface AuditoriaState {
  entradas: EntradaAuditoria[];
  totalRemoto: number;
  cargando: boolean;

  /** Registra una nueva entrada de auditoria (local + Supabase) */
  registrar: (
    entrada: Omit<EntradaAuditoria, "id" | "fecha_at" | "usuario"> & {
      usuario?: string;
    }
  ) => Promise<void>;

  /** Carga historial desde Supabase con filtros opcionales */
  fetchAuditoria: (filtros?: FiltrosAuditoria, pagina?: number) => Promise<void>;

  /** Helpers de consulta local */
  getByModulo: (modulo: ModuloAuditoria) => EntradaAuditoria[];
  getByEntidad: (id_entidad: string) => EntradaAuditoria[];
}

// ─────────────────────────────────────────────────────────────
//  Helper para generar ID local unico
// ─────────────────────────────────────────────────────────────

function generarIdLocal(): string {
  return `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

export const useAuditoriaStore = create<AuditoriaState>()(
  persist(
    (set, get) => ({
      entradas: [],
      totalRemoto: 0,
      cargando: false,

      registrar: async (entrada) => {
        const nuevaEntrada: EntradaAuditoria = {
          ...entrada,
          id: generarIdLocal(),
          fecha_at: new Date().toISOString(),
          usuario: entrada.usuario ?? USUARIO_DEFAULT,
        };

        // Actualizar estado local inmediatamente
        set((state) => ({
          entradas: [nuevaEntrada, ...state.entradas].slice(
            0,
            MAX_ENTRADAS_MEMORIA
          ),
        }));

        // Persistir en Supabase
        try {
          const { error } = await supabase.from("auditoria").insert([
            {
              modulo: nuevaEntrada.modulo,
              accion: nuevaEntrada.accion,
              id_entidad: nuevaEntrada.id_entidad,
              nombre_entidad: nuevaEntrada.nombre_entidad,
              detalle: nuevaEntrada.detalle,
              usuario: nuevaEntrada.usuario,
              fecha_at: nuevaEntrada.fecha_at,
              meta: nuevaEntrada.meta ?? null,
            },
          ]);

          if (error && process.env.NODE_ENV === "development") {
            console.warn(
              "[auditoria-store] No se pudo persistir entrada en Supabase:",
              error.message
            );
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auditoria-store] Error de red al registrar:", err);
          }
        }
      },

      fetchAuditoria: async (filtros, pagina = 0) => {
        set({ cargando: true });

        try {
          const LIMITE = 50;
          let query = supabase
            .from("auditoria")
            .select("*", { count: "exact" })
            .order("fecha_at", { ascending: false })
            .range(pagina * LIMITE, pagina * LIMITE + LIMITE - 1);

          if (filtros?.modulo) query = query.eq("modulo", filtros.modulo);
          if (filtros?.accion) query = query.eq("accion", filtros.accion);
          if (filtros?.usuario) query = query.ilike("usuario", `%${filtros.usuario}%`);
          if (filtros?.id_entidad) query = query.eq("id_entidad", filtros.id_entidad);
          if (filtros?.fecha_desde) query = query.gte("fecha_at", filtros.fecha_desde);
          if (filtros?.fecha_hasta) query = query.lte("fecha_at", filtros.fecha_hasta);
          if (filtros?.texto) {
            query = query.or(
              `detalle.ilike.%${filtros.texto}%,nombre_entidad.ilike.%${filtros.texto}%`
            );
          }

          const { data, error, count } = await query;

          if (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "[auditoria-store] Supabase no disponible, usando cache local:",
                error.message
              );
            }
            return;
          }

          if (data) {
            const entradas: EntradaAuditoria[] = data.map((row) => ({
              id: row.id,
              modulo: row.modulo,
              accion: row.accion,
              id_entidad: row.id_entidad,
              nombre_entidad: row.nombre_entidad,
              detalle: row.detalle,
              usuario: row.usuario,
              fecha_at: row.fecha_at,
              meta: row.meta ?? undefined,
            }));

            set({
              entradas: pagina === 0 ? entradas : [...get().entradas, ...entradas],
              totalRemoto: count ?? 0,
            });
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[auditoria-store] Error de red:", err);
          }
        } finally {
          set({ cargando: false });
        }
      },

      getByModulo: (modulo) =>
        get().entradas.filter((e) => e.modulo === modulo),

      getByEntidad: (id_entidad) =>
        get().entradas.filter((e) => e.id_entidad === id_entidad),
    }),
    { name: "monitoring-auditoria-v1" }
  )
);
