-- ============================================================
-- limpiar_bd.sql  —  Normalizacion y marcado de datos BD
-- Ejecutar en Supabase SQL Editor EN ESTE ORDEN:
--
--   BLOQUE 1: Estandarizar formato RUT  (115 registros)
--   BLOQUE 2: Agregar prefijo +56       (114 registros)
--   BLOQUE 3: Asignar cargo a Abbott    (1 registro)
--   BLOQUE 4: Marcar errores en auditoria (sexo/nac null)
--   BLOQUE 5: Marcar "Otro Contrato" en auditoria (20 registros)
--   BLOQUE 6: Marcar fecha dudosa Sebastian Lopez
--   BLOQUE 7: Registro global de limpieza
--
-- Generado: 2026-06-08
-- ============================================================


-- ============================================================
-- BLOQUE 1: Estandarizar RUT  "178313290" -> "17.831.329-0"
-- Afecta: 115 registros sin puntos ni guion
-- NO afecta: los 3 que ya tienen formato (tienen . o -)
-- ============================================================

-- Verificacion previa (ejecutar primero si quieres ver que cambiara):
/*
SELECT
  numero_identificacion AS antes,
  CONCAT(
    REPLACE( to_char( (left(numero_identificacion, -1))::bigint, 'FM999G999G999' ), ',', '.' ),
    '-',
    right(numero_identificacion, 1)
  ) AS despues,
  nombre_1,
  apellido_paterno
FROM trabajadores
WHERE numero_identificacion NOT LIKE '%.%'
  AND numero_identificacion NOT LIKE '%-%'
ORDER BY apellido_paterno
LIMIT 10;
*/

UPDATE trabajadores
SET
  numero_identificacion = CONCAT(
    REPLACE(
      to_char( (left(numero_identificacion, -1))::bigint, 'FM999G999G999' ),
      ',', '.'        -- En locale en-US usa coma; reemplazar por punto
    ),
    '-',
    right(numero_identificacion, 1)   -- Ultimo caracter = digito verificador (0-9 o K)
  )
WHERE
  numero_identificacion NOT LIKE '%.%'    -- No tiene punto = sin formato
  AND numero_identificacion NOT LIKE '%-%'; -- No tiene guion = sin formato

-- Verificacion post (descomentar para confirmar):
/*
SELECT COUNT(*) FILTER (WHERE numero_identificacion LIKE '%.%') AS con_formato,
       COUNT(*) FILTER (WHERE numero_identificacion NOT LIKE '%.%') AS sin_formato
FROM trabajadores;
*/


-- ============================================================
-- BLOQUE 2: Agregar prefijo +56 a telefonos de 9 digitos
-- Afecta: 114 registros con celular sin prefijo internacional
-- ============================================================

UPDATE trabajadores
SET
  celular_personal = '+56' || celular_personal
WHERE
  celular_personal ~ '^[0-9]{9}$'       -- Exactamente 9 digitos numericos
  AND celular_personal NOT LIKE '+56%'; -- Que no tengan prefijo aun

-- Verificacion:
/*
SELECT COUNT(*) FILTER (WHERE celular_personal LIKE '+56%') AS con_prefijo,
       COUNT(*) FILTER (WHERE celular_personal NOT LIKE '+56%') AS sin_prefijo
FROM trabajadores;
*/


-- ============================================================
-- BLOQUE 3: Asignar cargo a Josepedro Abbott
-- id: 44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6
-- Actualmente tiene cargo = null
-- ============================================================

UPDATE trabajadores
SET
  cargo = 'Administrativo'
WHERE id_trabajador = '44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6';

-- Verificacion:
/*
SELECT nombre_1, apellido_paterno, cargo FROM trabajadores
WHERE id_trabajador = '44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6';
*/


-- ============================================================
-- BLOQUE 4: Marcar en auditoria los campos null para revisar
-- (no se corrigen ahora — se revisan luego persona a persona)
-- ============================================================

-- Anderson Berna: sexo = null
-- id: 83fb3d21-5d72-400c-9b4e-287ed3994de6  |  RUT: 18.182.984-2
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
VALUES (
  'Trabajadores',
  'REVISION_REQUERIDA',
  '83fb3d21-5d72-400c-9b4e-287ed3994de6',
  'Anderson Berna',
  'Campo sexo vacio — completar manualmente. RUT en BD: 181829842 (verificar DV con cedula: CSV tiene 18.182.984-1, BD tiene ...984-2).',
  'Sistema'
);

-- Cristian Calderon: nacionalidad = null
-- id: d9db14a2-c3ad-4d6c-bdb0-55e52e2758ef  |  RUT: 16.055.419-3
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
VALUES (
  'Trabajadores',
  'REVISION_REQUERIDA',
  'd9db14a2-c3ad-4d6c-bdb0-55e52e2758ef',
  'Cristian Calderon',
  'Campo nacionalidad vacio — completar manualmente.',
  'Sistema'
);

-- Alex Chocobar: nacionalidad = null
-- id: cb954fae-4a58-443f-af48-84279930605c  |  RUT: 9.310.772-1
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
VALUES (
  'Trabajadores',
  'REVISION_REQUERIDA',
  'cb954fae-4a58-443f-af48-84279930605c',
  'Alex Chocobar',
  'Campo nacionalidad vacio — completar manualmente.',
  'Sistema'
);

-- Marjorie Callejas: sin cargo y sin email
-- id: 28de6e5d-56d3-424e-a593-6c4bd56f7b5e  |  RUT: 15.769.436-7
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
VALUES (
  'Trabajadores',
  'REVISION_REQUERIDA',
  '28de6e5d-56d3-424e-a593-6c4bd56f7b5e',
  'Marjorie Callejas',
  'Campos cargo y email_corporativo vacios — completar manualmente.',
  'Sistema'
);


-- ============================================================
-- BLOQUE 5: Marcar "Otro Contrato" los 20 que no estan en CSV
-- Son trabajadores de Valentina o Administracion, no de NCC30.
-- No son errores — se registran para trazabilidad.
-- ============================================================

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario) VALUES
('Trabajadores', 'INFO', '44aa0d8f-a52c-45a8-af6f-a4bde2e84fd6', 'Josepedro Abbott',    'Pertenece a otro contrato (Valentina/Administracion) — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '3313c7df-7cdd-43e0-8bbf-71826154e560', 'Natalia Arias',        'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '83fb3d21-5d72-400c-9b4e-287ed3994de6', 'Anderson Berna',       'Pertenece a otro contrato — no incluido en CSV NCC30. Verificar RUT con cedula.', 'Sistema'),
('Trabajadores', 'INFO', '28de6e5d-56d3-424e-a593-6c4bd56f7b5e', 'Marjorie Callejas',    'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '4d26e63d-4661-4166-b257-471d8771dafb', 'Cristian Cataldo',     'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '8f3e1919-dedb-49cf-b734-c819ba5fc678', 'Alex Cortes',          'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '33d99e03-064f-476a-9657-ac8aeebae8b3', 'Cristian Cortes',      'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '7895a5bb-baa4-4b51-a4ac-7f5599555e1b', 'Javier Cortes',        'Pertenece a otro contrato — no incluido en CSV NCC30. RUT: 19.463.790-K.', 'Sistema'),
('Trabajadores', 'INFO', 'c8c73f89-c66b-4fd7-8973-21dcc1252013', 'Diego Diaz',           'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '73e20c3f-2bad-4047-9325-76f4792af173', 'Laura Guerrero',       'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', 'd418af18-e383-416a-b8db-f6be9deec5d2', 'Pedro Hidalgo',        'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '51ee8ce0-4f9d-43d6-847a-6232998215e4', 'Jose Ibarra',          'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '4ff49c0b-cd2d-4ae2-a964-947f6689e0fa', 'Maria Lazo',           'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '3aa2f97b-3f94-47f9-9b41-7c0908428a03', 'Maria Leyton',         'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '04c57b19-f107-4cae-bef4-babc0560875b', 'Sebastian Lopez',      'Pertenece a otro contrato. REVISAR fecha_ingreso: registrada como 2016-03-02, posible typo (deberia ser 2026).', 'Sistema'),
('Trabajadores', 'INFO', '09395e91-1941-4eda-afab-7e0846bd8af6', 'Juan Loyola',          'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', 'acae1aa2-d9cb-4896-b9f3-0fe788393145', 'Guery Lucas',          'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '8e7bdb20-2116-4ec5-a240-5848f6096be5', 'Ian Mac Lean',         'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', 'f9f1879c-f171-4302-8948-a4ae70a6165f', 'Pedro Valenzuela',     'Pertenece a otro contrato — no incluido en CSV NCC30.', 'Sistema'),
('Trabajadores', 'INFO', '3b6948ed-eded-45dc-9356-dfc22d51b118', 'Jorge Vargas',         'Pertenece a otro contrato — no incluido en CSV NCC30. Verificar RUT con cedula.', 'Sistema');


-- ============================================================
-- BLOQUE 6: Marcar fecha de ingreso dudosa (Sebastian Lopez)
-- Su ingreso figura como 2016-03-02 — posible error (typo 2026)
-- ============================================================

-- Si confirmas que debe ser 2026-03-02:
-- UPDATE trabajadores
-- SET fecha_ingreso = '2026-03-02'
-- WHERE id_trabajador = '04c57b19-f107-4cae-bef4-babc0560875b';


-- ============================================================
-- BLOQUE 7: Registro global de esta operacion de limpieza
-- ============================================================

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario, meta)
VALUES (
  'Trabajadores',
  'Limpieza Datos',
  'bulk-limpieza-2026-06-08',
  'Tabla trabajadores',
  'Limpieza masiva pre-importacion NCC30: formato RUT (115), prefijo +56 (114), cargo Abbott, marcas auditoria errores y otros contratos.',
  'Sistema',
  '{"ruts_estandarizados": 115, "telefonos_prefijo": 114, "cargos_asignados": 1, "marcas_revision": 4, "marcas_otro_contrato": 20}'::jsonb
);

-- ============================================================
-- FIN
-- Proximo paso: descargar nuevo bd_trabajadores.csv y ejecutar
-- reconciliar_personal.ps1
-- ============================================================
