import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { useAuditoriaStore } from "@/store/auditoria-store";

const log = createLogger("ciclo-vida-store");

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type EstadoCicloVida = 
  | "nuevo_ingreso" 
  | "pre_incorporacion" 
  | "activo" 
  | "cambio_rol" 
  | "baja" 
  | "archivado";

export type TransicionPermitida = {
  desde: EstadoCicloVida;
  hacia: EstadoCicloVida;
  requiere?: string[];
};

export interface CicloVidaTrabajador {
  id: string;
  id_trabajador: string;
  estado_actual: EstadoCicloVida;
  fecha_ingreso_efectivo?: string;
  fecha_cambio_rol?: string;
  fecha_baja?: string;
  fecha_archivado?: string;
  motivo_baja?: string;
  historial: HistorialEstado[];
  updated_at: string;
}

export interface HistorialEstado {
  id: string;
  estado_anterior: EstadoCicloVida | null;
  estado_nuevo: EstadoCicloVida;
  fecha_transicion: string;
  razon?: string;
  ejecutado_por: string;
}

// ─────────────────────────────────────────────────────────────
//  Transiciones permitidas
// ─────────────────────────────────────────────────────────────

const TRANSICIONES_PERMITIDAS: TransicionPermitida[] = [
  { desde: "nuevo_ingreso", hacia: "pre_incorporacion" },
  { desde: "pre_incorporacion", hacia: "activo", requiere: ["datos_basicos", "contrato_asignado"] },
  { desde: "activo", hacia: "cambio_rol" },
  { desde: "cambio_rol", hacia: "activo" },
  { desde: "activo", hacia: "baja", requiere: ["motivo_baja"] },
  { desde: "cambio_rol", hacia: "baja", requiere: ["motivo_baja"] },
  { desde: "baja", hacia: "archivado" },
];

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

interface CicloVidaState {
  ciclos: CicloVidaTrabajador[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  /** Timestamp (ms) del último fetch exitoso para gatear refetch redundante. */
  lastFetchAt: number | null;

  // CRUD
  fetchCiclos: () => Promise<void>;
  getCicloByTrabajador: (idTrabajador: string) => CicloVidaTrabajador | undefined;
  /**
   * Garantiza que el trabajador tenga un ciclo de vida. Si no existe, crea uno
   * en estado `nuevo_ingreso`. Es idempotente: si ya existe, lo retorna.
   */
  inicializarCiclo: (idTrabajador: string) => Promise<CicloVidaTrabajador>;
  
  // Transiciones
  transicionarEstado: (
    idTrabajador: string,
    estadoNuevo: EstadoCicloVida,
    razon?: string
  ) => Promise<boolean>;
  validarTransicion: (desde: EstadoCicloVida, hacia: EstadoCicloVida) => boolean;
  
  // Helpers
  getTransicionesPermitidas: (estadoActual: EstadoCicloVida) => EstadoCicloVida[];
  estaActivo: (idTrabajador: string) => boolean;
}

export const useCicloVidaStore = create<CicloVidaState>()(
  persist(
    (set, get) => ({
      ciclos: [],
      loading: false,
      hydrated: false,
      lastFetchAt: null,

      fetchCiclos: async () => {
        const now = Date.now();
        const TTL_MS = 5 * 60 * 1000; // 5 minutos
        const { lastFetchAt } = get();

        if (lastFetchAt && now - lastFetchAt < TTL_MS) {
          return;
        }

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("ciclo_vida_trabajador")
            .select("*");
          // Solo sobrescribimos el caché local si vino contenido real. Una
          // respuesta vacía (RLS, tabla aún no creada en dev, etc.) NO debe
          // borrar los ciclos persistidos en localStorage.
          if (!error && data && data.length > 0) {
            set({ ciclos: data as CicloVidaTrabajador[], lastFetchAt: Date.now() });
          } else if (!error && data && data.length === 0) {
            // También consideramos fetch exitoso vacío como reciente para evitar
            // martillar la red durante la ventana TTL.
            set({ lastFetchAt: Date.now() });
          } else if (error && process.env.NODE_ENV === "development") {
            log.warn("fetchCiclos error", error.message);
          }
        } catch (err) {
          log.error("Error fetching ciclos", err);
        } finally {
          set({ loading: false });
        }
      },

      getCicloByTrabajador: (idTrabajador: string) => {
        return get().ciclos.find((c) => c.id_trabajador === idTrabajador);
      },

      inicializarCiclo: async (idTrabajador: string) => {
        // Idempotente: si ya existe, retornarlo
        const existente = get().getCicloByTrabajador(idTrabajador);
        if (existente) return existente;

        const ahora = new Date().toISOString();
        const nuevoCiclo: CicloVidaTrabajador = {
          id: `ciclo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          id_trabajador: idTrabajador,
          estado_actual: "nuevo_ingreso",
          historial: [
            {
              id: `hist-${Date.now()}`,
              estado_anterior: null,
              estado_nuevo: "nuevo_ingreso",
              fecha_transicion: ahora,
              ejecutado_por: "sistema",
            },
          ],
          updated_at: ahora,
        };

        // Actualizar estado local inmediatamente (optimista)
        set({ ciclos: [...get().ciclos, nuevoCiclo] });

        // Persistir en Supabase (silencioso si la tabla no existe)
        try {
          const { error } = await supabase
            .from("ciclo_vida_trabajador")
            .insert([nuevoCiclo]);
          if (error && process.env.NODE_ENV === "development") {
            log.warn("No se pudo persistir el ciclo en Supabase", error.message);
          }
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            log.warn("Error de red al inicializar ciclo", err);
          }
        }

        useAuditoriaStore.getState().registrar({
          modulo: "Trabajadores",
          id_entidad: idTrabajador,
          nombre_entidad: idTrabajador,
          accion: "Alta",
          detalle: "Ciclo de vida inicializado en estado nuevo_ingreso",
        });

        return nuevoCiclo;
      },

      validarTransicion: (desde: EstadoCicloVida, hacia: EstadoCicloVida) => {
        return TRANSICIONES_PERMITIDAS.some(
          (t) => t.desde === desde && t.hacia === hacia
        );
      },

      getTransicionesPermitidas: (estadoActual: EstadoCicloVida) => {
        return TRANSICIONES_PERMITIDAS
          .filter((t) => t.desde === estadoActual)
          .map((t) => t.hacia);
      },

      transicionarEstado: async (
        idTrabajador: string,
        estadoNuevo: EstadoCicloVida,
        razon?: string
      ) => {
        // Si no existe ciclo, inicializarlo automáticamente (nuevo_ingreso)
        let ciclo = get().getCicloByTrabajador(idTrabajador);
        if (!ciclo) {
          ciclo = await get().inicializarCiclo(idTrabajador);
        }

        // Validar transición
        if (!get().validarTransicion(ciclo.estado_actual, estadoNuevo)) {
          log.error("Transición no permitida", {
            desde: ciclo.estado_actual,
            hacia: estadoNuevo,
          });
          return false;
        }

        try {
          const nuevoHistorial = [
            ...ciclo.historial,
            {
              id: `hist-${Date.now()}`,
              estado_anterior: ciclo.estado_actual,
              estado_nuevo: estadoNuevo,
              fecha_transicion: new Date().toISOString(),
              razon: razon || "",
              ejecutado_por: "current_user", // TODO: obtener usuario actual
            },
          ];

          const cicloActualizado = {
            ...ciclo,
            estado_actual: estadoNuevo,
            historial: nuevoHistorial,
            updated_at: new Date().toISOString(),
            // Actualizar fechas según estado
            ...(estadoNuevo === "activo" && { fecha_ingreso_efectivo: new Date().toISOString().split("T")[0] }),
            ...(estadoNuevo === "baja" && { fecha_baja: new Date().toISOString().split("T")[0], motivo_baja: razon }),
            ...(estadoNuevo === "archivado" && { fecha_archivado: new Date().toISOString().split("T")[0] }),
          };

          // Guardar en Supabase
          const { error } = await supabase
            .from("ciclo_vida_trabajador")
            .upsert([cicloActualizado], { onConflict: "id" });

          if (error) {
            log.error("Error al guardar ciclo", error);
            return false;
          }

          // Actualizar store
          set({
            ciclos: get().ciclos.map((c) =>
              c.id_trabajador === idTrabajador ? cicloActualizado : c
            ),
          });

          // Registrar auditoría
          useAuditoriaStore.getState().registrar({
            modulo: "Trabajadores",
            id_entidad: idTrabajador,
            nombre_entidad: idTrabajador,
            accion: "Modificacion",
            detalle: `Transición de ciclo de vida a ${estadoNuevo}. ${razon || ""}`.trim(),
          });

          return true;
        } catch (err) {
          log.error("Error al transicionar estado", err);
          return false;
        }
      },

      estaActivo: (idTrabajador: string) => {
        const ciclo = get().getCicloByTrabajador(idTrabajador);
        return ciclo?.estado_actual === "activo";
      },
    }),
    {
      name: "ciclo-vida-store",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
