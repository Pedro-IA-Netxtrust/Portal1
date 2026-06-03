# Módulo de Trabajadores - Base Central del Sistema
**Proyecto:** Monitoring SPA  
**Enfoque:** Base abierta, simple, escalable y preparada para integrar otros módulos  
**Estado:** Fase inicial / pruebas internas  
**Restricciones:** Sin perfiles cerrados, sin restricción de usuario por ahora, sin bloqueo de módulos futuros

---

## 1. Objetivo

El módulo de trabajadores será la base central del sistema.  
Toda la operación futura dependerá de esta ficha: contratos, activos, tickets de TI, control operacional, reportes y trazabilidad general.

En esta etapa el objetivo es construir un ingreso detallado, claro y flexible, dejando el sistema abierto para pruebas y para incorporar más módulos más adelante.

---

## 2. Principios del módulo

- Los trabajadores son la columna vertebral del sistema.
- La información debe centralizarse en una sola base de datos.
- El ingreso debe ser detallado, pero simple de operar.
- No se definen perfiles ni restricciones de usuario por ahora.
- Todo debe quedar preparado para integrar contratos, activos, tickets y otros módulos.
- La primera versión debe priorizar captura de datos, trazabilidad y flexibilidad.

---

## 3. Alcance inicial

### Incluye
- Creación de ficha de trabajador.
- Edición de ficha de trabajador.
- Consulta de ficha.
- Datos personales, laborales y operativos.
- Relación futura con contratos, activos y tickets.
- Preparación para cargas posteriores de formación, exámenes y otros controles.

### No incluye por ahora
- Perfiles de usuario.
- Restricciones por rol.
- Flujos de aprobación.
- Bloqueos administrativos.
- Automatizaciones complejas.
- Integraciones externas.

---

## 4. Estructura de datos

### Tabla principal: `trabajadores`

#### Identificación
- `id_trabajador`
- `apellido_paterno`
- `apellido_materno`
- `nombre_1`
- `nombre_2`
- `sexo`
- `fecha_nacimiento`
- `ciudad_nacimiento`
- `nacionalidad`
- `tipo_identificacion`
- `numero_identificacion`
- `fecha_vencimiento_id`
- `estado_civil`

#### Contacto
- `email_corporativo`
- `email_personal`
- `celular_personal`
- `telefono_emergencia`
- `nombre_contacto_emergencia`
- `parentesco_emergencia`

#### Domicilio
- `region`
- `ciudad`
- `comuna`
- `calle`
- `numero_domicilio`
- `departamento_casa`

#### Previsión
- `afp`
- `sistema_salud`
- `nombre_isapre`
- `valor_plan_uf`

#### Bancario
- `banco`
- `tipo_cuenta`
- `numero_cuenta`

#### Laboral
- `fecha_ingreso`
- `tipo_contrato`
- `fecha_vencimiento_contrato`
- `cargo`
- `area_departamento`
- `modalidad_trabajo`

#### Operativo
- `talla_chaqueta`
- `talla_polera`
- `calzado_seguridad`
- `chaleco_geologo`
- `respirador`
- `vencimiento_carnet`
- `vencimiento_altura_geo`
- `vencimiento_psicosensometrico`
- `vencimiento_licencia_conducir`

#### Formación
- `titulo_profesional`
- `mencion_titulo`
- `universidad_titulo`
- `postgrado_1`
- `mencion_postgrado_1`
- `universidad_postgrado_1`
- `cursos_certificaciones`
- `cv_actualizado`
- `fecha_actualizacion_cv`
- `cert_sap_lms`
- `cert_soma_lms`
- `cert_ti`

---

## 5. Tabla relacionada: cargas familiares

### `cargas_seguro`
Esta tabla permite registrar dependientes o cargas asociadas al trabajador.

Campos sugeridos:
- `id_carga`
- `id_trabajador`
- `nombre_completo`
- `tipo_id_carga`
- `numero_id_carga`
- `fecha_nacimiento`
- `parentesco`

---

## 6. Reglas de validación iniciales

- `email_corporativo` debe ser único.
- El correo corporativo debe usar dominio `@monitoring.cl`.
- `numero_identificacion` debe validar según tipo de identificación.
- Si `tipo_identificacion` es `RUT`, no debe exigir vencimiento.
- Si `tipo_identificacion` es `DNI` o `PASAPORTE`, el vencimiento debe ser obligatorio.
- `celular_personal` debe aceptarse en formato internacional.
- Los campos básicos de identificación no deben quedar vacíos.
- El resto de los campos puede quedar abierto para pruebas y carga progresiva.

---

## 7. Flujo de ingreso

### Paso 1. Crear ficha
El usuario ingresa los datos básicos del trabajador y guarda el registro.

### Paso 2. Completar información adicional
Luego puede ir completando previsión, banco, formación, datos operativos y demás campos.

### Paso 3. Relación con otros módulos
Más adelante, esta ficha se conectará con:
- contratos,
- activos,
- tickets,
- cursos,
- exámenes,
- historial laboral.

---

## 8. Criterio de apertura del sistema

Por ahora el sistema debe quedar abierto para pruebas.  
Eso significa:

- sin usuarios restringidos,
- sin permisos por perfil,
- sin bloqueo de edición complejo,
- sin aprobación previa,
- sin dependencias obligatorias con otros módulos.

La idea es validar primero la calidad del ingreso de trabajadores y luego construir sobre esa base.

---

## 9. Relación con módulos futuros

### Contratos
Los trabajadores podrán asignarse a contratos activos y mantener historial.

### Activos
Los equipos tecnológicos y otros recursos podrán vincularse al trabajador.

### Tickets
Los tickets de soporte TI podrán originarse desde la ficha del trabajador o asociarse a su registro.

### Otros módulos
Más adelante se podrán agregar:
- cursos,
- exámenes,
- historial de cumplimiento,
- reportes operativos,
- documentos y respaldos.

---

## 10. Prioridad de desarrollo

1. Crear la tabla base de trabajadores.
2. Definir el formulario de ingreso.
3. Implementar validaciones mínimas.
4. Permitir edición y consulta.
5. Dejar lista la integración futura con otros módulos.
6. Recién después agregar permisos, perfiles y automatizaciones.

---

## 11. Resultado esperado

Al terminar esta fase, el sistema debe permitir:
- registrar trabajadores completos,
- consultar su información,
- editarlos sin restricciones complejas,
- y servir como base para todo el resto del portal.

---

## 12. Siguiente documento sugerido

Después de este MD, lo ideal es crear:
- `módulo-trabajadores-bd.md`
- `módulo-trabajadores-formulario.md`
- `módulo-trabajadores-validaciones.md`
- `módulo-trabajadores-flujo.md`
- `módulo-integraciones-futuras.md`