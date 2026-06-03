import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ExamenMedico {
  id_examen: string;
  id_trabajador: string;
  tipo_examen: string;
  resultado: "Aprobado" | "Rechazado" | "Pendiente";
  fecha_evaluacion: string;
  fecha_vencimiento: string;
  entidad_evaluadora: string;
}

export interface CursoCapacitacion {
  id_curso: string;
  id_trabajador: string;
  nombre_curso: string;
  fecha_capacitacion: string;
  fecha_vencimiento?: string;
  estado: "Completado" | "Vencido" | "En Curso";
}

interface ControlState {
  examenes: ExamenMedico[];
  cursos: CursoCapacitacion[];
  addExamen: (e: Omit<ExamenMedico, "id_examen">) => void;
  deleteExamen: (id: string) => void;
  addCurso: (c: Omit<CursoCapacitacion, "id_curso">) => void;
  deleteCurso: (id: string) => void;
}

const mockExamenes: ExamenMedico[] = [
  {
    id_examen: "ex-1",
    id_trabajador: "t-1", // Andrés Muñoz
    tipo_examen: "Altura Geográfica",
    resultado: "Aprobado",
    fecha_evaluacion: "2026-01-10",
    fecha_vencimiento: "2027-10-12",
    entidad_evaluadora: "Mutual de Seguridad"
  },
  {
    id_examen: "ex-2",
    id_trabajador: "t-2", // Valentina Gómez
    tipo_examen: "Altura Geográfica",
    resultado: "Aprobado",
    fecha_evaluacion: "2025-05-10",
    fecha_vencimiento: "2026-05-10", // Vencido!
    entidad_evaluadora: "ACHS"
  },
  {
    id_examen: "ex-3",
    id_trabajador: "t-1", // Andrés Muñoz
    tipo_examen: "Psicosensométrico",
    resultado: "Aprobado",
    fecha_evaluacion: "2024-08-20",
    fecha_vencimiento: "2026-08-20",
    entidad_evaluadora: "Mutual de Seguridad"
  }
];

const mockCursos: CursoCapacitacion[] = [
  {
    id_curso: "cur-1",
    id_trabajador: "t-1",
    nombre_curso: "Inducción Básica de Seguridad SOMA",
    fecha_capacitacion: "2026-01-15",
    estado: "Completado"
  },
  {
    id_curso: "cur-2",
    id_trabajador: "t-2",
    nombre_curso: "SAP LMS Control Operativo",
    fecha_capacitacion: "2026-02-20",
    estado: "Completado"
  },
  {
    id_curso: "cur-3",
    id_trabajador: "t-2",
    nombre_curso: "Trabajo Seguro en Alturas (LOTO)",
    fecha_capacitacion: "2025-05-10",
    fecha_vencimiento: "2026-05-10",
    estado: "Vencido"
  }
];

export const useControlStore = create<ControlState>()(
  persist(
    (set) => ({
      examenes: mockExamenes,
      cursos: mockCursos,
      addExamen: (e) => set((state) => ({
        examenes: [
          ...state.examenes,
          { ...e, id_examen: `ex-${Date.now()}` }
        ]
      })),
      deleteExamen: (id) => set((state) => ({
        examenes: state.examenes.filter((e) => e.id_examen !== id)
      })),
      addCurso: (c) => set((state) => ({
        cursos: [
          ...state.cursos,
          { ...c, id_curso: `cur-${Date.now()}` }
        ]
      })),
      deleteCurso: (id) => set((state) => ({
        cursos: state.cursos.filter((c) => c.id_curso !== id)
      }))
    }),
    {
      name: "monitoring-control-storage"
    }
  )
);
