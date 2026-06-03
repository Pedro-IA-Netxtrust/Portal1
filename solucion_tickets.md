# Solución de configuración de tickets

## Objetivo
El trabajador ingresa al portal, selecciona un tipo de ticket y el sistema deriva la solicitud según reglas definidas por contrato. La solución contempla un único contrato como unidad de operación, múltiples destinatarios por tipo de ticket y copia tipo CC cuando corresponda.

## Alcance funcional
- Un contrato puede tener múltiples tipos de ticket configurados.
- Cada tipo de ticket puede tener un destinatario principal.
- Cada tipo de ticket puede tener uno o varios destinatarios secundarios en modo CC.
- El sistema debe guardar estado, historial, comentarios y adjuntos.
- El flujo debe permitir derivación automática según contrato y tipo de ticket.

## Modelo propuesto

### 1. contracts
Representa el contrato operativo.
- id
- name
- active
- created_at
- updated_at

### 2. ticket_types
Catálogo de tipos de ticket.
- id
- code
- name
- description
- active
- allow_attachments
- require_reason
- created_at
- updated_at

### 3. ticket_type_contract_settings
Configuración del tipo de ticket por contrato.
- id
- contract_id
- ticket_type_id
- primary_recipient_type
- primary_recipient_id
- enable_cc
- active
- created_at
- updated_at

### 4. ticket_type_cc_recipients
Destinatarios secundarios por tipo de ticket y contrato.
- id
- contract_id
- ticket_type_id
- recipient_type
- recipient_id
- created_at
- updated_at

### 5. ticket_requests
Solicitud creada por el trabajador.
- id
- contract_id
- ticket_type_id
- requester_id
- subject
- description
- status
- current_assignee_type
- current_assignee_id
- created_at
- updated_at

### 6. ticket_comments
Comentarios o seguimiento.
- id
- ticket_request_id
- user_id
- comment
- created_at

### 7. ticket_attachments
Adjuntos del ticket.
- id
- ticket_request_id
- file_name
- file_url
- file_type
- created_at

### 8. ticket_status_history
Trazabilidad de estados.
- id
- ticket_request_id
- from_status
- to_status
- changed_by
- changed_at
- note

## Reglas de negocio
- El contrato define la configuración vigente del ticket.
- El tipo de ticket define si lleva adjuntos y si requiere motivo.
- El destinatario principal recibe la acción principal.
- Los destinatarios CC reciben copia informativa sin cambiar el flujo principal.
- Si no existe configuración para un contrato, el sistema debe bloquear la creación o usar una configuración general, según se defina.
- Todo cambio de estado debe quedar en historial.

## Ejemplo operativo
### Reposición de EPP
- Contrato: Operación Norte.
- Tipo: Reposición de EPP.
- Destinatario principal: Encargado de Seguridad.
- CC: Jefatura de Contrato, Prevención de Riesgos.
- Adjuntos: opcionales, por ejemplo evidencia o foto.
- Estado inicial: creado.
- Estado siguiente: enviado.

### Vacaciones
- Contrato: Operación Norte.
- Tipo: Vacaciones.
- Destinatario principal: Jefatura directa.
- CC: RRHH.
- Adjuntos: opcionales o según política.

## Flujo
1. El trabajador inicia ticket.
2. El sistema identifica contrato y tipo.
3. Se busca configuración de destinatario principal.
4. Se agregan destinatarios CC si existen.
5. Se almacena ticket con estado inicial.
6. El destinatario recibe notificación.
7. Cada cambio queda en historial.
8. El trabajador puede ver estado y comentarios.

## Campos mínimos de configuración
- Contrato.
- Tipo de ticket.
- Destinatario principal.
- Destinatarios CC.
- Activo/inactivo.
- Requiere adjuntos.
- Requiere motivo.

## Recomendación técnica
Para que el sistema sea flexible, el destinatario principal y los CC deberían poder configurarse por contrato y por tipo de ticket. Eso permite que un mismo ticket, como reposición de EPP, vaya siempre al encargado de seguridad, mientras otros tickets usen otra ruta.

## Próximo paso
El siguiente paso es convertir esta solución en SQL para Supabase o PostgreSQL, con tablas, relaciones y campos listos para implementar.
