# Plan del portal Monitoring

## Visión general
Monitoring administrará sus trabajadores internos y los operará dentro de contratos activos. Cada contrato tendrá su centro de costo, sus unidades, su estructura operativa y sus trabajadores asignados, de modo que todos los módulos cuelguen de una misma base central.

## Principios de diseño
- El contrato es la unidad principal de operación.
- Los trabajadores pertenecen a Monitoring y se asignan a contratos.
- Centro de costo y unidades viven dentro del contrato.
- Cada módulo debe poder desarrollarse de forma independiente.
- Todos los módulos deben converger a una sola base de datos común.
- Los registros simples deben priorizarse sobre estructuras complejas en la primera etapa.

## Reglas de negocio
- Un trabajador puede tener historial de asignaciones a más de un contrato.
- Un contrato puede tener uno o más centros de costo.
- Un contrato puede dividirse en varias unidades.
- Una unidad puede tener cargos asociados y trabajadores asignados.
- Exámenes se registran inicialmente con resultado resumido, fecha y vigencia.
- Cursos se manejan como control básico de cumplimiento en esta etapa.
- Vehículos y notebooks se gestionan como activos asignables y trazables.
- El análisis de currículum funciona como apoyo al ingreso o reemplazo de trabajadores.

## Fases del plan

### Fase 1. Fundación
Construir el núcleo maestro del sistema: Monitoring, contratos, centros de costo, unidades, faenas, cargos y trabajadores. Esta fase define la estructura que sostendrá todo lo demás.

### Fase 2. Operación base
Agregar las asignaciones entre trabajador, contrato, unidad y cargo. Incluir historial de movimientos para saber dónde estuvo cada persona y cuándo.

### Fase 3. Control simple
Incorporar exámenes con resultado resumido, cursos simples y sus vigencias. La prioridad aquí es capturar cumplimiento sin complicar la lógica.

### Fase 4. Activos y recursos
Añadir control de vehículos y notebooks. Cada activo debe poder asignarse, devolverse y rastrearse en el tiempo.

### Fase 5. Reclutamiento
Sumar el análisis de currículum. Este módulo servirá para evaluar nuevos ingresos o reemplazos, y para registrar brechas frente a cargos o requisitos.

### Fase 6. Monitoreo y reportes
Construir dashboards, alertas y semáforos por contrato. Esta capa consumirá la información creada por los módulos previos y dará visibilidad operativa.

### Fase 7. Crecimiento modular
Preparar catálogos nuevos, automatizaciones, nuevos tipos de activos, más reglas y mejores filtros. La idea es ampliar sin romper la base principal.

## Módulos independientes
- Maestros corporativos.
- Contratos.
- Centros de costo.
- Unidades.
- Trabajadores.
- Asignaciones e ისტორiales.
- Exámenes simples.
- Cursos simples.
- Vehículos.
- Notebooks.
- Análisis de currículum.
- Dashboards y alertas.

## Cómo se conectan
Cada módulo debe trabajar por separado, pero todos deben guardar información en la misma base central. La lógica es que los maestros creen el contexto, las operaciones registren movimiento y los reportes consuman el resultado.

## Opciones de crecimiento
- Agregar más tipos de activos.
- Ampliar el análisis de currículum con brechas por cargo.
- Crear reglas automáticas por contrato o unidad.
- Incluir flujos de aprobación.
- Incorporar documentos y respaldos por trabajador o activo.
- Agregar indicadores por contrato, unidad o centro de costo.
- Integrar nuevos catálogos sin reestructurar la base principal.

## Criterio de orden
Primero se construye la base estructural, luego la operación, después el control, y al final la visibilidad. Ese orden reduce retrabajo y permite que cada parte quede lista para convivir con la base general.
