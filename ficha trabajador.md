# 📁 Estructura de Base de Datos: Ficha del Trabajador - Monitoring SPA
**Versión:** 2.0 | **Última actualización:** Mayo 2026  
**Objetivo:** Normalizar la carga de datos personales, laborales y formativos del personal, incluyendo soporte nativo para trabajadores extranjeros (DNI/Pasaporte) y formatos de contacto internacionales.

---

## 🗃️ 1. Estructura de Tablas

### 👤 `trabajadores` (Tabla Principal)
| Categoría | Campo | Tipo de Dato | PK/FK/Not Null | Descripción |
|-----------|-------|--------------|----------------|-------------|
| **Identificación** | `id_trabajador` | INT / SERIAL | PK, Auto | ID interno del sistema |
| | `apellido_paterno` | VARCHAR(50) | NOT NULL | |
| | `apellido_materno` | VARCHAR(50) | NOT NULL | |
| | `nombre_1` | VARCHAR(50) | NOT NULL | |
| | `nombre_2` | VARCHAR(50) | NULL | Segundo nombre (opcional) |
| | `sexo` | ENUM('M','F','Otro') | NOT NULL | |
| | `fecha_nacimiento` | DATE | NOT NULL | |
| | `ciudad_nacimiento` | VARCHAR(50) | NULL | |
| | `nacionalidad` | VARCHAR(50) | NOT NULL | Ej: Chilena, Venezolana, Peruana |
| | `tipo_identificacion` | ENUM('RUT','DNI','PASAPORTE') | NOT NULL | **Clave para extranjeros** |
| | `numero_identificacion` | VARCHAR(20) | NOT NULL | RUT con DV o DNI/Pasaporte |
| | `fecha_vencimiento_id` | DATE | NULL | Obligatorio si NO es RUT chileno |
| | `estado_civil` | ENUM('Soltero','Casado','Divorciado','Viudo','Conviviente') | NULL | |
| **Contacto** | `email_corporativo` | VARCHAR(100) | UNIQUE, NOT NULL | Dominio @monitoring.cl |
| | `email_personal` | VARCHAR(100) | NULL | |
| | `celular_personal` | VARCHAR(20) | NOT NULL | Formato internacional |
| | `telefono_emergencia` | VARCHAR(20) | NULL | |
| | `nombre_contacto_emergencia` | VARCHAR(100) | NULL | |
| | `parentesco_emergencia` | VARCHAR(50) | NULL | Madre, Esposa, Hermana, etc. |
| **Domicilio** | `region` | VARCHAR(50) | NULL | |
| | `ciudad` | VARCHAR(50) | NULL | |
| | `comuna` | VARCHAR(50) | NULL | |
| | `calle` | VARCHAR(100) | NULL | |
| | `numero_domicilio` | VARCHAR(10) | NULL | |
| | `departamento_casa` | VARCHAR(20) | NULL | Dpto, Casa, Sitio, etc. |
| **Previsión** | `afp` | VARCHAR(50) | NULL | |
| | `sistema_salud` | ENUM('Fonasa','Isapre') | NULL | |
| | `nombre_isapre` | VARCHAR(50) | NULL | |
| | `valor_plan_uf` | DECIMAL(5,3) | NULL | Solo si Isapre |
| **Bancario** | `banco` | VARCHAR(50) | NULL | |
| | `tipo_cuenta` | ENUM('Corriente','Vista','CuentaRUT','Ahorro') | NULL | |
| | `numero_cuenta` | VARCHAR(20) | NULL | |
| **Laboral** | `fecha_ingreso` | DATE | NOT NULL | |
| | `tipo_contrato` | ENUM('Indefinido','Plazo Fijo','Honorarios','Práctica') | NOT NULL | |
| | `fecha_vencimiento_contrato` | DATE | NULL | Solo si Plazo Fijo/Honorarios |
| | `cargo` | VARCHAR(100) | NULL | |
| | `area_departamento` | VARCHAR(50) | NULL | |
| | `modalidad_trabajo` | ENUM('Presencial','Teletrabajo','Híbrido') | NOT NULL | 🆕 **Nuevo campo** |
| **Operativo** | `talla_chaqueta` | VARCHAR(5) | NULL | S, M, L, XL, XXL |
| | `talla_polera` | VARCHAR(5) | NULL | |
| | `calzado_seguridad` | VARCHAR(10) | NULL | Número |
| | `chaleco_geologo` | VARCHAR(5) | NULL | |
| | `respirador` | VARCHAR(5) | NULL | |
| | `vencimiento_carnet` | DATE | NULL | |
| | `vencimiento_altura_geo` | DATE | NULL | |
| | `vencimiento_psicosensometrico` | DATE | NULL | |
| | `vencimiento_licencia_conducir` | DATE | NULL | |
| **Formación** | `titulo_profesional` | VARCHAR(100) | NULL | |
| | `mencion_titulo` | VARCHAR(100) | NULL | |
| | `universidad_titulo` | VARCHAR(100) | NULL | |
| | `postgrado_1` | VARCHAR(100) | NULL | |
| | `mencion_postgrado_1` | VARCHAR(100) | NULL | |
| | `universidad_postgrado_1` | VARCHAR(100) | NULL | |
| | `cursos_certificaciones` | TEXT / JSON | NULL | Lista estructurada |
| | `cv_actualizado` | BOOLEAN | NULL | |
| | `fecha_actualizacion_cv` | DATE | NULL | |
| | `cert_sap_lms` | BOOLEAN | NULL | |
| | `cert_soma_lms` | BOOLEAN | NULL | |
| | `cert_ti` | BOOLEAN | NULL | |

### 👨‍👩‍👧‍👦 `cargas_seguro` (Tabla Relacionada)
| Campo | Tipo | Relación |
|-------|------|----------|
| `id_carga` | INT PK | |
| `id_trabajador` | INT FK | → `trabajadores.id_trabajador` |
| `nombre_completo` | VARCHAR(100) | |
| `tipo_id_carga` | ENUM('RUT','DNI','Pasaporte') | |
| `numero_id_carga` | VARCHAR(20) | |
| `fecha_nacimiento` | DATE | |
| `parentesco` | VARCHAR(50) | |

---

## 🔍 2. Reglas de Validación (Actualizadas)

### 📱 Validación de Teléfonos (Soporte Internacional)
Dado que Monitoring SPA cuenta con personal extranjero (Venezuela, Perú, Bolivia, etc.), la validación estricta `+569XXXXXXXX` ha sido reemplazada por un estándar **E.164 flexible**:

| Regla | Detalle |
|-------|---------|
| **Formato almacenado** | `+[código_pais][número]` (Ej: `+56912345678`, `+584123456789`, `+51987654321`) |
| **Expresión Regular (Regex)** | `^(\+?\d{1,3})?[\s.-]?\d{7,10}$` |
| **Longitud permitida** | 8 a 15 dígitos (incluyendo código de país) |
| **Normalización** | Al ingresar, convertir automáticamente a formato E.164 eliminando espacios, guiones o paréntesis. |
| **Países frecuentes en la BD** | 🇨🇱 `+56` \| 🇻🇪 `+58` \| 🇵🇪 `+51` \| 🇧🇴 `+591` \| 🇨🇴 `+57` \| 🇦🇷 `+54` |

### 🆔 Validación de Identificación (RUT vs DNI/Extranjeros)
```sql
-- Lógica de validación condicional
IF tipo_identificacion = 'RUT' THEN
    validar_formato_rut(numero_identificacion); -- XX.XXX.XXX-X
    fecha_vencimiento_id = NULL; -- RUT chileno no vence
ELSIF tipo_identificacion IN ('DNI', 'PASAPORTE') THEN
    validar_longitud_dni_pasaporte(numero_identificacion);
    fecha_vencimiento_id IS NOT NULL; -- Obligatorio para extranjeros
END IF;