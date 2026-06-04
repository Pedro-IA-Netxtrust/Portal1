-- ============================================================
--  MÓDULO DE ASISTENCIA — Supabase / PostgreSQL
--  Relacionado con: asistencia-store.ts
--  Actualizado: 2026-06-03
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type estado_asistencia as enum (
  'P',    -- Presente
  'T',    -- Teletrabajo
  'V',    -- Vacaciones
  'L',    -- Licencia Médica
  'D',    -- Día Libre / Descanso
  'C',    -- Comisión de Servicio
  'Per'   -- Permiso
);

-- ============================================================
--  1. asistencia_meta_fte
--     Meta FTE por contrato (número fijo acordado con el mandante)
-- ============================================================

create table asistencia_meta_fte (
  id           uuid primary key default uuid_generate_v4(),
  id_contrato  text not null,          -- FK lógica a contracts.code
  meta_fte     numeric(6,2) not null default 0,
  vigente_desde date not null default current_date,
  vigente_hasta date,                  -- null = vigente indefinidamente
  creado_por   text not null default 'Sistema',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (id_contrato, vigente_desde)
);

create index idx_meta_fte_contrato on asistencia_meta_fte(id_contrato);

-- ============================================================
--  2. asistencia_registros
--     Registro diario de asistencia por trabajador × contrato × fecha
-- ============================================================

create table asistencia_registros (
  id              uuid primary key default uuid_generate_v4(),
  id_contrato     text not null,            -- FK lógica a contracts.code
  id_trabajador   text not null,            -- FK lógica a trabajadores.id_trabajador
  id_asignacion   text not null,            -- FK lógica a contratos.trabajadores_asignados.id_asignacion
  fecha           date not null,
  estado          estado_asistencia not null,
  observacion     text,
  editado_por     text not null default 'Operador General',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Un registro único por trabajador × contrato × día
  unique (id_contrato, id_trabajador, fecha)
);

-- Índices de búsqueda frecuente
create index idx_asist_contrato       on asistencia_registros(id_contrato);
create index idx_asist_trabajador     on asistencia_registros(id_trabajador);
create index idx_asist_fecha          on asistencia_registros(fecha);
create index idx_asist_contrato_mes   on asistencia_registros(id_contrato, fecha);
create index idx_asist_estado         on asistencia_registros(estado);

-- ============================================================
--  3. asistencia_auditoria
--     Log inmutable de todos los cambios de estado de asistencia
-- ============================================================

create table asistencia_auditoria (
  id                 uuid primary key default uuid_generate_v4(),
  id_contrato        text not null,
  id_trabajador      text not null,
  nombre_trabajador  text not null,
  fecha_asistencia   date not null,
  estado_anterior    estado_asistencia,   -- null si es el primer registro
  estado_nuevo       estado_asistencia,   -- null si se elimina el registro
  editado_por        text not null default 'Operador General',
  editado_at         timestamptz not null default now()
);

create index idx_auditoria_contrato    on asistencia_auditoria(id_contrato);
create index idx_auditoria_trabajador  on asistencia_auditoria(id_trabajador);
create index idx_auditoria_fecha       on asistencia_auditoria(editado_at desc);

-- ============================================================
--  TRIGGERS
-- ============================================================

-- updated_at automático (reutiliza set_updated_at si ya existe)
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_asist_meta_upd
  before update on asistencia_meta_fte
  for each row execute function set_updated_at();

create trigger trg_asist_registros_upd
  before update on asistencia_registros
  for each row execute function set_updated_at();

-- Auditoría automática al insertar / actualizar / eliminar registros
create or replace function fn_asistencia_auditoria()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    insert into asistencia_auditoria (
      id_contrato, id_trabajador, nombre_trabajador,
      fecha_asistencia, estado_anterior, estado_nuevo, editado_por
    ) values (
      old.id_contrato, old.id_trabajador, 'N/A',
      old.fecha, old.estado, null, old.editado_por
    );
    return old;
  end if;

  if (tg_op = 'INSERT') then
    insert into asistencia_auditoria (
      id_contrato, id_trabajador, nombre_trabajador,
      fecha_asistencia, estado_anterior, estado_nuevo, editado_por
    ) values (
      new.id_contrato, new.id_trabajador, 'N/A',
      new.fecha, null, new.estado, new.editado_por
    );
    return new;
  end if;

  -- UPDATE: solo loguear si el estado cambió
  if (old.estado is distinct from new.estado) then
    insert into asistencia_auditoria (
      id_contrato, id_trabajador, nombre_trabajador,
      fecha_asistencia, estado_anterior, estado_nuevo, editado_por
    ) values (
      new.id_contrato, new.id_trabajador, 'N/A',
      new.fecha, old.estado, new.estado, new.editado_por
    );
  end if;

  return new;
end;
$$;

create trigger trg_asist_auditoria
  after insert or update or delete on asistencia_registros
  for each row execute function fn_asistencia_auditoria();

-- ============================================================
--  VISTAS ÚTILES
-- ============================================================

-- FTE real por contrato × mes (todos los estados que contabilizan: P, T, C)
create or replace view v_fte_real_por_mes as
select
  id_contrato,
  date_trunc('month', fecha)::date as mes,
  count(*) filter (where estado in ('P', 'T', 'C')) as dias_contabilizados,
  count(*) as total_registros
from asistencia_registros
group by id_contrato, date_trunc('month', fecha);

-- Distribución de estados por contrato × mes
create or replace view v_distribucion_estados_mes as
select
  id_contrato,
  date_trunc('month', fecha)::date as mes,
  estado,
  count(*) as cantidad
from asistencia_registros
group by id_contrato, date_trunc('month', fecha), estado;

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================

alter table asistencia_registros  enable row level security;
alter table asistencia_auditoria  enable row level security;
alter table asistencia_meta_fte   enable row level security;

-- Política temporal: acceso total para operadores autenticados
-- (ajustar con roles granulares cuando se implemente auth de roles)
create policy "authenticated_full_access_registros"
  on asistencia_registros for all
  using (auth.role() = 'authenticated');

create policy "authenticated_read_auditoria"
  on asistencia_auditoria for select
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_meta"
  on asistencia_meta_fte for all
  using (auth.role() = 'authenticated');

-- ============================================================
--  SEED: metas FTE iniciales para los 3 contratos activos
-- ============================================================

insert into asistencia_meta_fte (id_contrato, meta_fte, vigente_desde, creado_por) values
  ('MON-2026-NTE', 5.0, '2026-01-01', 'Sistema'),
  ('MON-2026-SUR', 3.0, '2025-06-01', 'Sistema'),
  ('MON-2026-CHQ', 7.0, '2026-03-01', 'Sistema');
