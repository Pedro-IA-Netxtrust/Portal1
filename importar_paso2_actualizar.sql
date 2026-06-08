-- ============================================================
-- PASO 2: Actualizar trabajadores con datos diferentes en CSV
-- Generado: 2026-06-08 19:15
-- Total a actualizar: 98
-- ============================================================

-- Javier Altamirano (17.831.329-0)
-- Diferencias:
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Andr�s',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '17.831.329-0';

-- Katherina Alvarado (17.094.193-4)
-- Diferencias:
--   calzado_seguridad: BD='38' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '17.094.193-4';

-- Guillermo Alvarado (13.743.409-1)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.743.409-1';

-- Carlos Alvear (8.609.678-1)
-- Diferencias:
--   area_departamento: BD='Serv.Est.M&C.Eq.Maniobras DCH NCC30' -> CSV='Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  area_departamento = 'Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '8.609.678-1';

-- Alfonso Anza (14.556.702-5)
-- Diferencias:
--   calzado_seguridad: BD='39' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.556.702-5';

-- Eduardo Arratia (7.933.710-2)
-- Diferencias:
--   nombre_2: BD='Hernán' -> CSV='Hern�n'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Hern�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '7.933.710-2';

-- Claudia Augusto (21.910.425-1)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '21.910.425-1';

-- Claudio Avenda�o (13.821.895-3)
-- Diferencias:
--   apellido_paterno: BD='Avendaño' -> CSV='Avenda�o'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Avenda�o',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.821.895-3';

-- Daniel Az�a (16.155.823-0)
-- Diferencias:
--   apellido_paterno: BD='Azúa' -> CSV='Az�a'
--   apellido_materno: BD='Fernández' -> CSV='Fern�ndez'
--   fecha_ingreso: BD='2022-08-22' -> CSV='2022-08-29'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Az�a',
  apellido_materno = 'Fern�ndez',
  fecha_ingreso = '2022-08-29',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.155.823-0';

-- Boris Badilla (16.100.706-4)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.100.706-4';

-- Enrique Baeza (15.813.037-8)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='XL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.813.037-8';

-- Sof�a Barbera (9.631.711-5)
-- Diferencias:
--   nombre_1: BD='Sofía' -> CSV='Sof�a'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C. Upgrade Concent.DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Sof�a',
  area_departamento = 'Serv.Est.M&C. Upgrade Concent.DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '9.631.711-5';

-- Cristian Bascur (19.812.753-1)
-- Diferencias:
--   apellido_materno: BD='Gómez' -> CSV='G�mez'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'G�mez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '19.812.753-1';

-- Felipe Blanca (19.788.063-5)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '19.788.063-5';

-- Ana Blanco (26.186.436-3)
-- Diferencias:
--   nombre_2: BD='María' -> CSV='Mar�a'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C. PRECLA DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Mar�a',
  area_departamento = 'Serv.Est.M&C. PRECLA DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.186.436-3';

-- Fernando Bolados (18.362.669-8)
-- Diferencias:
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   area_departamento: BD='Serv.Apoyo Planificación SOMA DMH' -> CSV='Serv.Apoyo PIMtto.Codelco DCH'
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Andr�s',
  area_departamento = 'Serv.Apoyo PIMtto.Codelco DCH',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.362.669-8';

-- B�rbara Borja (14.496.217-6)
-- Diferencias:
--   nombre_1: BD='Bárbara' -> CSV='B�rbara'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'B�rbara',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.496.217-6';

-- Hugo Brice�o (15.752.499-2)
-- Diferencias:
--   apellido_paterno: BD='Briceño' -> CSV='Brice�o'
--   apellido_materno: BD='López' -> CSV='L�pez'
--   nombre_2: BD='Aníbal' -> CSV='An�bal'
--   fecha_ingreso: BD='2021-09-06' -> CSV='2022-05-17'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Brice�o',
  apellido_materno = 'L�pez',
  nombre_2 = 'An�bal',
  fecha_ingreso = '2022-05-17',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.752.499-2';

-- Valentina B�rquez (15.878.005-4)
-- Diferencias:
--   apellido_paterno: BD='Bórquez' -> CSV='B�rquez'
--   apellido_materno: BD='Román' -> CSV='Rom�n'
--   calzado_seguridad: BD='38' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'B�rquez',
  apellido_materno = 'Rom�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.878.005-4';

-- Claudia Bugue�o (18.362.293-5)
-- Diferencias:
--   apellido_paterno: BD='Bugueño' -> CSV='Bugue�o'
--   apellido_materno: BD='Villalón' -> CSV='Villal�n'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Bugue�o',
  apellido_materno = 'Villal�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.362.293-5';

-- Cristi�n Calder�n (16.055.419-3)
-- Diferencias:
--   apellido_paterno: BD='Calderón' -> CSV='Calder�n'
--   nombre_1: BD='Cristián' -> CSV='Cristi�n'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Calder�n',
  nombre_1 = 'Cristi�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.055.419-3';

-- Alejandra Campos (15.969.541-7)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.969.541-7';

-- Lucinda Castillo (11.932.893-4)
-- Diferencias:
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='XXL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '11.932.893-4';

-- Jos� Chambi (14.696.522-9)
-- Diferencias:
--   nombre_1: BD='José' -> CSV='Jos�'
--   calzado_seguridad: BD='39' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Jos�',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.696.522-9';

-- Alex Chocobar (9.310.772-1)
-- Diferencias:
--   nombre_2: BD='Iván' -> CSV='Iv�n'
--   area_departamento: BD='Serv.Est.M&C.Alim.Vibratorios DCH NCC30' -> CSV='Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30'
--   fecha_ingreso: BD='2021-06-23' -> CSV='2021-08-23'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Iv�n',
  area_departamento = 'Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30',
  fecha_ingreso = '2021-08-23',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '9.310.772-1';

-- Alexander Collants (20.734.131-2)
-- Diferencias:
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='XXL' -> CSV=''
--   talla_polera: BD='XXL' -> CSV=''
--   chaleco_geologo: BD='XXL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.734.131-2';

-- Jos� Contreras (16.258.764-1)
-- Diferencias:
--   nombre_1: BD='José' -> CSV='Jos�'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Jos�',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.258.764-1';

-- Karen Cort�s (20.093.205-6)
-- Diferencias:
--   apellido_paterno: BD='Cortés' -> CSV='Cort�s'
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='S' -> CSV=''
--   talla_polera: BD='S' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Cort�s',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.093.205-6';

-- Rodrigo Cuevas (19.928.533-5)
-- Diferencias:
--   calzado_seguridad: BD='44' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '19.928.533-5';

-- Cristian D�az (16.868.211-5)
-- Diferencias:
--   apellido_paterno: BD='Díaz' -> CSV='D�az'
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   calzado_seguridad: BD='40' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'D�az',
  nombre_2 = 'Andr�s',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.868.211-5';

-- Mario D�az (25.936.133-8)
-- Diferencias:
--   apellido_paterno: BD='Díaz' -> CSV='D�az'
--   nombre_2: BD='José' -> CSV='Jos�'
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'D�az',
  nombre_2 = 'Jos�',
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '25.936.133-8';

-- Rodrigo De la Cruz (13.692.436-2)
-- Diferencias:
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Andr�s',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.692.436-2';

-- Fidel Delpino (25.958.444-2)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '25.958.444-2';

-- Karina Echeverr�a (18.233.881-8)
-- Diferencias:
--   apellido_paterno: BD='Echeverría' -> CSV='Echeverr�a'
--   calzado_seguridad: BD='38' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Echeverr�a',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.233.881-8';

-- Mar�a Fern�ndez (18.826.513-8)
-- Diferencias:
--   apellido_paterno: BD='Fernández' -> CSV='Fern�ndez'
--   apellido_materno: BD='Calderón' -> CSV='Calder�n'
--   nombre_1: BD='María' -> CSV='Mar�a'
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Fern�ndez',
  apellido_materno = 'Calder�n',
  nombre_1 = 'Mar�a',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.826.513-8';

-- Ricardo Flores (18.400.230-2)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='S' -> CSV=''
--   talla_polera: BD='S' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.400.230-2';

-- Marco Flores (18.149.268-6)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.149.268-6';

-- Francisco Godoy (10.835.947-1)
-- Diferencias:
--   nombre_2: BD='Aníbal' -> CSV='An�bal'
--   area_departamento: BD='Serv.Est.M&C.Eq.Maniobras DCH NCC30' -> CSV='Serv.Est.M&C. PRECLA DMH NCC30'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'An�bal',
  area_departamento = 'Serv.Est.M&C. PRECLA DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '10.835.947-1';

-- Rodrigo Gonz�lez (16.660.920-8)
-- Diferencias:
--   apellido_paterno: BD='González' -> CSV='Gonz�lez'
--   calzado_seguridad: BD='45' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Gonz�lez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.660.920-8';

-- Cristian Gonz�lez (13.007.836-2)
-- Diferencias:
--   apellido_paterno: BD='González' -> CSV='Gonz�lez'
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='XXL' -> CSV=''
--   talla_polera: BD='XXL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Gonz�lez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.007.836-2';

-- Cristian Gonz�lez (13.301.486-1)
-- Diferencias:
--   apellido_paterno: BD='González' -> CSV='Gonz�lez'
--   apellido_materno: BD='López' -> CSV='L�pez'
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Gonz�lez',
  apellido_materno = 'L�pez',
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.301.486-1';

-- Liset Hurtado (18.824.741-5)
-- Diferencias:
--   calzado_seguridad: BD='38' -> CSV=''
--   talla_chaqueta: BD='XL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.824.741-5';

-- Jos� Jara (7.521.183-K)
-- Diferencias:
--   nombre_1: BD='José' -> CSV='Jos�'
--   area_departamento: BD='Serv.Est.M&C.Alim.Vibratorios DCH NCC30' -> CSV='Serv.Est.M&C.Sist.Enfriamiento DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Jos�',
  area_departamento = 'Serv.Est.M&C.Sist.Enfriamiento DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '7.521.183-K';

-- Gabriel Jara (20.910.247-1)
-- Diferencias:
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.910.247-1';

-- Patricio Jim�nez (20.348.673-1)
-- Diferencias:
--   apellido_paterno: BD='Jiménez' -> CSV='Jim�nez'
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='S' -> CSV=''
--   talla_polera: BD='S' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Jim�nez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.348.673-1';

-- Javier Jorge (21.138.300-3)
-- Diferencias:
--   nombre_2: BD='null' -> CSV=''
--   calzado_seguridad: BD='39' -> CSV=''
--   talla_chaqueta: BD='S' -> CSV=''
--   talla_polera: BD='S' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = NULL,
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '21.138.300-3';

-- Francisco Karach�n (12.440.035-K)
-- Diferencias:
--   apellido_paterno: BD='Karachón' -> CSV='Karach�n'
--   nombre_2: BD='null' -> CSV=''
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Karach�n',
  nombre_2 = NULL,
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '12.440.035-K';

-- Eric Larenas (7.449.697-0)
-- Diferencias:
--   apellido_materno: BD='García' -> CSV='Garc�a'
--   area_departamento: BD='Serv.Est.M&C.Eq.Maniobras DCH NCC30' -> CSV='Serv.Est.M&C. Upgrade Concent.DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Garc�a',
  area_departamento = 'Serv.Est.M&C. Upgrade Concent.DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '7.449.697-0';

-- Daniel Ledesma (12.895.272-1)
-- Diferencias:
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C. PRECLA DMH NCC30'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  area_departamento = 'Serv.Est.M&C. PRECLA DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '12.895.272-1';

-- Erwin Le�n (14.108.876-9)
-- Diferencias:
--   apellido_paterno: BD='León' -> CSV='Le�n'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='XL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='XL' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Le�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.108.876-9';

-- Jos� Lira (26.124.198-6)
-- Diferencias:
--   apellido_materno: BD='Rodríguez' -> CSV='Rodr�guez'
--   nombre_1: BD='José' -> CSV='Jos�'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Rodr�guez',
  nombre_1 = 'Jos�',
  area_departamento = 'Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.124.198-6';

-- Juan Mamani (15.980.033-4)
-- Diferencias:
--   calzado_seguridad: BD='40' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.980.033-4';

-- Marcelo Marambio (10.324.155-3)
-- Diferencias:
--   apellido_materno: BD='Díaz' -> CSV='D�az'
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'D�az',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '10.324.155-3';

-- Benjam�n Marambio (19.542.216-8)
-- Diferencias:
--   nombre_1: BD='Benjamín' -> CSV='Benjam�n'
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Benjam�n',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '19.542.216-8';

-- Dimas Medina (26.235.280-3)
-- Diferencias:
--   apellido_materno: BD='Jiménez' -> CSV='Jim�nez'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Jim�nez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.235.280-3';

-- Mairin Mijares (26.979.384-8)
-- Diferencias:
--   calzado_seguridad: BD='39' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.979.384-8';

-- Erick Miranda (19.538.198-4)
-- Diferencias:
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '19.538.198-4';

-- Vanessa Mora (17.360.367-3)
-- Diferencias:
--   fecha_ingreso: BD='2024-11-24' -> CSV='2025-11-24'
--   calzado_seguridad: BD='40' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  fecha_ingreso = '2025-11-24',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '17.360.367-3';

-- Daniel Mora (10.859.253-2)
-- Diferencias:
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '10.859.253-2';

-- Yerko Navarro (12.575.373-6)
-- Diferencias:
--   nombre_2: BD='Román' -> CSV='Roman'
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='XXL' -> CSV=''
--   talla_polera: BD='XXL' -> CSV=''
--   chaleco_geologo: BD='XXL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Roman',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '12.575.373-6';

-- Ra�l Olcay (12.209.915-6)
-- Diferencias:
--   apellido_materno: BD='Sepúlveda' -> CSV='Sep�lveda'
--   nombre_1: BD='Raúl' -> CSV='Ra�l'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Sep�lveda',
  nombre_1 = 'Ra�l',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '12.209.915-6';

-- Alejandro Opitz (11.927.355-2)
-- Diferencias:
--   calzado_seguridad: BD='44' -> CSV=''
--   talla_chaqueta: BD='XL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '11.927.355-2';

-- Catalina Opitz (20.295.666-1)
-- Diferencias:
--   apellido_materno: BD='Sánchez' -> CSV='S�nchez'
--   nombre_2: BD='null' -> CSV=''
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'S�nchez',
  nombre_2 = NULL,
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.295.666-1';

-- L�zaro Panire (13.172.546-9)
-- Diferencias:
--   nombre_1: BD='Lázaro' -> CSV='L�zaro'
--   area_departamento: BD='Serv.Apoyo Planificación SOMA DMH' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'L�zaro',
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.172.546-9';

-- Rodrigo P�rez (13.632.309-1)
-- Diferencias:
--   apellido_paterno: BD='Pérez' -> CSV='P�rez'
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'P�rez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.632.309-1';

-- Oscar Quezada (14.733.814-7)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.733.814-7';

-- Juan Rejas (9.520.179-2)
-- Diferencias:
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  area_departamento = 'Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '9.520.179-2';

-- Miguel Rivas (16.436.601-4)
-- Diferencias:
--   apellido_materno: BD='Martínez' -> CSV='Mart�nez'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Mart�nez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.436.601-4';

-- Jorge Rivera (10.669.965-8)
-- Diferencias:
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '10.669.965-8';

-- Alejandra Rocco (20.735.038-9)
-- Diferencias:
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.735.038-9';

-- Annette Roco (18.362.400-8)
-- Diferencias:
--   calzado_seguridad: BD='38' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.362.400-8';

-- Javier Rodr�guez (16.653.657-K)
-- Diferencias:
--   apellido_paterno: BD='Rodríguez' -> CSV='Rodr�guez'
--   apellido_materno: BD='Pérez' -> CSV='P�rez'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Rodr�guez',
  apellido_materno = 'P�rez',
  area_departamento = 'Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.653.657-K';

-- Cristian Rojas (11.815.302-2)
-- Diferencias:
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '11.815.302-2';

-- Felipe Rojas (18.583.183-3)
-- Diferencias:
--   calzado_seguridad: BD='44' -> CSV=''
--   talla_chaqueta: BD='XL' -> CSV=''
--   talla_polera: BD='XL' -> CSV=''
--   chaleco_geologo: BD='XL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.583.183-3';

-- Sheryl R�os (14.622.529-2)
-- Diferencias:
--   apellido_paterno: BD='Ríos' -> CSV='R�os'
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'R�os',
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.622.529-2';

-- G�nesis Rowe (17.435.690-4)
-- Diferencias:
--   nombre_1: BD='Génesis' -> CSV='G�nesis'
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'G�nesis',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '17.435.690-4';

-- Jos� Ruiz (10.637.608-5)
-- Diferencias:
--   nombre_1: BD='José' -> CSV='Jos�'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Jos�',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '10.637.608-5';

-- Manuel Salvatierra (20.348.706-1)
-- Diferencias:
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='XXL' -> CSV=''
--   talla_polera: BD='XXL' -> CSV=''
--   chaleco_geologo: BD='XXL' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '20.348.706-1';

-- Bruno Schiappacasse (8.653.809-1)
-- Diferencias:
--   nombre_2: BD='null' -> CSV='Alberto'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Alberto',
  area_departamento = 'Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '8.653.809-1';

-- Carol Silva (13.357.160-4)
-- Diferencias:
--   apellido_materno: BD='Bugueño' -> CSV='Bugue�o'
--   calzado_seguridad: BD='37' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'Bugue�o',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.357.160-4';

-- Juan Silva (11.981.513-4)
-- Diferencias:
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   area_departamento: BD='Serv.Est.M&C.Eq.Maniobras DCH NCC30' -> CSV='Serv.Est.M&C.Sist.Enfriamiento DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'Andr�s',
  area_departamento = 'Serv.Est.M&C.Sist.Enfriamiento DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '11.981.513-4';

-- Francisco S�nchez (26.896.160-7)
-- Diferencias:
--   apellido_paterno: BD='Sánchez' -> CSV='S�nchez'
--   nombre_2: BD='Darío' -> CSV='Dar�o'
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'S�nchez',
  nombre_2 = 'Dar�o',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.896.160-7';

-- Miguel Socorro (27.013.747-4)
-- Diferencias:
--   apellido_materno: BD='null' -> CSV=''
--   area_departamento: BD='Serv.Est.M&C.Alim.Vibratorios DCH NCC30' -> CSV='Serv.Est.M&C. PRECLA DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = NULL,
  area_departamento = 'Serv.Est.M&C. PRECLA DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '27.013.747-4';

-- Eduardo Sotomayor (13.418.007-2)
-- Diferencias:
--   apellido_materno: BD='Álvarez' -> CSV='�lvarez'
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Sist.Enfriamiento DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = '�lvarez',
  area_departamento = 'Serv.Est.M&C.Sist.Enfriamiento DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.418.007-2';

-- Nelson Torres (15.398.547-2)
-- Diferencias:
--   apellido_materno: BD='Ríos' -> CSV='R�os'
--   nombre_2: BD='Andrés' -> CSV='Andr�s'
--   area_departamento: BD='Serv.Est.M&C. Etapa Ejecución DGM NCC30' -> CSV='Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_materno = 'R�os',
  nombre_2 = 'Andr�s',
  area_departamento = 'Serv.Est.M&C.Pre-cla Batet�a Hidro DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.398.547-2';

-- Jorge Torres (8.431.200-2)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '8.431.200-2';

-- Jos� Urra (15.111.695-7)
-- Diferencias:
--   nombre_1: BD='José' -> CSV='Jos�'
--   cargo: BD='Asistente Gestión Integral' -> CSV='Asistente Gesti�n Integral'
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  nombre_1 = 'Jos�',
  cargo = 'Asistente Gesti�n Integral',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.111.695-7';

-- Monserrat Valencia (17.092.687-0)
-- Diferencias:
--   calzado_seguridad: BD='37' -> CSV=''
--   talla_chaqueta: BD='S' -> CSV=''
--   talla_polera: BD='S' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '17.092.687-0';

-- Aldo Valenzuela (13.996.159-5)
-- Diferencias:
--   nombre_2: BD='Patricio' -> CSV=''
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = NULL,
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.996.159-5';

-- Claudia Valle (14.437.930-6)
-- Diferencias:
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '14.437.930-6';

-- Eduardo Varas (8.267.447-0)
-- Diferencias:
--   nombre_2: BD='null' -> CSV=''
--   area_departamento: BD='Serv.Est.M&C.Alim.Vibratorios DCH NCC30' -> CSV='Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = NULL,
  area_departamento = 'Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '8.267.447-0';

-- Enrique Veliz (15.684.647-3)
-- Diferencias:
--   calzado_seguridad: BD='42' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='M' -> CSV=''
--   respirador: BD='L' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '15.684.647-3';

-- Vicmayra Vergara (26.042.465-3)
-- Diferencias:
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='M' -> CSV=''
--   talla_polera: BD='M' -> CSV=''
--   chaleco_geologo: BD='S' -> CSV=''
--   respirador: BD='S' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '26.042.465-3';

-- Pedro Villalobos (18.484.960-7)
-- Diferencias:
--   nombre_2: BD='Héctor' -> CSV='H�ctor'
--   calzado_seguridad: BD='43' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  nombre_2 = 'H�ctor',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '18.484.960-7';

-- Fanny Villarroel (13.632.315-6)
-- Diferencias:
--   calzado_seguridad: BD='36' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '13.632.315-6';

-- Carlos V�squez (11.613.430-6)
-- Diferencias:
--   apellido_paterno: BD='Vásquez' -> CSV='V�squez'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'V�squez',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '11.613.430-6';

-- Juan Zepeda (12.569.540-K)
-- Diferencias:
--   calzado_seguridad: BD='41' -> CSV=''
--   talla_chaqueta: BD='L' -> CSV=''
--   talla_polera: BD='L' -> CSV=''
--   chaleco_geologo: BD='L' -> CSV=''
--   respirador: BD='M' -> CSV=''
UPDATE trabajadores SET
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '12.569.540-K';

-- Juan Zu�iga (16.878.379-5)
-- Diferencias:
--   apellido_paterno: BD='Zuñiga' -> CSV='Zu�iga'
--   area_departamento: BD='Administrativo' -> CSV='Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30'
--   calzado_seguridad: BD='null' -> CSV=''
--   talla_chaqueta: BD='null' -> CSV=''
--   talla_polera: BD='null' -> CSV=''
--   chaleco_geologo: BD='null' -> CSV=''
--   respirador: BD='null' -> CSV=''
UPDATE trabajadores SET
  apellido_paterno = 'Zu�iga',
  area_departamento = 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30',
  calzado_seguridad = NULL,
  talla_chaqueta = NULL,
  talla_polera = NULL,
  chaleco_geologo = NULL,
  respirador = NULL
WHERE numero_identificacion = '16.878.379-5';


