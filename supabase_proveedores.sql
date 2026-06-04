-- ============================================================
--  MÓDULO: PROVEEDORES
--  Relacionado con: proveedores-store.ts
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type proveedor_categoria as enum (
  'Alimentación',
  'Tecnología',
  'Vehículos',
  'Transporte',
  'Servicios Generales'
);

create type proveedor_estado as enum (
  'Activo',
  'Inactivo'
);

-- ============================================================
--  TABLAS
-- ============================================================

create table proveedores (
  id_proveedor      uuid primary key default uuid_generate_v4(),
  nombre            text not null,
  rut               text not null unique,
  categoria         proveedor_categoria not null,
  contacto_nombre   text,
  contacto_email    text,
  contacto_telefono text,
  estado            proveedor_estado not null default 'Activo',
  fecha_creacion    timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices
create index idx_proveedores_categoria on proveedores(categoria);
create index idx_proveedores_estado on proveedores(estado);

-- ============================================================
--  TRIGGERS Y RLS
-- ============================================================

-- Reutiliza la función set_updated_at() existente en la BD

create trigger trg_proveedores_upd
  before update on proveedores
  for each row execute function set_updated_at();

alter table proveedores enable row level security;

create policy "authenticated_full_access_proveedores"
  on proveedores for all
  using (auth.role() = 'authenticated');
