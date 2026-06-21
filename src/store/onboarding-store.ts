import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { createLogger } from "@/lib/logger";
import { useAuditoriaStore } from "@/store/auditoria-store";
import { useNotificacionesStore } from "@/store/notificaciones-store";

const log = createLogger("onboarding-store");

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type FaseOnboarding =
  | "datos_personales"
  | "laboral"
  | "administracion"
  | "seguridad_control"
  | "equipamiento"
  | "operacion";

export type TipoTarea = "auto" | "manual" | "actividad" | "transaccion";

export interface TareaOnboarding {
  id: string;
  id_trabajador: string;
  fase: FaseOnboarding;
  nombre: string;
  descripcion: string;
  tipo: TipoTarea;
  completada: boolean;
  responsable?: string;
  fecha_limite?: string;
  fecha_completada?: string;
  observaciones?: string;
  created_at: string;
}

export interface ProgressOnboarding {
  id_trabajador: string;
  porcentaje_total: number;
  tareas_total: number;
  tareas_completadas: number;
  fases: Record<FaseOnboarding, FaseProgress>;
}

export interface FaseProgress {
  fase: FaseOnboarding;
  completada: boolean;
  porcentaje: number;
  tareas_total: number;
  tareas_completadas: number;
}

// ─────────────────────────────────────────────────────────────
//  Template de tareas por fase
// ─────────────────────────────────────────────────────────────

const TAREAS_TEMPLATE: Record<FaseOnboarding, Omit<TareaOnboarding, "id" | "id_trabajador" | "fecha_completada" | "created_at">[]> = {
  datos_personales: [
    {
      fase: "datos_personales",
      nombre: "Identificación completa",
      descripcion: "Nombre, RUT/DNI, fecha nacimiento, nacionalidad",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "datos_personales",
      nombre: "Datos de contacto",
      descripcion: "Email corporativo y teléfono personal",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "datos_personales",
      nombre: "Domicilio completo",
      descripcion: "Región, comuna, calle, número",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "datos_personales",
      nombre: "Documentos de identidad",
      descripcion: "Validar vigencia de carnet",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
  ],
  laboral: [
    {
      fase: "laboral",
      nombre: "Asignación a Contrato",
      descripcion: "Seleccionar contrato donde trabajará",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
    {
      fase: "laboral",
      nombre: "Asignación a Unidad y Cargo",
      descripcion: "Definir unidad, cargo y nivel",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
    {
      fase: "laboral",
      nombre: "Modalidad de trabajo",
      descripcion: "Presencial, teletrabajo o híbrido",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
    {
      fase: "laboral",
      nombre: "Centro de costo",
      descripcion: "Asignar centro de costo",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
  ],
  administracion: [
    {
      fase: "administracion",
      nombre: "Datos bancarios",
      descripcion: "Banco, tipo cuenta, número",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "administracion",
      nombre: "Previsión y salud",
      descripcion: "AFP y sistema de salud",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "administracion",
      nombre: "Tallas EPP",
      descripcion: "Chaqueta, polera, calzado",
      tipo: "auto",
      completada: false,
      responsable: "trabajador",
    },
    {
      fase: "administracion",
      nombre: "Foto de identificación",
      descripcion: "Cargar foto para credencial",
      tipo: "manual",
      completada: false,
      responsable: "trabajador",
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ],
  seguridad_control: [
    {
      fase: "seguridad_control",
      nombre: "Examen médico pre-ocupacional",
      descripcion: "Evaluación médica inicial",
      tipo: "actividad",
      completada: false,
      responsable: "prevencion",
      fecha_limite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      fase: "seguridad_control",
      nombre: "Examen psicosensométrico",
      descripcion: "Evaluación psicológica y senso-motora",
      tipo: "actividad",
      completada: false,
      responsable: "prevencion",
      fecha_limite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      fase: "seguridad_control",
      nombre: "Charla de inducción",
      descripcion: "Inducción en políticas y procedimientos",
      tipo: "actividad",
      completada: false,
      responsable: "rrhh",
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      fase: "seguridad_control",
      nombre: "Firma de acuerdos",
      descripcion: "Acuerdos confidencialidad, políticas, etc.",
      tipo: "manual",
      completada: false,
      responsable: "trabajador",
      fecha_limite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ],
  equipamiento: [
    {
      fase: "equipamiento",
      nombre: "Entrega de EPP",
      descripcion: "Chaqueta, polera, calzado seguridad",
      tipo: "transaccion",
      completada: false,
      responsable: "administracion",
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      fase: "equipamiento",
      nombre: "Asignación de Notebook",
      descripcion: "Notebook y accesorios",
      tipo: "transaccion",
      completada: false,
      responsable: "ti",
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      fase: "equipamiento",
      nombre: "Asignación de Vehículo",
      descripcion: "Si aplica según cargo",
      tipo: "transaccion",
      completada: false,
      responsable: "administracion",
    },
    {
      fase: "equipamiento",
      nombre: "Entrega de credenciales",
      descripcion: "Badge, tarjetas de acceso",
      tipo: "transaccion",
      completada: false,
      responsable: "seguridad",
      fecha_limite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ],
  operacion: [
    {
      fase: "operacion",
      nombre: "Registro en Asistencia",
      descripcion: "Habilitar en sistema de asistencia",
      tipo: "auto",
      completada: false,
      responsable: "rrhh",
    },
    {
      fase: "operacion",
      nombre: "Acceso a Solicitudes",
      descripcion: "Permisos en módulo de solicitudes",
      tipo: "auto",
      completada: false,
      responsable: "ti",
    },
    {
      fase: "operacion",
      nombre: "Acceso a Comunicaciones",
      descripcion: "Integración con canales comunicación",
      tipo: "auto",
      completada: false,
      responsable: "administracion",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

interface OnboardingState {
  tareas: TareaOnboarding[];
  loading: boolean;
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;

  // Fetch y CRUD
  fetchTareas: () => Promise<void>;
  createTareasForTrabajador: (idTrabajador: string) => Promise<boolean>;
  getTareasByTrabajador: (idTrabajador: string) => TareaOnboarding[];

  // Actualizar tareas
  completarTarea: (idTarea: string, observaciones?: string) => Promise<boolean>;
  updateTarea: (idTarea: string, updates: Partial<TareaOnboarding>) => Promise<boolean>;

  // Progress
  getProgressByTrabajador: (idTrabajador: string) => ProgressOnboarding;
  getFasesProgress: (idTrabajador: string) => FaseProgress[];
  getTareasByFase: (idTrabajador: string, fase: FaseOnboarding) => TareaOnboarding[];
}

// ─────────────────────────────────────────────────────────────
//  Cache de cómputos derivados
//
//  INVARIANTE CRÍTICA: las dos WeakMaps usan la *referencia* del
//  array `tareas` como llave. La invalidación es automática SOLO
//  si todo mutator del store produce un array nuevo. Ejemplos:
//
//      OK   →  set({ tareas: [...state.tareas, nueva] })
//      OK   →  set({ tareas: state.tareas.map(fn) })
//      BUG  →  set({ tareas: state.tareas })
//                (misma referencia → cache nunca se invalida)
//      BUG  →  state.tareas.push(x); set({ tareas: state.tareas })
//                (mutación in-place → cache stale)
//
//  Si en el futuro se introduce Immer / `produce`, esta
//  invariante se satisface automáticamente. Mientras NO se use
//  Immer, todo `set` que toque `tareas` debe construir una nueva
//  referencia (spread, map, filter, etc.).
//
//  Ver convenciones #2 y #9 en `plan_refactor_tecnico.md`.
// ─────────────────────────────────────────────────────────────

const PROGRESS_CACHE = new WeakMap<
  TareaOnboarding[],
  Map<string, ProgressOnboarding>
>();
const TAREAS_POR_TRABAJADOR_CACHE = new WeakMap<
  TareaOnboarding[],
  Map<string, TareaOnboarding[]>
>();

const FASE_KEYS = Object.keys(TAREAS_TEMPLATE) as FaseOnboarding[];

function indexarTareasPorTrabajador(
  tareas: TareaOnboarding[]
): Map<string, TareaOnboarding[]> {
  const cached = TAREAS_POR_TRABAJADOR_CACHE.get(tareas);
  if (cached) return cached;
  const mapa = new Map<string, TareaOnboarding[]>();
  for (const t of tareas) {
    const lista = mapa.get(t.id_trabajador);
    if (lista) lista.push(t);
    else mapa.set(t.id_trabajador, [t]);
  }
  TAREAS_POR_TRABAJADOR_CACHE.set(tareas, mapa);
  return mapa;
}

function calcularProgreso(
  idTrabajador: string,
  tareasDelTrabajador: TareaOnboarding[]
): ProgressOnboarding {
  const total = tareasDelTrabajador.length;
  let completadas = 0;

  const fases: Record<FaseOnboarding, FaseProgress> = {
    datos_personales: { fase: "datos_personales", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
    laboral: { fase: "laboral", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
    administracion: { fase: "administracion", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
    seguridad_control: { fase: "seguridad_control", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
    equipamiento: { fase: "equipamiento", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
    operacion: { fase: "operacion", completada: false, porcentaje: 0, tareas_total: 0, tareas_completadas: 0 },
  };

  for (const t of tareasDelTrabajador) {
    if (t.completada) completadas++;
    const fp = fases[t.fase];
    if (!fp) continue;
    fp.tareas_total++;
    if (t.completada) fp.tareas_completadas++;
  }

  for (const fase of FASE_KEYS) {
    const fp = fases[fase];
    fp.porcentaje =
      fp.tareas_total > 0
        ? Math.round((fp.tareas_completadas / fp.tareas_total) * 100)
        : 0;
    fp.completada = fp.tareas_total > 0 && fp.tareas_completadas === fp.tareas_total;
  }

  return {
    id_trabajador: idTrabajador,
    porcentaje_total: total > 0 ? Math.round((completadas / total) * 100) : 0,
    tareas_total: total,
    tareas_completadas: completadas,
    fases,
  };
}

function progressMapFor(
  tareas: TareaOnboarding[]
): Map<string, ProgressOnboarding> {
  const cached = PROGRESS_CACHE.get(tareas);
  if (cached) return cached;
  const porTrabajador = indexarTareasPorTrabajador(tareas);
  const mapa = new Map<string, ProgressOnboarding>();
  for (const [id, lista] of porTrabajador) {
    mapa.set(id, calcularProgreso(id, lista));
  }
  PROGRESS_CACHE.set(tareas, mapa);
  return mapa;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      tareas: [],
      loading: false,
      hydrated: false,

      fetchTareas: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("onboarding_checklist")
            .select("*");
          // Idéntico criterio que en `ciclo-vida-store`: una respuesta vacía
          // o con error NO debe pisar las tareas persistidas localmente.
          if (!error && data && data.length > 0) {
            set({ tareas: data as TareaOnboarding[] });
          } else if (error && process.env.NODE_ENV === "development") {
            log.warn("fetchTareas error", error.message);
          }
        } catch (err) {
          log.error("Error fetching tareas", err);
        } finally {
          set({ loading: false });
        }
      },

      createTareasForTrabajador: async (idTrabajador: string) => {
        const tareasExistentes = get().getTareasByTrabajador(idTrabajador);
        if (tareasExistentes.length > 0) {
          log.warn("Trabajador ya tiene tareas de onboarding", { idTrabajador });
          return false;
        }

        // 1. Construccion + persistencia de las tareas (camino critico).
        //    Si esto falla, NO modificamos el store ni hacemos side-effects.
        let nuevasTareas: TareaOnboarding[];
        try {
          const ahora = new Date().toISOString();
          nuevasTareas = [];

          Object.values(TAREAS_TEMPLATE).forEach((tareas) => {
            tareas.forEach((tarea) => {
              nuevasTareas.push({
                ...tarea,
                id: `tarea-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                id_trabajador: idTrabajador,
                created_at: ahora,
              });
            });
          });

          const { error } = await supabase
            .from("onboarding_checklist")
            .insert(nuevasTareas);

          if (error) {
            log.error("Error al crear tareas", error);
            return false;
          }

          set({ tareas: [...get().tareas, ...nuevasTareas] });
        } catch (err) {
          log.error("Error al crear tareas para trabajador", err);
          return false;
        }

        // 2. Side-effects (notificaciones + auditoria). Cada uno se aisla
        //    en su propio try/catch: una falla aqui NO debe revertir las
        //    tareas ya persistidas en (1). Lo importante es que el
        //    onboarding del trabajador exista; las notificaciones y la
        //    auditoria son secundarias.
        try {
          const notifStore = useNotificacionesStore.getState();
          notifStore.addNotification({
            id: `onb-created-${idTrabajador}`,
            titulo: "Checklist de onboarding creado",
            mensaje: `Se generaron ${nuevasTareas.length} tareas para el trabajador ${idTrabajador}`,
            nivel: "info",
          });
        } catch (err) {
          log.warn("No se pudo emitir notificacion de checklist creado", err);
        }

        try {
          const notifStore = useNotificacionesStore.getState();
          nuevasTareas.forEach((t) => {
            if (!t.fecha_limite) return;
            // Programar recordatorio a las 09:00 del dia de vencimiento.
            const at = new Date(`${t.fecha_limite}T09:00:00`);
            notifStore.scheduleReminder(
              {
                id: `rem-${t.id}`,
                titulo: `Tarea próxima a vencer: ${t.nombre}`,
                mensaje: `La tarea '${t.nombre}' vence el ${t.fecha_limite}`,
                nivel: "advertencia",
                meta: { tareaId: t.id, id_trabajador: idTrabajador },
              },
              at.toISOString()
            );
          });
        } catch (err) {
          log.warn("No se pudieron programar recordatorios de onboarding", err);
        }

        try {
          useAuditoriaStore.getState().registrar({
            modulo: "Trabajadores",
            id_entidad: idTrabajador,
            nombre_entidad: idTrabajador,
            accion: "Alta",
            detalle: `Creación de checklist onboarding: ${nuevasTareas.length} tareas creadas`,
          });
        } catch (err) {
          log.warn("No se pudo registrar auditoria de checklist creado", err);
        }

        return true;
      },

      getTareasByTrabajador: (idTrabajador: string) => {
        return indexarTareasPorTrabajador(get().tareas).get(idTrabajador) ?? [];
      },

      completarTarea: async (idTarea: string, observaciones?: string) => {
        const tarea = get().tareas.find((t) => t.id === idTarea);
        if (!tarea) return false;

        try {
          const tareaActualizada = {
            ...tarea,
            completada: true,
            fecha_completada: new Date().toISOString(),
            observaciones: observaciones || tarea.observaciones,
          };

          const { error } = await supabase
            .from("onboarding_checklist")
            .update(tareaActualizada)
            .eq("id", idTarea);

          if (error) {
            log.error("Error al actualizar tarea", error);
            return false;
          }

          set({
            tareas: get().tareas.map((t) =>
              t.id === idTarea ? tareaActualizada : t
            ),
          });

          useAuditoriaStore.getState().registrar({
            modulo: "Trabajadores",
            id_entidad: tarea.id_trabajador,
            nombre_entidad: tarea.id_trabajador,
            accion: "Modificacion",
            detalle: `Tarea de onboarding completada: ${tarea.nombre}`,
          });

          return true;
        } catch (err) {
          log.error("Error al completar tarea", err);
          return false;
        }
      },

      updateTarea: async (idTarea: string, updates: Partial<TareaOnboarding>) => {
        try {
          const { error } = await supabase
            .from("onboarding_checklist")
            .update(updates)
            .eq("id", idTarea);

          if (error) {
            log.error("Error al actualizar tarea", error);
            return false;
          }

          set({
            tareas: get().tareas.map((t) =>
              t.id === idTarea ? { ...t, ...updates } : t
            ),
          });

          return true;
        } catch (err) {
          log.error("Error al actualizar tarea", err);
          return false;
        }
      },

      getProgressByTrabajador: (idTrabajador: string) => {
        const mapa = progressMapFor(get().tareas);
        const cacheado = mapa.get(idTrabajador);
        if (cacheado) return cacheado;
        // Trabajador sin tareas todavía: devolver estructura vacía consistente.
        return calcularProgreso(idTrabajador, []);
      },

      getFasesProgress: (idTrabajador: string) => {
        return Object.values(get().getProgressByTrabajador(idTrabajador).fases);
      },

      getTareasByFase: (idTrabajador: string, fase: FaseOnboarding) => {
        const tareasDelTrabajador =
          indexarTareasPorTrabajador(get().tareas).get(idTrabajador) ?? [];
        // Importante: NO ordenar in-place el array cacheado.
        return tareasDelTrabajador
          .filter((t) => t.fase === fase)
          .sort((a, b) => {
            // Primero incompletas, luego completas
            if (a.completada !== b.completada) {
              return a.completada ? 1 : -1;
            }
            return 0;
          });
      },
    }),
    {
      name: "onboarding-store",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
