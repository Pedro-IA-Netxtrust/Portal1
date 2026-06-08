-- ============================================================
-- PASO 5 (FASE 6 — NO EJECUTAR AÚN): Importar exámenes ocupacionales
-- Fuente: columnas 10-13 de PERSONAL NCC30.csv
-- Tabla destino: control_examenes
--
-- Este script se generará automáticamente desde el CSV cuando
-- se confirme la ejecución. Por ahora es un template documentado.
--
-- Columnas del CSV utilizadas:
--   Col 10: N° de Atención E. Ocupacional → observaciones / referencia
--   Col 11: Fecha Examen Ocupacional       → fecha_realizacion
--   Col 12: Fecha de Vigencia Examen       → fecha_vencimiento
--   Col 13: Institución Examen Ocupacional → observaciones
--
-- Catálogo de exámenes a usar (id_examen_catalogo):
--   'EXAM_OC_INGRESO'  → Examen Ocupacional de Ingreso
--   'EXAM_OC_VIGENCIA' → Examen Ocupacional Periódico
-- ============================================================

-- EJEMPLO de estructura (NO ejecutar — esperar confirmación):
/*
INSERT INTO control_examenes (
  id_trabajador,
  id_examen_catalogo,
  fecha_realizacion,
  fecha_vencimiento,
  resultado,
  observaciones,
  registrado_por
)
SELECT
  t.id_trabajador,
  'EXAM_OC_INGRESO',
  '2025-01-09'::date,          -- Fecha del CSV
  '2026-01-09'::date,          -- Vigencia del CSV
  'Aprobado',
  'Institución: ACHS | N° Atención: 1234567',
  'Sistema'
FROM trabajadores t
WHERE t.numero_identificacion = '8.609.678-1'  -- RUT del trabajador
ON CONFLICT DO NOTHING;
*/

-- ============================================================
-- IMPORTANTE: Ejecutar DESPUÉS de los pasos 1-4
-- El script reconciliar_personal.ps1 se actualizará para generar
-- los INSERTs reales de este paso en la próxima iteración.
-- ============================================================
