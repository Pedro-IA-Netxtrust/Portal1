-- ============================================================
--  PORTAL MONITORING — Schema SQL en español (sin ñ)
--  Tablas nuevas y renombradas tras unificacion de nomenclatura
--  Ejecutar en orden desde el SQL Editor de Supabase
-- ============================================================


-- ─────────────────────────────────────────────────────────────
--  1. TABLA AUDITORIA
--     Registro centralizado de trazabilidad del sistema.
--     Permite auditar todas las acciones CRUD de todos los modulos.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS auditoria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo          TEXT NOT NULL,         -- Trabajadores, Contratos, Tickets...
  accion          TEXT NOT NULL,         -- Alta, Baja, Modificacion, Asignacion...
  id_entidad      TEXT NOT NULL,         -- ID del registro afectado
  nombre_entidad  TEXT NOT NULL,         -- Nombre/descripcion del registro
  detalle         TEXT NOT NULL,         -- Descripcion completa de lo que cambio
  usuario         TEXT NOT NULL DEFAULT 'Sistema',
  fecha_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta            JSONB                  -- Datos extra opcionales (antes/despues)
);

-- Indice para busquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_auditoria_modulo     ON auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion     ON auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha_at   ON auditoria(fecha_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_id_entidad ON auditoria(id_entidad);

-- RLS: solo lectura publica, insert desde el cliente autenticado
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria_select_all" ON auditoria;
CREATE POLICY "auditoria_select_all"
  ON auditoria FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "auditoria_insert_autenticado" ON auditoria;
CREATE POLICY "auditoria_insert_autenticado"
  ON auditoria FOR INSERT
  WITH CHECK (true);  -- Ajustar a auth.role() = 'authenticated' cuando se active Auth


-- ─────────────────────────────────────────────────────────────
--  2. TABLA CONTRATOS
--     Reemplaza la tabla "contracts" (inglés) con nomenclatura
--     en español y campos completos para evitar el merge con
--     la caché local.
-- ─────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS contratos CASCADE;

CREATE TABLE contratos (
  id_contrato       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_contrato   TEXT NOT NULL UNIQUE,
  nombre_contrato   TEXT NOT NULL,
  id_mandante       TEXT NOT NULL DEFAULT 'm-1',
  estado            TEXT NOT NULL DEFAULT 'En Preparacion'
                    CHECK (estado IN ('Activo','Cerrado','En Preparacion','Suspendido')),
  fecha_inicio      DATE NOT NULL,
  fecha_termino     DATE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_estado ON contratos(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_fecha  ON contratos(fecha_inicio);

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contratos_select_all" ON contratos;
CREATE POLICY "contratos_select_all"   ON contratos FOR SELECT USING (true);
DROP POLICY IF EXISTS "contratos_insert_all" ON contratos;
CREATE POLICY "contratos_insert_all"   ON contratos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "contratos_update_all" ON contratos;
CREATE POLICY "contratos_update_all"   ON contratos FOR UPDATE USING (true);
DROP POLICY IF EXISTS "contratos_delete_all" ON contratos;
CREATE POLICY "contratos_delete_all"   ON contratos FOR DELETE USING (true);

-- Trigger para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contratos_updated_at ON contratos;
CREATE TRIGGER contratos_updated_at
  BEFORE UPDATE ON contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─────────────────────────────────────────────────────────────
--  3. TABLA SOLICITUDES
--     Reemplaza "ticket_requests" con nomenclatura española.
--     Todos los campos en español para alinear con el store.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS solicitudes (
  id_solicitud              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_solicitud          TEXT,
  tipo                      TEXT NOT NULL,
  estado                    TEXT NOT NULL DEFAULT 'Pendiente'
                            CHECK (estado IN ('Pendiente','En Revision','Aprobada','Rechazada','Cancelada')),
  prioridad                 TEXT NOT NULL DEFAULT 'Normal'
                            CHECK (prioridad IN ('Normal','Urgente')),
  id_trabajador_solicitante TEXT NOT NULL,
  nombre_solicitante        TEXT NOT NULL,
  area                      TEXT,
  asunto                    TEXT NOT NULL,
  payload                   JSONB,
  id_revisor                TEXT,
  nombre_revisor            TEXT,
  observaciones             TEXT,
  motivo_rechazo            TEXT,
  fecha_creacion            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_revision            TIMESTAMPTZ,
  fecha_resolucion          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado     ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_tipo       ON solicitudes(tipo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_trabajador ON solicitudes(id_trabajador_solicitante);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha      ON solicitudes(fecha_creacion DESC);

ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "solicitudes_select_all" ON solicitudes;
CREATE POLICY "solicitudes_select_all" ON solicitudes FOR SELECT USING (true);
DROP POLICY IF EXISTS "solicitudes_insert_all" ON solicitudes;
CREATE POLICY "solicitudes_insert_all" ON solicitudes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "solicitudes_update_all" ON solicitudes;
CREATE POLICY "solicitudes_update_all" ON solicitudes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "solicitudes_delete_all" ON solicitudes;
CREATE POLICY "solicitudes_delete_all" ON solicitudes FOR DELETE USING (true);


-- ─────────────────────────────────────────────────────────────
--  4. TABLA SOLICITUD_COMENTARIOS
--     Reemplaza "ticket_comments" con nomenclatura española.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS solicitud_comentarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_solicitud  UUID NOT NULL REFERENCES solicitudes(id_solicitud) ON DELETE CASCADE,
  autor         TEXT NOT NULL,
  texto         TEXT NOT NULL,
  es_resolucion BOOLEAN NOT NULL DEFAULT FALSE,
  fecha         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sol_comentarios_solicitud ON solicitud_comentarios(id_solicitud);

ALTER TABLE solicitud_comentarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sol_comentarios_select_all" ON solicitud_comentarios;
CREATE POLICY "sol_comentarios_select_all" ON solicitud_comentarios FOR SELECT USING (true);
DROP POLICY IF EXISTS "sol_comentarios_insert_all" ON solicitud_comentarios;
CREATE POLICY "sol_comentarios_insert_all" ON solicitud_comentarios FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "sol_comentarios_update_all" ON solicitud_comentarios;
CREATE POLICY "sol_comentarios_update_all" ON solicitud_comentarios FOR UPDATE USING (true);
DROP POLICY IF EXISTS "sol_comentarios_delete_all" ON solicitud_comentarios;
CREATE POLICY "sol_comentarios_delete_all" ON solicitud_comentarios FOR DELETE USING (true);


-- ─────────────────────────────────────────────────────────────
--  5. TABLA REGISTROS_ASISTENCIA
--     Para persistir los registros de asistencia en Supabase.
--     Permite upsert diario por (id_contrato, id_trabajador, fecha).
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS registros_asistencia (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_contrato     TEXT NOT NULL,
  id_trabajador   TEXT NOT NULL,
  id_asignacion   TEXT NOT NULL,
  fecha           DATE NOT NULL,
  estado          TEXT NOT NULL CHECK (estado IN ('P','T','V','L','D','C','Per')),
  observacion     TEXT,
  editado_por     TEXT NOT NULL DEFAULT 'Sistema',
  editado_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_contrato, id_trabajador, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencia_contrato  ON registros_asistencia(id_contrato);
CREATE INDEX IF NOT EXISTS idx_asistencia_trabajador ON registros_asistencia(id_trabajador);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha      ON registros_asistencia(fecha);

ALTER TABLE registros_asistencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "asistencia_select_all" ON registros_asistencia;
CREATE POLICY "asistencia_select_all" ON registros_asistencia FOR SELECT USING (true);
DROP POLICY IF EXISTS "asistencia_insert_all" ON registros_asistencia;
CREATE POLICY "asistencia_insert_all" ON registros_asistencia FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "asistencia_update_all" ON registros_asistencia;
CREATE POLICY "asistencia_update_all" ON registros_asistencia FOR UPDATE USING (true);
DROP POLICY IF EXISTS "asistencia_delete_all" ON registros_asistencia;
CREATE POLICY "asistencia_delete_all" ON registros_asistencia FOR DELETE USING (true);


-- ─────────────────────────────────────────────────────────────
--  6. TABLA METAS_FTE
--     Para persistir las metas FTE por contrato.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS metas_fte (
  id_contrato TEXT PRIMARY KEY,
  meta_fte    NUMERIC(6,2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE metas_fte ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metas_fte_select_all" ON metas_fte;
CREATE POLICY "metas_fte_select_all" ON metas_fte FOR SELECT USING (true);
DROP POLICY IF EXISTS "metas_fte_insert_all" ON metas_fte;
CREATE POLICY "metas_fte_insert_all" ON metas_fte FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "metas_fte_update_all" ON metas_fte;
CREATE POLICY "metas_fte_update_all" ON metas_fte FOR UPDATE USING (true);


-- ─────────────────────────────────────────────────────────────
--  7. MIGRACION OPCIONAL
--     Si ya tienes datos en "contracts" o "ticket_requests",
--     ejecuta los bloques siguientes para migrarlos al nuevo schema.
--     IMPORTANTE: Descomentar solo si las tablas antiguas existen.
-- ─────────────────────────────────────────────────────────────

/*
-- Migrar contratos desde tabla "contracts"
INSERT INTO contratos (codigo_contrato, nombre_contrato, estado, fecha_inicio, fecha_termino)
SELECT
  code,
  name,
  CASE WHEN active THEN 'Activo' ELSE 'Cerrado' END,
  COALESCE(created_at::date, CURRENT_DATE),
  COALESCE(created_at::date + interval '1 year', CURRENT_DATE + interval '1 year')
FROM contracts
ON CONFLICT (codigo_contrato) DO NOTHING;

-- Migrar solicitudes desde tabla "ticket_requests"
INSERT INTO solicitudes (
  tipo, estado, prioridad,
  id_trabajador_solicitante, nombre_solicitante, area, asunto, payload,
  nombre_revisor, observaciones, motivo_rechazo,
  fecha_creacion, fecha_revision, fecha_resolucion
)
SELECT
  tipo,
  status,
  priority,
  requester_id,
  requester_name,
  requester_area,
  subject,
  payload,
  current_assignee_name,
  resolution_note,
  rejection_reason,
  created_at,
  reviewed_at,
  resolved_at
FROM ticket_requests
ON CONFLICT DO NOTHING;
*/

-- Recargar el cache del esquema en PostgREST/Supabase
NOTIFY pgrst, 'reload schema';
