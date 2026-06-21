import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn();
const insertMock = vi.fn();
const selectMock = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: selectMock,
      insert: insertMock,
      upsert: upsertMock,
    }),
  },
}));

const registrarMock = vi.fn();

vi.mock("@/store/auditoria-store", () => ({
  useAuditoriaStore: {
    getState: () => ({ registrar: registrarMock }),
  },
}));

import { useCicloVidaStore } from "@/store/ciclo-vida-store";

beforeEach(() => {
  vi.clearAllMocks();
  useCicloVidaStore.setState({
    ciclos: [],
    loading: false,
    hydrated: true,
    lastFetchAt: null,
  });

  selectMock.mockResolvedValue({ data: [], error: null });
  insertMock.mockResolvedValue({ error: null });
  upsertMock.mockResolvedValue({ error: null });
});

describe("ciclo-vida-store", () => {
  it("inicializarCiclo es idempotente para el mismo trabajador", async () => {
    const s = useCicloVidaStore.getState();
    const a = await s.inicializarCiclo("t-1");
    const b = await useCicloVidaStore.getState().inicializarCiclo("t-1");

    expect(a.id).toBe(b.id);
    expect(useCicloVidaStore.getState().ciclos).toHaveLength(1);
  });

  it("bloquea transición inválida", async () => {
    await useCicloVidaStore.getState().inicializarCiclo("t-1");
    const ok = await useCicloVidaStore.getState().transicionarEstado("t-1", "archivado");
    expect(ok).toBe(false);
  });

  it("permite transición válida y marca activo", async () => {
    await useCicloVidaStore.getState().inicializarCiclo("t-1");
    let ok = await useCicloVidaStore.getState().transicionarEstado("t-1", "pre_incorporacion");
    expect(ok).toBe(true);

    ok = await useCicloVidaStore.getState().transicionarEstado("t-1", "activo");
    expect(ok).toBe(true);
    expect(useCicloVidaStore.getState().estaActivo("t-1")).toBe(true);
  });

  it("fetchCiclos aplica TTL de 5 minutos y evita refetch inmediato", async () => {
    selectMock.mockResolvedValueOnce({
      data: [
        {
          id: "c1",
          id_trabajador: "t-1",
          estado_actual: "activo",
          historial: [],
          updated_at: new Date().toISOString(),
        },
      ],
      error: null,
    });

    await useCicloVidaStore.getState().fetchCiclos();
    expect(selectMock).toHaveBeenCalledTimes(1);

    await useCicloVidaStore.getState().fetchCiclos();
    expect(selectMock).toHaveBeenCalledTimes(1);
  });
});
