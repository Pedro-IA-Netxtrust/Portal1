-- ============================================================
-- MÓDULO DE ASISTENCIA A REUNIONES — Supabase / PostgreSQL
-- ============================================================

-- 1. Tabla de reuniones
create table if not exists reuniones (
  id_reunion          uuid primary key default gen_random_uuid(),
  tema                text not null,
  fecha               date not null default current_date,
  filtro_tipo         text not null check (filtro_tipo in ('todos', 'contratos', 'mandantes')),
  contratos_filtrados text[] default '{}', -- Códigos de contratos aplicados
  mandantes_filtrados text[] default '{}', -- IDs de mandantes aplicados
  estado              text not null default 'realizada' check (estado in ('programada', 'realizada')),
  observacion         text,
  creado_por          text not null default 'Operador General',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 2. Tabla de registros de asistencia por reunión y trabajador
create table if not exists reuniones_asistencia (
  id             uuid primary key default gen_random_uuid(),
  id_reunion     uuid not null references reuniones(id_reunion) on delete cascade,
  id_trabajador  text not null, -- FK lógica consistente con otras tablas
  estado         text not null check (estado in ('presente', 'ausente', 'otra_reunion', 'computador_compartido', 'no_aplica', 'vacaciones', 'otro')),
  observacion    text,
  editado_por    text not null default 'Operador General',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (id_reunion, id_trabajador)
);

-- Índices de búsqueda
create index if not exists idx_reuniones_fecha on reuniones(fecha);
create index if not exists idx_reunasist_reunion on reuniones_asistencia(id_reunion);
create index if not exists idx_reunasist_trabajador on reuniones_asistencia(id_trabajador);

-- Trigger de updated_at para reuniones
create or replace trigger trg_reuniones_upd
  before update on reuniones
  for each row execute function set_updated_at();

-- Trigger de updated_at para reuniones_asistencia
create or replace trigger trg_reunasist_upd
  before update on reuniones_asistencia
  for each row execute function set_updated_at();

-- RLS (Row Level Security)
alter table reuniones enable row level security;
alter table reuniones_asistencia enable row level security;

-- Eliminar políticas previas si existen para evitar duplicación
drop policy if exists "authenticated_full_access_reuniones" on reuniones;
drop policy if exists "authenticated_full_access_reunasist" on reuniones_asistencia;

create policy "authenticated_full_access_reuniones"
  on reuniones for all
  using (true);

create policy "authenticated_full_access_reunasist"
  on reuniones_asistencia for all
  using (true);

-- ============================================================
-- SCRIPT DE MIGRACIÓN (EJECUTAR SI LA TABLA YA EXISTE):
-- ============================================================
-- ALTER TABLE reuniones ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'realizada' CHECK (estado IN ('programada', 'realizada'));
-- ALTER TABLE reuniones ADD COLUMN IF NOT EXISTS observacion TEXT;

