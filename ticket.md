# Modulo de Tickets IT - Monitoring SPA
Version: 1.0 | Fase del Plan: 4.5 (Soporte TI) | Enfoque: Simple, trazable y escalable

## 1. Estructura de Base de Datos

### Tabla: tickets (Nucleo principal)
| Campo | Tipo | Restriccion | Descripcion |
|-------|------|-------------|-------------|
| id_ticket | SERIAL | PK | Identificador unico interno |
| codigo_ticket | VARCHAR(20) | UNIQUE, NOT NULL | Formato: IT-YYYY-NNNN (auto-generado) |
| id_trabajador_solicitante | INT | FK -> trabajadores, NOT NULL | Solicitante del ticket |
| id_activo_relacionado | INT | FK -> activos, NULL | Equipo/activo asociado (opcional) |
| tipo | VARCHAR(20) | NOT NULL | Incidencia, Requerimiento, Consulta |
| categoria | VARCHAR(50) | NOT NULL | Hardware, Software, Red, Accesos, Otros |
| prioridad | VARCHAR(20) | NOT NULL | Baja, Media, Alta, Critica |
| estado | VARCHAR(20) | NOT NULL, DEFAULT 'Abierto' | Abierto, En Atencion, Cerrado |
| id_tecnico_responsable | INT | FK -> trabajadores, NULL | Tecnico TI asignado (modelo bandeja) |
| asunto | VARCHAR(150) | NOT NULL | Resumen del problema/solicitud |
| descripcion | TEXT | NULL | Detalle tecnico o requerimiento |
| fecha_creacion | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| fecha_asignacion | TIMESTAMP | NULL | Momento en que un tecnico toma el ticket |
| fecha_cierre | TIMESTAMP | NULL | Momento de resolucion/cierre |
| sla_respuesta_hasta | TIMESTAMP | NULL | Limite de tiempo para primera respuesta |
| sla_resolucion_hasta | TIMESTAMP | NULL | Limite de tiempo para solucion final |
| cumplio_sla_respuesta | BOOLEAN | DEFAULT TRUE | Se actualiza al registrar respuesta |
| cumplio_sla_resolucion | BOOLEAN | DEFAULT TRUE | Se actualiza al cerrar ticket |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |

### Tabla: ticket_comentarios (Historial de interaccion)
| Campo | Tipo | Restriccion | Descripcion |
|-------|------|-------------|-------------|
| id_comentario | SERIAL | PK | |
| id_ticket | INT | FK -> tickets, NOT NULL | |
| id_trabajador | INT | FK -> trabajadores, NOT NULL | Autor del comentario |
| texto | TEXT | NOT NULL | |
| es_interno | BOOLEAN | DEFAULT FALSE | TRUE: solo visible para TI. FALSE: visible para solicitante |
| fecha_creacion | TIMESTAMP | DEFAULT NOW() | |

### Tabla: ticket_adjuntos (Preparado para implementacion futura)
| Campo | Tipo | Restriccion | Descripcion |
|-------|------|-------------|-------------|
| id_adjunto | SERIAL | PK | |
| id_ticket | INT | FK -> tickets, NOT NULL | |
| nombre_archivo | VARCHAR(255) | NOT NULL | |
| ruta_archivo | TEXT | NOT NULL | Path relativo o URL en S3/servidor |
| tipo_mime | VARCHAR(50) | NULL | image/png, application/pdf, text/plain, etc. |
| tamano_bytes | INT | NULL | |
| subido_por | INT | FK -> trabajadores | |
| fecha_subida | TIMESTAMP | DEFAULT NOW() | |

### Tabla: ticket_sla_reglas (Configuracion de tiempos)
| Campo | Tipo | Restriccion | Descripcion |
|-------|------|-------------|-------------|
| id_regla | SERIAL | PK | |
| prioridad | VARCHAR(20) | NOT NULL | Baja, Media, Alta, Critica |
| categoria | VARCHAR(50) | NOT NULL | Hardware, Software, Red, Accesos, Otros |
| horas_respuesta | INT | NOT NULL | Tiempo maximo para primera atencion |
| horas_resolucion | INT | NOT NULL | Tiempo maximo para cierre |
| activo | BOOLEAN | DEFAULT TRUE | |

### Tabla: ticket_auditoria (Trazabilidad inmutable)
| Campo | Tipo | Restriccion | Descripcion |
|-------|------|-------------|-------------|
| id_log | SERIAL | PK | |
| id_ticket | INT | FK -> tickets, NOT NULL | |
| campo_modificado | VARCHAR(50) | NOT NULL | estado, prioridad, id_tecnico_responsable, etc. |
| valor_anterior | TEXT | | |
| valor_nuevo | TEXT | | |
| usuario_modifica | VARCHAR(100) | NOT NULL | Email o ID del operador |
| timestamp | TIMESTAMP | DEFAULT NOW() | |

## 2. Reglas de Negocio y Flujo

### Estados del Ticket
- Abierto: Ticket creado, en bandeja general de TI. Sin responsable asignado.
- En Atencion: Un tecnico se asigna el ticket. Se registra fecha_asignacion.
- Cerrado: Solucion confirmada o requerimiento entregado. Se registra fecha_cierre. No se permite edicion posterior sin reabrir.

### Modelo de Asignacion (Opcion B)
- El ticket ingresa sin id_tecnico_responsable.
- Cualquier tecnico de TI puede tomar el ticket desde la bandeja.
- Al asignarse, el sistema actualiza estado a En Atencion y registra el cambio en ticket_auditoria.
- Un ticket solo puede tener un tecnico responsable activo a la vez.

### Calculo de SLA (Prioridad + Categoria)
- Al crear el ticket, el backend consulta ticket_sla_reglas WHERE prioridad = X AND categoria = Y AND activo = TRUE.
- Se calcula sla_respuesta_hasta = fecha_creacion + INTERVAL 'X horas'.
- Se calcula sla_resolucion_hasta = fecha_creacion + INTERVAL 'Y horas'.
- Si no existe regla exacta, se aplica una regla por defecto (ej: prioridad Media, categoria Otros).
- Los campos cumplio_sla_respuesta y cumplio_sla_resolucion se validan al registrar el primer comentario tecnico o al cerrar el ticket.

### Validaciones Obligatorias
- Trabajador solicitante: SIEMPRE obligatorio.
- Activo relacionado: OPCIONAL. Solo requerido si el problema/solicitud deriva de un equipo o software especifico.
- Si se asigna un activo, el sistema verifica que el activo no este en estado Mantencion, Baja, Extraviado o Robado.
- Los comentarios con es_interno = TRUE no se notifican al solicitante ni aparecen en su portal.
- Los adjuntos se almacenan por ruta. La tabla esta lista para conectar con un servicio de almacenamiento (S3, MinIO, o disco local).

## 3. Script SQL Completo (PostgreSQL)

```sql
-- 1. Reglas SLA (Catalogo inicial)
CREATE TABLE ticket_sla_reglas (
    id_regla SERIAL PRIMARY KEY,
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Critica')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Hardware', 'Software', 'Red', 'Accesos', 'Otros')),
    horas_respuesta INT NOT NULL,
    horas_resolucion INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(prioridad, categoria)
);

-- Insertar reglas base (ejemplo ajustable)
INSERT INTO ticket_sla_reglas (prioridad, categoria, horas_respuesta, horas_resolucion) VALUES
('Critica', 'Red', 2, 8),
('Critica', 'Hardware', 4, 24),
('Critica', 'Software', 4, 12),
('Alta', 'Hardware', 8, 48),
('Alta', 'Software', 8, 24),
('Media', 'Hardware', 24, 72),
('Media', 'Software', 24, 48),
('Baja', 'Otros', 48, 120);

-- 2. Tabla Principal: Tickets
CREATE TABLE tickets (
    id_ticket SERIAL PRIMARY KEY,
    codigo_ticket VARCHAR(20) UNIQUE NOT NULL,
    id_trabajador_solicitante INT REFERENCES trabajadores(id_trabajador),
    id_activo_relacionado INT REFERENCES activos(id_activo),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Incidencia', 'Requerimiento', 'Consulta')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Hardware', 'Software', 'Red', 'Accesos', 'Otros')),
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Critica')),
    estado VARCHAR(20) NOT NULL DEFAULT 'Abierto' CHECK (estado IN ('Abierto', 'En Atencion', 'Cerrado')),
    id_tecnico_responsable INT REFERENCES trabajadores(id_trabajador),
    asunto VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP,
    fecha_cierre TIMESTAMP,
    sla_respuesta_hasta TIMESTAMP,
    sla_resolucion_hasta TIMESTAMP,
    cumplio_sla_respuesta BOOLEAN DEFAULT TRUE,
    cumplio_sla_resolucion BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Comentarios y Notas
CREATE TABLE ticket_comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_ticket INT REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    id_trabajador INT REFERENCES trabajadores(id_trabajador),
    texto TEXT NOT NULL,
    es_interno BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Adjuntos (Listo para implementacion futura)
CREATE TABLE ticket_adjuntos (
    id_adjunto SERIAL PRIMARY KEY,
    id_ticket INT REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tipo_mime VARCHAR(50),
    tamano_bytes INT,
    subido_por INT REFERENCES trabajadores(id_trabajador),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Auditoria de Cambios
CREATE TABLE ticket_auditoria (
    id_log SERIAL PRIMARY KEY,
    id_ticket INT REFERENCES tickets(id_ticket) ON DELETE CASCADE,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    usuario_modifica VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indices para rendimiento
CREATE INDEX idx_tickets_estado_fecha ON tickets(estado, fecha_creacion DESC);
CREATE INDEX idx_tickets_solicitante ON tickets(id_trabajador_solicitante);
CREATE INDEX idx_tickets_tecnico ON tickets(id_tecnico_responsable);
CREATE INDEX idx_tickets_activo ON tickets(id_activo_relacionado);
CREATE INDEX idx_tickets_sla ON tickets(sla_respuesta_hasta, sla_resolucion_hasta);
CREATE INDEX idx_comentarios_ticket ON ticket_comentarios(id_ticket, fecha_creacion DESC);
CREATE INDEX idx_auditoria_ticket ON ticket_auditoria(id_ticket, timestamp DESC);

-- 7. Trigger de Auditoria Simple
CREATE OR REPLACE FUNCTION fn_audit_tickets() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.estado IS DISTINCT FROM NEW.estado OR
           OLD.id_tecnico_responsable IS DISTINCT FROM NEW.id_tecnico_responsable OR
           OLD.prioridad IS DISTINCT FROM NEW.prioridad THEN
            INSERT INTO ticket_auditoria (id_ticket, campo_modificado, valor_anterior, valor_nuevo, usuario_modifica)
            VALUES (NEW.id_ticket, 'estado', OLD.estado, NEW.estado, CURRENT_USER);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_tickets
AFTER UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION fn_audit_tickets();