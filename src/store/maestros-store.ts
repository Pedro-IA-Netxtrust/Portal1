import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ExamenMaestro {
  id_examen_maestro: string;
  nombre_examen: string;
  duracion_meses: number; // default validity duration in months
  descripcion?: string;
}

export interface CursoMaestro {
  id_curso_maestro: string;
  nombre_curso: string;
  duracion_meses: number; // default validity duration in months
  descripcion?: string;
}

interface MaestrosState {
  examenesMaestros: ExamenMaestro[];
  cursosMaestros: CursoMaestro[];
  /** True una vez que el middleware `persist` terminó de leer del storage. */
  hydrated: boolean;
  addExamenMaestro: (em: Omit<ExamenMaestro, "id_examen_maestro">) => void;
  deleteExamenMaestro: (id: string) => void;
  addCursoMaestro: (cm: Omit<CursoMaestro, "id_curso_maestro">) => void;
  deleteCursoMaestro: (id: string) => void;
}

const mockExamenesMaestros: ExamenMaestro[] = [
  {
    id_examen_maestro: "em-1",
    nombre_examen: "Altura Geográfica",
    duracion_meses: 12,
    descripcion: "Evaluación médica obligatoria para trabajos sobre 3000 msnm."
  },
  {
    id_examen_maestro: "em-2",
    nombre_examen: "Psicosensométrico",
    duracion_meses: 24,
    descripcion: "Examen psicosensométrico riguroso para conductores y operadores."
  },
  {
    id_examen_maestro: "em-3",
    nombre_examen: "Ocupacional General",
    duracion_meses: 12,
    descripcion: "Batería médica básica de salud laboral ocupacional."
  }
];

const mockCursosMaestros: CursoMaestro[] = [
  {
    id_curso_maestro: "cm-1",
    nombre_curso: "Inducción Básica de Seguridad SOMA",
    duracion_meses: 12,
    descripcion: "Curso obligatorio de ingreso a faena de seguridad industrial."
  },
  {
    id_curso_maestro: "cm-2",
    nombre_curso: "SAP LMS Control Operativo",
    duracion_meses: 24,
    descripcion: "Certificación básica de sistemas de imputación y control de horas."
  },
  {
    id_curso_maestro: "cm-3",
    nombre_curso: "Trabajo Seguro en Alturas (LOTO)",
    duracion_meses: 12,
    descripcion: "Curso teórico-práctico de control de energías peligrosas y caídas."
  },
  {
    id_curso_maestro: "cm-4",
    nombre_curso: "Operación Segura de Maquinaria Pesada",
    duracion_meses: 36,
    descripcion: "Certificación avanzada para la conducción de equipos pesados en minería."
  }
];

export const useMaestrosStore = create<MaestrosState>()(
  persist(
    (set) => ({
      examenesMaestros: mockExamenesMaestros,
      cursosMaestros: mockCursosMaestros,
      hydrated: false,
      addExamenMaestro: (em) => set((state) => ({
        examenesMaestros: [
          ...state.examenesMaestros,
          { ...em, id_examen_maestro: `em-${Date.now()}` }
        ]
      })),
      deleteExamenMaestro: (id) => set((state) => ({
        examenesMaestros: state.examenesMaestros.filter(e => e.id_examen_maestro !== id)
      })),
      addCursoMaestro: (cm) => set((state) => ({
        cursosMaestros: [
          ...state.cursosMaestros,
          { ...cm, id_curso_maestro: `cm-${Date.now()}` }
        ]
      })),
      deleteCursoMaestro: (id) => set((state) => ({
        cursosMaestros: state.cursosMaestros.filter(c => c.id_curso_maestro !== id)
      }))
    }),
    {
      name: "monitoring-maestros-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
