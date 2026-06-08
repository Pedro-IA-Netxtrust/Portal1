import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoAsistencia = "P" | "T" | "V" | "L" | "D" | "C" | "Per";

export const ESTADO_CONFIG: Record<
  EstadoAsistencia,
  { label: string; shortLabel: string; bg: string; ring: string; text: string; contabiliza: boolean }
> = {
  P:   { label: "Presente",      shortLabel: "P",  bg: "bg-emerald-500",  ring: "ring-emerald-400/40", text: "text-white", contabiliza: true  },
  T:   { label: "Teletrabajo",   shortLabel: "T",  bg: "bg-purple-500",   ring: "ring-purple-400/40",  text: "text-white", contabiliza: true  },
  V:   { label: "Vacaciones",    shortLabel: "V",  bg: "bg-amber-500",    ring: "ring-amber-400/40",   text: "text-white", contabiliza: false },
  L:   { label: "Lic. Médica",   shortLabel: "L",  bg: "bg-red-500",      ring: "ring-red-400/40",     text: "text-white", contabiliza: false },
  D:   { label: "Día Libre",     shortLabel: "D",  bg: "bg-zinc-500",     ring: "ring-zinc-400/40",    text: "text-white", contabiliza: false },
  C:   { label: "Comisión",      shortLabel: "C",  bg: "bg-cyan-500",     ring: "ring-cyan-400/40",    text: "text-white", contabiliza: true  },
  Per: { label: "Permiso",       shortLabel: "Pr", bg: "bg-blue-500",     ring: "ring-blue-400/40",    text: "text-white", contabiliza: false },
};

/** Orden de rotación al hacer clic en una celda */
export const ESTADOS_CYCLE: (EstadoAsistencia | null)[] = ["P", "T", "V", "L", "D", "C", "Per", null];

export interface RegistroAsistencia {
  id: string;
  id_contrato: string;
  id_trabajador: string;
  id_asignacion: string;
  fecha: string;           // "YYYY-MM-DD"
  estado: EstadoAsistencia;
  observacion?: string;
  editado_por: string;
  editado_at: string;
}

export interface AuditoriaEntry {
  id: string;
  id_contrato: string;
  id_trabajador: string;
  nombre_trabajador: string;
  fecha_asistencia: string;
  estado_anterior: EstadoAsistencia | null;
  estado_nuevo: EstadoAsistencia | null;
  editado_por: string;
  editado_at: string;
}

export interface MetaFTE {
  id_contrato: string;
  meta_fte: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Mock data generation
// ─────────────────────────────────────────────────────────────────────────────

type WorkerRef = { id: string; asig: string };

const CONTRACT_WORKERS: Record<string, WorkerRef[]> = {
  "c-1": [
    { id: "t-1", asig: "as-1" },
    { id: "t-2", asig: "as-2" },
    { id: "t-3", asig: "as-3" },
    { id: "t-4", asig: "as-4" },
    { id: "t-5", asig: "as-5" },
  ],
  "c-2": [
    { id: "t-7",  asig: "as-10" },
    { id: "t-8",  asig: "as-11" },
    { id: "t-9",  asig: "as-12" },
  ],
  "c-3": [
    { id: "t-10", asig: "as-20" },
    { id: "t-11", asig: "as-21" },
    { id: "t-12", asig: "as-22" },
    { id: "t-13", asig: "as-23" },
    { id: "t-14", asig: "as-24" },
    { id: "t-15", asig: "as-25" },
    { id: "t-3",  asig: "as-26" },
  ],
};

const INITIAL_METAS: MetaFTE[] = [
  { id_contrato: "c-1", meta_fte: 5.0 },
  { id_contrato: "c-2", meta_fte: 3.0 },
  { id_contrato: "c-3", meta_fte: 7.0 },
];

function isWeekendStr(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pickEstado(seed: number): EstadoAsistencia {
  const r = seededRandom(seed);
  if (r < 0.58) return "P";
  if (r < 0.76) return "T";
  if (r < 0.83) return "V";
  if (r < 0.88) return "L";
  if (r < 0.92) return "D";
  if (r < 0.96) return "C";
  return "Per";
}

type ExplicitRecord = [string, string, string, string, EstadoAsistencia];

const JUNE_RECORDS: ExplicitRecord[] = [
  // June 1 (Monday)
  ["c-1","t-1","as-1","2026-06-01","P"], ["c-1","t-2","as-2","2026-06-01","T"],
  ["c-1","t-3","as-3","2026-06-01","P"], ["c-1","t-4","as-4","2026-06-01","P"],
  ["c-1","t-5","as-5","2026-06-01","P"],
  ["c-2","t-7","as-10","2026-06-01","P"], ["c-2","t-8","as-11","2026-06-01","P"],
  ["c-2","t-9","as-12","2026-06-01","C"],
  ["c-3","t-10","as-20","2026-06-01","P"], ["c-3","t-11","as-21","2026-06-01","P"],
  ["c-3","t-12","as-22","2026-06-01","P"], ["c-3","t-13","as-23","2026-06-01","P"],
  ["c-3","t-14","as-24","2026-06-01","T"], ["c-3","t-15","as-25","2026-06-01","P"],
  ["c-3","t-3", "as-26","2026-06-01","P"],

  // June 2 (Tuesday)
  ["c-1","t-1","as-1","2026-06-02","P"], ["c-1","t-2","as-2","2026-06-02","P"],
  ["c-1","t-3","as-3","2026-06-02","T"], ["c-1","t-4","as-4","2026-06-02","V"],
  ["c-1","t-5","as-5","2026-06-02","P"],
  ["c-2","t-7","as-10","2026-06-02","P"], ["c-2","t-8","as-11","2026-06-02","T"],
  ["c-2","t-9","as-12","2026-06-02","P"],
  ["c-3","t-10","as-20","2026-06-02","P"], ["c-3","t-11","as-21","2026-06-02","V"],
  ["c-3","t-12","as-22","2026-06-02","P"], ["c-3","t-13","as-23","2026-06-02","P"],
  ["c-3","t-14","as-24","2026-06-02","P"], ["c-3","t-15","as-25","2026-06-02","T"],
  ["c-3","t-3", "as-26","2026-06-02","P"],

  // June 3 (Wednesday — today, partially entered)
  ["c-1","t-1","as-1","2026-06-03","P"], ["c-1","t-2","as-2","2026-06-03","P"],
  ["c-1","t-3","as-3","2026-06-03","P"], ["c-1","t-4","as-4","2026-06-03","V"],
  ["c-1","t-5","as-5","2026-06-03","L"],
  ["c-2","t-7","as-10","2026-06-03","Per"], ["c-2","t-8","as-11","2026-06-03","P"],
  ["c-2","t-9","as-12","2026-06-03","P"],
  ["c-3","t-10","as-20","2026-06-03","P"], ["c-3","t-11","as-21","2026-06-03","V"],
  ["c-3","t-12","as-22","2026-06-03","D"], ["c-3","t-13","as-23","2026-06-03","L"],
  ["c-3","t-14","as-24","2026-06-03","P"], ["c-3","t-15","as-25","2026-06-03","P"],
  ["c-3","t-3", "as-26","2026-06-03","P"],
];

function generateMockRegistros(): RegistroAsistencia[] {
  const records: RegistroAsistencia[] = [];
  const now = new Date().toISOString();

  // ── May 2026 (seeded) ──────────────────────────────────────────────────────
  for (const [id_contrato, workers] of Object.entries(CONTRACT_WORKERS)) {
    const cNum = parseInt(id_contrato.replace(/\D/g, "")) || 1;
    for (let day = 1; day <= 31; day++) {
      const fecha = `2026-05-${String(day).padStart(2, "0")}`;
      try { if (isNaN(new Date(fecha + "T12:00:00").getTime())) continue; }
      catch { continue; }
      if (isWeekendStr(fecha)) continue;

      workers.forEach((w, wi) => {
        const seed = cNum * 1000 + wi * 100 + day;
        records.push({
          id: `r-${id_contrato}-${w.id}-${fecha}`,
          id_contrato,
          id_trabajador: w.id,
          id_asignacion: w.asig,
          fecha,
          estado: pickEstado(seed),
          editado_por: "Sistema (Demo)",
          editado_at: now,
        });
      });
    }
  }

  // ── June 2026 (explicit) ──────────────────────────────────────────────────
  for (const [id_contrato, id_trabajador, id_asignacion, fecha, estado] of JUNE_RECORDS) {
    records.push({
      id: `r-${id_contrato}-${id_trabajador}-${fecha}`,
      id_contrato,
      id_trabajador,
      id_asignacion,
      fecha,
      estado,
      editado_por: "Sistema (Demo)",
      editado_at: now,
    });
  }

  return records;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Store interface & implementation
// ─────────────────────────────────────────────────────────────────────────────

interface AsistenciaState {
  registros: RegistroAsistencia[];
  auditoria: AuditoriaEntry[];
  metas: MetaFTE[];

  fetchAsistencia: () => Promise<void>;
  fetchMetasFTE: () => Promise<void>;

  /** Upsert / remove a daily attendance record and add an audit entry */
  setEstado: (params: {
    id_contrato: string;
    id_trabajador: string;
    id_asignacion: string;
    nombre_trabajador: string;
    fecha: string;
    estado: EstadoAsistencia | null;
    observacion?: string;
  }) => Promise<void>;

  getEstado: (id_contrato: string, id_trabajador: string, fecha: string) => EstadoAsistencia | null;
  getMetaFTE: (id_contrato: string) => number;
  setMetaFTE: (id_contrato: string, meta: number) => Promise<void>;

  /** Total working days (Mon–Fri) in a given month */
  calcularDiasHabiles: (anio: number, mes: number) => number;

  /** FTE real = Σ(días contabilizados) / diasHabiles */
  calcularFTEReal: (id_contrato: string, anio: number, mes: number, diasHabiles: number) => number;
}

export const useAsistenciaStore = create<AsistenciaState>()(
  persist(
    (set, get) => ({
      registros: generateMockRegistros(),
      auditoria: [],
      metas: INITIAL_METAS,

      fetchAsistencia: async () => {
        try {
          const { data, error } = await supabase
            .from("registros_asistencia")
            .select("*");

          if (error) throw new Error(error.message);

          if (data && data.length > 0) {
            const mapped = data.map((r) => ({
              id: r.id,
              id_contrato: r.id_contrato,
              id_trabajador: r.id_trabajador,
              id_asignacion: r.id_asignacion,
              fecha: r.fecha,
              estado: r.estado as EstadoAsistencia,
              observacion: r.observacion ?? undefined,
              editado_por: r.editado_por,
              editado_at: r.editado_at,
            }));
            set({ registros: mapped });
          } else if (process.env.NODE_ENV !== "production") {
            const mockData = generateMockRegistros();
            const seedData = mockData.map((r) => ({
              id_contrato: r.id_contrato,
              id_trabajador: r.id_trabajador,
              id_asignacion: r.id_asignacion,
              fecha: r.fecha,
              estado: r.estado,
              observacion: r.observacion ?? null,
              editado_por: r.editado_por,
              editado_at: r.editado_at,
            }));

            const { data: seeded, error: seedError } = await supabase
              .from("registros_asistencia")
              .insert(seedData)
              .select();

            if (seedError) throw new Error(seedError.message);
            if (seeded) {
              const mapped = seeded.map((r) => ({
                id: r.id,
                id_contrato: r.id_contrato,
                id_trabajador: r.id_trabajador,
                id_asignacion: r.id_asignacion,
                fecha: r.fecha,
                estado: r.estado as EstadoAsistencia,
                observacion: r.observacion ?? undefined,
                editado_por: r.editado_por,
                editado_at: r.editado_at,
              }));
              set({ registros: mapped });
            }
          }
        } catch (err) {
          console.error("Failed to load assistance from Supabase:", err instanceof Error ? err.message : err);
        }
      },

      fetchMetasFTE: async () => {
        try {
          const { data, error } = await supabase
            .from("metas_fte")
            .select("*");

          if (error) throw new Error(error.message);

          if (data && data.length > 0) {
            const mapped = data.map((m) => ({
              id_contrato: m.id_contrato,
              meta_fte: Number(m.meta_fte),
            }));
            set({ metas: mapped });
          } else if (process.env.NODE_ENV !== "production") {
            const seedData = INITIAL_METAS.map((m) => ({
              id_contrato: m.id_contrato,
              meta_fte: m.meta_fte,
            }));

            const { data: seeded, error: seedError } = await supabase
              .from("metas_fte")
              .insert(seedData)
              .select();

            if (seedError) throw new Error(seedError.message);
            if (seeded) {
              const mapped = seeded.map((m) => ({
                id_contrato: m.id_contrato,
                meta_fte: Number(m.meta_fte),
              }));
              set({ metas: mapped });
            }
          }
        } catch (err) {
          console.error("Failed to load metas_fte from Supabase:", err instanceof Error ? err.message : err);
        }
      },

      setEstado: async ({ id_contrato, id_trabajador, id_asignacion, nombre_trabajador, fecha, estado, observacion }) => {
        const existing = get().registros.find(
          (r) => r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
        );
        const estadoAnterior = existing?.estado ?? null;
        const now = new Date().toISOString();
        const audEntry: AuditoriaEntry = {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          id_contrato,
          id_trabajador,
          nombre_trabajador,
          fecha_asistencia: fecha,
          estado_anterior: estadoAnterior,
          estado_nuevo: estado,
          editado_por: "Operador General",
          editado_at: now,
        };

        // Optimistic update
        set((state) => {
          let newRegistros: RegistroAsistencia[];
          if (estado === null) {
            newRegistros = state.registros.filter(
              (r) => !(r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha)
            );
          } else if (existing) {
            newRegistros = state.registros.map((r) =>
              r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
                ? { ...r, estado, observacion, editado_por: "Operador General", editado_at: now }
                : r
            );
          } else {
            newRegistros = [
              ...state.registros,
              { id: `r-${id_contrato}-${id_trabajador}-${fecha}`, id_contrato, id_trabajador, id_asignacion, fecha, estado, observacion, editado_por: "Operador General", editado_at: now },
            ];
          }
          return {
            registros: newRegistros,
            auditoria: [audEntry, ...state.auditoria].slice(0, 500),
          };
        });

        try {
          if (estado === null) {
            const { error } = await supabase
              .from("registros_asistencia")
              .delete()
              .eq("id_contrato", id_contrato)
              .eq("id_trabajador", id_trabajador)
              .eq("fecha", fecha);

            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from("registros_asistencia")
              .upsert(
                {
                  id_contrato,
                  id_trabajador,
                  id_asignacion,
                  fecha,
                  estado,
                  observacion: observacion || null,
                  editado_por: "Operador General",
                  editado_at: now,
                },
                { onConflict: "id_contrato,id_trabajador,fecha" }
              )
              .select();

            if (error) throw error;

            if (data && data[0]) {
              set((state) => ({
                registros: state.registros.map((r) =>
                  r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
                    ? { ...r, id: data[0].id }
                    : r
                ),
              }));
            }
          }

          // Global Auditoria
          await useAuditoriaStore.getState().registrar({
            modulo: "Asistencia",
            accion: estado === null ? "Baja" : estadoAnterior ? "Modificacion" : "Alta",
            id_entidad: `${id_contrato}|${id_trabajador}|${fecha}`,
            nombre_entidad: nombre_trabajador,
            detalle: estado === null
              ? `Registro de asistencia eliminado para el ${fecha}.`
              : `Asistencia del ${fecha} marcada como ${ESTADO_CONFIG[estado].label}.${observacion ? ` Obs: ${observacion}` : ""}`,
            meta: {
              estado_anterior: estadoAnterior,
              estado_nuevo: estado,
              fecha_asistencia: fecha,
            },
          });
        } catch (err) {
          console.error("Failed to persist attendance update on Supabase:", err);
          // Rollback local state
          set((state) => {
            let restoredRegistros = [...state.registros];
            if (estadoAnterior === null) {
              restoredRegistros = restoredRegistros.filter(
                (r) => !(r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha)
              );
            } else {
              restoredRegistros = restoredRegistros.map((r) =>
                r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
                  ? { ...r, estado: estadoAnterior, observacion: existing?.observacion }
                  : r
              );
            }
            return {
              registros: restoredRegistros,
              auditoria: state.auditoria.filter((a) => a.id !== audEntry.id),
            };
          });
        }
      },

      getEstado: (id_contrato, id_trabajador, fecha) =>
        get().registros.find(
          (r) => r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
        )?.estado ?? null,

      getMetaFTE: (id_contrato) =>
        get().metas.find((m) => m.id_contrato === id_contrato)?.meta_fte ?? 0,

      setMetaFTE: async (id_contrato, meta_fte) => {
        set((state) => ({
          metas: state.metas.some((m) => m.id_contrato === id_contrato)
            ? state.metas.map((m) => (m.id_contrato === id_contrato ? { ...m, meta_fte } : m))
            : [...state.metas, { id_contrato, meta_fte }],
        }));

        try {
          const { error } = await supabase
            .from("metas_fte")
            .upsert({
              id_contrato,
              meta_fte,
              updated_at: new Date().toISOString(),
            });

          if (error) throw error;

          await useAuditoriaStore.getState().registrar({
            modulo: "Asistencia",
            accion: "Modificacion",
            id_entidad: id_contrato,
            nombre_entidad: `Meta FTE ${id_contrato}`,
            detalle: `Meta FTE actualizada a ${meta_fte}.`,
            meta: { meta_fte },
          });
        } catch (err) {
          console.error(`Failed to update meta_fte for ${id_contrato} in Supabase:`, err);
        }
      },

      calcularDiasHabiles: (anio, mes) => {
        const totalDays = new Date(anio, mes, 0).getDate();
        let count = 0;
        for (let d = 1; d <= totalDays; d++) {
          const day = new Date(anio, mes - 1, d).getDay();
          if (day !== 0 && day !== 6) count++;
        }
        return count;
      },

      calcularFTEReal: (id_contrato, anio, mes, diasHabiles) => {
        if (diasHabiles <= 0) return 0;
        const mesStr = `${anio}-${String(mes).padStart(2, "0")}`;
        const total = get()
          .registros.filter((r) => r.id_contrato === id_contrato && r.fecha.startsWith(mesStr))
          .filter((r) => ESTADO_CONFIG[r.estado]?.contabiliza).length;
        return total / diasHabiles;
      },
    }),
    { name: "monitoring-asistencia-v1" }
  )
);
