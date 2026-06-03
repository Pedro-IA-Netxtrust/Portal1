-- ============================================================
--  TICKET SYSTEM — Supabase / PostgreSQL
--  Basado en: solucion_tickets.md + solicitudes-store.ts
--  Actualizado: 2026-05-30
-- ============================================================

-- ─── Extensiones ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ============================================================
--  TIPOS ENUMERADOS
-- ============================================================

create type ticket_tipo as enum (
  'Vacaciones',
  'Permiso con Goce',
  'Permiso sin Goce',
  'Cambio de Equipo',
  'Cambio de Turno',
  'Teletrabajo',
  'Licencia Médica',
  'Reposición de EPP',
  'Otro'
);

create type ticket_status as enum (
  'Pendiente',
  'En Revisión',
  'Aprobada',
  'Rechazada',
  'Cancelada',
  'Cerrada'
);

create type ticket_prioridad as enum (
  'Normal',
  'Urgente'
);

create type recipient_type as enum (
  'trabajador',
  'jefatura',
  'rrhh',
  'seguridad',
  'prevencion',
  'ti',
  'administracion',
  'otro'
);

-- Tipos de equipo (para Cambio de Equipo)
create type equipo_tipo as enum (
  'Notebook',
  'Monitor',
  'Teclado',
  'Mouse',
  'Auriculares',
  'Teléfono',
  'Otro'
);

-- Motivo de cambio de equipo
create type equipo_motivo as enum (
  'Falla',
  'Obsolescencia',
  'Nuevo Ingreso',
  'Actualización'
);

-- Modalidad de teletrabajo
create type teletrabajo_modalidad as enum (
  'Permanente',
  'Temporal'
);

-- Tipo de licencia médica
create type licencia_tipo as enum (
  'Común',
  'Reposo Maternal',
  'Accidente Laboral'
);

-- ============================================================
--  1. contracts
--     Unidad operativa (Ej: "Operación Norte")
-- ============================================================

create table contracts (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  code        text unique not null,          -- Ej: "OP-NORTE"
  description text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
--  2. ticket_types
--     Catálogo global de tipos de ticket con sus reglas
-- ============================================================

create table ticket_types (
  id                 uuid primary key default uuid_generate_v4(),
  tipo               ticket_tipo unique not null,
  name               text not null,
  description        text,
  icon               text,                  -- emoji o nombre de ícono lucide
  active             boolean not null default true,

  -- Reglas del tipo
  allow_attachments  boolean not null default false,
  require_reason     boolean not null default false,
  require_dates      boolean not null default false,   -- vacaciones, permisos, teletrabajo
  require_dias_habiles boolean not null default false, -- para tipos con cálculo de días

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
--  3. ticket_type_contract_settings
--     Configuración del tipo de ticket por contrato
-- ============================================================

create table ticket_type_contract_settings (
  id                     uuid primary key default uuid_generate_v4(),
  contract_id            uuid not null references contracts(id) on delete cascade,
  ticket_type_id         uuid not null references ticket_types(id) on delete cascade,
  primary_recipient_type recipient_type not null,
  primary_recipient_id   uuid,
  sla_hours              integer default 48,
  enable_cc              boolean not null default false,
  active                 boolean not null default true,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  unique (contract_id, ticket_type_id)
);

-- ============================================================
--  4. ticket_type_cc_recipients
--     Destinatarios secundarios (CC) por contrato y tipo
-- ============================================================

create table ticket_type_cc_recipients (
  id             uuid primary key default uuid_generate_v4(),
  contract_id    uuid not null references contracts(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id) on delete cascade,
  recipient_type recipient_type not null,
  recipient_id   uuid,
  label          text,                      -- Ej: "Prevención de Riesgos"
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ============================================================
--  5. ticket_requests
--     Solicitud principal creada por el trabajador.
--
--     Estrategia de payload:
--     - Campos comunes en columnas nativas (para búsqueda e índices)
--     - Campos específicos por tipo en columna JSONB `payload`
--     - Tablas de detalle especializadas para los tipos más complejos
-- ============================================================

create sequence ticket_request_seq start 1;

create table ticket_requests (
  id                    uuid primary key default uuid_generate_v4(),
  code                  text unique not null default '',   -- generado por trigger
  contract_id           uuid not null references contracts(id),
  ticket_type_id        uuid not null references ticket_types(id),
  tipo                  ticket_tipo not null,              -- desnormalizado para queries rápidos
  requester_id          uuid not null,                     -- FK a trabajadores
  requester_name        text not null,                     -- desnormalizado
  requester_area        text,
  subject               text not null,
  description           text,
  status                ticket_status not null default 'Pendiente',
  priority              ticket_prioridad not null default 'Normal',

  -- Gestión
  current_assignee_type recipient_type,
  current_assignee_id   uuid,
  current_assignee_name text,

  -- Resolución
  resolution_note       text,
  rejection_reason      text,

  -- Fechas clave
  reviewed_at           timestamptz,
  resolved_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- ──────────────────────────────────────────
  --  CAMPOS ESPECÍFICOS POR TIPO
  --  (columnas nativas para los más consultados)
  -- ──────────────────────────────────────────

  -- Compartidos: Vacaciones / Permisos / Teletrabajo / Licencia
  date_from             date,
  date_to               date,
  business_days         integer,             -- días hábiles calculados

  -- Payload completo en JSONB para campos variables
  payload               jsonb not null default '{}'::jsonb
);

-- Índices
create index idx_tr_contract      on ticket_requests(contract_id);
create index idx_tr_tipo          on ticket_requests(tipo);
create index idx_tr_requester     on ticket_requests(requester_id);
create index idx_tr_status        on ticket_requests(status);
create index idx_tr_priority      on ticket_requests(priority);
create index idx_tr_assignee      on ticket_requests(current_assignee_id);
create index idx_tr_date_from     on ticket_requests(date_from);
create index idx_tr_payload       on ticket_requests using gin(payload);

-- ============================================================
--  5a. payload_vacaciones  (detalle normalizado)
--      Refleja: PayloadVacaciones
-- ============================================================

create table payload_vacaciones (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  fecha_inicio      date not null,
  fecha_fin         date not null,
  dias_habiles      integer not null default 0,
  motivo            text
);

-- ============================================================
--  5b. payload_permisos  (Permiso con Goce / sin Goce)
--      Refleja: PayloadPermisoConGoce / PayloadPermisoSinGoce
-- ============================================================

create table payload_permisos (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  tipo_permiso      text not null check (tipo_permiso in ('Con Goce', 'Sin Goce')),
  fecha_inicio      date not null,
  fecha_fin         date not null,
  dias_habiles      integer not null default 0,
  motivo            text not null
);

-- ============================================================
--  5c. payload_cambio_equipo
--      Refleja: PayloadCambioEquipo
-- ============================================================

create table payload_cambio_equipo (
  id                    uuid primary key default uuid_generate_v4(),
  ticket_request_id     uuid not null unique references ticket_requests(id) on delete cascade,
  tipo_equipo           equipo_tipo not null,
  motivo_cambio         equipo_motivo not null,
  descripcion_solicitud text not null,
  activo_actual         text,               -- código o número de serie del equipo a reemplazar
  adjunto_informe_url   text                -- URL en Supabase Storage
);

-- ============================================================
--  5d. payload_cambio_turno
--      Refleja: PayloadCambioTurno
-- ============================================================

create table payload_cambio_turno (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  turno_actual      text not null,          -- Ej: "08:00 - 17:00"
  turno_solicitado  text not null,
  fecha_efectiva    date not null,
  motivo            text not null
);

-- ============================================================
--  5e. payload_teletrabajo
--      Refleja: PayloadTeletrabajo
-- ============================================================

create table payload_teletrabajo (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  fecha_inicio      date not null,
  fecha_fin         date,                   -- null si es Permanente
  modalidad         teletrabajo_modalidad not null,
  dias_semana       text[] not null,        -- Ej: ["Lunes","Miércoles"]
  motivo            text not null
);

-- ============================================================
--  5f. payload_licencia_medica
--      Refleja: PayloadLicenciaMedica
-- ============================================================

create table payload_licencia_medica (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  fecha_inicio      date not null,
  dias              integer not null check (dias > 0),
  tipo_licencia     licencia_tipo not null,
  numero_licencia   text                    -- número del documento oficial
);

-- ============================================================
--  5g. payload_epp  (Reposición de EPP)
-- ============================================================

create table payload_epp (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null unique references ticket_requests(id) on delete cascade,
  items_solicitados text[] not null,        -- lista de EPP requeridos
  motivo            text not null,
  talla_referencia  text,
  evidencia_url     text                    -- foto o informe adjunto
);

-- ============================================================
--  6. ticket_comments
-- ============================================================

create table ticket_comments (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null references ticket_requests(id) on delete cascade,
  user_id           uuid not null,
  author_name       text not null,
  comment           text not null,
  is_internal       boolean not null default false,   -- solo visible para gestores
  is_resolution     boolean not null default false,   -- marca el comentario de cierre
  created_at        timestamptz not null default now()
);

create index idx_comments_request on ticket_comments(ticket_request_id);

-- ============================================================
--  7. ticket_attachments
-- ============================================================

create table ticket_attachments (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null references ticket_requests(id) on delete cascade,
  uploaded_by       uuid not null,
  file_name         text not null,
  file_url          text not null,          -- URL de Supabase Storage
  file_type         text,                   -- MIME type
  file_size_bytes   bigint,
  created_at        timestamptz not null default now()
);

create index idx_attachments_request on ticket_attachments(ticket_request_id);

-- ============================================================
--  8. ticket_status_history
--     Trazabilidad completa de cambios de estado
-- ============================================================

create table ticket_status_history (
  id                uuid primary key default uuid_generate_v4(),
  ticket_request_id uuid not null references ticket_requests(id) on delete cascade,
  from_status       ticket_status,          -- null en creación inicial
  to_status         ticket_status not null,
  changed_by        uuid,
  changed_by_name   text not null,
  note              text,
  changed_at        timestamptz not null default now()
);

create index idx_status_history_request on ticket_status_history(ticket_request_id);

-- ============================================================
--  TRIGGERS
-- ============================================================

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_contracts_upd         before update on contracts                        for each row execute function set_updated_at();
create trigger trg_ticket_types_upd      before update on ticket_types                     for each row execute function set_updated_at();
create trigger trg_ttcs_upd              before update on ticket_type_contract_settings     for each row execute function set_updated_at();
create trigger trg_ticket_requests_upd   before update on ticket_requests                  for each row execute function set_updated_at();

-- Correlativo automático
create or replace function generate_ticket_code()
returns trigger language plpgsql as $$
begin
  new.code := 'SOL-' || to_char(now(), 'YYYY') || '-' ||
              lpad(nextval('ticket_request_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger trg_ticket_code
  before insert on ticket_requests
  for each row execute function generate_ticket_code();

-- Registro automático en historial al cambiar estado
create or replace function log_status_change()
returns trigger language plpgsql as $$
begin
  if (old.status is distinct from new.status) then
    insert into ticket_status_history (
      ticket_request_id, from_status, to_status,
      changed_by, changed_by_name, note, changed_at
    ) values (
      new.id,
      old.status,
      new.status,
      new.current_assignee_id,
      coalesce(new.current_assignee_name, 'Sistema'),
      new.resolution_note,
      now()
    );

    -- Actualizar fechas de revisión y resolución automáticamente
    if new.status = 'En Revisión' and old.reviewed_at is null then
      new.reviewed_at := now();
    end if;
    if new.status in ('Aprobada', 'Rechazada', 'Cancelada', 'Cerrada') then
      new.resolved_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_status_log
  before update on ticket_requests
  for each row execute function log_status_change();

-- Registro de estado inicial al crear el ticket
create or replace function log_initial_status()
returns trigger language plpgsql as $$
begin
  insert into ticket_status_history (
    ticket_request_id, from_status, to_status,
    changed_by, changed_by_name, changed_at
  ) values (
    new.id, null, new.status,
    new.requester_id, new.requester_name, now()
  );
  return new;
end;
$$;

create trigger trg_initial_status
  after insert on ticket_requests
  for each row execute function log_initial_status();

-- ============================================================
--  SEED: tipos de ticket con sus características
-- ============================================================

insert into ticket_types (tipo, name, description, icon, allow_attachments, require_reason, require_dates, require_dias_habiles) values
  ('Vacaciones',        'Vacaciones',          'Solicitud de días de vacaciones anuales',       '🏖️', false, false, true,  true),
  ('Permiso con Goce',  'Permiso con Goce',    'Permiso remunerado por motivo justificado',     '✅', false, true,  true,  true),
  ('Permiso sin Goce',  'Permiso sin Goce',    'Permiso no remunerado',                         '📋', false, true,  true,  true),
  ('Cambio de Equipo',  'Cambio de Equipo',    'Reposición o reemplazo de equipo tecnológico',  '💻', true,  true,  false, false),
  ('Cambio de Turno',   'Cambio de Turno',     'Solicitud de cambio de horario o jornada',      '🔄', false, true,  false, false),
  ('Teletrabajo',       'Teletrabajo',         'Solicitud de trabajo remoto (parcial o total)', '🏠', false, true,  true,  false),
  ('Licencia Médica',   'Licencia Médica',     'Registro y tramitación de licencia médica',     '🏥', true,  false, true,  false),
  ('Reposición de EPP', 'Reposición de EPP',   'Solicitud de equipos de protección personal',   '🦺', true,  true,  false, false),
  ('Otro',              'Otra Solicitud',       'Solicitud no clasificada en los tipos anteriores', '📌', false, true, false, false);

-- ============================================================
--  SEED: contrato base de ejemplo
-- ============================================================

insert into contracts (name, code, description) values
  ('Operación Norte',  'OP-NORTE',  'Contrato principal faena minera norte'),
  ('Operación Central','OP-CENTRAL','Contrato oficinas centrales');

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================

alter table ticket_requests       enable row level security;
alter table ticket_comments       enable row level security;
alter table ticket_attachments    enable row level security;
alter table ticket_status_history enable row level security;

-- El solicitante ve sus propios tickets
create policy "requester_select_own"
  on ticket_requests for select
  using (requester_id = auth.uid());

-- El solicitante puede crear tickets
create policy "requester_insert"
  on ticket_requests for insert
  with check (requester_id = auth.uid());

-- El solicitante puede cancelar solo sus tickets pendientes
create policy "requester_cancel"
  on ticket_requests for update
  using (requester_id = auth.uid() and status = 'Pendiente');

-- Gestores/admins ven todo (habilitar según roles de auth.jwt())
-- create policy "admin_all"
--   on ticket_requests for all
--   using ( (auth.jwt() ->> 'role') in ('admin', 'gestor') );

-- El solicitante ve el historial de sus tickets
create policy "requester_history"
  on ticket_status_history for select
  using (
    exists (
      select 1 from ticket_requests tr
      where tr.id = ticket_status_history.ticket_request_id
        and tr.requester_id = auth.uid()
    )
  );

-- El solicitante ve comentarios públicos de sus tickets
create policy "requester_comments"
  on ticket_comments for select
  using (
    is_internal = false and
    exists (
      select 1 from ticket_requests tr
      where tr.id = ticket_comments.ticket_request_id
        and tr.requester_id = auth.uid()
    )
  );
