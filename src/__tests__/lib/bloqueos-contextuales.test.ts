import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Trabajador } from "@/store/trabajadores-store";
import type {
  CicloVidaTrabajador,
  EstadoCicloVida,
} from "@/store/ciclo-vida-store";
import {
  getAlertasUrgencia,
  getEstadoLaboralDerivado,
  puedeAsignarActivos,
  puedeModificarTrabajador,
  puedeRegistrarAsistencia,
  puedeRegistrarExamen,
  puedeSolicitarPermiso,
} from "@/lib/bloqueos-contextuales";

const HOY = new Date("2026-06-14T00:00:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOY);
});

afterEach(() => {
  vi.useRealTimers();
});

function trabajador(overrides: Partial<Trabajador> = {}): Trabajador {
  return {
    id_trabajador: "t-1",
    apellido_paterno: "Perez",
    apellido_materno: "Lopez",
    nombre_1: "Juan",
    sexo: "M",
    fecha_nacimiento: "1990-01-01",
    nacionalidad: "Chilena",
    tipo_identificacion: "RUT",
    numero_identificacion: "12345678-9",
    email_corporativo: "juan@portal.cl",
    celular_personal: "+56912345678",
    fecha_ingreso: "2025-01-15",
    tipo_contrato: "Indefinido",
    modalidad_trabajo: "Presencial",
    banco: "Banco de Chile",
    afp: "Modelo",
    ...overrides,
  };
}

function ciclo(estado: EstadoCicloVida): CicloVidaTrabajador {
  return {
    id: "cv-1",
    id_trabajador: "t-1",
    estado_actual: estado,
    historial: [],
    updated_at: HOY.toISOString(),
  };
}

describe("puedeRegistrarAsistencia", () => {
  it("bloquea cuando no hay trabajador", () => {
    const r = puedeRegistrarAsistencia(null, ciclo("activo"));
    expect(r.bloqueado).toBe(true);
    expect(r.razon).toContain("no encontrado");
  });

  it("bloquea cuando no hay ciclo y sugiere contactar Administracion", () => {
    const r = puedeRegistrarAsistencia(trabajador(), null);
    expect(r.bloqueado).toBe(true);
    expect(r.accion_recomendada).toContain("Administraci");
  });

  it("bloquea cuando el ciclo no esta en activo", () => {
    const r = puedeRegistrarAsistencia(trabajador(), ciclo("pre_incorporacion"));
    expect(r.bloqueado).toBe(true);
    expect(r.razon).toContain("pre_incorporacion");
  });

  it("permite cuando el trabajador esta activo", () => {
    const r = puedeRegistrarAsistencia(trabajador(), ciclo("activo"));
    expect(r.bloqueado).toBe(false);
  });
});

describe("puedeAsignarActivos", () => {
  it("bloquea vehiculo sin licencia registrada", () => {
    const r = puedeAsignarActivos(
      trabajador({ vencimiento_licencia_conducir: undefined }),
      ciclo("activo"),
      "vehiculo"
    );
    expect(r.bloqueado).toBe(true);
    expect(r.razon).toContain("Sin licencia");
  });

  it("bloquea vehiculo con licencia vencida", () => {
    const r = puedeAsignarActivos(
      trabajador({ vencimiento_licencia_conducir: "2025-01-01T00:00:00" }),
      ciclo("activo"),
      "vehiculo"
    );
    expect(r.bloqueado).toBe(true);
    expect(r.razon).toContain("vencida");
  });

  it("permite vehiculo con licencia vigente y ciclo activo", () => {
    const r = puedeAsignarActivos(
      trabajador({ vencimiento_licencia_conducir: "2027-01-01T00:00:00" }),
      ciclo("activo"),
      "vehiculo"
    );
    expect(r.bloqueado).toBe(false);
  });

  it("permite notebook ignorando licencia de conducir", () => {
    const r = puedeAsignarActivos(
      trabajador({ vencimiento_licencia_conducir: undefined }),
      ciclo("activo"),
      "notebook"
    );
    expect(r.bloqueado).toBe(false);
  });

  it("bloquea cualquier asignacion si el ciclo no es activo", () => {
    const r = puedeAsignarActivos(
      trabajador(),
      ciclo("pre_incorporacion"),
      "notebook"
    );
    expect(r.bloqueado).toBe(true);
  });
});

describe("puedeSolicitarPermiso", () => {
  it("bloquea sin trabajador", () => {
    expect(puedeSolicitarPermiso(null, ciclo("activo")).bloqueado).toBe(true);
  });

  it("bloquea sin ciclo", () => {
    expect(puedeSolicitarPermiso(trabajador(), null).bloqueado).toBe(true);
  });

  it("bloquea si no esta activo", () => {
    expect(
      puedeSolicitarPermiso(trabajador(), ciclo("baja")).bloqueado
    ).toBe(true);
  });

  it("permite si esta activo", () => {
    expect(
      puedeSolicitarPermiso(trabajador(), ciclo("activo")).bloqueado
    ).toBe(false);
  });
});

describe("puedeRegistrarExamen", () => {
  it("bloquea sin trabajador", () => {
    expect(puedeRegistrarExamen(null).bloqueado).toBe(true);
  });

  it("bloquea cuando faltan apellido o nombre", () => {
    expect(
      puedeRegistrarExamen(trabajador({ apellido_paterno: "" })).bloqueado
    ).toBe(true);
    expect(
      puedeRegistrarExamen(trabajador({ nombre_1: "" })).bloqueado
    ).toBe(true);
  });

  it("permite con datos minimos", () => {
    expect(puedeRegistrarExamen(trabajador()).bloqueado).toBe(false);
  });
});

describe("puedeModificarTrabajador", () => {
  it("permite cuando no hay ciclo (recien creado)", () => {
    expect(
      puedeModificarTrabajador(trabajador(), null).bloqueado
    ).toBe(false);
  });

  it("bloquea cuando esta en baja", () => {
    expect(
      puedeModificarTrabajador(trabajador(), ciclo("baja")).bloqueado
    ).toBe(true);
  });

  it("bloquea cuando esta archivado", () => {
    expect(
      puedeModificarTrabajador(trabajador(), ciclo("archivado")).bloqueado
    ).toBe(true);
  });

  it("permite cuando esta activo", () => {
    expect(
      puedeModificarTrabajador(trabajador(), ciclo("activo")).bloqueado
    ).toBe(false);
  });
});

describe("getEstadoLaboralDerivado", () => {
  it("retorna 'nuevo' como fallback cuando falta trabajador o ciclo", () => {
    expect(getEstadoLaboralDerivado(null, null).estado).toBe("nuevo");
    expect(getEstadoLaboralDerivado(trabajador(), null).estado).toBe("nuevo");
  });

  it("mapea estados conocidos a su derivado correcto", () => {
    const t = trabajador();
    expect(getEstadoLaboralDerivado(t, ciclo("activo")).estado).toBe(
      "operativo"
    );
    expect(
      getEstadoLaboralDerivado(t, ciclo("pre_incorporacion")).estado
    ).toBe("incorporando");
    expect(getEstadoLaboralDerivado(t, ciclo("baja")).estado).toBe(
      "inactivo"
    );
    expect(getEstadoLaboralDerivado(t, ciclo("archivado")).estado).toBe(
      "inactivo"
    );
    expect(getEstadoLaboralDerivado(t, ciclo("cambio_rol")).estado).toBe(
      "transitando"
    );
  });

  it("estado 'activo' permite todas las acciones operativas", () => {
    const r = getEstadoLaboralDerivado(trabajador(), ciclo("activo"));
    expect(r.acciones_permitidas).toContain("asistencia");
    expect(r.acciones_permitidas).toContain("permisos");
    expect(r.acciones_permitidas).toContain("activos");
    expect(r.acciones_bloqueadas).toEqual([]);
  });

  it("estado 'baja' bloquea operaciones criticas", () => {
    const r = getEstadoLaboralDerivado(trabajador(), ciclo("baja"));
    expect(r.acciones_bloqueadas).toContain("asistencia");
    expect(r.acciones_bloqueadas).toContain("editar_datos");
  });
});

describe("getAlertasUrgencia", () => {
  it("retorna lista vacia sin trabajador o ciclo", () => {
    expect(getAlertasUrgencia(null, null)).toEqual([]);
    expect(getAlertasUrgencia(trabajador(), null)).toEqual([]);
  });

  it("emite alerta de licencia vencida con nivel critica", () => {
    const t = trabajador({
      vencimiento_licencia_conducir: "2025-01-01T00:00:00",
    });
    const alertas = getAlertasUrgencia(t, ciclo("activo"));
    const lic = alertas.find((a) => a.titulo.includes("Licencia"));
    expect(lic?.nivel).toBe("critica");
  });

  it("emite alerta de licencia por vencer (< 30 dias) con nivel advertencia", () => {
    const t = trabajador({
      vencimiento_licencia_conducir: "2026-06-25T00:00:00",
    });
    const alertas = getAlertasUrgencia(t, ciclo("activo"));
    const lic = alertas.find((a) => a.titulo.includes("Licencia"));
    expect(lic?.nivel).toBe("advertencia");
    expect(lic?.descripcion).toContain("11");
  });

  it("no emite alerta de licencia cuando vence en > 30 dias", () => {
    const t = trabajador({
      vencimiento_licencia_conducir: "2027-01-01T00:00:00",
    });
    const alertas = getAlertasUrgencia(t, ciclo("activo"));
    expect(alertas.find((a) => a.titulo.includes("Licencia"))).toBeUndefined();
  });

  it("emite alerta de onboarding incompleto solo en pre_incorporacion", () => {
    const t = trabajador();
    const sinAlerta = getAlertasUrgencia(t, ciclo("activo"), 50);
    expect(
      sinAlerta.find((a) => a.titulo.includes("Onboarding"))
    ).toBeUndefined();

    const conAlerta = getAlertasUrgencia(t, ciclo("pre_incorporacion"), 50);
    expect(
      conAlerta.find((a) => a.titulo.includes("Onboarding"))
    ).toBeDefined();
  });

  it("emite alerta de datos incompletos cuando faltan email/banco/afp", () => {
    const t = trabajador({
      email_corporativo: "",
      banco: undefined,
      afp: undefined,
    });
    const alertas = getAlertasUrgencia(t, ciclo("activo"));
    const datos = alertas.find((a) => a.titulo === "Datos incompletos");
    expect(datos).toBeDefined();
    expect(datos?.descripcion).toContain("Email");
    expect(datos?.descripcion).toContain("Datos bancarios");
    expect(datos?.descripcion).toContain("AFP");
  });
});
