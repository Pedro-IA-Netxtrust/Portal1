-- ============================================================
-- estandarizar_ruts_bd.sql
-- Convierte los RUTs de la BD de formato "178313290" a "17.831.329-0"
--
-- EJECUTAR ANTES de reconciliar_personal.ps1
-- Requiere: que los RUTs en la BD no tengan puntos ni guion
--
-- IMPORTANTE: Ejecutar primero la seccion SELECT para verificar
--             que la conversion es correcta antes de hacer UPDATE.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PASO 0: Verificar estado actual (ejecutar primero, sin UPDATE)
-- ────────────────────────────────────────────────────────────
/*
SELECT
  id_trabajador,
  nombre_1,
  apellido_paterno,
  numero_identificacion AS rut_actual,
  -- Simular el formato nuevo
  CONCAT(
    to_char((SUBSTRING(numero_identificacion, 1, LENGTH(numero_identificacion)-1))::bigint, 'FM999G999G999'),
    '-',
    SUBSTRING(numero_identificacion, LENGTH(numero_identificacion), 1)
  ) AS rut_nuevo
FROM trabajadores
WHERE numero_identificacion NOT LIKE '%.%'   -- Solo los que no tienen punto
  AND numero_identificacion NOT LIKE '%-%'   -- Solo los que no tienen guion
ORDER BY apellido_paterno
LIMIT 10;
*/

-- ────────────────────────────────────────────────────────────
-- PASO 1: UPDATE de RUTs sin formato → formato DD.DDD.DDD-D
-- ────────────────────────────────────────────────────────────
-- Solo afecta registros donde el RUT no tiene punto ni guion.
-- El último caracter se separa como dígito verificador.

UPDATE trabajadores
SET
  numero_identificacion = CONCAT(
    REPLACE(
      to_char( (left(numero_identificacion, -1))::bigint, 'FM999G999G999' ),
      ',', '.'
    ),
    '-',
    right(numero_identificacion, 1)
  )
WHERE
  numero_identificacion NOT LIKE '%.%'
  AND numero_identificacion NOT LIKE '%-%'
  AND LENGTH(numero_identificacion) >= 2;

-- ────────────────────────────────────────────────────────────
-- PASO 2: Verificar resultado
-- ────────────────────────────────────────────────────────────
/*
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE numero_identificacion LIKE '%.%') AS con_punto,
  COUNT(*) FILTER (WHERE numero_identificacion LIKE '%-%') AS con_guion,
  COUNT(*) FILTER (WHERE numero_identificacion NOT LIKE '%.%') AS sin_punto
FROM trabajadores;
*/

-- ────────────────────────────────────────────────────────────
-- PASO 3: Registrar en auditoría
-- ────────────────────────────────────────────────────────────
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
VALUES (
  'Trabajadores',
  'Normalizacion',
  'bulk-rut-formato',
  'Tabla trabajadores',
  'Estandarizacion de formato RUT: de dígitos planos a DD.DDD.DDD-D.',
  'Sistema'
);

-- ────────────────────────────────────────────────────────────
-- NOTAS:
-- - La funcion to_char con 'FM999G999G999' usa coma como separador
--   por defecto en PostgreSQL. Si la BD usa locale es_CL, usará punto.
-- - Si el resultado tiene comas en lugar de puntos, usar:
--   REPLACE(to_char(...),',' ,'.') en lugar del to_char directo.
-- ────────────────────────────────────────────────────────────
