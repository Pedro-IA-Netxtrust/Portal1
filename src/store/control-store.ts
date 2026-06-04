import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export type ResultadoExamen = "Aprobado" | "Aprobado con Observaciones" | "Rechazado" | "Pendiente";
export type EstadoCurso = "Aprobado" | "Reprobado" | "Pendiente" | "No Asiste";

export interface ControlExamen {
  id: string;
  id_trabajador: string;
  tipo_examen: string;
  fecha_realizacion: string;
  fecha_vencimiento: string | null;
  resultado: ResultadoExamen;
  observaciones: string | null;
  adjunto_url: string | null;
}

export interface ControlCurso {
  id: string;
  id_trabajador: string;
  nombre_curso: string;
  institucion: string | null;
  modalidad: string | null;
  fecha_realizacion: string;
  fecha_vencimiento: string | null;
  estado: EstadoCurso;
  observaciones: string | null;
  certificado_url: string | null;
}

// Interfaz para componentes UI
export type NivelAlerta = "vigente" | "alerta" | "critico" | "vencido" | "pendiente";

export interface AlertaControl {
  id: string;
  tipo: "Examen" | "Curso";
  nombre: string;
  fecha_vencimiento: string | null;
  nivel: NivelAlerta;
  dias_restantes: number | null;
  estado_texto: string;
}

interface ControlState {
  examenes: ControlExamen[];
  cursos: ControlCurso[];
  
  fetchControlData: () => Promise<void>;
  
  addExamen: (e: Omit<ControlExamen, "id">) => Promise<void>;
  updateExamen: (id: string, updates: Partial<ControlExamen>) => Promise<void>;
  deleteExamen: (id: string) => Promise<void>;

  addCurso: (c: Omit<ControlCurso, "id">) => Promise<void>;
  updateCurso: (id: string, updates: Partial<ControlCurso>) => Promise<void>;
  deleteCurso: (id: string) => Promise<void>;
  
  // Helpers
  getAlertasByTrabajador: (id_trabajador: string) => AlertaControl[];
  getAllAlertas: () => { trabajador_id: string; alerta: AlertaControl }[];
}

// Datos Mock Iniciales para visualización
const mockExamenes: ControlExamen[] = [
  {
    id: "ex-1",
    id_trabajador: "t-1",
    tipo_examen: "Altura Geográfica",
    fecha_realizacion: "2025-05-10",
    fecha_vencimiento: "2026-05-10", // Vencido hace poco
    resultado: "Aprobado",
    observaciones: null,
    adjunto_url: null,
  },
  {
    id: "ex-2",
    id_trabajador: "t-2",
    tipo_examen: "Psicosensométrico",
    fecha_realizacion: "2026-01-15",
    fecha_vencimiento: "2027-01-15", // Vigente
    resultado: "Aprobado con Observaciones",
    observaciones: "Uso de lentes ópticos obligatorio",
    adjunto_url: null,
  },
  {
    id: "ex-3",
    id_trabajador: "t-3",
    tipo_examen: "Preocupacional",
    fecha_realizacion: "2026-06-01",
    fecha_vencimiento: null,
    resultado: "Pendiente",
    observaciones: "A la espera de resultados de laboratorio",
    adjunto_url: null,
  }
];

const mockCursos: ControlCurso[] = [
  {
    id: "cu-1",
    id_trabajador: "t-1",
    nombre_curso: "Inducción ODI",
    institucion: "Mutual de Seguridad",
    modalidad: "E-learning",
    fecha_realizacion: "2025-06-20",
    fecha_vencimiento: "2026-06-20", // Por vencer pronto (< 30 días)
    estado: "Aprobado",
    observaciones: null,
    certificado_url: null,
  },
  {
    id: "cu-2",
    id_trabajador: "t-2",
    nombre_curso: "Manejo a la Defensiva",
    institucion: "Automóvil Club",
    modalidad: "Presencial",
    fecha_realizacion: "2026-04-10",
    fecha_vencimiento: "2028-04-10",
    estado: "Aprobado",
    observaciones: null,
    certificado_url: null,
  }
];

// Helper para calcular nivel de alerta
const calcularNivelAlerta = (fechaVencimiento: string | null, estadoActual: string): { nivel: NivelAlerta; dias: number | null } => {
  if (estadoActual === "Pendiente" || estadoActual === "No Asiste" || estadoActual === "Reprobado" || estadoActual === "Rechazado") {
    return { nivel: "pendiente", dias: null };
  }

  if (!fechaVencimiento) return { nivel: "vigente", dias: null };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  const diasDiff = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasDiff < 0) return { nivel: "vencido", dias: diasDiff };
  if (diasDiff <= 30) return { nivel: "critico", dias: diasDiff };
  if (diasDiff <= 60) return { nivel: "alerta", dias: diasDiff };
  return { nivel: "vigente", dias: diasDiff };
};

export const useControlStore = create<ControlState>()(
  persist(
    (set, get) => ({
      examenes: [],
      cursos: [],

      fetchControlData: async () => {
        try {
          const { data: exData, error: exError } = await supabase
            .from("control_examenes")
            .select("*")
            .order("fecha_vencimiento", { ascending: true, nullsFirst: false });

          // Fallback silencioso si la tabla no existe
          if (exError) {
            if (process.env.NODE_ENV === "development") console.warn("Supabase no tiene control_examenes, usando mock");
            const { examenes } = get();
            if (examenes.length === 0) set({ examenes: mockExamenes });
          } else if (exData) {
            set({ examenes: exData });
          }

          const { data: cuData, error: cuError } = await supabase
            .from("control_cursos")
            .select("*")
            .order("fecha_vencimiento", { ascending: true, nullsFirst: false });

          if (cuError) {
            if (process.env.NODE_ENV === "development") console.warn("Supabase no tiene control_cursos, usando mock");
            const { cursos } = get();
            if (cursos.length === 0) set({ cursos: mockCursos });
          } else if (cuData) {
            set({ cursos: cuData });
          }

        } catch (err) {
          if (process.env.NODE_ENV === "development") console.warn("Error red control-store", err);
          const { examenes, cursos } = get();
          if (examenes.length === 0 && cursos.length === 0) {
            set({ examenes: mockExamenes, cursos: mockCursos });
          }
        }
      },

      addExamen: async (e) => {
        const tempId = `temp-ex-${Date.now()}`;
        const nuevo: ControlExamen = { ...e, id: tempId };
        
        set((state) => ({ examenes: [...state.examenes, nuevo] }));

        try {
          const { data, error } = await supabase.from("control_examenes").insert([e]).select();
          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              examenes: state.examenes.map((item) => item.id === tempId ? data[0] : item)
            }));
          }
        } catch (err) {
          console.warn("Error persistiendo examen", err);
        }
      },

      updateExamen: async (id, updates) => {
        set((state) => ({
          examenes: state.examenes.map((e) => e.id === id ? { ...e, ...updates } : e)
        }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_examenes").update(updates).eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      deleteExamen: async (id) => {
        set((state) => ({ examenes: state.examenes.filter((e) => e.id !== id) }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_examenes").delete().eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      addCurso: async (c) => {
        const tempId = `temp-cu-${Date.now()}`;
        const nuevo: ControlCurso = { ...c, id: tempId };
        set((state) => ({ cursos: [...state.cursos, nuevo] }));

        try {
          const { data, error } = await supabase.from("control_cursos").insert([c]).select();
          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              cursos: state.cursos.map((item) => item.id === tempId ? data[0] : item)
            }));
          }
        } catch (err) { console.warn(err); }
      },

      updateCurso: async (id, updates) => {
        set((state) => ({
          cursos: state.cursos.map((c) => c.id === id ? { ...c, ...updates } : c)
        }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_cursos").update(updates).eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      deleteCurso: async (id) => {
        set((state) => ({ cursos: state.cursos.filter((c) => c.id !== id) }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_cursos").delete().eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      getAlertasByTrabajador: (id_trabajador) => {
        const { examenes, cursos } = get();
        const alertas: AlertaControl[] = [];

        examenes.filter(e => e.id_trabajador === id_trabajador).forEach(ex => {
          const calc = calcularNivelAlerta(ex.fecha_vencimiento, ex.resultado);
          alertas.push({
            id: ex.id,
            tipo: "Examen",
            nombre: ex.tipo_examen,
            fecha_vencimiento: ex.fecha_vencimiento,
            nivel: calc.nivel,
            dias_restantes: calc.dias,
            estado_texto: ex.resultado
          });
        });

        cursos.filter(c => c.id_trabajador === id_trabajador).forEach(cu => {
          const calc = calcularNivelAlerta(cu.fecha_vencimiento, cu.estado);
          alertas.push({
            id: cu.id,
            tipo: "Curso",
            nombre: cu.nombre_curso,
            fecha_vencimiento: cu.fecha_vencimiento,
            nivel: calc.nivel,
            dias_restantes: calc.dias,
            estado_texto: cu.estado
          });
        });

        return alertas.sort((a, b) => {
          // Orden de prioridad: vencido > critico > alerta > pendiente > vigente
          const ordenNivel = { vencido: 1, critico: 2, alerta: 3, pendiente: 4, vigente: 5 };
          const cmp = ordenNivel[a.nivel] - ordenNivel[b.nivel];
          if (cmp !== 0) return cmp;
          
          // Si mismo nivel, ordenar por días restantes (los menores primero)
          if (a.dias_restantes !== null && b.dias_restantes !== null) {
            return a.dias_restantes - b.dias_restantes;
          }
          return 0;
        });
      },

      getAllAlertas: () => {
        const { examenes, cursos, getAlertasByTrabajador } = get();
        const allWorkers = Array.from(new Set([
          ...examenes.map(e => e.id_trabajador),
          ...cursos.map(c => c.id_trabajador)
        ]));

        const allAlertas: { trabajador_id: string; alerta: AlertaControl }[] = [];
        
        allWorkers.forEach(wId => {
          const alertas = getAlertasByTrabajador(wId);
          alertas.forEach(a => {
            allAlertas.push({ trabajador_id: wId, alerta: a });
          });
        });

        return allAlertas.sort((a, b) => {
          const ordenNivel = { vencido: 1, critico: 2, alerta: 3, pendiente: 4, vigente: 5 };
          const cmp = ordenNivel[a.alerta.nivel] - ordenNivel[b.alerta.nivel];
          if (cmp !== 0) return cmp;
          if (a.alerta.dias_restantes !== null && b.alerta.dias_restantes !== null) {
            return a.alerta.dias_restantes - b.alerta.dias_restantes;
          }
          return 0;
        });
      }
    }),
    {
      name: "monitoring-control-storage"
    }
  )
);
