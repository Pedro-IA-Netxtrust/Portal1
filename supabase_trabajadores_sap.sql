-- ============================================================
-- MÓDULO DE TRABAJADORES SAP (ACCESOS Y CURSOS) — Supabase / PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS trabajadores_sap (
  id_trabajador UUID PRIMARY KEY REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE,

  -- 1. Cuenta de Correo Codelco
  correo_adc_codelco DATE,
  aprobacion_correo_adc_codelco DATE,
  solicitud_cuenta_realizada_codelco DATE,
  cuenta_correo_activa_codelco BOOLEAN NOT NULL DEFAULT false,
  ticket_codelco TEXT,

  -- 2. Cuenta SAP
  correo_adc_sap DATE,
  aprobacion_correo_adc_sap DATE,
  solicitud_cuenta_sap DATE,
  cuenta_sap_activa BOOLEAN NOT NULL DEFAULT false,
  ticket_sap TEXT, -- ticket3

  -- 3. Perfiles SAP
  correo_adc_perfiles_sap DATE,
  aprobacion_correo_adc_perfiles_sap DATE,
  solicitud_perfiles_roles_sap DATE,
  ticket_perfiles_sap TEXT,
  perfiles_sap_activos BOOLEAN NOT NULL DEFAULT false,

  -- 4. Datamart
  requiere_datamart BOOLEAN NOT NULL DEFAULT false,
  correo_adc_datamart DATE,
  aprobacion_correo_adc_datamart DATE,
  solicitud_datamart DATE,
  datamart_activo BOOLEAN NOT NULL DEFAULT false,
  ticket_datamart TEXT, -- ticket2

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger de updated_at para mantener la sincronía temporal
CREATE OR REPLACE TRIGGER trg_trabajadores_sap_upd
  BEFORE UPDATE ON trabajadores_sap
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Habilitar RLS
ALTER TABLE trabajadores_sap ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso
DROP POLICY IF EXISTS "authenticated_full_access_trabajadores_sap" ON trabajadores_sap;
CREATE POLICY "authenticated_full_access_trabajadores_sap"
  ON trabajadores_sap FOR ALL
  USING (true);
