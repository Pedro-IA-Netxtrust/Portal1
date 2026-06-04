-- ============================================================
--  MÓDULO DE USUARIOS Y PERMISOS — Supabase / PostgreSQL
--  Relacionado con: usuarios-store.ts
--  Actualizado: 2026-06-03
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type user_role_global as enum (
  'Super Admin',
  'Usuario'
);

create type module_access_level as enum (
  'No Ver',
  'Ver y Operar',
  'Administrar'
);

-- ============================================================
--  1. usuarios_roles_globales
--     Define el rol base de cada trabajador. Si no existe, se asume 'Usuario'.
-- ============================================================

create table usuarios_roles_globales (
  id_trabajador text primary key,             -- FK lógica a trabajadores.id_trabajador
  rol_global    user_role_global not null default 'Usuario',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
--  2. usuarios_permisos_modulos
--     Nivel de acceso detallado por módulo para los que son 'Usuario'.
-- ============================================================

create table usuarios_permisos_modulos (
  id_trabajador text not null,                -- FK lógica a trabajadores.id_trabajador
  modulo_id     text not null,                -- ID del módulo en el frontend (ej: 'asistencia', 'trabajadores')
  nivel_acceso  module_access_level not null default 'No Ver',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  
  primary key (id_trabajador, modulo_id)
);

-- ============================================================
--  TRIGGERS
-- ============================================================

-- updated_at automático (asume que la función set_updated_at ya existe de los otros SQL)
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_usr_roles_globales_upd
  before update on usuarios_roles_globales
  for each row execute function set_updated_at();

create trigger trg_usr_permisos_mod_upd
  before update on usuarios_permisos_modulos
  for each row execute function set_updated_at();

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================

alter table usuarios_roles_globales   enable row level security;
alter table usuarios_permisos_modulos enable row level security;

-- Política temporal: acceso total para operadores autenticados
create policy "authenticated_full_access_roles"
  on usuarios_roles_globales for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_permisos"
  on usuarios_permisos_modulos for all
  using (auth.role() = 'authenticated');

-- ============================================================
--  SEED INICIAL (Opcional, para el usuario demo u otros)
-- ============================================================
-- Hacemos que el primer trabajador (t-1) sea Super Admin por defecto
insert into usuarios_roles_globales (id_trabajador, rol_global)
values ('t-1', 'Super Admin')
on conflict (id_trabajador) do nothing;
