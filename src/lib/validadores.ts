import { Trabajador } from "@/store/trabajadores-store";

// ─────────────────────────────────────────────────────────────
//  Tipos de validación
// ─────────────────────────────────────────────────────────────

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  porcentajeCompletitud: number;
}

export interface ValidacionCampo {
  campo: string;
  valido: boolean;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
//  Helpers internos
// ─────────────────────────────────────────────────────────────

/**
 * Construye un `ValidacionCampo` para un campo de texto cualquiera.
 * - Si `valor` es truthy → válido.
 * - Si `valor` es falsy → inválido con `error`.
 *
 * IMPORTANTE: a diferencia de la versión anterior, esto SIEMPRE retorna una
 * entrada (válida o inválida), para que `porcentajeCompletitud` tenga sentido.
 */
const check = (
  campo: string,
  valor: unknown,
  error: string
): ValidacionCampo => {
  const valido = typeof valor === "string" ? valor.trim().length > 0 : !!valor;
  return valido ? { campo, valido: true } : { campo, valido: false, error };
};

// ─────────────────────────────────────────────────────────────
//  Validadores por sección
// ─────────────────────────────────────────────────────────────

export const validarDatosPersonales = (t: Trabajador): ValidacionCampo[] => [
  check("apellido_paterno", t.apellido_paterno, "Apellido paterno requerido"),
  check("nombre_1", t.nombre_1, "Primer nombre requerido"),
  check("numero_identificacion", t.numero_identificacion, "RUT/DNI requerido"),
  check("fecha_nacimiento", t.fecha_nacimiento, "Fecha de nacimiento requerida"),
  check("nacionalidad", t.nacionalidad, "Nacionalidad requerida"),
  check("sexo", t.sexo, "Sexo requerido"),
];

export const validarContacto = (t: Trabajador): ValidacionCampo[] => {
  const emailCheck: ValidacionCampo = !t.email_corporativo
    ? { campo: "email_corporativo", valido: false, error: "Email corporativo requerido" }
    : !t.email_corporativo.includes("@")
    ? { campo: "email_corporativo", valido: false, error: "Email corporativo inválido" }
    : { campo: "email_corporativo", valido: true };

  return [emailCheck, check("celular_personal", t.celular_personal, "Celular personal requerido")];
};

export const validarDomicilio = (t: Trabajador): ValidacionCampo[] => [
  check("region", t.region, "Región requerida"),
  check("comuna", t.comuna, "Comuna requerida"),
  check("calle", t.calle, "Calle requerida"),
  check("numero_domicilio", t.numero_domicilio, "Número de domicilio requerido"),
];

export const validarDatosLaborales = (t: Trabajador): ValidacionCampo[] => [
  check("cargo", t.cargo, "Cargo requerido"),
  check("area_departamento", t.area_departamento, "Área/Departamento requerido"),
  check("tipo_contrato", t.tipo_contrato, "Tipo de contrato requerido"),
  check("fecha_ingreso", t.fecha_ingreso, "Fecha de ingreso requerida"),
  check("modalidad_trabajo", t.modalidad_trabajo, "Modalidad de trabajo requerida"),
];

export const validarDatosAdministrativos = (t: Trabajador): ValidacionCampo[] => [
  check("banco", t.banco, "Banco requerido"),
  check("tipo_cuenta", t.tipo_cuenta, "Tipo de cuenta requerido"),
  check("numero_cuenta", t.numero_cuenta, "Número de cuenta requerido"),
  check("afp", t.afp, "AFP requerida"),
  check("sistema_salud", t.sistema_salud, "Sistema de salud requerido"),
];

export const validarTallasEPP = (t: Trabajador): ValidacionCampo[] => [
  check("talla_chaqueta", t.talla_chaqueta, "Talla chaqueta requerida"),
  check("talla_polera", t.talla_polera, "Talla polera requerida"),
  check("calzado_seguridad", t.calzado_seguridad, "Calzado de seguridad requerido"),
];

// ─────────────────────────────────────────────────────────────
//  Validaciones compiladas
// ─────────────────────────────────────────────────────────────

export interface ValidacionTrabajador {
  datosPersonales: ValidacionCampo[];
  contacto: ValidacionCampo[];
  domicilio: ValidacionCampo[];
  datosLaborales: ValidacionCampo[];
  administrativo: ValidacionCampo[];
  tallasEPP: ValidacionCampo[];
}

export const validarTrabajadorCompleto = (t: Trabajador): ResultadoValidacion => {
  const validaciones: ValidacionTrabajador = {
    datosPersonales: validarDatosPersonales(t),
    contacto: validarContacto(t),
    domicilio: validarDomicilio(t),
    datosLaborales: validarDatosLaborales(t),
    administrativo: validarDatosAdministrativos(t),
    tallasEPP: validarTallasEPP(t),
  };

  const errores: string[] = [];
  const advertencias: string[] = [];
  let camposValidos = 0;
  let camposTotales = 0;

  Object.values(validaciones).forEach((seccion) => {
    seccion.forEach((val: ValidacionCampo) => {
      camposTotales++;
      if (val.valido) {
        camposValidos++;
      } else if (val.error) {
        errores.push(val.error);
      }
    });
  });

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    porcentajeCompletitud:
      camposTotales > 0 ? Math.round((camposValidos / camposTotales) * 100) : 0,
  };
};

export const validacionesPorFase = {
  datosPersonales: (t: Trabajador) => [
    ...validarDatosPersonales(t),
    ...validarContacto(t),
    ...validarDomicilio(t),
  ],
  laboral: (t: Trabajador) => validarDatosLaborales(t),
  administracion: (t: Trabajador) => [
    ...validarDatosAdministrativos(t),
    ...validarTallasEPP(t),
  ],
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

export const puedePasoSiguiente = (
  t: Trabajador,
  fase: keyof typeof validacionesPorFase
): boolean => {
  return validacionesPorFase[fase](t).every((v) => v.valido);
};

export const obtenerErroresPendientes = (
  t: Trabajador,
  fase: keyof typeof validacionesPorFase
): string[] => {
  return validacionesPorFase[fase](t)
    .filter((v) => !v.valido && v.error)
    .map((v) => v.error as string);
};

export const getCompletitudPorcentaje = (t: Trabajador): number => {
  return validarTrabajadorCompleto(t).porcentajeCompletitud;
};
