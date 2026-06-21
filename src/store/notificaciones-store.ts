import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NivelNotificacion = "info" | "advertencia" | "critica" | "exito";

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje?: string;
  nivel?: NivelNotificacion;
  fecha?: string; // ISO
  read?: boolean;
  meta?: Record<string, unknown>;
}

interface RecordatorioPersistido {
  id: string;
  at: string; // ISO con la fecha objetivo
  notificacion: Notificacion;
}

interface NotificacionesState {
  notificaciones: Notificacion[];
  /** Recordatorios programados a futuro (persistidos). Los timers en sí son
   *  runtime-only y se reprograman al rehidratar. */
  recordatorios: RecordatorioPersistido[];
  /** Map de id de recordatorio → handle de setTimeout. NO persistido. */
  timers: Record<string, ReturnType<typeof setTimeout>>;

  addNotification: (n: Notificacion) => string;
  removeNotification: (id: string) => void;
  markRead: (id: string) => void;
  clear: () => void;

  scheduleReminder: (n: Notificacion, at: string) => string | null;
  cancelReminder: (recordatorioId: string) => void;

  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;

  /** Reprograma timers en memoria a partir de los recordatorios persistidos.
   *  Idempotente; debe llamarse una vez del lado cliente tras rehidratación. */
  rehydrateTimers: () => void;
}

const isBrowser = typeof window !== "undefined";

export const useNotificacionesStore = create<NotificacionesState>()(
  persist(
    (set, get) => ({
      notificaciones: [],
      recordatorios: [],
      timers: {},
      hydrated: false,

      addNotification: (n) => {
        const id = n.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        set((s) => {
          const existente = s.notificaciones.find((x) => x.id === id);
          if (existente) {
            // Upsert: refresca contenido pero preserva el estado read del usuario
            return {
              notificaciones: s.notificaciones.map((x) =>
                x.id === id
                  ? {
                      ...x,
                      ...n,
                      id,
                      read: existente.read,
                      fecha: existente.fecha,
                    }
                  : x
              ),
            };
          }
          const noti: Notificacion = {
            ...n,
            id,
            read: false,
            fecha: n.fecha || new Date().toISOString(),
          };
          return { notificaciones: [noti, ...s.notificaciones] };
        });
        return id;
      },

      removeNotification: (id) => {
        set((s) => ({ notificaciones: s.notificaciones.filter((x) => x.id !== id) }));
      },

      markRead: (id) => {
        set((s) => ({
          notificaciones: s.notificaciones.map((x) => (x.id === id ? { ...x, read: true } : x)),
        }));
      },

      clear: () => set({ notificaciones: [] }),

      scheduleReminder: (n, at) => {
        const when = new Date(at).getTime();
        if (Number.isNaN(when)) return null;

        const id =
          n.id || `rem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const delay = when - Date.now();

        // Si ya pasó la fecha objetivo, dispara la notificación de inmediato.
        if (delay <= 0) {
          get().addNotification({ ...n, id });
          return id;
        }

        // Persistir el recordatorio (reemplaza si ya existía con mismo id)
        set((s) => ({
          recordatorios: [
            ...s.recordatorios.filter((r) => r.id !== id),
            { id, at, notificacion: { ...n, id } },
          ],
        }));

        // Solo registrar el timer si estamos en navegador.
        if (isBrowser) {
          // Cancelar timer previo con mismo id si existía
          const previo = get().timers[id];
          if (previo) clearTimeout(previo);

          const handle = setTimeout(() => {
            get().addNotification({ ...n, id, fecha: new Date().toISOString() });
            set((s) => {
              const { [id]: _omit, ...resto } = s.timers;
              void _omit;
              return {
                timers: resto,
                recordatorios: s.recordatorios.filter((r) => r.id !== id),
              };
            });
          }, delay);

          set((s) => ({ timers: { ...s.timers, [id]: handle } }));
        }

        return id;
      },

      cancelReminder: (recordatorioId) => {
        const handle = get().timers[recordatorioId];
        if (handle) clearTimeout(handle);
        set((s) => {
          const { [recordatorioId]: _omit, ...resto } = s.timers;
          void _omit;
          return {
            timers: resto,
            recordatorios: s.recordatorios.filter((r) => r.id !== recordatorioId),
          };
        });
      },

      rehydrateTimers: () => {
        if (!isBrowser) return;
        const { recordatorios, timers, scheduleReminder, addNotification } = get();

        recordatorios.forEach((r) => {
          // Si ya hay un timer activo para este id, no duplicarlo.
          if (timers[r.id]) return;

          const delay = new Date(r.at).getTime() - Date.now();
          if (Number.isNaN(delay)) return;

          if (delay <= 0) {
            // Recordatorio vencido durante el periodo offline: disparar ya.
            addNotification({ ...r.notificacion, id: r.id });
            set((s) => ({
              recordatorios: s.recordatorios.filter((x) => x.id !== r.id),
            }));
            return;
          }

          scheduleReminder(r.notificacion, r.at);
        });
      },
    }),
    {
      name: "notificaciones-store",
      version: 1,
      storage: createJSONStorage(() =>
        isBrowser
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      // No persistimos `timers` (handles de setTimeout no son serializables).
      partialize: (state) => ({
        notificaciones: state.notificaciones,
        recordatorios: state.recordatorios,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
        // Reprograma los recordatorios en el siguiente tick del cliente.
        if (state && isBrowser) {
          setTimeout(() => state.rehydrateTimers(), 0);
        }
      },
    }
  )
);
