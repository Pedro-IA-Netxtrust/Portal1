-- ============================================================
--  MÓDULO: PROVEEDORES
--  Relacionado con: proveedores-store.ts
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type proveedor_estado as enum (
  'Activo',
  'Inactivo'
);

-- ============================================================
--  TABLAS
-- ============================================================

-- Tabla de Categorías/Tipos de Proveedores (Catálogo Configurable)
create table proveedor_categorias (
  id          text primary key, -- e.g. 'cat-1', 'cat-2'
  nombre      text not null unique,
  created_at  timestamptz not null default now()
);

create table proveedores (
  id_proveedor      uuid primary key default uuid_generate_v4(),
  nombre            text not null,
  rut               text not null unique,
  categoria         text not null, -- Cambiado de proveedor_categoria (enum) a text para listado configurable
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
alter table proveedor_categorias enable row level security;

create policy "authenticated_full_access_proveedores"
  on proveedores for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_proveedor_categorias"
  on proveedor_categorias for all
  using (auth.role() = 'authenticated');

-- Inserción de Categorías Predeterminadas
insert into proveedor_categorias (id, nombre) values
  ('cat-1', 'Alimentación'),
  ('cat-2', 'Tecnología'),
  ('cat-3', 'Vehículos'),
  ('cat-4', 'Transporte'),
  ('cat-5', 'Servicios Generales')
on conflict (id) do nothing;

-- ============================================================
--  MIGRACIÓN PARA BASE DE DATOS EXISTENTE (EJECUTAR EN SUPABASE)
-- ============================================================
/*
-- 1. Crear tabla de categorías
create table if not exists proveedor_categorias (
  id          text primary key,
  nombre      text not null unique,
  created_at  timestamptz not null default now()
);

-- 2. Insertar categorías iniciales
insert into proveedor_categorias (id, nombre) values
  ('cat-1', 'Alimentación'),
  ('cat-2', 'Tecnología'),
  ('cat-3', 'Vehículos'),
  ('cat-4', 'Transporte'),
  ('cat-5', 'Servicios Generales')
on conflict (id) do nothing;

-- 3. Habilitar RLS y políticas
alter table proveedor_categorias enable row level security;
create policy "authenticated_full_access_proveedor_categorias"
  on proveedor_categorias for all
  using (auth.role() = 'authenticated');

-- 4. Modificar tipo de columna en proveedores
alter table proveedores alter column categoria type text;

-- 5. Eliminar el tipo ENUM antiguo
drop type proveedor_categoria;
*/
