-- ============================================================
--  MÓDULO DE CONTROL: CURSOS Y EXÁMENES MÉDICOS
--  Relacionado con: control-store.ts
--  Actualizado: 2026-06-03
-- ============================================================

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

-- Estados para Exámenes Médicos
create type control_resultado_examen as enum (
  'Aprobado',
  'Aprobado con Observaciones',
  'Rechazado',
  'Pendiente'
);

-- Estados para Cursos y Certificaciones
create type control_estado_curso as enum (
  'Aprobado',
  'Reprobado',
  'Pendiente',
  'No Asiste'
);

-- Estados para Documentos y Pases
create type control_estado_documento as enum (
  'Vigente',
  'Retenido',
  'Suspendido',
  'Vencido'
);

-- ============================================================
--  1. control_examenes
--     Registro del historial de salud ocupacional por trabajador
-- ============================================================

create table control_examenes (
  id                uuid primary key default uuid_generate_v4(),
  id_trabajador     text not null,            -- FK lógica a trabajadores.id_trabajador
  id_examen_catalogo text not null,           -- ID del catálogo de exámenes
  fecha_realizacion date not null,
  fecha_vencimiento date,                     -- null si el examen no tiene vencimiento
  resultado         control_resultado_examen not null default 'Pendiente',
  observaciones     text,
  adjunto_url       text,                     -- URL en Supabase Storage (opcional)
  registrado_por    text not null default 'Sistema',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices
create index idx_control_exam_trabajador on control_examenes(id_trabajador);
create index idx_control_exam_vencimiento on control_examenes(fecha_vencimiento);

-- ============================================================
--  2. control_cursos
--     Registro del historial de capacitaciones por trabajador
-- ============================================================

create table control_cursos (
  id                uuid primary key default uuid_generate_v4(),
  id_trabajador     text not null,            -- FK lógica a trabajadores.id_trabajador
  id_curso_catalogo text not null,            -- ID del catálogo de cursos
  institucion       text,                     -- Entidad que impartió el curso (ej. Mutual, Interno)
  modalidad         text,                     -- Ej: 'Presencial', 'E-learning'
  fecha_realizacion date not null,
  fecha_vencimiento date,                     -- null si no requiere renovación
  estado            control_estado_curso not null default 'Pendiente',
  observaciones     text,
  certificado_url   text,                     -- URL en Supabase Storage (opcional)
  registrado_por    text not null default 'Sistema',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices
create index idx_control_curso_trabajador on control_cursos(id_trabajador);
create index idx_control_curso_vencimiento on control_cursos(fecha_vencimiento);

-- ============================================================
--  3. control_documentos
--     Registro de documentos y pases por trabajador
-- ============================================================

create table control_documentos (
  id                uuid primary key default uuid_generate_v4(),
  id_trabajador     text not null,
  id_documento_catalogo text not null,
  numero_documento  text,
  fecha_emision     date not null,
  fecha_vencimiento date,
  estado            control_estado_documento not null default 'Vigente',
  observaciones     text,
  adjunto_url       text,
  registrado_por    text not null default 'Sistema',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices
create index idx_control_documentos_trabajador on control_documentos(id_trabajador);
create index idx_control_documentos_vencimiento on control_documentos(fecha_vencimiento);

-- ============================================================
--  TRIGGERS
-- ============================================================

-- Reutiliza set_updated_at() definido en los módulos anteriores

create trigger trg_control_examenes_upd
  before update on control_examenes
  for each row execute function set_updated_at();

create trigger trg_control_cursos_upd
  before update on control_cursos
  for each row execute function set_updated_at();

create trigger trg_control_documentos_upd
  before update on control_documentos
  for each row execute function set_updated_at();

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================

alter table control_examenes enable row level security;
alter table control_cursos   enable row level security;
alter table control_documentos enable row level security;

-- Política temporal: acceso total para operadores autenticados
create policy "authenticated_full_access_examenes"
  on control_examenes for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_cursos"
  on control_cursos for all
  using (auth.role() = 'authenticated');

create policy "authenticated_full_access_documentos"
  on control_documentos for all
  using (auth.role() = 'authenticated');
