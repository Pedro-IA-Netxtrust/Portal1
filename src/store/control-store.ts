import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

export type ResultadoExamen = "Aprobado" | "Aprobado con Observaciones" | "Rechazado" | "Pendiente";
export type EstadoCurso = "Aprobado" | "Reprobado" | "Pendiente" | "No Asiste";
export type EstadoDocumento = "Vigente" | "Retenido" | "Suspendido" | "Vencido";

export interface CatalogoExamen {
  id: string;
  nombre: string;
  categoria: string;
}

export interface CatalogoCurso {
  id: string;
  nombre: string;
  categoria: string;
}

export interface CatalogoDocumento {
  id: string;
  nombre: string;
  categoria: string;
}

export interface ControlExamen {
  id: string;
  id_trabajador: string;
  id_examen_catalogo: string;
  fecha_realizacion: string;
  fecha_vencimiento: string | null;
  resultado: ResultadoExamen;
  observaciones: string | null;
  adjunto_url: string | null;
}

export interface ControlCurso {
  id: string;
  id_trabajador: string;
  id_curso_catalogo: string;
  institucion: string | null;
  modalidad: string | null;
  fecha_realizacion: string;
  fecha_vencimiento: string | null;
  estado: EstadoCurso;
  observaciones: string | null;
  certificado_url: string | null;
}

export interface ControlDocumento {
  id: string;
  id_trabajador: string;
  id_documento_catalogo: string;
  numero_documento: string | null;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  estado: EstadoDocumento;
  observaciones: string | null;
  adjunto_url: string | null;
}

// Interfaz para componentes UI
export type NivelAlerta = "vigente" | "alerta" | "critico" | "vencido" | "pendiente";

export interface AlertaControl {
  id: string;
  tipo: "Examen" | "Curso" | "Documento";
  nombre: string;
  fecha_vencimiento: string | null;
  nivel: NivelAlerta;
  dias_restantes: number | null;
  estado_texto: string;
}

interface ControlState {
  examenes: ControlExamen[];
  cursos: ControlCurso[];
  documentos: ControlDocumento[];
  
  catalogoExamenes: CatalogoExamen[];
  catalogoCursos: CatalogoCurso[];
  catalogoDocumentos: CatalogoDocumento[];
  
  fetchControlData: () => Promise<void>;
  
  addExamen: (e: Omit<ControlExamen, "id">) => Promise<void>;
  addExamenMasivo: (trabajadoresIds: string[], e: Omit<ControlExamen, "id" | "id_trabajador">) => Promise<void>;
  updateExamen: (id: string, updates: Partial<ControlExamen>) => Promise<void>;
  deleteExamen: (id: string) => Promise<void>;

  addCurso: (c: Omit<ControlCurso, "id">) => Promise<void>;
  addCursoMasivo: (trabajadoresIds: string[], c: Omit<ControlCurso, "id" | "id_trabajador">) => Promise<void>;
  updateCurso: (id: string, updates: Partial<ControlCurso>) => Promise<void>;
  deleteCurso: (id: string) => Promise<void>;

  addDocumento: (d: Omit<ControlDocumento, "id">) => Promise<void>;
  addDocumentoMasivo: (trabajadoresIds: string[], d: Omit<ControlDocumento, "id" | "id_trabajador">) => Promise<void>;
  updateDocumento: (id: string, updates: Partial<ControlDocumento>) => Promise<void>;
  deleteDocumento: (id: string) => Promise<void>;
  
  // Helpers
  getAlertasByTrabajador: (id_trabajador: string) => AlertaControl[];
  getAllAlertas: () => { trabajador_id: string; alerta: AlertaControl }[];
}

// Datos Mock Iniciales para visualización
const mockCatalogoExamenes: CatalogoExamen[] = [
  { id: "cat-ex-1", nombre: "Altura Geográfica", categoria: "Salud Ocupacional" },
  { id: "cat-ex-2", nombre: "Psicosensométrico", categoria: "Psicológico" },
  { id: "cat-ex-3", nombre: "Preocupacional", categoria: "Salud Ocupacional" },
  { id: "cat-ex-4", nombre: "Audiometría", categoria: "Físico" }
];

const mockCatalogoCursos: CatalogoCurso[] = [
  { id: "cat-cu-1", nombre: "Inducción ODI", categoria: "Inducción Obligatoria" },
  { id: "cat-cu-2", nombre: "Manejo a la Defensiva", categoria: "Seguridad y Salud" },
  { id: "cat-cu-3", nombre: "Liderazgo Efectivo", categoria: "Desarrollo Profesional" },
  { id: "cat-cu-4", nombre: "Operación de Grúas", categoria: "Certificación Técnica" }
];

const mockCatalogoDocumentos: CatalogoDocumento[] = [
  { id: "cat-doc-1", nombre: "Pase de Ingreso Faena", categoria: "Pase" },
  { id: "cat-doc-2", nombre: "Licencia Interna Conducir", categoria: "Licencia" },
  { id: "cat-doc-3", nombre: "Acreditación SSOMA", categoria: "Acreditación" }
];

const mockExamenes: ControlExamen[] = [
  {
    id: "ex-1",
    id_trabajador: "t-1",
    id_examen_catalogo: "cat-ex-1",
    fecha_realizacion: "2025-05-10",
    fecha_vencimiento: "2026-05-10", // Vencido hace poco
    resultado: "Aprobado",
    observaciones: null,
    adjunto_url: null,
  },
  {
    id: "ex-2",
    id_trabajador: "t-2",
    id_examen_catalogo: "cat-ex-2",
    fecha_realizacion: "2026-01-15",
    fecha_vencimiento: "2027-01-15", // Vigente
    resultado: "Aprobado con Observaciones",
    observaciones: "Uso de lentes ópticos obligatorio",
    adjunto_url: null,
  },
  {
    id: "ex-3",
    id_trabajador: "t-3",
    id_examen_catalogo: "cat-ex-3",
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
    id_curso_catalogo: "cat-cu-1",
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
    id_curso_catalogo: "cat-cu-2",
    institucion: "Automóvil Club",
    modalidad: "Presencial",
    fecha_realizacion: "2026-04-10",
    fecha_vencimiento: "2028-04-10",
    estado: "Aprobado",
    observaciones: null,
    certificado_url: null,
  }
];

const mockDocumentos: ControlDocumento[] = [
  {
    id: "doc-1",
    id_trabajador: "t-1",
    id_documento_catalogo: "cat-doc-1",
    numero_documento: "PASE-12345",
    fecha_emision: "2025-01-01",
    fecha_vencimiento: "2026-01-01",
    estado: "Vigente",
    observaciones: null,
    adjunto_url: null
  },
  {
    id: "doc-2",
    id_trabajador: "t-2",
    id_documento_catalogo: "cat-doc-2",
    numero_documento: "LIC-555",
    fecha_emision: "2024-05-10",
    fecha_vencimiento: "2025-05-10", // Vencido
    estado: "Vencido",
    observaciones: "Debe renovar antes de volver a conducir",
    adjunto_url: null
  }
];

// Helper para calcular nivel de alerta
const calcularNivelAlerta = (fechaVencimiento: string | null, estadoActual: string): { nivel: NivelAlerta; dias: number | null } => {
  if (estadoActual === "Pendiente" || estadoActual === "No Asiste" || estadoActual === "Reprobado" || estadoActual === "Rechazado") {
    return { nivel: "pendiente", dias: null };
  }
  if (estadoActual === "Retenido" || estadoActual === "Suspendido" || estadoActual === "Vencido") {
    return { nivel: "vencido", dias: null };
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
      documentos: [],
      catalogoExamenes: mockCatalogoExamenes,
      catalogoCursos: mockCatalogoCursos,
      catalogoDocumentos: mockCatalogoDocumentos,

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

          const { data: docData, error: docError } = await supabase
            .from("control_documentos")
            .select("*")
            .order("fecha_vencimiento", { ascending: true, nullsFirst: false });

          if (docError) {
            if (process.env.NODE_ENV === "development") console.warn("Supabase no tiene control_documentos, usando mock");
            const { documentos } = get();
            if (documentos.length === 0) set({ documentos: mockDocumentos });
          } else if (docData) {
            set({ documentos: docData });
          }

        } catch (err) {
          if (process.env.NODE_ENV === "development") console.warn("Error red control-store", err);
          const { examenes, cursos, documentos } = get();
          if (examenes.length === 0 && cursos.length === 0 && documentos.length === 0) {
            set({ examenes: mockExamenes, cursos: mockCursos, documentos: mockDocumentos });
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

      addExamenMasivo: async (trabajadoresIds, e) => {
        const tempIds: string[] = trabajadoresIds.map(
          (_, idx) => `temp-ex-masivo-${Date.now()}-${idx}`
        );
        const nuevos: ControlExamen[] = trabajadoresIds.map((id_trabajador, idx) => ({
          ...e,
          id_trabajador,
          id: tempIds[idx]
        }));

        set((state) => ({ examenes: [...state.examenes, ...nuevos] }));

        try {
          const registrosInsert = trabajadoresIds.map((id_trabajador) => ({
            ...e, id_trabajador
          }));
          const { data, error } = await supabase
            .from("control_examenes")
            .insert(registrosInsert)
            .select();

          if (error) throw error;

          if (data && data.length > 0) {
            // Reemplazar temp IDs con UUIDs reales de Supabase
            set((state) => ({
              examenes: state.examenes.map((ex) => {
                const tempIdx = tempIds.indexOf(ex.id);
                return tempIdx !== -1 ? data[tempIdx] ?? ex : ex;
              })
            }));
            useAuditoriaStore.getState().registrar({
              modulo: "Control",
              accion: "Alta",
              id_entidad: e.id_examen_catalogo,
              nombre_entidad: `Examen masivo (${data.length} trabajadores)`,
              detalle: `Examen registrado para ${data.length} trabajador(es) de forma masiva.`,
            });
          }
        } catch (err) {
          // Rollback: eliminar los registros temporales del estado
          set((state) => ({
            examenes: state.examenes.filter((ex) => !tempIds.includes(ex.id))
          }));
          console.warn("Error insert masivo examenes — rollback aplicado", err);
        }
      },

      updateExamen: async (id, updates) => {
        set((state) => ({
          examenes: state.examenes.map((e) => e.id === id ? { ...e, ...updates } : e)
        }));
        try {
          // Solo persistir si es un ID real (no temp)
          if (!id.startsWith("temp-")) {
            const { error } = await supabase
              .from("control_examenes")
              .update(updates)
              .eq("id", id);
            if (error) throw error;
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

      addCursoMasivo: async (trabajadoresIds, c) => {
        const tempIds: string[] = trabajadoresIds.map(
          (_, idx) => `temp-cu-masivo-${Date.now()}-${idx}`
        );
        const nuevos: ControlCurso[] = trabajadoresIds.map((id_trabajador, idx) => ({
          ...c,
          id_trabajador,
          id: tempIds[idx]
        }));

        set((state) => ({ cursos: [...state.cursos, ...nuevos] }));

        try {
          const registrosInsert = trabajadoresIds.map((id_trabajador) => ({
            ...c, id_trabajador
          }));
          const { data, error } = await supabase
            .from("control_cursos")
            .insert(registrosInsert)
            .select();

          if (error) throw error;

          if (data && data.length > 0) {
            set((state) => ({
              cursos: state.cursos.map((cu) => {
                const tempIdx = tempIds.indexOf(cu.id);
                return tempIdx !== -1 ? data[tempIdx] ?? cu : cu;
              })
            }));
          }
        } catch (err) {
          set((state) => ({
            cursos: state.cursos.filter((cu) => !tempIds.includes(cu.id))
          }));
          console.warn("Error insert masivo cursos — rollback aplicado", err);
        }
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

      addDocumento: async (d) => {
        const tempId = `temp-doc-${Date.now()}`;
        const nuevo: ControlDocumento = { ...d, id: tempId };
        set((state) => ({ documentos: [...state.documentos, nuevo] }));

        try {
          const { data, error } = await supabase.from("control_documentos").insert([d]).select();
          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              documentos: state.documentos.map((item) => item.id === tempId ? data[0] : item)
            }));
          }
        } catch (err) { console.warn(err); }
      },

      addDocumentoMasivo: async (trabajadoresIds, d) => {
        const tempIds: string[] = trabajadoresIds.map(
          (_, idx) => `temp-doc-masivo-${Date.now()}-${idx}`
        );
        const nuevos: ControlDocumento[] = trabajadoresIds.map((id_trabajador, idx) => ({
          ...d,
          id_trabajador,
          id: tempIds[idx]
        }));

        set((state) => ({ documentos: [...state.documentos, ...nuevos] }));

        try {
          const registrosInsert = trabajadoresIds.map((id_trabajador) => ({
            ...d, id_trabajador
          }));
          const { data, error } = await supabase
            .from("control_documentos")
            .insert(registrosInsert)
            .select();

          if (error) throw error;

          if (data && data.length > 0) {
            set((state) => ({
              documentos: state.documentos.map((doc) => {
                const tempIdx = tempIds.indexOf(doc.id);
                return tempIdx !== -1 ? data[tempIdx] ?? doc : doc;
              })
            }));
          }
        } catch (err) {
          set((state) => ({
            documentos: state.documentos.filter((doc) => !tempIds.includes(doc.id))
          }));
          console.warn("Error insert masivo documentos — rollback aplicado", err);
        }
      },

      updateDocumento: async (id, updates) => {
        set((state) => ({
          documentos: state.documentos.map((d) => d.id === id ? { ...d, ...updates } : d)
        }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_documentos").update(updates).eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      deleteDocumento: async (id) => {
        set((state) => ({ documentos: state.documentos.filter((d) => d.id !== id) }));
        try {
          if (!id.startsWith('temp-')) {
            await supabase.from("control_documentos").delete().eq("id", id);
          }
        } catch (err) { console.warn(err); }
      },

      getAlertasByTrabajador: (id_trabajador) => {
        // Una sola llamada a get() para todos los datos necesarios
        const { examenes, cursos, documentos, catalogoExamenes, catalogoCursos, catalogoDocumentos } = get();
        const alertas: AlertaControl[] = [];

        examenes.filter(e => e.id_trabajador === id_trabajador).forEach(ex => {
          const cat = catalogoExamenes.find(c => c.id === ex.id_examen_catalogo);
          const nombreEx = cat ? cat.nombre : "Examen Desconocido";
          const calc = calcularNivelAlerta(ex.fecha_vencimiento, ex.resultado);
          alertas.push({
            id: ex.id,
            tipo: "Examen",
            nombre: nombreEx,
            fecha_vencimiento: ex.fecha_vencimiento,
            nivel: calc.nivel,
            dias_restantes: calc.dias,
            estado_texto: ex.resultado
          });
        });

        cursos.filter(c => c.id_trabajador === id_trabajador).forEach(cu => {
          const cat = catalogoCursos.find(c => c.id === cu.id_curso_catalogo);
          const nombreCu = cat ? cat.nombre : "Curso Desconocido";
          const calc = calcularNivelAlerta(cu.fecha_vencimiento, cu.estado);
          alertas.push({
            id: cu.id,
            tipo: "Curso",
            nombre: nombreCu,
            fecha_vencimiento: cu.fecha_vencimiento,
            nivel: calc.nivel,
            dias_restantes: calc.dias,
            estado_texto: cu.estado
          });
        });

        documentos.filter(d => d.id_trabajador === id_trabajador).forEach(doc => {
          const cat = catalogoDocumentos.find(c => c.id === doc.id_documento_catalogo);
          const nombreDoc = cat ? cat.nombre : "Documento Desconocido";
          const calc = calcularNivelAlerta(doc.fecha_vencimiento, doc.estado);
          alertas.push({
            id: doc.id,
            tipo: "Documento",
            nombre: nombreDoc,
            fecha_vencimiento: doc.fecha_vencimiento,
            nivel: calc.nivel,
            dias_restantes: calc.dias,
            estado_texto: doc.estado
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
        const { examenes, cursos, documentos, getAlertasByTrabajador } = get();
        const allWorkers = Array.from(new Set([
          ...examenes.map(e => e.id_trabajador),
          ...cursos.map(c => c.id_trabajador),
          ...documentos.map(d => d.id_trabajador)
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
