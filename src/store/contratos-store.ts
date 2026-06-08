import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { useAuditoriaStore } from "@/store/auditoria-store";

// ─────────────────────────────────────────────────────────────
//  Sub-entities
// ─────────────────────────────────────────────────────────────

export interface CentroCosto {
  id_cc: string;
  codigo_cc: string;
  nombre_cc: string;
}

export interface ContratoUnidad {
  id_unidad: string;
  nombre: string;
  descripcion?: string;
  id_jefe_trabajador?: string;
  nombre_jefe?: string;
  activa: boolean;
}

export interface ContratoCargo {
  id_cargo: string;
  nombre: string;
  nivel: "Operativo" | "Supervisión" | "Jefatura" | "Gerencia";
  id_unidad?: string;
  activo: boolean;
}

export interface ContratoTrabajador {
  id_asignacion: string;
  id_trabajador: string;
  nombre: string;
  rut?: string;
  id_unidad?: string;
  nombre_unidad?: string;
  id_cargo?: string;
  nombre_cargo?: string;
  nivel?: string;
  fecha_ingreso: string;
  fecha_salida?: string;
  activo: boolean;
  motivo_baja?: string;
}

export type TipoMovimiento =
  | "Ingreso"
  | "Reasignación"
  | "Baja"
  | "Cambio Cargo"
  | "Nueva Unidad"
  | "Nuevo Cargo"
  | "Edición Contrato"
  | "Activación"
  | "Suspensión";

export interface MovimientoHistorial {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  id_trabajador?: string;
  nombre_trabajador?: string;
  detalle: string;
  usuario_accion: string;
}

export interface Contrato {
  id_contrato: string;
  codigo_contrato: string;
  nombre_contrato: string;
  id_mandante: string;
  estado: "Activo" | "Cerrado" | "En Preparación" | "Suspendido";
  fecha_inicio: string;
  fecha_termino: string;
  centros_costo: CentroCosto[];
  unidades: ContratoUnidad[];
  cargos: ContratoCargo[];
  trabajadores_asignados: ContratoTrabajador[];
  proveedores_asignados: { id_proveedor: string; categoria: string }[];
  historial: MovimientoHistorial[];
}

// ─────────────────────────────────────────────────────────────
//  Helpers de fecha
// ─────────────────────────────────────────────────────────────

const d = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString();
const ds = (y: number, m: number, day: number) => new Date(y, m - 1, day).toISOString();

// ─────────────────────────────────────────────────────────────
//  Mock data — 4 contratos con datos ricos
// ─────────────────────────────────────────────────────────────

const mockContratos: Contrato[] = [

  // ── CONTRATO 1: Zona Norte — Minera Escondida ─────────────────
  {
    id_contrato: "c-1",
    codigo_contrato: "MON-2026-NTE",
    nombre_contrato: "Servicio Monitoreo Zona Norte",
    id_mandante: "m-1",
    estado: "Activo",
    fecha_inicio: "2026-01-01",
    fecha_termino: "2027-12-31",
    centros_costo: [
      { id_cc: "cc-1", codigo_cc: "CC-4500", nombre_cc: "CC Soporte Operativo Norte" },
      { id_cc: "cc-2", codigo_cc: "CC-4510", nombre_cc: "CC Administración Norte" },
      { id_cc: "cc-3", codigo_cc: "CC-4520", nombre_cc: "CC Seguridad y Prevención" }
    ],
    unidades: [
      {
        id_unidad: "u-1",
        nombre: "Unidad de Control Terreno",
        descripcion: "Supervisión de operaciones en terreno y faena activa",
        id_jefe_trabajador: "t-1",
        nombre_jefe: "Andrés Muñoz",
        activa: true
      },
      {
        id_unidad: "u-2",
        nombre: "Unidad de Ingeniería Operacional",
        descripcion: "Soporte técnico, análisis de datos y mejora continua",
        activa: true
      },
      {
        id_unidad: "u-3",
        nombre: "Unidad de Seguridad y Salud",
        descripcion: "Gestión de riesgos, EPP y cumplimiento normativo",
        activa: true
      }
    ],
    cargos: [
      { id_cargo: "cg-1", nombre: "Jefe de Contrato",           nivel: "Gerencia",    id_unidad: "u-1", activo: true },
      { id_cargo: "cg-2", nombre: "Supervisor de Terreno",       nivel: "Supervisión", id_unidad: "u-1", activo: true },
      { id_cargo: "cg-3", nombre: "Técnico en Control de Calidad", nivel: "Operativo", id_unidad: "u-1", activo: true },
      { id_cargo: "cg-4", nombre: "Ingeniero Civil Operaciones", nivel: "Jefatura",   id_unidad: "u-2", activo: true },
      { id_cargo: "cg-5", nombre: "Analista de Datos",           nivel: "Operativo",  id_unidad: "u-2", activo: true },
      { id_cargo: "cg-6", nombre: "Prevencionista de Riesgos",   nivel: "Supervisión", id_unidad: "u-3", activo: true }
    ],
    proveedores_asignados: [
      { id_proveedor: "prov-1", categoria: "Alimentación" },
      { id_proveedor: "prov-3", categoria: "Tecnología" }
    ],
    trabajadores_asignados: [
      {
        id_asignacion: "as-1",
        id_trabajador: "t-1",
        nombre: "Andrés Muñoz",
        rut: "17.489.125-K",
        id_unidad: "u-1", nombre_unidad: "Unidad de Control Terreno",
        id_cargo: "cg-2", nombre_cargo: "Supervisor de Terreno",
        nivel: "Supervisión",
        fecha_ingreso: "2026-01-01",
        activo: true
      },
      {
        id_asignacion: "as-2",
        id_trabajador: "t-2",
        nombre: "Valentina Gómez",
        rut: "25.321.456",
        id_unidad: "u-1", nombre_unidad: "Unidad de Control Terreno",
        id_cargo: "cg-3", nombre_cargo: "Técnico en Control de Calidad",
        nivel: "Operativo",
        fecha_ingreso: "2026-01-15",
        activo: true
      },
      {
        id_asignacion: "as-3",
        id_trabajador: "t-3",
        nombre: "Felipe Rojas",
        rut: "18.567.234-5",
        id_unidad: "u-2", nombre_unidad: "Unidad de Ingeniería Operacional",
        id_cargo: "cg-4", nombre_cargo: "Ingeniero Civil Operaciones",
        nivel: "Jefatura",
        fecha_ingreso: "2026-01-01",
        activo: true
      },
      {
        id_asignacion: "as-4",
        id_trabajador: "t-4",
        nombre: "Camila Torres",
        rut: "19.234.876-3",
        id_unidad: "u-2", nombre_unidad: "Unidad de Ingeniería Operacional",
        id_cargo: "cg-5", nombre_cargo: "Analista de Datos",
        nivel: "Operativo",
        fecha_ingreso: "2026-02-01",
        activo: true
      },
      {
        id_asignacion: "as-5",
        id_trabajador: "t-5",
        nombre: "Diego Herrera",
        rut: "20.345.987-1",
        id_unidad: "u-3", nombre_unidad: "Unidad de Seguridad y Salud",
        id_cargo: "cg-6", nombre_cargo: "Prevencionista de Riesgos",
        nivel: "Supervisión",
        fecha_ingreso: "2026-01-20",
        activo: true
      },
      {
        id_asignacion: "as-6",
        id_trabajador: "t-6",
        nombre: "Rodrigo Saavedra",
        rut: "16.789.012-4",
        id_unidad: "u-1", nombre_unidad: "Unidad de Control Terreno",
        id_cargo: "cg-3", nombre_cargo: "Técnico en Control de Calidad",
        nivel: "Operativo",
        fecha_ingreso: "2026-01-10",
        fecha_salida: "2026-04-30",
        activo: false,
        motivo_baja: "Renuncia voluntaria"
      }
    ],
    historial: [
      { id: "h-1", fecha: ds(2026,1,1),  tipo: "Edición Contrato", detalle: "Contrato MON-2026-NTE creado con 2 unidades y 5 cargos.", usuario_accion: "Operador General" },
      { id: "h-2", fecha: ds(2026,1,1),  tipo: "Ingreso", id_trabajador: "t-1", nombre_trabajador: "Andrés Muñoz",    detalle: "Andrés Muñoz asignado como Supervisor de Terreno — Unidad de Control Terreno.", usuario_accion: "Operador General" },
      { id: "h-3", fecha: ds(2026,1,1),  tipo: "Ingreso", id_trabajador: "t-3", nombre_trabajador: "Felipe Rojas",    detalle: "Felipe Rojas asignado como Ingeniero Civil Operaciones — Unidad de Ingeniería.", usuario_accion: "Operador General" },
      { id: "h-4", fecha: ds(2026,1,10), tipo: "Ingreso", id_trabajador: "t-6", nombre_trabajador: "Rodrigo Saavedra", detalle: "Rodrigo Saavedra asignado como Técnico en Control de Calidad — Unidad de Control Terreno.", usuario_accion: "Operador General" },
      { id: "h-5", fecha: ds(2026,1,15), tipo: "Ingreso", id_trabajador: "t-2", nombre_trabajador: "Valentina Gómez", detalle: "Valentina Gómez asignada como Técnico en Control de Calidad — Unidad de Control Terreno.", usuario_accion: "Operador General" },
      { id: "h-6", fecha: ds(2026,1,20), tipo: "Ingreso", id_trabajador: "t-5", nombre_trabajador: "Diego Herrera",   detalle: "Diego Herrera asignado como Prevencionista de Riesgos — Unidad de Seguridad y Salud.", usuario_accion: "Operador General" },
      { id: "h-7", fecha: ds(2026,2,1),  tipo: "Ingreso", id_trabajador: "t-4", nombre_trabajador: "Camila Torres",  detalle: "Camila Torres asignada como Analista de Datos — Unidad de Ingeniería Operacional.", usuario_accion: "Operador General" },
      { id: "h-8", fecha: ds(2026,2,15), tipo: "Nueva Unidad", detalle: "Unidad de Seguridad y Salud creada en el contrato.", usuario_accion: "Operador General" },
      { id: "h-9", fecha: ds(2026,3,10), tipo: "Reasignación", id_trabajador: "t-1", nombre_trabajador: "Andrés Muñoz", detalle: "Andrés Muñoz reasignado de Técnico en Control de Calidad a Supervisor de Terreno. Cobertura de vacante.", usuario_accion: "Operador General" },
      { id: "h-10", fecha: ds(2026,4,30), tipo: "Baja", id_trabajador: "t-6", nombre_trabajador: "Rodrigo Saavedra", detalle: "Rodrigo Saavedra dado de baja del contrato. Motivo: Renuncia voluntaria", usuario_accion: "Operador General" }
    ]
  },

  // ── CONTRATO 2: Zona Sur — Celulosa Arauco ────────────────────
  {
    id_contrato: "c-2",
    codigo_contrato: "MON-2026-SUR",
    nombre_contrato: "Servicio Integrado Zona Sur",
    id_mandante: "m-2",
    estado: "Activo",
    fecha_inicio: "2025-06-01",
    fecha_termino: "2026-06-30",
    centros_costo: [
      { id_cc: "cc-10", codigo_cc: "CC-5200", nombre_cc: "CC Control Ambiental Sur" },
      { id_cc: "cc-11", codigo_cc: "CC-5210", nombre_cc: "CC Operaciones Forestales" }
    ],
    unidades: [
      { id_unidad: "u-10", nombre: "Unidad de Monitoreo Ambiental", descripcion: "Control de emisiones, calidad de agua y biodiversidad", activa: true },
      { id_unidad: "u-11", nombre: "Unidad de Operaciones Forestales", descripcion: "Coordinación de corte, reforestación y trazabilidad de madera", activa: true }
    ],
    cargos: [
      { id_cargo: "cg-10", nombre: "Coordinador Ambiental",  nivel: "Jefatura",   id_unidad: "u-10", activo: true },
      { id_cargo: "cg-11", nombre: "Técnico Ambiental",      nivel: "Operativo",  id_unidad: "u-10", activo: true },
      { id_cargo: "cg-12", nombre: "Analista SIG",           nivel: "Operativo",  id_unidad: "u-10", activo: true },
      { id_cargo: "cg-13", nombre: "Supervisor Forestal",    nivel: "Supervisión", id_unidad: "u-11", activo: true },
      { id_cargo: "cg-14", nombre: "Operador Maquinaria",    nivel: "Operativo",  id_unidad: "u-11", activo: true }
    ],
    proveedores_asignados: [
      { id_proveedor: "prov-2", categoria: "Alimentación" },
      { id_proveedor: "prov-4", categoria: "Vehículos" }
    ],
    trabajadores_asignados: [
      {
        id_asignacion: "as-10",
        id_trabajador: "t-7",
        nombre: "Sofía Ramírez",
        rut: "21.456.789-2",
        id_unidad: "u-10", nombre_unidad: "Unidad de Monitoreo Ambiental",
        id_cargo: "cg-10", nombre_cargo: "Coordinador Ambiental",
        nivel: "Jefatura",
        fecha_ingreso: "2025-06-01",
        activo: true
      },
      {
        id_asignacion: "as-11",
        id_trabajador: "t-8",
        nombre: "Matías Vidal",
        rut: "22.567.890-1",
        id_unidad: "u-10", nombre_unidad: "Unidad de Monitoreo Ambiental",
        id_cargo: "cg-11", nombre_cargo: "Técnico Ambiental",
        nivel: "Operativo",
        fecha_ingreso: "2025-06-15",
        activo: true
      },
      {
        id_asignacion: "as-12",
        id_trabajador: "t-9",
        nombre: "Ignacio Pino",
        rut: "23.678.901-0",
        id_unidad: "u-11", nombre_unidad: "Unidad de Operaciones Forestales",
        id_cargo: "cg-13", nombre_cargo: "Supervisor Forestal",
        nivel: "Supervisión",
        fecha_ingreso: "2025-07-01",
        activo: true
      },
      {
        id_asignacion: "as-13",
        id_trabajador: "t-2",
        nombre: "Valentina Gómez",
        rut: "25.321.456",
        id_unidad: "u-10", nombre_unidad: "Unidad de Monitoreo Ambiental",
        id_cargo: "cg-12", nombre_cargo: "Analista SIG",
        nivel: "Operativo",
        fecha_ingreso: "2025-08-01",
        fecha_salida: "2026-01-14",
        activo: false,
        motivo_baja: "Transferencia a contrato MON-2026-NTE"
      }
    ],
    historial: [
      { id: "h-20", fecha: ds(2025,6,1),  tipo: "Edición Contrato", detalle: "Contrato MON-2026-SUR creado. 1 unidad inicial.", usuario_accion: "Operador General" },
      { id: "h-21", fecha: ds(2025,6,1),  tipo: "Ingreso", id_trabajador: "t-7", nombre_trabajador: "Sofía Ramírez", detalle: "Sofía Ramírez asignada como Coordinador Ambiental.", usuario_accion: "Operador General" },
      { id: "h-22", fecha: ds(2025,6,15), tipo: "Ingreso", id_trabajador: "t-8", nombre_trabajador: "Matías Vidal",  detalle: "Matías Vidal asignado como Técnico Ambiental.", usuario_accion: "Operador General" },
      { id: "h-23", fecha: ds(2025,7,1),  tipo: "Nueva Unidad", detalle: "Unidad de Operaciones Forestales incorporada al contrato.", usuario_accion: "Operador General" },
      { id: "h-24", fecha: ds(2025,7,1),  tipo: "Ingreso", id_trabajador: "t-9", nombre_trabajador: "Ignacio Pino",  detalle: "Ignacio Pino asignado como Supervisor Forestal.", usuario_accion: "Operador General" },
      { id: "h-25", fecha: ds(2025,8,1),  tipo: "Ingreso", id_trabajador: "t-2", nombre_trabajador: "Valentina Gómez", detalle: "Valentina Gómez asignada como Analista SIG.", usuario_accion: "Operador General" },
      { id: "h-26", fecha: ds(2026,1,14), tipo: "Baja", id_trabajador: "t-2", nombre_trabajador: "Valentina Gómez",  detalle: "Valentina Gómez transferida a contrato MON-2026-NTE. Motivo: Transferencia a contrato MON-2026-NTE", usuario_accion: "Operador General" }
    ]
  },

  // ── CONTRATO 3: Chuquicamata — Codelco ────────────────────────
  {
    id_contrato: "c-3",
    codigo_contrato: "MON-2026-CHQ",
    nombre_contrato: "Operación Chuquicamata — Monitoreo Integral",
    id_mandante: "m-4",
    estado: "Activo",
    fecha_inicio: "2026-03-01",
    fecha_termino: "2028-02-28",
    centros_costo: [
      { id_cc: "cc-20", codigo_cc: "CC-7100", nombre_cc: "CC Monitoreo Ambiental CHQ" },
      { id_cc: "cc-21", codigo_cc: "CC-7110", nombre_cc: "CC Operaciones Mina" },
      { id_cc: "cc-22", codigo_cc: "CC-7120", nombre_cc: "CC Seguridad Industrial" }
    ],
    unidades: [
      { id_unidad: "u-20", nombre: "Unidad de Monitoreo de Polvo",  descripcion: "Control de material particulado y calidad del aire",                    activa: true },
      { id_unidad: "u-21", nombre: "Unidad de Seguridad Industrial", descripcion: "Gestión de riesgos en mina rajo abierto",                              activa: true },
      { id_unidad: "u-22", nombre: "Unidad de Soporte Técnico",      descripcion: "Mantenimiento de equipos de medición y sistemas SCADA",                activa: true },
      { id_unidad: "u-23", nombre: "Unidad de Gestión Hídrica",      descripcion: "Monitoreo de agua de riego y drenaje ácido de mina (DAM)",             activa: false }
    ],
    cargos: [
      { id_cargo: "cg-20", nombre: "Director de Proyecto",         nivel: "Gerencia",    id_unidad: "u-20", activo: true },
      { id_cargo: "cg-21", nombre: "Especialista en Polvo",        nivel: "Jefatura",    id_unidad: "u-20", activo: true },
      { id_cargo: "cg-22", nombre: "Técnico Muestreador",         nivel: "Operativo",   id_unidad: "u-20", activo: true },
      { id_cargo: "cg-23", nombre: "Jefe de Seguridad",           nivel: "Jefatura",    id_unidad: "u-21", activo: true },
      { id_cargo: "cg-24", nombre: "CPHS / Delegado Prevención",  nivel: "Operativo",   id_unidad: "u-21", activo: true },
      { id_cargo: "cg-25", nombre: "Técnico Instrumentista",      nivel: "Operativo",   id_unidad: "u-22", activo: true },
      { id_cargo: "cg-26", nombre: "Ing. de Sistemas SCADA",      nivel: "Supervisión", id_unidad: "u-22", activo: true }
    ],
    proveedores_asignados: [
      { id_proveedor: "prov-1", categoria: "Alimentación" }
    ],
    trabajadores_asignados: [
      { id_asignacion: "as-20", id_trabajador: "t-10", nombre: "Martín Contreras", rut: "14.123.456-7", id_unidad: "u-20", nombre_unidad: "Unidad de Monitoreo de Polvo",  id_cargo: "cg-20", nombre_cargo: "Director de Proyecto", nivel: "Gerencia",    fecha_ingreso: "2026-03-01", activo: true },
      { id_asignacion: "as-21", id_trabajador: "t-11", nombre: "Javiera Medina",  rut: "15.234.567-8", id_unidad: "u-20", nombre_unidad: "Unidad de Monitoreo de Polvo",  id_cargo: "cg-21", nombre_cargo: "Especialista en Polvo", nivel: "Jefatura",   fecha_ingreso: "2026-03-01", activo: true },
      { id_asignacion: "as-22", id_trabajador: "t-12", nombre: "Pablo Cisterna",  rut: "16.345.678-9", id_unidad: "u-20", nombre_unidad: "Unidad de Monitoreo de Polvo",  id_cargo: "cg-22", nombre_cargo: "Técnico Muestreador",    nivel: "Operativo",  fecha_ingreso: "2026-03-15", activo: true },
      { id_asignacion: "as-23", id_trabajador: "t-13", nombre: "Andrea Soto",     rut: "17.456.789-0", id_unidad: "u-21", nombre_unidad: "Unidad de Seguridad Industrial", id_cargo: "cg-23", nombre_cargo: "Jefe de Seguridad",    nivel: "Jefatura",   fecha_ingreso: "2026-03-01", activo: true },
      { id_asignacion: "as-24", id_trabajador: "t-14", nombre: "Luis Fuentes",    rut: "18.567.890-1", id_unidad: "u-21", nombre_unidad: "Unidad de Seguridad Industrial", id_cargo: "cg-24", nombre_cargo: "CPHS / Delegado Prevención", nivel: "Operativo", fecha_ingreso: "2026-04-01", activo: true },
      { id_asignacion: "as-25", id_trabajador: "t-15", nombre: "Karen Núñez",     rut: "19.678.901-2", id_unidad: "u-22", nombre_unidad: "Unidad de Soporte Técnico",     id_cargo: "cg-26", nombre_cargo: "Ing. de Sistemas SCADA", nivel: "Supervisión", fecha_ingreso: "2026-03-01", activo: true },
      { id_asignacion: "as-26", id_trabajador: "t-3",  nombre: "Felipe Rojas",    rut: "18.567.234-5", id_unidad: "u-22", nombre_unidad: "Unidad de Soporte Técnico",     id_cargo: "cg-25", nombre_cargo: "Técnico Instrumentista", nivel: "Operativo",  fecha_ingreso: "2026-05-01", activo: true }
    ],
    historial: [
      { id: "h-30", fecha: ds(2026,3,1),  tipo: "Edición Contrato", detalle: "Contrato MON-2026-CHQ creado. 3 unidades activas, 7 cargos definidos.", usuario_accion: "Operador General" },
      { id: "h-31", fecha: ds(2026,3,1),  tipo: "Ingreso", id_trabajador: "t-10", nombre_trabajador: "Martín Contreras", detalle: "Martín Contreras asignado como Director de Proyecto.", usuario_accion: "Operador General" },
      { id: "h-32", fecha: ds(2026,3,1),  tipo: "Ingreso", id_trabajador: "t-11", nombre_trabajador: "Javiera Medina",  detalle: "Javiera Medina asignada como Especialista en Polvo.",  usuario_accion: "Operador General" },
      { id: "h-33", fecha: ds(2026,3,1),  tipo: "Ingreso", id_trabajador: "t-13", nombre_trabajador: "Andrea Soto",     detalle: "Andrea Soto asignada como Jefe de Seguridad.",         usuario_accion: "Operador General" },
      { id: "h-34", fecha: ds(2026,3,15), tipo: "Ingreso", id_trabajador: "t-12", nombre_trabajador: "Pablo Cisterna",  detalle: "Pablo Cisterna asignado como Técnico Muestreador.",    usuario_accion: "Operador General" },
      { id: "h-35", fecha: ds(2026,3,1),  tipo: "Ingreso", id_trabajador: "t-15", nombre_trabajador: "Karen Núñez",     detalle: "Karen Núñez asignada como Ing. de Sistemas SCADA.",    usuario_accion: "Operador General" },
      { id: "h-36", fecha: ds(2026,4,1),  tipo: "Ingreso", id_trabajador: "t-14", nombre_trabajador: "Luis Fuentes",    detalle: "Luis Fuentes asignado como CPHS / Delegado Prevención.", usuario_accion: "Operador General" },
      { id: "h-37", fecha: ds(2026,4,15), tipo: "Edición Contrato", detalle: "Unidad de Gestión Hídrica desactivada por reorganización del mandante.", usuario_accion: "Operador General" },
      { id: "h-38", fecha: ds(2026,5,1),  tipo: "Ingreso", id_trabajador: "t-3",  nombre_trabajador: "Felipe Rojas",   detalle: "Felipe Rojas incorporado como Técnico Instrumentista (asignación adicional). Se mantiene en contrato NTE.", usuario_accion: "Operador General" },
      { id: "h-39", fecha: ds(2026,5,15), tipo: "Nuevo Cargo", detalle: "Cargo 'Ing. de Sistemas SCADA' agregado a Unidad de Soporte Técnico.", usuario_accion: "Operador General" }
    ]
  },

  // ── CONTRATO 4: Administración Central — En Preparación ───────
  {
    id_contrato: "c-4",
    codigo_contrato: "MON-2026-ADM",
    nombre_contrato: "Administración Operativa Central",
    id_mandante: "m-3",
    estado: "En Preparación",
    fecha_inicio: "2026-07-01",
    fecha_termino: "2029-06-30",
    centros_costo: [
      { id_cc: "cc-30", codigo_cc: "CC-1000", nombre_cc: "CC Administración Central" },
      { id_cc: "cc-31", codigo_cc: "CC-1010", nombre_cc: "CC Recursos Humanos" }
    ],
    unidades: [
      { id_unidad: "u-30", nombre: "Unidad de Recursos Humanos",   descripcion: "Gestión de personas, contratos y beneficios", activa: true },
      { id_unidad: "u-31", nombre: "Unidad de Tecnologías de la Información", descripcion: "Soporte TI, infraestructura y sistemas", activa: true }
    ],
    cargos: [
      { id_cargo: "cg-30", nombre: "Gerente General",     nivel: "Gerencia",    id_unidad: "u-30", activo: true },
      { id_cargo: "cg-31", nombre: "Jefe RRHH",           nivel: "Jefatura",    id_unidad: "u-30", activo: true },
      { id_cargo: "cg-32", nombre: "Analista RRHH",       nivel: "Operativo",   id_unidad: "u-30", activo: true },
      { id_cargo: "cg-33", nombre: "Jefe TI",             nivel: "Jefatura",    id_unidad: "u-31", activo: true },
      { id_cargo: "cg-34", nombre: "Técnico TI Soporte",  nivel: "Operativo",   id_unidad: "u-31", activo: true }
    ],
    proveedores_asignados: [],
    trabajadores_asignados: [],
    historial: [
      { id: "h-40", fecha: ds(2026,5,20), tipo: "Edición Contrato", detalle: "Contrato MON-2026-ADM creado en estado 'En Preparación'. Inicio operacional proyectado: julio 2026.", usuario_accion: "Operador General" },
      { id: "h-41", fecha: ds(2026,5,25), tipo: "Nueva Unidad",     detalle: "Unidad de Recursos Humanos y Unidad de TI definidas en la estructura base.", usuario_accion: "Operador General" },
      { id: "h-42", fecha: ds(2026,5,28), tipo: "Nuevo Cargo",      detalle: "Catálogo inicial de 5 cargos definido: Gerente General, Jefe RRHH, Analista RRHH, Jefe TI, Técnico TI.", usuario_accion: "Operador General" }
    ]
  },

  // ── CONTRATO 5: Los Bronces — Anglo American — Cerrado ────────
  {
    id_contrato: "c-5",
    codigo_contrato: "MON-2025-LBR",
    nombre_contrato: "Monitoreo Los Bronces — Fase II",
    id_mandante: "m-5",
    estado: "Cerrado",
    fecha_inicio: "2024-01-01",
    fecha_termino: "2025-12-31",
    centros_costo: [
      { id_cc: "cc-40", codigo_cc: "CC-9000", nombre_cc: "CC Faena Los Bronces" }
    ],
    unidades: [
      { id_unidad: "u-40", nombre: "Equipo de Monitoreo Continuo", descripcion: "Operación de estaciones automáticas y manuales", activa: true }
    ],
    cargos: [
      { id_cargo: "cg-40", nombre: "Jefe de Proyecto",    nivel: "Jefatura",  id_unidad: "u-40", activo: true },
      { id_cargo: "cg-41", nombre: "Técnico de Campo",    nivel: "Operativo", id_unidad: "u-40", activo: true }
    ],
    proveedores_asignados: [],
    trabajadores_asignados: [
      { id_asignacion: "as-40", id_trabajador: "t-10", nombre: "Martín Contreras", rut: "14.123.456-7", id_unidad: "u-40", nombre_unidad: "Equipo de Monitoreo Continuo", id_cargo: "cg-40", nombre_cargo: "Jefe de Proyecto", nivel: "Jefatura", fecha_ingreso: "2024-01-01", fecha_salida: "2025-12-31", activo: false, motivo_baja: "Fin de contrato" },
      { id_asignacion: "as-41", id_trabajador: "t-12", nombre: "Pablo Cisterna",   rut: "16.345.678-9", id_unidad: "u-40", nombre_unidad: "Equipo de Monitoreo Continuo", id_cargo: "cg-41", nombre_cargo: "Técnico de Campo",  nivel: "Operativo", fecha_ingreso: "2024-01-01", fecha_salida: "2025-12-31", activo: false, motivo_baja: "Fin de contrato" }
    ],
    historial: [
      { id: "h-50", fecha: ds(2024,1,1),   tipo: "Edición Contrato", detalle: "Contrato MON-2025-LBR iniciado. Fase II Los Bronces.", usuario_accion: "Operador General" },
      { id: "h-51", fecha: ds(2024,1,1),   tipo: "Ingreso", id_trabajador: "t-10", nombre_trabajador: "Martín Contreras", detalle: "Martín Contreras asignado como Jefe de Proyecto.", usuario_accion: "Operador General" },
      { id: "h-52", fecha: ds(2024,1,1),   tipo: "Ingreso", id_trabajador: "t-12", nombre_trabajador: "Pablo Cisterna",   detalle: "Pablo Cisterna asignado como Técnico de Campo.", usuario_accion: "Operador General" },
      { id: "h-53", fecha: ds(2025,12,31), tipo: "Suspensión", detalle: "Contrato cerrado al término del plazo acordado. Sin renovación.", usuario_accion: "Operador General" }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
//  Store state & actions
// ─────────────────────────────────────────────────────────────

const ACTOR = "Operador General";

interface ContratosState {
  contratos: Contrato[];
  fetchContratos: () => Promise<void>;
  addContrato: (c: Omit<Contrato, "id_contrato" | "trabajadores_asignados" | "historial">) => Promise<void>;
  updateContrato: (id: string, fields: Partial<Omit<Contrato, "trabajadores_asignados" | "historial">>) => Promise<void>;
  deleteContrato: (id: string) => Promise<void>;
  addUnidad: (id_contrato: string, u: Omit<ContratoUnidad, "id_unidad">) => void;
  updateUnidad: (id_contrato: string, id_unidad: string, fields: Partial<ContratoUnidad>) => void;
  removeUnidad: (id_contrato: string, id_unidad: string) => void;
  addCargo: (id_contrato: string, c: Omit<ContratoCargo, "id_cargo">) => void;
  updateCargo: (id_contrato: string, id_cargo: string, fields: Partial<ContratoCargo>) => void;
  removeCargo: (id_contrato: string, id_cargo: string) => void;
  addCentroCosto: (id_contrato: string, cc: Omit<CentroCosto, "id_cc">) => void;
  removeCentroCosto: (id_contrato: string, id_cc: string) => void;
  asignarTrabajador: (id_contrato: string, asignacion: Omit<ContratoTrabajador, "id_asignacion" | "activo">) => void;
  reasignarTrabajador: (id_contrato: string, id_asignacion: string, campos: Pick<ContratoTrabajador, "id_unidad" | "nombre_unidad" | "id_cargo" | "nombre_cargo" | "nivel">, motivo?: string) => void;
  darBajaTrabajador: (id_contrato: string, id_asignacion: string, motivo: string) => void;
  reactivarTrabajador: (id_contrato: string, id_asignacion: string) => void;
}

function addHist(contratos: Contrato[], id_contrato: string, mov: Omit<MovimientoHistorial, "id" | "fecha" | "usuario_accion">): Contrato[] {
  return contratos.map((c) => {
    if (c.id_contrato !== id_contrato) return c;
    const entrada: MovimientoHistorial = {
      ...mov,
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fecha: new Date().toISOString(),
      usuario_accion: ACTOR
    };
    return { ...c, historial: [...c.historial, entrada] };
  });
}

export const useContratosStore = create<ContratosState>()(
  persist(
    (set) => ({
      contratos: mockContratos,

      fetchContratos: async () => {
        try {
          const { data, error } = await supabase
            .from("contratos")
            .select("*")
            .order("fecha_inicio", { ascending: true });

          if (error) throw new Error(error.message);

          if (data && data.length > 0) {
            set((state) => {
              const updatedContratos = data.map((dbContrato) => {
                const existing = state.contratos.find(
                  (c) =>
                    c.id_contrato === dbContrato.id_contrato ||
                    c.codigo_contrato === dbContrato.codigo_contrato
                );
                // Mapear estado: la columna "estado" en DB es el texto directo
                const estado = (dbContrato.estado as Contrato["estado"]) ?? "En Preparacion";
                return {
                  id_contrato: dbContrato.id_contrato,
                  codigo_contrato: dbContrato.codigo_contrato,
                  nombre_contrato: dbContrato.nombre_contrato,
                  id_mandante: dbContrato.id_mandante ?? existing?.id_mandante ?? "m-1",
                  estado,
                  fecha_inicio: dbContrato.fecha_inicio ?? existing?.fecha_inicio ?? "",
                  fecha_termino: dbContrato.fecha_termino ?? existing?.fecha_termino ?? "",
                  centros_costo: existing?.centros_costo ?? [],
                  unidades: existing?.unidades ?? [],
                  cargos: existing?.cargos ?? [],
                  trabajadores_asignados: existing?.trabajadores_asignados ?? [],
                  historial: existing?.historial ?? [],
                  proveedores_asignados: existing?.proveedores_asignados ?? [],
                };
              });
              return { contratos: updatedContratos };
            });
          } else if (process.env.NODE_ENV !== "production") {
            // Seed base solo en desarrollo
            const seedData = mockContratos.map((c) => ({
              codigo_contrato: c.codigo_contrato,
              nombre_contrato: c.nombre_contrato,
              id_mandante: c.id_mandante,
              estado: c.estado,
              fecha_inicio: c.fecha_inicio,
              fecha_termino: c.fecha_termino,
            }));
            const { data: seeded, error: seedError } = await supabase
              .from("contratos")
              .insert(seedData)
              .select();

            if (seedError) throw new Error(seedError.message);
            if (seeded) {
              set(() => {
                const updatedContratos = seeded.map((dbContrato) => {
                  const existing = mockContratos.find(
                    (c) => c.codigo_contrato === dbContrato.codigo_contrato
                  )!;
                  return { ...existing, id_contrato: dbContrato.id_contrato };
                });
                return { contratos: updatedContratos };
              });
            }
          }
        } catch (err) {
          console.error("Failed to load contracts from Supabase:", err instanceof Error ? err.message : err);
        }
      },

      addContrato: async (c) => {
        const tempId = `temp-c-${Date.now()}`;
        const nuevoTemp: Contrato = {
          ...c,
          id_contrato: tempId,
          trabajadores_asignados: [],
          historial: [{
            id: `h-${Date.now()}`,
            fecha: new Date().toISOString(),
            tipo: "Edición Contrato",
            detalle: `Contrato ${c.codigo_contrato} creado (temporal).`,
            usuario_accion: ACTOR
          }]
        };

        set((state) => ({ contratos: [...state.contratos, nuevoTemp] }));

        try {
          const { data, error } = await supabase
            .from("contratos")
            .insert([{
              codigo_contrato: c.codigo_contrato,
              nombre_contrato: c.nombre_contrato,
              id_mandante: c.id_mandante,
              estado: c.estado,
              fecha_inicio: c.fecha_inicio,
              fecha_termino: c.fecha_termino,
            }])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            set((state) => ({
              contratos: state.contratos.map((item) =>
                item.id_contrato === tempId
                  ? { ...item, id_contrato: data[0].id_contrato }
                  : item
              )
            }));
            useAuditoriaStore.getState().registrar({
              modulo: "Contratos",
              accion: "Alta",
              id_entidad: data[0].id_contrato,
              nombre_entidad: c.nombre_contrato,
              detalle: `Contrato ${c.codigo_contrato} creado. Estado: ${c.estado}.`,
            });
          }
        } catch (err) {
          console.error("Failed to persist new contract to Supabase:", err);
        }
      },

      updateContrato: async (id, fields) => {
        set((state) => {
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id ? { ...c, ...fields } : c
          );
          return { contratos: addHist(contratos, id, { tipo: "Edición Contrato", detalle: "Datos generales del contrato actualizados." }) };
        });

        try {
          const updateFields: Record<string, unknown> = {};
          if (fields.nombre_contrato !== undefined) updateFields.nombre_contrato = fields.nombre_contrato;
          if (fields.codigo_contrato !== undefined) updateFields.codigo_contrato = fields.codigo_contrato;
          if (fields.estado !== undefined) updateFields.estado = fields.estado;
          if (fields.fecha_inicio !== undefined) updateFields.fecha_inicio = fields.fecha_inicio;
          if (fields.fecha_termino !== undefined) updateFields.fecha_termino = fields.fecha_termino;

          const { error } = await supabase
            .from("contratos")
            .update(updateFields)
            .eq("id_contrato", id);

          if (error) throw error;

          const contrato = useContratosStore.getState().contratos.find((c) => c.id_contrato === id);
          if (contrato) {
            useAuditoriaStore.getState().registrar({
              modulo: "Contratos",
              accion: "Modificacion",
              id_entidad: id,
              nombre_entidad: contrato.nombre_contrato,
              detalle: `Campos actualizados: ${Object.keys(fields).join(", ")}.`,
              meta: fields as Record<string, unknown>,
            });
          }
        } catch (err) {
          console.error(`Failed to update contract ${id} in Supabase:`, err);
        }
      },

      deleteContrato: async (id) => {
        const contratoBorrado = useContratosStore.getState().contratos.find((c) => c.id_contrato === id);
        set((state) => ({ contratos: state.contratos.filter((c) => c.id_contrato !== id) }));

        try {
          const { error } = await supabase
            .from("contratos")
            .delete()
            .eq("id_contrato", id);

          if (error) throw error;

          if (contratoBorrado) {
            useAuditoriaStore.getState().registrar({
              modulo: "Contratos",
              accion: "Baja",
              id_entidad: id,
              nombre_entidad: contratoBorrado.nombre_contrato,
              detalle: `Contrato ${contratoBorrado.codigo_contrato} eliminado.`,
            });
          }
        } catch (err) {
          console.error(`Failed to delete contract ${id} from Supabase:`, err);
        }
      },

      addUnidad: (id_contrato, u) =>
        set((state) => {
          const id_unidad = `u-${Date.now()}`;
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, unidades: [...c.unidades, { ...u, id_unidad }] }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Nueva Unidad", detalle: `Unidad "${u.nombre}" creada en el contrato.` }) };
        }),

      updateUnidad: (id_contrato, id_unidad, fields) =>
        set((state) => ({
          contratos: state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, unidades: c.unidades.map((u) => u.id_unidad === id_unidad ? { ...u, ...fields } : u) }
              : c
          )
        })),

      removeUnidad: (id_contrato, id_unidad) =>
        set((state) => {
          const u = state.contratos.find(c => c.id_contrato === id_contrato)?.unidades.find(u => u.id_unidad === id_unidad);
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, unidades: c.unidades.map(un => un.id_unidad === id_unidad ? { ...un, activa: false } : un) }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Edición Contrato", detalle: `Unidad "${u?.nombre}" desactivada.` }) };
        }),

      addCargo: (id_contrato, c) =>
        set((state) => {
          const contratos = state.contratos.map((ct) =>
            ct.id_contrato === id_contrato
              ? { ...ct, cargos: [...ct.cargos, { ...c, id_cargo: `cg-${Date.now()}` }] }
              : ct
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Nuevo Cargo", detalle: `Cargo "${c.nombre}" (${c.nivel}) agregado al contrato.` }) };
        }),

      updateCargo: (id_contrato, id_cargo, fields) =>
        set((state) => ({
          contratos: state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, cargos: c.cargos.map((cg) => cg.id_cargo === id_cargo ? { ...cg, ...fields } : cg) }
              : c
          )
        })),

      removeCargo: (id_contrato, id_cargo) =>
        set((state) => ({
          contratos: state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, cargos: c.cargos.map((cg) => cg.id_cargo === id_cargo ? { ...cg, activo: false } : cg) }
              : c
          )
        })),

      addCentroCosto: (id_contrato, cc) =>
        set((state) => ({
          contratos: state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, centros_costo: [...c.centros_costo, { ...cc, id_cc: `cc-${Date.now()}` }] }
              : c
          )
        })),

      removeCentroCosto: (id_contrato, id_cc) =>
        set((state) => ({
          contratos: state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, centros_costo: c.centros_costo.filter((cc) => cc.id_cc !== id_cc) }
              : c
          )
        })),

      asignarTrabajador: (id_contrato, asignacion) =>
        set((state) => {
          const nueva: ContratoTrabajador = { ...asignacion, id_asignacion: `as-${Date.now()}`, activo: true };
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, trabajadores_asignados: [...c.trabajadores_asignados, nueva] }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Ingreso", id_trabajador: asignacion.id_trabajador, nombre_trabajador: asignacion.nombre, detalle: `${asignacion.nombre} asignado/a como ${asignacion.nombre_cargo ?? "Sin cargo"} en ${asignacion.nombre_unidad ?? "Sin unidad"}.` }) };
        }),

      reasignarTrabajador: (id_contrato, id_asignacion, campos, motivo) =>
        set((state) => {
          const asig = state.contratos.find(c => c.id_contrato === id_contrato)?.trabajadores_asignados.find(a => a.id_asignacion === id_asignacion);
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, trabajadores_asignados: c.trabajadores_asignados.map((a) => a.id_asignacion === id_asignacion ? { ...a, ...campos } : a) }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Reasignación", id_trabajador: asig?.id_trabajador, nombre_trabajador: asig?.nombre, detalle: `${asig?.nombre} reasignado/a a ${campos.nombre_cargo ?? asig?.nombre_cargo} en ${campos.nombre_unidad ?? asig?.nombre_unidad}. ${motivo ? `Motivo: ${motivo}` : ""}` }) };
        }),

      darBajaTrabajador: (id_contrato, id_asignacion, motivo) =>
        set((state) => {
          const asig = state.contratos.find(c => c.id_contrato === id_contrato)?.trabajadores_asignados.find(a => a.id_asignacion === id_asignacion);
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, trabajadores_asignados: c.trabajadores_asignados.map((a) => a.id_asignacion === id_asignacion ? { ...a, activo: false, fecha_salida: new Date().toISOString(), motivo_baja: motivo } : a) }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Baja", id_trabajador: asig?.id_trabajador, nombre_trabajador: asig?.nombre, detalle: `${asig?.nombre} dado/a de baja del contrato. Motivo: ${motivo}` }) };
        }),

      reactivarTrabajador: (id_contrato, id_asignacion) =>
        set((state) => {
          const asig = state.contratos.find(c => c.id_contrato === id_contrato)?.trabajadores_asignados.find(a => a.id_asignacion === id_asignacion);
          const contratos = state.contratos.map((c) =>
            c.id_contrato === id_contrato
              ? { ...c, trabajadores_asignados: c.trabajadores_asignados.map((a) => a.id_asignacion === id_asignacion ? { ...a, activo: true, fecha_salida: undefined, motivo_baja: undefined } : a) }
              : c
          );
          return { contratos: addHist(contratos, id_contrato, { tipo: "Activación", id_trabajador: asig?.id_trabajador, nombre_trabajador: asig?.nombre, detalle: `${asig?.nombre} reactivado/a en el contrato.` }) };
        })
    }),
    { name: "monitoring-contratos-v2-storage" }  // v2 = fuerza datos frescos
  )
);
