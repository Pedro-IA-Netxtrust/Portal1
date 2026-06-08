# Guía de Importación — Personal NCC30
_Orden de ejecución controlada para no romper nada_

---

## 📋 Resumen de Archivos

| Archivo | Qué hace | Cuándo ejecutar |
|---|---|---|
| `analizar_csv.ps1` | Analiza y valida el CSV | **Primero — AHORA** |
| `exportar_trabajadores.sql` | Exporta BD actual de Supabase | Después del paso 1 |
| `reconciliar_personal.ps1` | Compara y genera los SQL | Después de tener el export |
| `reporte_diferencias.md` | Resumen para revisión humana | Leer antes de ejecutar SQL |
| `importar_paso1_nuevos.sql` | Inserta trabajadores nuevos | Paso 1 en Supabase |
| `importar_paso2_actualizar.sql` | Actualiza campos que cambiaron | Paso 2 en Supabase |
| `importar_paso3_revision.sql` | Marca en auditoría los que revisar | Paso 3 en Supabase |
| `importar_paso4_auditoria.sql` | Registra la operación completa | Paso 4 en Supabase |
| `importar_paso5_examenes.sql` | Template exámenes (Fase 6) | ⏸ No ejecutar aún |
| `importar_paso6_cursos.sql` | Template cursos (Fase 6) | ⏸ No ejecutar aún |

---

## PASO 1 — Analizar el CSV

> [!IMPORTANT]
> Ejecuta esto primero. Te mostrará problemas en el CSV antes de tocar la BD.

Abre PowerShell en la carpeta del proyecto:

```powershell
cd "C:\Users\Peyo\Documents\Portal Monitoring"
.\analizar_csv.ps1
```

**Resultado:** Se genera `csv_analisis.md`

**Revisa:**
- ¿Hay RUTs con dígito inválido? → Corrígelos en el CSV antes de continuar
- ¿Hay duplicados de RUT? → Determina cuál es el correcto
- ¿Hay fechas inválidas? → Corrige el formato a `DD/MM/YYYY`

---

## PASO 2 — Exportar datos actuales de Supabase

1. Abre el **SQL Editor** en Supabase
2. Pega y ejecuta el contenido de `exportar_trabajadores.sql`
3. Haz clic en **Download CSV** (ícono arriba a la derecha del resultado)
4. Guarda el archivo como **`bd_trabajadores.csv`** en la carpeta del proyecto

> [!NOTE]
> El CSV de Supabase usa **coma (`,`)** como separador. El script lo detecta automáticamente.

---

## PASO 3 — Reconciliar CSV vs BD

Con el `bd_trabajadores.csv` ya descargado:

```powershell
.\reconciliar_personal.ps1
```

**Resultado:** Se generan los 4 archivos SQL + el reporte

---

## PASO 4 — Revisar el reporte

Abre `reporte_diferencias.md` y revisa:

1. **Nuevos (➕):** ¿Son todos trabajadores reales que deberían estar en el sistema?
2. **Actualizaciones (🔄):** ¿Los cambios de campo tienen sentido? ¿No hay errores?
3. **Solo en BD (⚠️):** ¿Estos trabajadores siguen activos o ya se fueron?

> [!CAUTION]
> No ejecutes los SQL hasta haber revisado el reporte. El objetivo es no romper nada.

---

## PASO 5 — Ejecutar SQL en Supabase (en orden)

Ejecuta cada archivo **uno a la vez** en el SQL Editor de Supabase:

### 5.1 — Nuevos trabajadores
```
importar_paso1_nuevos.sql
```
- Verifica que no haya errores de constraint
- Si hay error en un RUT, comenta ese INSERT y continúa

### 5.2 — Actualizaciones
```
importar_paso2_actualizar.sql
```
- Cada UPDATE es independiente — si uno falla no afecta los demás

### 5.3 — Marcar para revisión
```
importar_paso3_revision.sql
```
- Registra en auditoría los que están en BD pero no en CSV

### 5.4 — Registrar operación en auditoría
```
importar_paso4_auditoria.sql
```
- Ejecutar **último** — registra el resumen global de la importación

---

## PASO 6 — Verificación post-importación

Ejecuta en Supabase SQL Editor:

```sql
-- Total de trabajadores tras importación
SELECT COUNT(*) FROM trabajadores;

-- Últimas altas registradas
SELECT nombre_entidad, detalle, fecha_at 
FROM auditoria 
WHERE accion = 'Alta' 
ORDER BY fecha_at DESC 
LIMIT 20;

-- Registros para revisión
SELECT nombre_entidad, detalle, fecha_at
FROM auditoria
WHERE accion = 'REVISION_REQUERIDA'
ORDER BY fecha_at DESC;

-- Verificar que no haya RUTs duplicados
SELECT numero_identificacion, COUNT(*) as cnt
FROM trabajadores
GROUP BY numero_identificacion
HAVING COUNT(*) > 1;
```

---

## FASE 6 — Cursos y Exámenes (próxima iteración)

Una vez validada la importación base:

1. Revisar `importar_paso5_examenes.sql` (template con mapeo documentado)
2. Revisar `importar_paso6_cursos.sql` (template con mapeo de 32 cursos/inducciones)
3. Confirmar con el usuario antes de ejecutar

> [!NOTE]
> Los templates ya tienen el mapeo completo columna → campo BD. Solo falta generar los INSERTs reales desde el script PowerShell (próxima iteración).

---

## ⚠️ Cosas a tener en cuenta

- **sexo y nacionalidad** en los INSERT nuevos están como `'M'` y `'Chilena'` por defecto — corregir manualmente los casos que no correspondan
- **email_corporativo** se genera automáticamente como `nombre.apellido@monitoring.cl` — verificar ortografía
- **celular_personal** se inserta como `'PENDIENTE'` — completar después uno a uno
- Los campos no disponibles en el CSV (fecha_nacimiento, previsión, banco) quedan en `NULL` y se completan progresivamente

---

_Scripts generados automáticamente por el sistema de reconciliación del Portal Monitoring_
