-- ============================================================
-- PASO 6 (FASE 6 — NO EJECUTAR AÚN): Importar cursos e inducciones
-- Fuente: columnas 22-53 de PERSONAL NCC30.csv
-- Tabla destino: control_cursos
--
-- Este script se generará automáticamente en la próxima iteración.
-- Por ahora documenta el mapeo CSV → BD.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- MAPEO: Columnas CSV → id_curso_catalogo
-- ──────────────────────────────────────────────────────────────
-- Col 22: Estado curso Formación para personas Trabajadoras (OPR) → 'CURSO_OPR_FORMACION'
-- Col 23: Estado Curso Primeros Auxilios                           → 'CURSO_PRIMEROS_AUXILIOS'
-- Col 24: Estado curso Manejo extintores                          → 'CURSO_EXTINTORES'
-- Col 25: Ergonomia2                                              → 'CURSO_ERGONOMIA'
-- Col 26: OPR decreto 44                                          → 'CURSO_OPR_D44'
-- Col 27: Radiación UV                                            → 'CURSO_RADIACION_UV'
-- Col 28: TMERT                                                   → 'CURSO_TMERT'
-- Col 29: TMERT CPHS                                              → 'CURSO_TMERT_CPHS'
-- Col 30: Capsula Silice                                          → 'CURSO_SILICE'
-- Col 31: SILICE                                                  → 'CURSO_SILICE_FULL'
-- Col 32: Capsula prexor                                          → 'CURSO_PREXOR'
-- Col 33: PREXOR                                                  → 'CURSO_PREXOR_FULL'
-- Col 34: Psicosociales                                           → 'CURSO_PSICOSOCIALES'
-- Col 35: Metales y Metaloides                                    → 'CURSO_METALES'
-- Col 36: Ley Karin                                               → 'CURSO_LEY_KARIN'
-- Col 37: IPN                                                     → 'CURSO_IPN'
-- Col 38: Perspectiva de género en SST                            → 'CURSO_GENERO_SST'
-- Col 39: Manejo Sustancias Químicas                              → 'CURSO_SUSTANCIAS_QUIMICAS'
-- Col 40: Estado IRL                                              → 'CURSO_IRL'
--
-- INDUCCIONES (cols 41-53):
-- Col 41: Inducción GEL Húmeda      → 'IND_GEL_HUMEDA'
-- Col 42: Inducción GEL Seca        → 'IND_GEL_SECA'
-- Col 43: Inducción MINA            → 'IND_MINA'
-- Col 44: Inducción Ch2y3           → 'IND_CH2Y3'
-- Col 45: Inducción CH1             → 'IND_CH1'
-- Col 46: Inducción SUBTE           → 'IND_SUBTE'
-- Col 47: Inducción MOFI FRA        → 'IND_MOFI_FRA'
-- Col 48: Inducción Eléctricos      → 'IND_ELECTRICOS'
-- Col 49: Inducción GSYS            → 'IND_GSYS'
-- Col 50: Inducción Refinería       → 'IND_REFINERIA'
-- Col 51: Inducción GAR             → 'IND_GAR'
-- Col 52: Inducción Fundición       → 'IND_FUNDICION'
-- Col 53: Estado charla Inducción Concentradora → 'IND_CONCENTRADORA'
-- ──────────────────────────────────────────────────────────────
-- Valores de estado en CSV → control_estado_curso en BD:
--   Fecha (ej: "25/05/2027") → 'Aprobado' con fecha_realizacion
--   Texto libre              → 'Aprobado' con fecha en observaciones
--   Vacío                    → 'Pendiente'
--   "No Asiste"              → 'No Asiste'
-- ──────────────────────────────────────────────────────────────

-- EJEMPLO de inserción (NO ejecutar):
/*
INSERT INTO control_cursos (
  id_trabajador, id_curso_catalogo, fecha_realizacion, estado, observaciones, registrado_por
)
SELECT
  t.id_trabajador,
  'CURSO_PRIMEROS_AUXILIOS',
  '2027-01-19'::date,
  'Aprobado'::control_estado_curso,
  'Importado desde PERSONAL NCC30.csv',
  'Sistema'
FROM trabajadores t
WHERE t.numero_identificacion = '9.631.711-5'
ON CONFLICT DO NOTHING;
*/

-- ============================================================
-- IMPORTANTE: Esperar validación de pasos 1-4 antes de este paso.
-- ============================================================
