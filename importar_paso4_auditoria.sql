-- ============================================================
-- PASO 4: Registrar operacion global en auditoria
-- Generado: 2026-06-08 19:15
-- Ejecutar DESPUES de los pasos 1, 2 y 3
-- ============================================================

-- Resumen global
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario, meta)
VALUES (
  'Trabajadores',
  'Importacion CSV',
  'bulk-ncc30-2026-06-08-19-15',
  'PERSONAL NCC30.csv',
  'Importacion masiva desde PERSONAL NCC30.csv. Nuevos: 15 | Actualizados: 98 | Sin cambios: 0 | Otro contrato: 20',
  'Sistema',
  '{"fuente": "PERSONAL NCC30.csv", "nuevos": 15, "actualizados": 98, "exactos": 0, "otro_contrato": 20}'::jsonb
);

-- Auditoria individual: trabajadores nuevos
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Anderson Berna',
  'Creado por importacion CSV NCC30. RUT: 18.182.984-1', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.182.984-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Roger Brice�o',
  'Creado por importacion CSV NCC30. RUT: 12.976.306-K', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.976.306-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Alex Calcina',
  'Creado por importacion CSV NCC30. RUT: 19.093.513-6', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.093.513-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Juan Castillo',
  'Creado por importacion CSV NCC30. RUT: 15.013.426-9', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.013.426-9' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Valentina Contreras',
  'Creado por importacion CSV NCC30. RUT: 19.206.404-K', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.206.404-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Constanza Echeverr�a',
  'Creado por importacion CSV NCC30. RUT: 19.204.703-K', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.204.703-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Alejandro Escalera',
  'Creado por importacion CSV NCC30. RUT: 12.575.237-3', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.575.237-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Danilo Gonz�lez',
  'Creado por importacion CSV NCC30. RUT: 12.517.017-K', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.517.017-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Robinson Mu�oz',
  'Creado por importacion CSV NCC30. RUT: 13.789.195-6', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.789.195-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Ignacio Mu�oz',
  'Creado por importacion CSV NCC30. RUT: 17.735.104-0', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.735.104-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Cristian Sep�lveda',
  'Creado por importacion CSV NCC30. RUT: 12.911.580-7', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.911.580-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Jhon Smith',
  'Creado por importacion CSV NCC30. RUT: 20.093.850-K', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.093.850-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Yandari Trigo',
  'Creado por importacion CSV NCC30. RUT: 19.205.745-0', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.205.745-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Jorge Vargas',
  'Creado por importacion CSV NCC30. RUT: 19.462.270-3', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.462.270-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Alta', id_trabajador, 'Jorge Vivanco',
  'Creado por importacion CSV NCC30. RUT: 19.507.160-8', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.507.160-8' LIMIT 1;

-- Auditoria individual: trabajadores actualizados
INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Javier Altamirano',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.831.329-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Katherina Alvarado',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.094.193-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Guillermo Alvarado',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.743.409-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Carlos Alvear',
  'Campos actualizados por importacion CSV NCC30: area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '8.609.678-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alfonso Anza',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.556.702-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Eduardo Arratia',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '7.933.710-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Claudia Augusto',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '21.910.425-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Claudio Avenda�o',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.821.895-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Daniel Az�a',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, fecha_ingreso, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.155.823-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Boris Badilla',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.100.706-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Enrique Baeza',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.813.037-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Sof�a Barbera',
  'Campos actualizados por importacion CSV NCC30: nombre_1, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '9.631.711-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristian Bascur',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.812.753-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Felipe Blanca',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.788.063-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Ana Blanco',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.186.436-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Fernando Bolados',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.362.669-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'B�rbara Borja',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.496.217-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Hugo Brice�o',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, nombre_2, fecha_ingreso, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.752.499-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Valentina B�rquez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.878.005-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Claudia Bugue�o',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.362.293-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristi�n Calder�n',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.055.419-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alejandra Campos',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.969.541-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Lucinda Castillo',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '11.932.893-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Chambi',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.696.522-9' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alex Chocobar',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, fecha_ingreso, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '9.310.772-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alexander Collants',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.734.131-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Contreras',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.258.764-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Karen Cort�s',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.093.205-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Rodrigo Cuevas',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.928.533-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristian D�az',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.868.211-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Mario D�az',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '25.936.133-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Rodrigo De la Cruz',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.692.436-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Fidel Delpino',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '25.958.444-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Karina Echeverr�a',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.233.881-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Mar�a Fern�ndez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.826.513-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Ricardo Flores',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.400.230-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Marco Flores',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.149.268-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Francisco Godoy',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '10.835.947-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Rodrigo Gonz�lez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.660.920-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristian Gonz�lez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.007.836-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristian Gonz�lez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.301.486-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Liset Hurtado',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.824.741-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Jara',
  'Campos actualizados por importacion CSV NCC30: nombre_1, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '7.521.183-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Gabriel Jara',
  'Campos actualizados por importacion CSV NCC30: area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.910.247-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Patricio Jim�nez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.348.673-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Javier Jorge',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '21.138.300-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Francisco Karach�n',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.440.035-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Eric Larenas',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '7.449.697-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Daniel Ledesma',
  'Campos actualizados por importacion CSV NCC30: area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.895.272-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Erwin Le�n',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.108.876-9' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Lira',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, nombre_1, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.124.198-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Juan Mamani',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.980.033-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Marcelo Marambio',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '10.324.155-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Benjam�n Marambio',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.542.216-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Dimas Medina',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.235.280-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Mairin Mijares',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.979.384-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Erick Miranda',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '19.538.198-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Vanessa Mora',
  'Campos actualizados por importacion CSV NCC30: fecha_ingreso, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.360.367-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Daniel Mora',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '10.859.253-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Yerko Navarro',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.575.373-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Ra�l Olcay',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.209.915-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alejandro Opitz',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '11.927.355-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Catalina Opitz',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.295.666-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'L�zaro Panire',
  'Campos actualizados por importacion CSV NCC30: nombre_1, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.172.546-9' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Rodrigo P�rez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.632.309-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Oscar Quezada',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.733.814-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Juan Rejas',
  'Campos actualizados por importacion CSV NCC30: area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '9.520.179-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Miguel Rivas',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.436.601-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jorge Rivera',
  'Campos actualizados por importacion CSV NCC30: area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '10.669.965-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Alejandra Rocco',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.735.038-9' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Annette Roco',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.362.400-8' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Javier Rodr�guez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, apellido_materno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.653.657-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Cristian Rojas',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '11.815.302-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Felipe Rojas',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.583.183-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Sheryl R�os',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.622.529-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'G�nesis Rowe',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.435.690-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Ruiz',
  'Campos actualizados por importacion CSV NCC30: nombre_1, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '10.637.608-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Manuel Salvatierra',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '20.348.706-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Bruno Schiappacasse',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '8.653.809-1' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Carol Silva',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.357.160-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Juan Silva',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '11.981.513-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Francisco S�nchez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.896.160-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Miguel Socorro',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '27.013.747-4' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Eduardo Sotomayor',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.418.007-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Nelson Torres',
  'Campos actualizados por importacion CSV NCC30: apellido_materno, nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.398.547-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jorge Torres',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '8.431.200-2' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Jos� Urra',
  'Campos actualizados por importacion CSV NCC30: nombre_1, cargo, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.111.695-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Monserrat Valencia',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '17.092.687-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Aldo Valenzuela',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.996.159-5' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Claudia Valle',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '14.437.930-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Eduardo Varas',
  'Campos actualizados por importacion CSV NCC30: nombre_2, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '8.267.447-0' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Enrique Veliz',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '15.684.647-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Vicmayra Vergara',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '26.042.465-3' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Pedro Villalobos',
  'Campos actualizados por importacion CSV NCC30: nombre_2, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '18.484.960-7' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Fanny Villarroel',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '13.632.315-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Carlos V�squez',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '11.613.430-6' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Juan Zepeda',
  'Campos actualizados por importacion CSV NCC30: calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '12.569.540-K' LIMIT 1;

INSERT INTO auditoria (modulo, accion, id_entidad, nombre_entidad, detalle, usuario)
SELECT 'Trabajadores', 'Modificacion', id_trabajador, 'Juan Zu�iga',
  'Campos actualizados por importacion CSV NCC30: apellido_paterno, area_departamento, calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador', 'Sistema'
FROM trabajadores WHERE numero_identificacion = '16.878.379-5' LIMIT 1;


