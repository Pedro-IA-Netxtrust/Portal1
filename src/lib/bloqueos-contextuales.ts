import { Trabajador } from "@/store/trabajadores-store";
import { CicloVidaTrabajador } from "@/store/ciclo-vida-store";
import { diasRestantes, estaVencido } from "@/lib/fechas";

// ─────────────────────────────────────────────────────────────
//  Helpers para bloqueos contextuales
// ─────────────────────────────────────────────────────────────

export interface BloqueOperacion {
  bloqueado: boolean;
  razon: string;
  motivo: string;
  accion_recomendada?: string;
}

/**
 * Valida si un trabajador puede registrar asistencia
 */
export const puedeRegistrarAsistencia = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined
): BloqueOperacion => {
  if (!trabajador) {
    return {
      bloqueado: true,
      razon: "Trabajador no encontrado",
      motivo: "El trabajador no existe en el sistema",
    };
  }

  if (!estadoCiclo) {
    return {
      bloqueado: true,
      razon: "Ciclo de vida no registrado",
      motivo: "El trabajador no tiene ciclo de vida configurado",
      accion_recomendada: "Contacta a Administración",
    };
  }

  if (estadoCiclo.estado_actual !== "activo") {
    return {
      bloqueado: true,
      razon: `Estado: ${estadoCiclo.estado_actual}`,
      motivo: `El trabajador no está en estado ACTIVO. Estado actual: ${estadoCiclo.estado_actual}`,
      accion_recomendada: "Completa el onboarding para habilitar asistencia",
    };
  }

  return {
    bloqueado: false,
    razon: "Permitido",
    motivo: "El trabajador está habilitado para registrar asistencia",
  };
};

/**
 * Valida si se pueden asignar activos (notebooks, vehículos)
 */
export const puedeAsignarActivos = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined,
  tipoActivo: "notebook" | "vehiculo"
): BloqueOperacion => {
  if (!trabajador) {
    return {
      bloqueado: true,
      razon: "Trabajador no encontrado",
      motivo: "El trabajador no existe en el sistema",
    };
  }

  // Para vehículos, requiere licencia vigente
  if (tipoActivo === "vehiculo") {
    if (!trabajador.vencimiento_licencia_conducir) {
      return {
        bloqueado: true,
        razon: "Sin licencia registrada",
        motivo: "El trabajador no tiene licencia de conducir registrada",
        accion_recomendada: "Registra la licencia de conducir",
      };
    }

    if (estaVencido(trabajador.vencimiento_licencia_conducir)) {
      const fechaLegible = new Date(
        trabajador.vencimiento_licencia_conducir
      ).toLocaleDateString();
      return {
        bloqueado: true,
        razon: "Licencia vencida",
        motivo: `La licencia de conducir venció el ${fechaLegible}`,
        accion_recomendada: "Renueva la licencia de conducir",
      };
    }
  }

  if (!estadoCiclo || estadoCiclo.estado_actual !== "activo") {
    return {
      bloqueado: true,
      razon: "Estado no permitido",
      motivo: "El trabajador no está en estado ACTIVO",
      accion_recomendada: "Completa el onboarding",
    };
  }

  return {
    bloqueado: false,
    razon: "Permitido",
    motivo: `Puedes asignar ${tipoActivo === "vehiculo" ? "un vehículo" : "un notebook"} a este trabajador`,
  };
};

/**
 * Valida si se puede solicitar un permiso
 */
export const puedeSolicitarPermiso = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined
): BloqueOperacion => {
  if (!trabajador) {
    return {
      bloqueado: true,
      razon: "Trabajador no encontrado",
      motivo: "El trabajador no existe en el sistema",
    };
  }

  if (!estadoCiclo) {
    return {
      bloqueado: true,
      razon: "Ciclo de vida no registrado",
      motivo: "El trabajador no tiene ciclo de vida",
    };
  }

  if (estadoCiclo.estado_actual !== "activo") {
    return {
      bloqueado: true,
      razon: `Estado: ${estadoCiclo.estado_actual}`,
      motivo: `Solo trabajadores ACTIVOS pueden solicitar permisos`,
      accion_recomendada: "Completa el onboarding",
    };
  }

  return {
    bloqueado: false,
    razon: "Permitido",
    motivo: "Puedes enviar una solicitud de permiso",
  };
};

/**
 * Valida si se puede registrar un examen
 */
export const puedeRegistrarExamen = (
  trabajador: Trabajador | null | undefined
): BloqueOperacion => {
  if (!trabajador) {
    return {
      bloqueado: true,
      razon: "Trabajador no encontrado",
      motivo: "El trabajador no existe en el sistema",
    };
  }

  // Requiere datos personales mínimos
  if (!trabajador.apellido_paterno || !trabajador.nombre_1) {
    return {
      bloqueado: true,
      razon: "Datos incompletos",
      motivo: "El trabajador no tiene nombre o apellido registrado",
      accion_recomendada: "Completa datos personales",
    };
  }

  return {
    bloqueado: false,
    razon: "Permitido",
    motivo: "Puedes registrar exámenes para este trabajador",
  };
};

/**
 * Valida si puede haber modificaciones al trabajador
 */
export const puedeModificarTrabajador = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined
): BloqueOperacion => {
  if (!trabajador) {
    return {
      bloqueado: true,
      razon: "Trabajador no encontrado",
      motivo: "El trabajador no existe en el sistema",
    };
  }

  if (!estadoCiclo) {
    return {
      bloqueado: false,
      razon: "Permitido",
      motivo: "Puedes modificar los datos del trabajador",
    };
  }

  // Si está en baja o archivado, solo lectura
  if (estadoCiclo.estado_actual === "baja" || estadoCiclo.estado_actual === "archivado") {
    return {
      bloqueado: true,
      razon: `Estado: ${estadoCiclo.estado_actual}`,
      motivo: "Los trabajadores en baja o archivados no pueden modificarse",
      accion_recomendada: "Contacta a Administración para cambios",
    };
  }

  return {
    bloqueado: false,
    razon: "Permitido",
    motivo: "Puedes modificar los datos del trabajador",
  };
};

// ─────────────────────────────────────────────────────────────
//  Estado laboral derivado
// ─────────────────────────────────────────────────────────────

export interface EstadoLaboralDerivado {
  estado: "nuevo" | "incorporando" | "operativo" | "transitando" | "inactivo";
  icono: string;
  color: string;
  descripcion: string;
  acciones_permitidas: string[];
  acciones_bloqueadas: string[];
}

export const getEstadoLaboralDerivado = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined
): EstadoLaboralDerivado => {
  if (!trabajador || !estadoCiclo) {
    return {
      estado: "nuevo",
      icono: "🆕",
      color: "blue",
      descripcion: "Nuevo en el sistema",
      acciones_permitidas: ["editar_datos", "ver_perfil"],
      acciones_bloqueadas: ["asistencia", "permisos", "activos"],
    };
  }

  const mapa: Record<string, EstadoLaboralDerivado> = {
    nuevo_ingreso: {
      estado: "nuevo",
      icono: "🆕",
      color: "blue",
      descripcion: "Recién creado en el sistema",
      acciones_permitidas: ["editar_datos", "ver_perfil", "iniciar_onboarding"],
      acciones_bloqueadas: ["asistencia", "permisos", "examen"],
    },
    pre_incorporacion: {
      estado: "incorporando",
      icono: "⏳",
      color: "amber",
      descripcion: "Completando checklist de onboarding",
      acciones_permitidas: ["editar_datos", "ver_perfil", "completar_checklist"],
      acciones_bloqueadas: ["asistencia", "permisos", "activos"],
    },
    activo: {
      estado: "operativo",
      icono: "🟢",
      color: "emerald",
      descripcion: "Habilitado para operar",
      acciones_permitidas: ["asistencia", "permisos", "activos", "examen", "solicitudes", "editar_datos"],
      acciones_bloqueadas: [],
    },
    cambio_rol: {
      estado: "transitando",
      icono: "🔄",
      color: "purple",
      descripcion: "En transición de rol/contrato",
      acciones_permitidas: ["asistencia", "permisos"],
      acciones_bloqueadas: ["activos", "solicitudes"],
    },
    baja: {
      estado: "inactivo",
      icono: "🚫",
      color: "red",
      descripcion: "Dado de baja",
      acciones_permitidas: ["ver_perfil", "ver_historial"],
      acciones_bloqueadas: ["asistencia", "permisos", "activos", "examen", "solicitudes", "editar_datos"],
    },
    archivado: {
      estado: "inactivo",
      icono: "📦",
      color: "slate",
      descripcion: "Archivado en el sistema",
      acciones_permitidas: ["ver_perfil", "ver_historial"],
      acciones_bloqueadas: ["asistencia", "permisos", "activos", "examen", "solicitudes", "editar_datos"],
    },
  };

  return mapa[estadoCiclo.estado_actual] || mapa.nuevo_ingreso;
};

// ─────────────────────────────────────────────────────────────
//  Helpers de urgencia
// ─────────────────────────────────────────────────────────────

export interface AlertaUrgencia {
  nivel: "critica" | "advertencia" | "info";
  titulo: string;
  descripcion: string;
  accion?: string;
}

export const getAlertasUrgencia = (
  trabajador: Trabajador | null | undefined,
  estadoCiclo: CicloVidaTrabajador | null | undefined,
  onboardingProgress?: number
): AlertaUrgencia[] => {
  const alertas: AlertaUrgencia[] = [];

  if (!trabajador || !estadoCiclo) return alertas;

  // Alerta: Estado no activo
  if (estadoCiclo.estado_actual !== "activo") {
    alertas.push({
      nivel: "advertencia",
      titulo: "Trabajador no operativo",
      descripcion: `Estado actual: ${estadoCiclo.estado_actual}. Algunas operaciones estarán bloqueadas.`,
      accion: "Ver ciclo de vida",
    });
  }

  // Alerta: Onboarding incompleto
  if (onboardingProgress !== undefined && onboardingProgress < 100 && estadoCiclo.estado_actual === "pre_incorporacion") {
    alertas.push({
      nivel: "advertencia",
      titulo: "Onboarding incompleto",
      descripcion: `Progreso: ${onboardingProgress}%. Completa todas las tareas para activar.`,
      accion: "Ir al onboarding",
    });
  }

  // Alerta: Licencia vencida o por vencer
  if (trabajador.vencimiento_licencia_conducir) {
    const dias = diasRestantes(trabajador.vencimiento_licencia_conducir);

    if (dias < 0) {
      alertas.push({
        nivel: "critica",
        titulo: "Licencia de conducir vencida",
        descripcion: "No puede operar vehículos hasta renovar.",
        accion: "Renovar licencia",
      });
    } else if (dias < 30) {
      alertas.push({
        nivel: "advertencia",
        titulo: "Licencia vencerá pronto",
        descripcion: `Vence en ${dias} días.`,
        accion: "Agendar renovación",
      });
    }
  }

  // Alerta: Documentos faltantes
  const documentosFaltantes = [];
  if (!trabajador.email_corporativo) documentosFaltantes.push("Email");
  if (!trabajador.banco) documentosFaltantes.push("Datos bancarios");
  if (!trabajador.afp) documentosFaltantes.push("AFP");

  if (documentosFaltantes.length > 0) {
    alertas.push({
      nivel: "info",
      titulo: "Datos incompletos",
      descripcion: `Faltan: ${documentosFaltantes.join(", ")}`,
      accion: "Completar perfil",
    });
  }

  return alertas;
};
