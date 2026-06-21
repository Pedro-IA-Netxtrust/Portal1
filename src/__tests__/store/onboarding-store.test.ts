import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetSink, setSink } from "@/lib/logger";

const mocks = vi.hoisted(() => ({
  insertError: null as { message: string } | null,
  addNotification: vi.fn(() => undefined),
  scheduleReminder: vi.fn(() => undefined),
  registrarAuditoria: vi.fn(() => undefined),
}));

// Mock de las dependencias externas (Supabase, otras stores) ANTES de
// importar el store. El cache no necesita ninguna de ellas para los
// caminos que probamos (getProgress, getTareasByTrabajador).
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ error: mocks.insertError }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  },
}));

vi.mock("@/store/auditoria-store", () => ({
  useAuditoriaStore: {
    getState: () => ({ registrar: mocks.registrarAuditoria }),
  },
}));

vi.mock("@/store/notificaciones-store", () => ({
  useNotificacionesStore: {
    getState: () => ({
      addNotification: mocks.addNotification,
      scheduleReminder: mocks.scheduleReminder,
    }),
  },
}));

import {
  useOnboardingStore,
  type FaseOnboarding,
  type TareaOnboarding,
} from "@/store/onboarding-store";

let counter = 0;
function tarea(
  idTrabajador: string,
  fase: FaseOnboarding,
  completada = false
): TareaOnboarding {
  counter++;
  return {
    id: `task-${counter}`,
    id_trabajador: idTrabajador,
    fase,
    nombre: `Tarea ${counter}`,
    descripcion: "",
    tipo: "manual",
    completada,
    created_at: "2026-06-14T00:00:00Z",
  };
}

beforeEach(() => {
  counter = 0;
  mocks.insertError = null;
  mocks.addNotification.mockReset();
  mocks.addNotification.mockImplementation(() => undefined);
  mocks.scheduleReminder.mockReset();
  mocks.scheduleReminder.mockImplementation(() => undefined);
  mocks.registrarAuditoria.mockReset();
  mocks.registrarAuditoria.mockImplementation(() => undefined);
  resetSink();
  // Reset del store entre tests para evitar cross-contamination.
  useOnboardingStore.setState({ tareas: [], loading: false });
});

afterEach(() => {
  useOnboardingStore.setState({ tareas: [], loading: false });
});

describe("onboarding-store / getProgressByTrabajador", () => {
  it("retorna 0% cuando el trabajador no tiene tareas", () => {
    const p = useOnboardingStore.getState().getProgressByTrabajador("ghost");
    expect(p.tareas_total).toBe(0);
    expect(p.tareas_completadas).toBe(0);
    expect(p.porcentaje_total).toBe(0);
  });

  it("calcula 100% cuando todas estan completadas", () => {
    useOnboardingStore.setState({
      tareas: [
        tarea("t-1", "datos_personales", true),
        tarea("t-1", "laboral", true),
      ],
    });
    const p = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(p.porcentaje_total).toBe(100);
    expect(p.tareas_total).toBe(2);
    expect(p.tareas_completadas).toBe(2);
  });

  it("calcula 50% con mezcla de completadas e incompletas", () => {
    useOnboardingStore.setState({
      tareas: [
        tarea("t-1", "datos_personales", true),
        tarea("t-1", "laboral", false),
      ],
    });
    const p = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(p.porcentaje_total).toBe(50);
  });

  it("expone porcentaje por fase", () => {
    useOnboardingStore.setState({
      tareas: [
        tarea("t-1", "datos_personales", true),
        tarea("t-1", "datos_personales", false),
        tarea("t-1", "laboral", true),
      ],
    });
    const p = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(p.fases.datos_personales.porcentaje).toBe(50);
    expect(p.fases.laboral.porcentaje).toBe(100);
  });
});

describe("onboarding-store / cache memoization", () => {
  it("retorna la MISMA referencia de progreso entre llamadas si las tareas no cambian", () => {
    useOnboardingStore.setState({
      tareas: [tarea("t-1", "datos_personales", true)],
    });
    const a = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    const b = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    // Mismo array de tareas => misma instancia cacheada
    expect(a).toBe(b);
  });

  it("invalida el cache cuando se reemplaza tareas con un nuevo array", () => {
    useOnboardingStore.setState({
      tareas: [tarea("t-1", "datos_personales", false)],
    });
    const antes = useOnboardingStore.getState().getProgressByTrabajador("t-1");

    useOnboardingStore.setState({
      tareas: [tarea("t-1", "datos_personales", true)],
    });
    const despues = useOnboardingStore.getState().getProgressByTrabajador("t-1");

    // Distintas referencias por ser arrays distintos => calculo nuevo.
    expect(despues).not.toBe(antes);
    expect(antes.porcentaje_total).toBe(0);
    expect(despues.porcentaje_total).toBe(100);
  });

  it("trabajadores distintos no comparten cache", () => {
    useOnboardingStore.setState({
      tareas: [
        tarea("t-1", "datos_personales", true),
        tarea("t-2", "laboral", false),
      ],
    });
    const p1 = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    const p2 = useOnboardingStore.getState().getProgressByTrabajador("t-2");
    expect(p1.porcentaje_total).toBe(100);
    expect(p2.porcentaje_total).toBe(0);
    expect(p1).not.toBe(p2);
  });

  it("getTareasByTrabajador tambien memoiza por referencia de array", () => {
    useOnboardingStore.setState({
      tareas: [
        tarea("t-1", "datos_personales", true),
        tarea("t-1", "laboral", false),
      ],
    });
    const a = useOnboardingStore.getState().getTareasByTrabajador("t-1");
    const b = useOnboardingStore.getState().getTareasByTrabajador("t-1");
    expect(a).toBe(b);
    expect(a).toHaveLength(2);
  });
});

describe("onboarding-store / invariante de identidad de array (regresion)", () => {
  /**
   * INVARIANTE CRITICA del store: los WeakMaps usan la referencia del array
   * `tareas` como llave. Cualquier mutador que reuse la misma referencia
   * deja el cache stale silenciosamente.
   *
   * Estos tests describen el contrato esperado y, ademas, demuestran el
   * BUG que ocurriria si alguien mutara in-place. Sirven como regresion
   * para que esa documentacion no se quede solo en comentario.
   */
  it("mutar in-place y reusar la misma referencia produce cache stale (anti-patron documentado)", () => {
    const tareasOriginal = [tarea("t-1", "datos_personales", false)];
    useOnboardingStore.setState({ tareas: tareasOriginal });

    const antes = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(antes.porcentaje_total).toBe(0);

    // Anti-patron: mutar el item in-place y reasignar la MISMA referencia.
    tareasOriginal[0].completada = true;
    useOnboardingStore.setState({ tareas: tareasOriginal });

    const despues = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    // El cache devuelve el valor stale porque la llave del WeakMap no cambio.
    expect(despues.porcentaje_total).toBe(0);
    expect(despues).toBe(antes);
  });

  it("crear un nuevo array (spread) invalida el cache correctamente", () => {
    const tareasOriginal = [tarea("t-1", "datos_personales", false)];
    useOnboardingStore.setState({ tareas: tareasOriginal });
    const antes = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(antes.porcentaje_total).toBe(0);

    // Patron correcto: nuevo array con item actualizado.
    useOnboardingStore.setState({
      tareas: tareasOriginal.map((t) => ({ ...t, completada: true })),
    });

    const despues = useOnboardingStore.getState().getProgressByTrabajador("t-1");
    expect(despues.porcentaje_total).toBe(100);
    expect(despues).not.toBe(antes);
  });
});

describe("onboarding-store / createTareasForTrabajador", () => {
  it("retorna false y no modifica el store si Supabase insert falla", async () => {
    mocks.insertError = { message: "insert failed" };
    useOnboardingStore.setState({ tareas: [] });

    const ok = await useOnboardingStore
      .getState()
      .createTareasForTrabajador("t-new");

    expect(ok).toBe(false);
    expect(useOnboardingStore.getState().tareas).toHaveLength(0);
    expect(mocks.addNotification).not.toHaveBeenCalled();
  });

  it("retorna true aunque addNotification falle (side-effect aislado)", async () => {
    mocks.addNotification.mockImplementation(() => {
      throw new Error("notification down");
    });
    const warns: string[] = [];
    setSink((level, _scope, msg) => {
      if (level === "warn") warns.push(msg);
    });

    const ok = await useOnboardingStore
      .getState()
      .createTareasForTrabajador("t-new");

    expect(ok).toBe(true);
    expect(useOnboardingStore.getState().getTareasByTrabajador("t-new").length).toBeGreaterThan(0);
    expect(warns.some((m) => m.includes("notificacion"))).toBe(true);
  });

  it("retorna false si el trabajador ya tiene tareas", async () => {
    useOnboardingStore.setState({
      tareas: [tarea("t-existing", "datos_personales", false)],
    });

    const ok = await useOnboardingStore
      .getState()
      .createTareasForTrabajador("t-existing");

    expect(ok).toBe(false);
    expect(useOnboardingStore.getState().tareas).toHaveLength(1);
  });
});
