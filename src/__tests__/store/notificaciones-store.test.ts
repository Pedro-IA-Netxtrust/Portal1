import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificacionesStore } from "@/store/notificaciones-store";

beforeEach(() => {
  vi.useFakeTimers();
  useNotificacionesStore.setState({
    notificaciones: [],
    recordatorios: [],
    timers: {},
    hydrated: true,
  });
});

afterEach(() => {
  useNotificacionesStore.getState().clear();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("notificaciones-store", () => {
  it("addNotification hace upsert idempotente por id preservando read", () => {
    const id = useNotificacionesStore.getState().addNotification({
      id: "n-1",
      titulo: "A",
      mensaje: "x",
    });

    useNotificacionesStore.getState().markRead(id);

    useNotificacionesStore.getState().addNotification({
      id: "n-1",
      titulo: "A2",
      mensaje: "y",
    });

    const notis = useNotificacionesStore.getState().notificaciones;
    expect(notis).toHaveLength(1);
    expect(notis[0].id).toBe("n-1");
    expect(notis[0].titulo).toBe("A2");
    expect(notis[0].read).toBe(true);
  });

  it("scheduleReminder con fecha pasada dispara inmediato", () => {
    const id = useNotificacionesStore.getState().scheduleReminder(
      { id: "r-1", titulo: "Recordatorio vencido" },
      new Date(Date.now() - 1000).toISOString()
    );
    expect(id).toBe("r-1");
    expect(useNotificacionesStore.getState().notificaciones.some((n) => n.id === "r-1")).toBe(true);
  });

  it("scheduleReminder + cancelReminder elimina recordatorio", () => {
    const id = useNotificacionesStore.getState().scheduleReminder(
      { id: "r-2", titulo: "Recordatorio futuro" },
      new Date(Date.now() + 60_000).toISOString()
    );

    expect(id).toBe("r-2");
    expect(useNotificacionesStore.getState().recordatorios.some((r) => r.id === "r-2")).toBe(true);

    useNotificacionesStore.getState().cancelReminder("r-2");
    expect(useNotificacionesStore.getState().recordatorios.some((r) => r.id === "r-2")).toBe(false);
  });

  it("rehydrateTimers dispara los vencidos offline y limpia recordatorio", () => {
    useNotificacionesStore.setState({
      notificaciones: [],
      recordatorios: [
        {
          id: "r-3",
          at: new Date(Date.now() - 5000).toISOString(),
          notificacion: { id: "r-3", titulo: "Offline vencido" },
        },
      ],
      timers: {},
      hydrated: true,
    });

    useNotificacionesStore.getState().rehydrateTimers();

    const state = useNotificacionesStore.getState();
    expect(state.notificaciones.some((n) => n.id === "r-3")).toBe(true);
    expect(state.recordatorios.some((r) => r.id === "r-3")).toBe(false);
  });
});
