-- ============================================================
--  MÓDULO: ALIMENTACIÓN
--  Relacionado con: alimentacion-store.ts
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

-- 'D' = Desayuno, 'A' = Almuerzo, 'C' = Cena, 'Co' = Colación
create type alimentacion_tipo as enum (
  'D',
  'A',
  'C',
  'Co'
);

-- ============================================================
--  TABLAS
-- ============================================================

-- 1. Registro diario de Alimentación
create table alimentacion_registros (
  id                text primary key, -- Ej: ralim-{id_contrato}-{id_trabajador}-{fecha}
  id_contrato       text not null,    -- FK lógica a contrato
  id_trabajador     text not null,    -- FK lógica a trabajador
  id_asignacion     text,             -- FK lógica a asignación
  fecha             date not null,
  estados           alimentacion_tipo[] not null default '{}',
  editado_por       text not null default 'Sistema',
  editado_at        timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices
create index idx_alim_reg_contrato on alimentacion_registros(id_contrato);
create index idx_alim_reg_trabajador on alimentacion_registros(id_trabajador);
create index idx_alim_reg_fecha on alimentacion_registros(fecha);

-- 2. Presupuestos Mensuales (Raciones Límite)
create table alimentacion_presupuestos (
  id_contrato         text primary key,
  presupuesto_mensual integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3. Auditoría de Alimentación (Historial de Cambios)
create table alimentacion_auditoria (
  id                  text primary key,
  id_contrato         text not null,
  id_trabajador       text not null,
  nombre_trabajador   text not null,
  fecha_consumo       date not null,
  estados_anteriores  alimentacion_tipo[] not null default '{}',
  estados_nuevos      alimentacion_tipo[] not null default '{}',
  editado_por         text not null,
  editado_at          timestamptz not null default now()
);

create index idx_alim_aud_contrato on alimentacion_auditoria(id_contrato);

-- ============================================================
--  TRIGGERS Y RLS
-- ============================================================

create trigger trg_alimentacion_registros_upd
  before update on alimentacion_registros
  for each row execute function set_updated_at();

create trigger trg_alimentacion_presupuestos_upd
  before update on alimentacion_presupuestos
  for each row execute function set_updated_at();

alter table alimentacion_registros enable row level security;
alter table alimentacion_presupuestos enable row level security;
alter table alimentacion_auditoria enable row level security;

create policy "authenticated_full_access_alim_registros"
  on alimentacion_registros for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_alim_presupuestos"
  on alimentacion_presupuestos for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_alim_auditoria"
  on alimentacion_auditoria for all
  using (auth.role() = 'authenticated');
