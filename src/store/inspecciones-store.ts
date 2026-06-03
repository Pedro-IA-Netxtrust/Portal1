import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InspeccionDiaria {
  id_inspeccion: string;
  id_trabajador_conductor: string;
  id_activo_vehiculo: string;
  fecha: string;
  hora: string;
  kilometraje: number;
  
  // Section states
  carroceria: "Bueno" | "Regular" | "Malo";
  parachoques_delantero: "Bueno" | "Regular" | "Malo";
  parachoques_trasero: "Bueno" | "Regular" | "Malo";
  espejos_laterales: "Bueno" | "Regular" | "Malo";
  parabrisas: "Bueno" | "Regular" | "Malo";
  limpia_parabrisas: "Bueno" | "Regular" | "Malo";
  neumaticos: "Bueno" | "Regular" | "Malo";
  presion_neumaticos: "Bueno" | "Regular" | "Malo";
  neumatico_repuesto: "Bueno" | "Regular" | "Malo";
  llave_rueda: "Bueno" | "Regular" | "Malo";
  gata: "Bueno" | "Regular" | "Malo";
  
  luces_bajas: "Bueno" | "Regular" | "Malo";
  luces_altas: "Bueno" | "Regular" | "Malo";
  luces_freno: "Bueno" | "Regular" | "Malo";
  luces_intermitentes: "Bueno" | "Regular" | "Malo";
  luces_retroceso: "Bueno" | "Regular" | "Malo";
  baliza: "Bueno" | "Regular" | "Malo";
  pertiga: "Bueno" | "Regular" | "Malo" | "NA";
  
  cinturones: "Bueno" | "Regular" | "Malo";
  bocina: "Bueno" | "Regular" | "Malo";
  tablero_instrumentos: "Bueno" | "Regular" | "Malo";
  indicadores_advertencia: "Bueno" | "Regular" | "Malo";
  climatizador: "Bueno" | "Regular" | "Malo";
  asientos_apoyacabezas: "Bueno" | "Regular" | "Malo";
  frenos: "Bueno" | "Regular" | "Malo";
  
  extintor: "Presente" | "Incompleto" | "Ausente";
  botiquin: "Presente" | "Incompleto" | "Ausente";
  triangulos: "Presente" | "Incompleto" | "Ausente";
  chaleco: "Presente" | "Incompleto" | "Ausente";
  cunas: "Presente" | "Incompleto" | "Ausente";

  resultado: "Apto" | "No Apto";
  observaciones?: string;
}

export interface AuditoriaECF4 {
  id_auditoria: string;
  fecha: string;
  auditor: string;
  id_activo_vehiculo: string;
  porcentaje_cumplimiento: number;
  observaciones?: string;
  respuestas: Record<string, "SI" | "NO" | "NA">;
}

export interface VerificacionExpress {
  id_verificacion: string;
  fecha: string;
  inspector: string;
  id_activo_vehiculo: string;
  porcentaje_cumplimiento: number;
  observaciones?: string;
  respuestas: Record<number, "SI" | "NO" | "NA">;
}

interface InspeccionesState {
  inspeccionesDiarias: InspeccionDiaria[];
  auditorias: AuditoriaECF4[];
  verificacionesExpress: VerificacionExpress[];
  addInspeccionDiaria: (i: Omit<InspeccionDiaria, "id_inspeccion" | "resultado">) => void;
  deleteInspeccionDiaria: (id: string) => void;
  addAuditoria: (a: Omit<AuditoriaECF4, "id_auditoria">) => void;
  deleteAuditoria: (id: string) => void;
  addVerificacionExpress: (v: Omit<VerificacionExpress, "id_verificacion">) => void;
  deleteVerificacionExpress: (id: string) => void;
}

const mockInspeccionesDiarias: InspeccionDiaria[] = [
  {
    id_inspeccion: "insp-1",
    id_trabajador_conductor: "t-1", // Andrés Muñoz
    id_activo_vehiculo: "a-3", // Toyota Hilux
    fecha: "2026-05-29",
    hora: "07:15",
    kilometraje: 45200,
    carroceria: "Bueno",
    parachoques_delantero: "Bueno",
    parachoques_trasero: "Bueno",
    espejos_laterales: "Bueno",
    parabrisas: "Bueno",
    limpia_parabrisas: "Bueno",
    neumaticos: "Bueno",
    presion_neumaticos: "Bueno",
    neumatico_repuesto: "Bueno",
    llave_rueda: "Bueno",
    gata: "Bueno",
    luces_bajas: "Bueno",
    luces_altas: "Bueno",
    luces_freno: "Bueno",
    luces_intermitentes: "Bueno",
    luces_retroceso: "Bueno",
    baliza: "Bueno",
    pertiga: "Bueno",
    cinturones: "Bueno",
    bocina: "Bueno",
    tablero_instrumentos: "Bueno",
    indicadores_advertencia: "Bueno",
    climatizador: "Bueno",
    asientos_apoyacabezas: "Bueno",
    frenos: "Bueno",
    extintor: "Presente",
    botiquin: "Presente",
    triangulos: "Presente",
    chaleco: "Presente",
    cunas: "Presente",
    resultado: "Apto",
    observaciones: "Vehículo en excelentes condiciones para ingresar a mina rajo."
  },
  {
    id_inspeccion: "insp-2",
    id_trabajador_conductor: "t-2", // Valentina Gómez
    id_activo_vehiculo: "a-4", // Mitsubishi L200
    fecha: "2026-05-30",
    hora: "08:00",
    kilometraje: 89050,
    carroceria: "Regular",
    parachoques_delantero: "Bueno",
    parachoques_trasero: "Bueno",
    espejos_laterales: "Bueno",
    parabrisas: "Bueno",
    limpia_parabrisas: "Bueno",
    neumaticos: "Malo", // CRITICAL FAIL!
    presion_neumaticos: "Bueno",
    neumatico_repuesto: "Bueno",
    llave_rueda: "Bueno",
    gata: "Bueno",
    luces_bajas: "Bueno",
    luces_altas: "Bueno",
    luces_freno: "Bueno",
    luces_intermitentes: "Bueno",
    luces_retroceso: "Bueno",
    baliza: "Bueno",
    pertiga: "NA",
    cinturones: "Bueno",
    bocina: "Bueno",
    tablero_instrumentos: "Bueno",
    indicadores_advertencia: "Bueno",
    climatizador: "Bueno",
    asientos_apoyacabezas: "Bueno",
    frenos: "Bueno",
    extintor: "Presente",
    botiquin: "Incompleto", // FAIL!
    triangulos: "Presente",
    chaleco: "Presente",
    cunas: "Ausente", // CRITICAL FAIL!
    resultado: "No Apto",
    observaciones: "Neumático delantero izquierdo desgastado bajo límite (3mm). Faltan cuñas de seguridad en cabina. Se aplica Tarjeta Verde."
  }
];

const mockAuditorias: AuditoriaECF4[] = [
  {
    id_auditoria: "aud-1",
    fecha: "2026-04-15",
    auditor: "Eduardo Silva (Asesor RSSO)",
    id_activo_vehiculo: "a-3",
    porcentaje_cumplimiento: 92,
    observaciones: "Cumple con el 92% del estándar CODELCO. Se observa pendiente actualizar certificación de jaula ROPS en la carpeta digital.",
    respuestas: {
      "A.1.a": "SI", "A.1.b": "SI", "A.1.c": "SI", "A.1.d": "SI", "A.1.e": "SI", "A.1.f": "SI", "A.2.a": "SI", "A.3.a": "SI", "A.4.a": "SI", "A.5": "SI", "A.6.a": "SI", "A.6.f": "SI", "A.7": "SI",
      "B.1": "SI", "B.2": "SI", "B.3": "SI", "B.4": "SI", "B.5": "SI", "B.6": "SI", "B.7": "SI", "B.8": "SI", "B.9": "SI", "B.10-12": "NA",
      "C.1": "SI", "C.2": "SI", "C.3": "SI", "C.4": "SI", "C.5": "SI", "C.6": "SI", "C.7": "SI", "C.8": "NO", "C.9": "SI", "C.10": "SI", "C.11": "SI", "C.12": "SI", "C.13": "SI", "C.14": "SI", "C.15": "SI", "C.16": "NA", "C.17": "SI", "C.18": "SI", "C.19": "SI", "C.20": "SI", "C.21": "SI", "C.22": "SI", "C.23": "SI", "C.24": "NA", "C.25": "NA", "C.26": "SI",
      "D.1": "SI", "D.2": "SI", "D.3": "SI", "D.4": "SI"
    }
  }
];

const mockVerificacionesExpress: VerificacionExpress[] = [
  {
    id_verificacion: "ver-1",
    fecha: "2026-05-28",
    inspector: "Héctor Lagos (Supervisor Operaciones)",
    id_activo_vehiculo: "a-3",
    porcentaje_cumplimiento: 100,
    observaciones: "Control express en garita de control. Equipamiento ECF 4 en perfecto estado.",
    respuestas: {
      1: "SI", 2: "SI", 3: "SI", 4: "SI", 5: "SI", 6: "SI", 7: "SI", 8: "SI", 9: "SI", 10: "SI", 11: "SI", 12: "SI", 13: "SI", 14: "SI", 15: "SI", 16: "NA", 17: "SI", 18: "SI", 19: "SI", 20: "SI", 21: "SI", 22: "SI", 23: "SI", 24: "NA", 25: "NA", 26: "NA", 27: "SI"
    }
  }
];

// Helper to determine if inspection is "Apto" based on Codelco safety requirements
const evaluateInspectionResult = (fields: Omit<InspeccionDiaria, "id_inspeccion" | "resultado">): "Apto" | "No Apto" => {
  // Critical ECF 4 failures that immediately disqualify the pickup truck
  const hasCriticalFail = 
    fields.neumaticos === "Malo" || 
    fields.frenos === "Malo" || 
    fields.cinturones === "Malo" || 
    fields.luces_freno === "Malo" || 
    fields.luces_bajas === "Malo" ||
    fields.extintor === "Ausente" || 
    fields.cunas === "Ausente" || 
    fields.botiquin === "Ausente";

  return hasCriticalFail ? "No Apto" : "Apto";
};

export const useInspeccionesStore = create<InspeccionesState>()(
  persist(
    (set) => ({
      inspeccionesDiarias: mockInspeccionesDiarias,
      auditorias: mockAuditorias,
      verificacionesExpress: mockVerificacionesExpress,

      addInspeccionDiaria: (i) => set((state) => {
        const resultado = evaluateInspectionResult(i);
        const nuevo: InspeccionDiaria = {
          ...i,
          id_inspeccion: `insp-${Date.now()}`,
          resultado
        };
        return {
          inspeccionesDiarias: [nuevo, ...state.inspeccionesDiarias]
        };
      }),

      deleteInspeccionDiaria: (id) => set((state) => ({
        inspeccionesDiarias: state.inspeccionesDiarias.filter(i => i.id_inspeccion !== id)
      })),

      addAuditoria: (a) => set((state) => {
        const nuevo: AuditoriaECF4 = {
          ...a,
          id_auditoria: `aud-${Date.now()}`
        };
        return {
          auditorias: [nuevo, ...state.auditorias]
        };
      }),

      deleteAuditoria: (id) => set((state) => ({
        auditorias: state.auditorias.filter(a => a.id_auditoria !== id)
      })),

      addVerificacionExpress: (v) => set((state) => {
        const nuevo: VerificacionExpress = {
          ...v,
          id_verificacion: `ver-${Date.now()}`
        };
        return {
          verificacionesExpress: [nuevo, ...state.verificacionesExpress]
        };
      }),

      deleteVerificacionExpress: (id) => set((state) => ({
        verificacionesExpress: state.verificacionesExpress.filter(v => v.id_verificacion !== id)
      }))
    }),
    {
      name: "monitoring-inspecciones-storage"
    }
  )
);
