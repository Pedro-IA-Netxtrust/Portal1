-- ============================================================
-- PASO 1: Insertar trabajadores NUEVOS desde PERSONAL NCC30.csv
-- Generado: 2026-06-08 19:15
-- Total nuevos: 15
--
-- REVISAR antes de ejecutar:
--   sexo y nacionalidad usan valores por defecto (M / Chilena)
--   email_corporativo generado como nombre.apellido@monitoring.cl
-- ============================================================

-- Anderson Berna (18.182.984-1)
-- INSERT INTO trabajadores (
--   apellido_paterno, apellido_materno, nombre_1, nombre_2,
--   tipo_identificacion, numero_identificacion,
--   cargo, area_departamento, fecha_ingreso,
--   calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
--   modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
--   celular_personal, email_corporativo, fecha_nacimiento
-- ) VALUES (
--   'Berna', 'Colque', 'Anderson', 'Alexis',
--   'RUT', '18.182.984-1',
--   'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-11-03',
--   NULL, NULL, NULL, NULL, NULL,
--   'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
--   'PENDIENTE', 'anderson.berna@monitoring.cl', '1900-01-01'
-- )
-- ON CONFLICT (numero_identificacion) DO NOTHING;

-- Roger Brice�o (12.976.306-K)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Brice�o', 'Mart�nez', 'Roger', 'Javier',
  'RUT', '12.976.306-K',
  'Consultor', 'Serv.Est.M&C.Rep.Red.Contra.Incendio DCH NCC30', '2025-09-22',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'roger.briceo@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Alex Calcina (19.093.513-6)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Calcina', 'Olivares', 'Alex', 'Andr�s',
  'RUT', '19.093.513-6',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-10-27',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'alex.calcina@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Juan Castillo (15.013.426-9)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Castillo', 'Contreras', 'Juan', 'Manuel',
  'RUT', '15.013.426-9',
  'Consultor', 'Serv.Est.M&C. SAPCI SALAS ELEC DMH NCC30', '2023-12-11',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'juan.castillo@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Valentina Contreras (19.206.404-K)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Contreras', 'Garc�a', 'Valentina', 'Constanza',
  'RUT', '19.206.404-K',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-11-03',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'valentina.contreras@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Constanza Echeverr�a (19.204.703-K)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Echeverr�a', 'Alzamora', 'Constanza', 'Andrea',
  'RUT', '19.204.703-K',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-10-06',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'constanza.echeverra@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Alejandro Escalera (12.575.237-3)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Escalera', '�lvarez', 'Alejandro', 'Valent�n',
  'RUT', '12.575.237-3',
  'Consultor', 'Administrativo', '2025-07-15',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'alejandro.escalera@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Danilo Gonz�lez (12.517.017-K)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Gonz�lez', 'Gonz�lez', 'Danilo', 'Gabriel',
  'RUT', '12.517.017-K',
  'Consultor', 'Serv.Est.M&C. Upgrade Concent.DMH NCC30', '2025-12-01',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'danilo.gonzlez@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Robinson Mu�oz (13.789.195-6)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Mu�oz', 'V�squez', 'Robinson', 'Sebasti�n',
  'RUT', '13.789.195-6',
  'Consultor', 'Serv.Est.M&C. Upgrade Concent.DMH NCC30', '2024-01-08',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'robinson.muoz@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Ignacio Mu�oz (17.735.104-0)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Mu�oz', 'Gripe', 'Ignacio', 'Alejandro',
  'RUT', '17.735.104-0',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-11-10',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'ignacio.muoz@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Cristian Sep�lveda (12.911.580-7)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Sep�lveda', 'Atenas', 'Cristian', 'Igor',
  'RUT', '12.911.580-7',
  'Consultor', 'Serv.Est.M&C.Rep.Colapso.Domo DCH NCC30', '2023-12-11',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'cristian.seplveda@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Jhon Smith (20.093.850-K)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Smith', 'Campillay', 'Jhon', 'Franco',
  'RUT', '20.093.850-K',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-10-06',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'jhon.smith@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Yandari Trigo (19.205.745-0)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Trigo', 'Rodr�guez', 'Yandari', 'Mauro',
  'RUT', '19.205.745-0',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-12-02',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'yandari.trigo@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;

-- Jorge Vargas (19.462.270-3)
-- INSERT INTO trabajadores (
--   apellido_paterno, apellido_materno, nombre_1, nombre_2,
--   tipo_identificacion, numero_identificacion,
--   cargo, area_departamento, fecha_ingreso,
--   calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
--   modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
--   celular_personal, email_corporativo, fecha_nacimiento
-- ) VALUES (
--   'Vargas', 'Morales', 'Jorge', 'Bastian',
--   'RUT', '19.462.270-3',
--   'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-10-27',
--   NULL, NULL, NULL, NULL, NULL,
--   'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
--   'PENDIENTE', 'jorge.vargas@monitoring.cl', '1900-01-01'
-- )
-- ON CONFLICT (numero_identificacion) DO NOTHING;

-- Jorge Vivanco (19.507.160-8)
INSERT INTO trabajadores (
  apellido_paterno, apellido_materno, nombre_1, nombre_2,
  tipo_identificacion, numero_identificacion,
  cargo, area_departamento, fecha_ingreso,
  calzado_seguridad, talla_chaqueta, talla_polera, chaleco_geologo, respirador,
  modalidad_trabajo, tipo_contrato, nacionalidad, sexo,
  celular_personal, email_corporativo, fecha_nacimiento
) VALUES (
  'Vivanco', 'Jure', 'Jorge', 'Andoni',
  'RUT', '19.507.160-8',
  'Consultor', 'Serv.Apoyo PIMtto.Codelco DCH', '2025-10-20',
  NULL, NULL, NULL, NULL, NULL,
  'Presencial', 'Indefinido', 'Chilena', 'M',  -- VERIFICAR sexo y nacionalidad
  'PENDIENTE', 'jorge.vivanco@monitoring.cl', '1900-01-01'
)
ON CONFLICT (numero_identificacion) DO NOTHING;


