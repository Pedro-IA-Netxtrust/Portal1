-- ============================================================
-- WORKFLOWS AND NOTIFICATIONS SCHEMA — Supabase / PostgreSQL
-- ============================================================

-- 1. Agregar columna manager_id a la tabla contratos
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS manager_id UUID;

-- Agregar llave foránea a trabajadores si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_contratos_manager'
  ) THEN
    ALTER TABLE contratos 
      ADD CONSTRAINT fk_contratos_manager 
      FOREIGN KEY (manager_id) 
      REFERENCES trabajadores(id_trabajador) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Crear tabla para las plantillas y flujos de notificaciones por etapa
CREATE TABLE IF NOT EXISTS ticket_workflow_templates (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  stage          TEXT NOT NULL, -- 'Pendiente', 'En Revisión', 'Aprobada', 'Rechazada', 'Cancelada'
  
  -- Roles dinámicos a notificar
  notify_requester        BOOLEAN NOT NULL DEFAULT false,
  notify_assignee         BOOLEAN NOT NULL DEFAULT false,
  notify_unit_manager     BOOLEAN NOT NULL DEFAULT false,
  notify_cc_recipients    BOOLEAN NOT NULL DEFAULT false,
  
  -- Plantilla del correo
  email_subject  TEXT NOT NULL,
  email_body     TEXT NOT NULL,
  
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (ticket_type_id, stage)
);

-- Habilitar RLS
ALTER TABLE ticket_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS simples
DROP POLICY IF EXISTS "allow_authenticated_all" ON ticket_workflow_templates;
CREATE POLICY "allow_authenticated_all" 
  ON ticket_workflow_templates FOR ALL 
  USING (true);

-- Semillar plantillas por defecto para todos los tipos de ticket y las etapas principales
-- Primero borramos duplicados si existen para evitar errores en re-ejecución
DELETE FROM ticket_workflow_templates;

-- Etapa: Pendiente (Al crear la solicitud)
INSERT INTO ticket_workflow_templates (ticket_type_id, stage, notify_requester, notify_assignee, notify_unit_manager, notify_cc_recipients, email_subject, email_body)
SELECT 
  id, 
  'Pendiente', 
  true, 
  true, 
  true, 
  false, 
  'Nueva solicitud {codigo_solicitud} de {tipo_solicitud} recibida', 
  'Estimado/a,\n\nSe ha creado una nueva solicitud de {tipo_solicitud} con código {codigo_solicitud}.\n\nAsunto: {asunto}\nSolicitante: {nombre_solicitante}\nPrioridad: {prioridad}\n\nFavor revisar en el portal.'
FROM ticket_types;

-- Etapa: En Revisión (Cuando pasa a revisión)
INSERT INTO ticket_workflow_templates (ticket_type_id, stage, notify_requester, notify_assignee, notify_unit_manager, notify_cc_recipients, email_subject, email_body)
SELECT 
  id, 
  'En Revisión', 
  true, 
  false, 
  false, 
  false, 
  'Tu solicitud {codigo_solicitud} de {tipo_solicitud} está en revisión', 
  'Estimado/a {nombre_solicitante},\n\nTu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha cambiado de estado a "En Revisión".\n\nRevisor actual: {nombre_revisor}\n\nTe mantendremos informado sobre el avance del proceso.'
FROM ticket_types;

-- Etapa: Aprobada (Al aprobar)
INSERT INTO ticket_workflow_templates (ticket_type_id, stage, notify_requester, notify_assignee, notify_unit_manager, notify_cc_recipients, email_subject, email_body)
SELECT 
  id, 
  'Aprobada', 
  true, 
  false, 
  true, 
  true, 
  'Solicitud {codigo_solicitud} de {tipo_solicitud} APROBADA', 
  'Estimado/a {nombre_solicitante},\n\nNos complace informarte que tu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha sido APROBADA.\n\nObservaciones/Detalles:\n{observaciones}\n\nFecha de resolución: {fecha_resolucion}'
FROM ticket_types;

-- Etapa: Rechazada (Al rechazar)
INSERT INTO ticket_workflow_templates (ticket_type_id, stage, notify_requester, notify_assignee, notify_unit_manager, notify_cc_recipients, email_subject, email_body)
SELECT 
  id, 
  'Rechazada', 
  true, 
  false, 
  false, 
  false, 
  'Solicitud {codigo_solicitud} de {tipo_solicitud} RECHAZADA', 
  'Estimado/a {nombre_solicitante},\n\nTe informamos que tu solicitud con código {codigo_solicitud} ({tipo_solicitud}) ha sido RECHAZADA.\n\nMotivo del rechazo:\n{motivo_rechazo}\n\nFecha de resolución: {fecha_resolucion}'
FROM ticket_types;

-- Etapa: Cancelada (Al cancelar)
INSERT INTO ticket_workflow_templates (ticket_type_id, stage, notify_requester, notify_assignee, notify_unit_manager, notify_cc_recipients, email_subject, email_body)
SELECT 
  id, 
  'Cancelada', 
  false, 
  true, 
  false, 
  false, 
  'Solicitud {codigo_solicitud} CANCELADA por el trabajador', 
  'Estimado/a,\n\nTe informamos que la solicitud con código {codigo_solicitud} ({tipo_solicitud}) creada por {nombre_solicitante} ha sido CANCELADA por el propio trabajador.'
FROM ticket_types;
