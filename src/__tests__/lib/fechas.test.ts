import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SIN_VENCIMIENTO,
  diasRestantes,
  estaVencido,
  venceEn,
} from "@/lib/fechas";

// Usamos formato "YYYY-MM-DDTHH:mm:ss" SIN sufijo Z para que el constructor
// `new Date(...)` lo interprete como hora local. Eso evita ruido por la
// zona horaria de la maquina de CI.
const HOY = new Date("2026-06-14T00:00:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("diasRestantes", () => {
  it("retorna SIN_VENCIMIENTO cuando dateStr es nulo o vacio", () => {
    expect(diasRestantes(null)).toBe(SIN_VENCIMIENTO);
    expect(diasRestantes(undefined)).toBe(SIN_VENCIMIENTO);
    expect(diasRestantes("")).toBe(SIN_VENCIMIENTO);
  });

  it("retorna SIN_VENCIMIENTO cuando la fecha es invalida", () => {
    expect(diasRestantes("no-es-una-fecha")).toBe(SIN_VENCIMIENTO);
    expect(diasRestantes("2026-13-99")).toBe(SIN_VENCIMIENTO);
  });

  it("retorna 0 cuando la fecha es hoy", () => {
    expect(diasRestantes("2026-06-14T00:00:00")).toBe(0);
  });

  it("retorna positivo cuando la fecha es futura", () => {
    expect(diasRestantes("2026-06-21T00:00:00")).toBe(7);
    expect(diasRestantes("2026-07-14T00:00:00")).toBe(30);
  });

  it("retorna negativo cuando la fecha ya paso", () => {
    expect(diasRestantes("2026-06-13T00:00:00")).toBe(-1);
    expect(diasRestantes("2026-05-15T00:00:00")).toBe(-30);
  });

  it("normaliza la hora a 00:00 local: tarde de hoy sigue siendo hoy", () => {
    expect(diasRestantes("2026-06-14T23:59:59")).toBe(0);
  });
});

describe("estaVencido", () => {
  it("retorna false para nulo/indefinido (sin vencimiento conocido)", () => {
    expect(estaVencido(null)).toBe(false);
    expect(estaVencido(undefined)).toBe(false);
  });

  it("retorna false para fechas futuras", () => {
    expect(estaVencido("2026-07-01T00:00:00")).toBe(false);
  });

  it("retorna false cuando vence hoy (no es < 0)", () => {
    expect(estaVencido("2026-06-14T00:00:00")).toBe(false);
  });

  it("retorna true cuando ya paso", () => {
    expect(estaVencido("2026-06-13T00:00:00")).toBe(true);
    expect(estaVencido("2025-12-31T00:00:00")).toBe(true);
  });
});

describe("venceEn", () => {
  it("retorna false cuando dateStr es nulo o indefinido", () => {
    expect(venceEn(null, 30)).toBe(false);
    expect(venceEn(undefined, 30)).toBe(false);
  });

  it("retorna true cuando el vencimiento esta dentro del rango", () => {
    expect(venceEn("2026-06-14T00:00:00", 30)).toBe(true);
    expect(venceEn("2026-07-14T00:00:00", 30)).toBe(true);
    expect(venceEn("2026-06-21T00:00:00", 7)).toBe(true);
  });

  it("retorna true para fechas ya vencidas (siempre <= dias)", () => {
    expect(venceEn("2026-05-01T00:00:00", 30)).toBe(true);
  });

  it("retorna false cuando el vencimiento queda fuera del rango", () => {
    expect(venceEn("2026-07-15T00:00:00", 30)).toBe(false);
    expect(venceEn("2026-06-22T00:00:00", 7)).toBe(false);
  });
});
