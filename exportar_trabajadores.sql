-- ============================================================
-- FASE 2: exportar_trabajadores.sql
-- Exportar estado actual de la tabla "trabajadores" en Supabase.
--
-- INSTRUCCIONES:
--   1. Abre el SQL Editor de Supabase
--   2. Pega y ejecuta esta query
--   3. Haz clic en "Download CSV" (ícono descarga arriba a la derecha)
--   4. Guarda el archivo como: bd_trabajadores.csv
--      (en la misma carpeta donde están los scripts PS1)
-- ============================================================

SELECT
  id_trabajador,
  numero_identificacion,
  apellido_paterno,
  apellido_materno,
  nombre_1,
  nombre_2,
  cargo,
  area_departamento,
  fecha_ingreso,
  calzado_seguridad,
  talla_chaqueta,
  talla_polera,
  chaleco_geologo,
  respirador,
  modalidad_trabajo,
  tipo_contrato,
  tipo_identificacion,
  nacionalidad,
  sexo,
  email_corporativo,
  celular_personal,
  created_at,
  updated_at
FROM trabajadores
ORDER BY apellido_paterno, nombre_1;

-- ──────────────────────────────────────────────────────────────
-- OPCIONAL: Ver un resumen rápido del estado actual
-- ──────────────────────────────────────────────────────────────
/*
SELECT
  COUNT(*)                                    AS total_registros,
  COUNT(DISTINCT numero_identificacion)       AS ruts_unicos,
  COUNT(*) FILTER (WHERE cargo IS NOT NULL)   AS con_cargo,
  COUNT(*) FILTER (WHERE fecha_ingreso IS NOT NULL) AS con_fecha_ingreso,
  MIN(created_at)::date                       AS primer_registro,
  MAX(created_at)::date                       AS ultimo_registro
FROM trabajadores;
*/
