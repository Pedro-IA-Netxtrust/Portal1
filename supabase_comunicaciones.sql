-- ============================================================
--  MÓDULO: COMUNICACIONES Y RECONOCIMIENTOS
--  Relacionado con: comunicaciones-store.ts
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type tipo_comunicacion as enum (
  'Cumpleaños',
  'Aniversario',
  'Reconocimiento',
  'Bienvenida',
  'Recordatorio',
  'Condolencias'
);

create type estado_comunicado as enum (
  'Borrador',
  'Enviado',
  'Impreso'
);

-- ============================================================
--  TABLAS
-- ============================================================

create table comunicados (
  id                  text primary key default 'com-' || (extract(epoch from now()) * 1000)::text,
  id_trabajador       text not null,
  nombre_trabajador   text not null,
  tipo                tipo_comunicacion not null,
  mensaje             text not null,
  estado              estado_comunicado not null default 'Borrador',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Índices
create index idx_comunicados_trabajador on comunicados(id_trabajador);
create index idx_comunicados_tipo on comunicados(tipo);
create index idx_comunicados_fecha on comunicados(created_at);

-- ============================================================
--  TRIGGERS Y RLS
-- ============================================================

-- Reutiliza la función set_updated_at() que ya deberia existir en la BD
create trigger trg_comunicados_upd
  before update on comunicados
  for each row execute function set_updated_at();

alter table comunicados enable row level security;

create policy "authenticated_full_access_comunicados"
  on comunicados for all
  using (auth.role() = 'authenticated');
