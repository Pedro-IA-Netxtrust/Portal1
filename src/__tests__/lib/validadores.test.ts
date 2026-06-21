import { describe, expect, it } from "vitest";
import type { Trabajador } from "@/store/trabajadores-store";
import {
  getCompletitudPorcentaje,
  obtenerErroresPendientes,
  puedePasoSiguiente,
  validacionesPorFase,
  validarContacto,
  validarDatosPersonales,
  validarTrabajadorCompleto,
} from "@/lib/validadores";

/**
 * Construye un Trabajador con todos los campos vacios. Usamos `as Trabajador`
 * porque el tipo tiene campos no opcionales que justamente queremos probar
 * cuando estan vacios.
 */
function makeEmpty(): Trabajador {
  // Forzamos los enums a string vacio para simular el escenario de un
  // formulario donde el usuario aun no ha tocado ningun campo. El cast `as
  // unknown as ...` se aplica porque los enums no admiten "" en su tipo,
  // pero el validador igual tiene que detectar que esta vacio.
  return {
    id_trabajador: "t-test",
    apellido_paterno: "",
    apellido_materno: "",
    nombre_1: "",
    sexo: "" as unknown as Trabajador["sexo"],
    fecha_nacimiento: "",
    nacionalidad: "",
    tipo_identificacion: "" as unknown as Trabajador["tipo_identificacion"],
    numero_identificacion: "",
    email_corporativo: "",
    celular_personal: "",
    fecha_ingreso: "",
    tipo_contrato: "" as unknown as Trabajador["tipo_contrato"],
    modalidad_trabajo: "" as unknown as Trabajador["modalidad_trabajo"],
  } as Trabajador;
}

function makeFull(): Trabajador {
  return {
    ...makeEmpty(),
    // Enums repoblados explicitamente sobre el "empty".
    sexo: "M",
    tipo_identificacion: "RUT",
    tipo_contrato: "Indefinido",
    modalidad_trabajo: "Presencial",
    apellido_paterno: "Perez",
    apellido_materno: "Lopez",
    nombre_1: "Juan",
    fecha_nacimiento: "1990-01-01",
    nacionalidad: "Chilena",
    numero_identificacion: "12345678-9",
    email_corporativo: "juan@portal.cl",
    celular_personal: "+56912345678",
    region: "Metropolitana",
    comuna: "Santiago",
    calle: "Av. Siempre Viva",
    numero_domicilio: "742",
    cargo: "Operador",
    area_departamento: "Operaciones",
    fecha_ingreso: "2025-01-15",
    banco: "Banco de Chile",
    tipo_cuenta: "Corriente",
    numero_cuenta: "00012345",
    afp: "Modelo",
    sistema_salud: "Fonasa",
    talla_chaqueta: "M",
    talla_polera: "M",
    calzado_seguridad: "42",
  };
}

describe("validarDatosPersonales", () => {
  it("retorna todos los campos invalidos cuando estan vacios", () => {
    const t = makeEmpty();
    const validaciones = validarDatosPersonales(t);
    expect(validaciones).toHaveLength(6);
    expect(validaciones.every((v) => !v.valido)).toBe(true);
    expect(validaciones.every((v) => typeof v.error === "string")).toBe(true);
  });

  it("retorna todos validos cuando los campos estan poblados", () => {
    const t = makeFull();
    const validaciones = validarDatosPersonales(t);
    expect(validaciones.every((v) => v.valido)).toBe(true);
    expect(validaciones.every((v) => v.error === undefined)).toBe(true);
  });

  it("trata strings con solo whitespace como invalidos", () => {
    const t = makeFull();
    t.apellido_paterno = "   ";
    const validaciones = validarDatosPersonales(t);
    const apellido = validaciones.find((v) => v.campo === "apellido_paterno");
    expect(apellido?.valido).toBe(false);
  });
});

describe("validarContacto", () => {
  it("rechaza email sin @ con error 'invalido'", () => {
    const t = makeFull();
    t.email_corporativo = "no-es-email";
    const [emailCheck] = validarContacto(t);
    expect(emailCheck.valido).toBe(false);
    expect(emailCheck.error?.toLowerCase()).toContain("inv");
  });

  it("acepta email valido con @", () => {
    const t = makeFull();
    const [emailCheck] = validarContacto(t);
    expect(emailCheck.valido).toBe(true);
  });

  it("rechaza email vacio con error 'requerido'", () => {
    const t = makeFull();
    t.email_corporativo = "";
    const [emailCheck] = validarContacto(t);
    expect(emailCheck.valido).toBe(false);
    expect(emailCheck.error).toContain("requerido");
  });
});

describe("validarTrabajadorCompleto - regresion B9", () => {
  /**
   * Bug B9: el trabajador con TODOS los campos vacios reportaba 0%, pero
   * un trabajador con TODOS los campos poblados tenia que llegar a 100%.
   * Antes el porcentaje saltaba directo de 0 a algun valor sin escalar.
   */
  it("trabajador completamente vacio reporta 0%", () => {
    const t = makeEmpty();
    const r = validarTrabajadorCompleto(t);
    expect(r.porcentajeCompletitud).toBe(0);
    expect(r.valido).toBe(false);
    expect(r.errores.length).toBeGreaterThan(0);
  });

  it("trabajador completamente poblado reporta 100%", () => {
    const t = makeFull();
    const r = validarTrabajadorCompleto(t);
    expect(r.porcentajeCompletitud).toBe(100);
    expect(r.valido).toBe(true);
    expect(r.errores).toEqual([]);
  });

  it("porcentaje crece progresivamente (no salta de 0 a 100)", () => {
    const empty = makeEmpty();
    const full = makeFull();

    // Construimos un trabajador parcial: solo datos personales y contacto.
    const half = makeFull();
    // Limpiamos secciones para reducir el porcentaje.
    half.banco = undefined;
    half.tipo_cuenta = undefined;
    half.numero_cuenta = undefined;
    half.afp = undefined;
    half.sistema_salud = undefined;
    half.talla_chaqueta = undefined;
    half.talla_polera = undefined;
    half.calzado_seguridad = undefined;

    const pe = validarTrabajadorCompleto(empty).porcentajeCompletitud;
    const ph = validarTrabajadorCompleto(half).porcentajeCompletitud;
    const pf = validarTrabajadorCompleto(full).porcentajeCompletitud;

    expect(pe).toBeLessThan(ph);
    expect(ph).toBeLessThan(pf);
    expect(pf).toBe(100);
  });
});

describe("puedePasoSiguiente", () => {
  it("retorna true cuando todos los campos de la fase son validos", () => {
    const t = makeFull();
    expect(puedePasoSiguiente(t, "datosPersonales")).toBe(true);
    expect(puedePasoSiguiente(t, "laboral")).toBe(true);
    expect(puedePasoSiguiente(t, "administracion")).toBe(true);
  });

  it("retorna false cuando falta cualquier campo de la fase", () => {
    const t = makeFull();
    t.cargo = "";
    expect(puedePasoSiguiente(t, "laboral")).toBe(false);
    expect(puedePasoSiguiente(t, "datosPersonales")).toBe(true);
  });
});

describe("obtenerErroresPendientes", () => {
  it("retorna solo los errores de campos invalidos en la fase", () => {
    const t = makeFull();
    t.cargo = "";
    t.fecha_ingreso = "";

    const errores = obtenerErroresPendientes(t, "laboral");
    expect(errores).toContain("Cargo requerido");
    expect(errores).toContain("Fecha de ingreso requerida");
    expect(errores).not.toContain("Apellido paterno requerido");
  });

  it("retorna lista vacia cuando todo esta valido", () => {
    const t = makeFull();
    expect(obtenerErroresPendientes(t, "datosPersonales")).toEqual([]);
    expect(obtenerErroresPendientes(t, "laboral")).toEqual([]);
    expect(obtenerErroresPendientes(t, "administracion")).toEqual([]);
  });
});

describe("validacionesPorFase", () => {
  it("la fase datosPersonales agrupa personales + contacto + domicilio", () => {
    const t = makeFull();
    const validaciones = validacionesPorFase.datosPersonales(t);
    // Datos personales (6) + contacto (2) + domicilio (4) = 12 entradas.
    expect(validaciones).toHaveLength(12);
    expect(validaciones.every((v) => v.valido)).toBe(true);
  });

  it("la fase administracion agrupa administrativo + tallas EPP", () => {
    const t = makeFull();
    const validaciones = validacionesPorFase.administracion(t);
    // Administrativo (5) + tallas EPP (3) = 8 entradas.
    expect(validaciones).toHaveLength(8);
    expect(validaciones.every((v) => v.valido)).toBe(true);
  });
});

describe("getCompletitudPorcentaje", () => {
  it("delega correctamente a validarTrabajadorCompleto", () => {
    expect(getCompletitudPorcentaje(makeEmpty())).toBe(0);
    expect(getCompletitudPorcentaje(makeFull())).toBe(100);
  });
});
