import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoAlimentacion = "D" | "A" | "C" | "Co";

export const ALIMENTACION_CONFIG: Record<
  EstadoAlimentacion,
  { label: string; shortLabel: string; bg: string; text: string; colorHex: string }
> = {
  D:  { label: "Desayuno", shortLabel: "D",  bg: "bg-amber-500", text: "text-white", colorHex: "#f59e0b" },
  A:  { label: "Almuerzo", shortLabel: "A",  bg: "bg-emerald-500", text: "text-white", colorHex: "#10b981" },
  C:  { label: "Cena",     shortLabel: "C",  bg: "bg-blue-500",  text: "text-white", colorHex: "#3b82f6" },
  Co: { label: "Colación", shortLabel: "Co", bg: "bg-purple-500", text: "text-white", colorHex: "#a855f7" },
};

export interface RegistroAlimentacion {
  id: string;
  id_contrato: string;
  id_trabajador: string;
  id_asignacion: string;
  fecha: string;           // "YYYY-MM-DD"
  estados: EstadoAlimentacion[]; // Multiple consumptions per day
  editado_por: string;
  editado_at: string;
}

export interface AuditoriaAlimentacionEntry {
  id: string;
  id_contrato: string;
  id_trabajador: string;
  nombre_trabajador: string;
  fecha_consumo: string;
  estados_anteriores: EstadoAlimentacion[];
  estados_nuevos: EstadoAlimentacion[];
  editado_por: string;
  editado_at: string;
}

export interface PresupuestoAlimentacion {
  id_contrato: string;
  presupuesto_mensual: number; // Rations limit per month
}

// ─────────────────────────────────────────────────────────────────────────────
//  Mock data generation
// ─────────────────────────────────────────────────────────────────────────────

type WorkerRef = { id: string; asig: string };

const CONTRACT_WORKERS: Record<string, WorkerRef[]> = {
  "c-1": [
    { id: "t-1", asig: "as-1" }, { id: "t-2", asig: "as-2" }, { id: "t-3", asig: "as-3" },
    { id: "t-4", asig: "as-4" }, { id: "t-5", asig: "as-5" },
  ],
  "c-2": [
    { id: "t-7",  asig: "as-10" }, { id: "t-8",  asig: "as-11" }, { id: "t-9",  asig: "as-12" },
  ],
  "c-3": [
    { id: "t-10", asig: "as-20" }, { id: "t-11", asig: "as-21" }, { id: "t-12", asig: "as-22" },
    { id: "t-13", asig: "as-23" }, { id: "t-14", asig: "as-24" }, { id: "t-15", asig: "as-25" },
    { id: "t-3",  asig: "as-26" },
  ],
};

const INITIAL_PRESUPUESTOS: PresupuestoAlimentacion[] = [
  { id_contrato: "c-1", presupuesto_mensual: 500 },
  { id_contrato: "c-2", presupuesto_mensual: 300 },
  { id_contrato: "c-3", presupuesto_mensual: 700 },
];

function isWeekendStr(dateStr: string): boolean {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pickEstados(seed: number): EstadoAlimentacion[] {
  const r = seededRandom(seed);
  // Real world behavior: Some only have lunch, some breakfast and lunch, etc.
  if (r < 0.4) return ["A"]; // Only Almuerzo
  if (r < 0.7) return ["D", "A"]; // Desayuno and Almuerzo
  if (r < 0.85) return ["A", "C"]; // Almuerzo and Cena
  if (r < 0.95) return ["D", "A", "C"]; // Full meals
  return ["Co"]; // Only Colación
}

function generateMockRegistros(): RegistroAlimentacion[] {
  const records: RegistroAlimentacion[] = [];
  const now = new Date().toISOString();

  for (const [id_contrato, workers] of Object.entries(CONTRACT_WORKERS)) {
    const cNum = parseInt(id_contrato.replace(/\D/g, "")) || 1;
    for (let day = 1; day <= 31; day++) {
      const fecha = `2026-05-${String(day).padStart(2, "0")}`;
      try { if (isNaN(new Date(fecha + "T12:00:00").getTime())) continue; } catch { continue; }
      if (isWeekendStr(fecha)) continue;

      workers.forEach((w, wi) => {
        const seed = cNum * 2000 + wi * 50 + day; // different seed than asistencia
        records.push({
          id: `ralim-${id_contrato}-${w.id}-${fecha}`,
          id_contrato,
          id_trabajador: w.id,
          id_asignacion: w.asig,
          fecha,
          estados: pickEstados(seed),
          editado_por: "Sistema (Demo)",
          editado_at: now,
        });
      });
    }
  }

  // Same for June current week
  for (const [id_contrato, workers] of Object.entries(CONTRACT_WORKERS)) {
    const cNum = parseInt(id_contrato.replace(/\D/g, "")) || 1;
    for (let day = 1; day <= 5; day++) {
      const fecha = `2026-06-${String(day).padStart(2, "0")}`;
      workers.forEach((w, wi) => {
        const seed = cNum * 2000 + wi * 50 + day;
        records.push({
          id: `ralim-${id_contrato}-${w.id}-${fecha}`,
          id_contrato,
          id_trabajador: w.id,
          id_asignacion: w.asig,
          fecha,
          estados: pickEstados(seed),
          editado_por: "Sistema (Demo)",
          editado_at: now,
        });
      });
    }
  }

  return records;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Store interface & implementation
// ─────────────────────────────────────────────────────────────────────────────

interface AlimentacionState {
  registros: RegistroAlimentacion[];
  auditoria: AuditoriaAlimentacionEntry[];
  presupuestos: PresupuestoAlimentacion[];

  toggleEstado: (params: {
    id_contrato: string;
    id_trabajador: string;
    id_asignacion: string;
    nombre_trabajador: string;
    fecha: string;
    estado: EstadoAlimentacion;
  }) => void;

  setEstados: (params: {
    id_contrato: string;
    id_trabajador: string;
    id_asignacion: string;
    nombre_trabajador: string;
    fecha: string;
    estados: EstadoAlimentacion[];
  }) => void;

  getEstados: (id_contrato: string, id_trabajador: string, fecha: string) => EstadoAlimentacion[];
  
  getPresupuestoMensual: (id_contrato: string) => number;
  setPresupuestoMensual: (id_contrato: string, presupuesto: number) => void;
}

export const useAlimentacionStore = create<AlimentacionState>()(
  persist(
    (set, get) => ({
      registros: generateMockRegistros(),
      auditoria: [],
      presupuestos: INITIAL_PRESUPUESTOS,

      toggleEstado: ({ id_contrato, id_trabajador, id_asignacion, nombre_trabajador, fecha, estado }) => {
        const existing = get().registros.find(
          (r) => r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
        );
        const currentEstados = existing?.estados || [];
        
        let newEstados: EstadoAlimentacion[];
        if (currentEstados.includes(estado)) {
          newEstados = currentEstados.filter(e => e !== estado);
        } else {
          newEstados = [...currentEstados, estado];
        }

        get().setEstados({
          id_contrato,
          id_trabajador,
          id_asignacion,
          nombre_trabajador,
          fecha,
          estados: newEstados
        });
      },

      setEstados: ({ id_contrato, id_trabajador, id_asignacion, nombre_trabajador, fecha, estados }) => {
        const existing = get().registros.find(
          (r) => r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
        );
        const estadosAnteriores = existing?.estados ?? [];
        const now = new Date().toISOString();
        
        const audEntry: AuditoriaAlimentacionEntry = {
          id: `aud-alim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          id_contrato,
          id_trabajador,
          nombre_trabajador,
          fecha_consumo: fecha,
          estados_anteriores: estadosAnteriores,
          estados_nuevos: estados,
          editado_por: "Operador General",
          editado_at: now,
        };

        set((state) => {
          let newRegistros: RegistroAlimentacion[];
          if (estados.length === 0) {
            newRegistros = state.registros.filter(
              (r) => !(r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha)
            );
          } else if (existing) {
            newRegistros = state.registros.map((r) =>
              r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
                ? { ...r, estados, editado_por: "Operador General", editado_at: now }
                : r
            );
          } else {
            newRegistros = [
              ...state.registros,
              { id: `ralim-${id_contrato}-${id_trabajador}-${fecha}`, id_contrato, id_trabajador, id_asignacion, fecha, estados, editado_por: "Operador General", editado_at: now },
            ];
          }
          return {
            registros: newRegistros,
            auditoria: [audEntry, ...state.auditoria].slice(0, 500),
          };
        });
      },

      getEstados: (id_contrato, id_trabajador, fecha) =>
        get().registros.find(
          (r) => r.id_contrato === id_contrato && r.id_trabajador === id_trabajador && r.fecha === fecha
        )?.estados ?? [],

      getPresupuestoMensual: (id_contrato) =>
        get().presupuestos.find((m) => m.id_contrato === id_contrato)?.presupuesto_mensual ?? 0,

      setPresupuestoMensual: (id_contrato, presupuesto_mensual) =>
        set((state) => ({
          presupuestos: state.presupuestos.some((m) => m.id_contrato === id_contrato)
            ? state.presupuestos.map((m) => (m.id_contrato === id_contrato ? { ...m, presupuesto_mensual } : m))
            : [...state.presupuestos, { id_contrato, presupuesto_mensual }],
        })),
    }),
    { name: "monitoring-alimentacion-v1" }
  )
);
