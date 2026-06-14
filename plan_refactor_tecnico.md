# Plan de Refactor Técnico — Portal Monitoring

> Bitácora de la auditoría técnica del 2026-06-14. Sirve dos propósitos:
> 1. **Referencia de lo ya hecho** (no repetir el trabajo, conservar el "por qué").
> 2. **Roadmap de lo pendiente** (priorizado, con criterios de aceptación).
>
> Convenciones:
> - 🟢 = completado y verificado (`tsc --noEmit` + `next build` OK).
> - 🟡 = pendiente, prioridad media.
> - 🔴 = pendiente, prioridad alta.
> - Cada bug original mantiene su id (`B1`…`B15`) para referencia cruzada.

---

## 0. Diagnóstico inicial (referencia histórica)

App **Next.js 16.2.6 / React 19.2 / Zustand 5 + persist / Supabase**. Núcleo funcional, pero la auditoría detectó:

- Fuga de datos mock al `localStorage` de producción.
- Condiciones de carrera entre `persist` y `fetch` de Supabase.
- Notificaciones duplicadas y lógica invertida en checklist.
- Validadores que computaban completitud incorrectamente.
- Cálculos pesados sin memoización + selectores Zustand "tontos".
- `window` referenciado sin guard en stores (riesgo SSR).
- Enums inline replicados en múltiples archivos.

Build limpio al inicio, pero con riesgos latentes que se materializaban tras navegación o re-fetch.

---

## 1. ✅ Tareas completadas

### 1.1 Bugs visibles para el usuario (P0)

| ID | Descripción | Archivos | Por qué se hizo así |
|----|-------------|----------|---------------------|
| 🟢 B1 | **Botón "marcar tarea completada" tenía condición invertida.** Solo disparaba cuando `editable === false`, opuesto a la intención. | `src/components/custom/checklist-board.tsx` | Se corrigió la condición y se agregó `disabled={tarea.completada \|\| !editable \|\| completando}` + `aria-label`. También se eliminaron `any` y se tipeó `tarea: TareaOnboarding`. |
| 🟢 B2 | **Notificaciones duplicadas.** `addNotification` no deduplicaba por `id` y el efecto del dashboard se reejecutaba al cargar stores en cascada. | `src/store/notificaciones-store.ts`, `src/app/page.tsx` | `addNotification` ahora es idempotente: upsert por id preservando `read` y `fecha`. Se eliminó el guard `notificacionesGeneradas.current` (innecesario con idempotencia). |
| 🟢 B3 | **`mockCiclos` filtrándose a producción + posible wipe de datos persistidos.** El mock se serializaba al primer load; `fetchCiclos` pisaba el estado con `[]` si Supabase devolvía vacío. | `src/store/ciclo-vida-store.ts` | Default `ciclos: []`. `fetchCiclos` solo sobrescribe si `data.length > 0`. Log de warn en dev cuando hay error. |
| 🟢 B4 | **Mismo wipe destructivo en onboarding-store.** | `src/store/onboarding-store.ts` | `fetchTareas` aplica el mismo criterio "no pisar persist con respuestas vacías". |
| 🟢 B7 | **Optional chaining inconsistente sobre `a.detalles_adicionales`.** Una rama usaba `?.`, otra no → `TypeError` posible. | `src/app/page.tsx` | Todas las lecturas usan `a.detalles_adicionales?.vencimiento_revision_tecnica`. El cálculo se refactorizó en `useMemo` con Map para dedupe O(1). |
| 🟢 B8 | **Wizard de onboarding usaba el mismo campo (`vencimiento_psicosensometrico`) para dos exámenes distintos.** | `src/components/custom/onboarding-wizard.tsx` | Wizard ahora consulta `useControlStore().examenes` por nombre de catálogo (`Preocupacional` vs `Psicosensométrico`). |

### 1.2 Estabilidad y rendimiento (P1)

| ID | Descripción | Archivos | Por qué se hizo así |
|----|-------------|----------|---------------------|
| 🟢 B5 | **`notificaciones-store` no persistido + `window.setTimeout` sin guard SSR + `as any`.** | `src/store/notificaciones-store.ts` | Reescrito con `persist + partialize`. Timers fuera de serialización. Nuevos `recordatorios` persistidos. `onRehydrateStorage` reprograma timers; los vencidos durante offline se disparan al cargar. `storage: createJSONStorage(...)` con fallback in-memory para SSR. Cero `any`. |
| 🟢 B9 | **`validarTrabajadorCompleto` daba 0% siempre.** Cada validador solo agregaba entradas inválidas, nunca válidas → `camposValidos/camposTotales = 0/N`. Además había typo `camosTotales`. | `src/lib/validadores.ts` | Reescrito: helper `check(campo, valor, error)` retorna SIEMPRE un `ValidacionCampo`, válido o inválido. `porcentajeCompletitud` ahora es significativo. |
| 🟢 — | **Cálculo de alertas O(N²) sin memo.** `Array.some` para dedupe + dentro del cuerpo de render. | `src/app/page.tsx` | `useMemo` con `Map<id, alerta>` para dedupe O(1). |
| 🟢 — | **`getProgressByTrabajador` recorría todas las tareas en cada llamada (en loops).** | `src/store/onboarding-store.ts` | Dos `WeakMap` indexadas por la referencia del array `tareas`: `TAREAS_POR_TRABAJADOR_CACHE` y `PROGRESS_CACHE`. Como Zustand siempre genera nuevo array en `set`, la invalidación es automática. Lookup O(1). |
| 🟢 B10 | **Comparaciones de fecha sin normalizar hora.** Mezcla de `new Date(x) < new Date()` con y sin `setHours(0,0,0,0)`. | `src/lib/fechas.ts` (nuevo), `src/app/page.tsx`, `src/lib/bloqueos-contextuales.ts` | Utilidad central: `diasRestantes`, `estaVencido`, `venceEn`. Constante `SIN_VENCIMIENTO = 999`. Todos los consumidores migrados. |
| 🟢 B11 | **Selectores Zustand "tontos"** (`const { trabajadores } = useStore()` se suscribe a todo el store). | `src/app/page.tsx`, `src/app/trabajadores/page.tsx`, `src/components/custom/dashboard-onboarding.tsx` | Migrado a `useStore(s => s.field)` por slice. Memoizados `topTrabajadores`, `tareasPendientes`, `promedioCompletitudOnboarding` en dashboard-onboarding. |

### 1.3 Higiene de código (P2)

| ID | Descripción | Archivos | Por qué se hizo así |
|----|-------------|----------|---------------------|
| 🟢 B12 | **2 lint errors `prefer-const`** en `trabajador-form.tsx` (`let dv`, `let dvCalculado`). | `src/components/custom/trabajador-form.tsx` | `let` → `const`. |
| 🟢 B12 | **14 lint errors `react/no-unescaped-entities`** (comillas literales en JSX). | `src/app/epp/page.tsx`, `src/app/inventario/page.tsx`, `src/app/vehiculos/inspecciones/page.tsx` ×3, `src/components/custom/contrato-form.tsx` ×2 | Reemplazados por `&ldquo;` / `&rdquo;`. |
| 🟢 — | **`Math.random().toString(36).substr(...)` (legacy)**. | `src/store/onboarding-store.ts` | `.slice(2, 11)`. Coherente con el resto del codebase. |
| 🟢 B15 | **Enums replicados en múltiples archivos.** | `src/lib/enums.ts` (nuevo) | Centralizados `ESTADOS_TICKET`, `ESTADOS_TICKET_ABIERTOS`, `PRIORIDADES_TICKET`, `ESTADOS_CONTRATO`, `TIPOS_CONTRATO`, `MODALIDADES_TRABAJO`, `TIPOS_IDENTIFICACION`, `SISTEMAS_SALUD`, `TIPOS_ACTIVO`, `ESTADOS_ACTIVO`. Patrón: `as const` array + tipo derivado con `(typeof X)[number]`. Stores importan los tipos, ya no los declaran inline. Helpers `esTicketAbierto`, `esTicketCerrado`. |

### 1.4 Resiliencia (P3)

| ID | Descripción | Archivos | Por qué se hizo así |
|----|-------------|----------|---------------------|
| 🟢 — | **No había Error Boundary.** Un crash en cualquier página tumbaba todo (sidebar incluido). | `src/app/error.tsx` (nuevo), `src/app/global-error.tsx` (nuevo) | API de Next.js 16.2+: usar `unstable_retry` (no `reset`). `error.tsx` preserva el root layout; `global-error.tsx` es fallback con inline styles para no depender de la cascada Tailwind. |

### 1.5 Archivos nuevos creados

- `src/lib/fechas.ts` — utilidades de fecha centralizadas.
- `src/lib/enums.ts` — enums de dominio centralizados.
- `src/app/error.tsx` — boundary de segmento raíz.
- `src/app/global-error.tsx` — fallback de último recurso.

### 1.6 Verificación final aplicada

- `npx tsc --noEmit` → 0 errores.
- `npx eslint <archivos modificados>` → 0 errores nuevos (solo warnings preexistentes ya degradados por la config del proyecto).
- `npx next build` → exitoso, 26 estáticas + 3 dinámicas.

---

## 2. 📋 Plan pendiente (roadmap)

### 2.1 🔴 Alta prioridad

#### P1-9 ext — Aplicar selectores granulares al resto de páginas
- **Estado:** Solo 3 páginas migradas (home, trabajadores, dashboard-onboarding).
- **Pendiente:** `asistencia/page.tsx`, `comunicaciones/page.tsx`, `contratos/page.tsx`, `contratos/[id]/page.tsx`, `control/page.tsx`, `epp/page.tsx`, `inventario/page.tsx`, `tickets/page.tsx`, `vehiculos/page.tsx`, `vehiculos/inspecciones/page.tsx`, `solicitudes/*`, `usuarios/page.tsx`, `auditoria/page.tsx`, `proveedores/page.tsx`, `reuniones/page.tsx`, `sap/page.tsx`, `notebooks/page.tsx`, `talentos/page.tsx`, `flujos/page.tsx`.
- **Patrón:** reemplazar `const { x, y } = useStore()` por `const x = useStore(s => s.x); const y = useStore(s => s.y);`.
- **Criterio de aceptación:** sin regresiones de comportamiento; React DevTools profiler muestra menos renders en navegación.

#### P3-18 — Tests unitarios de funciones puras
- **Pendiente:** `src/lib/validadores.ts`, `src/lib/bloqueos-contextuales.ts`, `src/lib/fechas.ts`, cache de `onboarding-store` (`progressMapFor`, `indexarTareasPorTrabajador`).
- **Por qué:** estas funciones tienen lógica de negocio (cálculo de porcentajes, días, completitud) sin side effects; son el target ideal para empezar la suite de tests.
- **Stack sugerido:** Vitest (compatible con Next.js 16 + Turbopack).

### 2.2 🟡 Prioridad media

#### Logging estructurado centralizado
- **Estado:** `console.error` / `console.warn` repartidos en stores.
- **Pendiente:** crear `src/lib/logger.ts` con niveles (`info`, `warn`, `error`) y un sink configurable (consola en dev, Sentry/Logflare en prod).
- **Migración:** reemplazar los `console.*` en los stores y boundaries con el logger.

#### Estado `hydrated` por store
- **Por qué:** el dashboard muestra "0%" parpadeantes durante la hidratación de `persist` + el `fetchX` inicial. Un flag `hydrated: boolean` permitiría mostrar skeletons hasta tener datos sólidos.
- **Patrón:** zustand `onRehydrateStorage` → `set({ hydrated: true })`.

#### Refactor de mutaciones en `onboarding-store.createTareasForTrabajador`
- **Estado:** secuencia "insert → audit → schedule" sin transacción. Si falla el schedule, el audit ya quedó hecho.
- **Pendiente:** envolver en una secuencia "persist → if ok → schedule + audit" con rollback ante fallo intermedio.

#### Documentación inline de las invariantes del cache
- **Por qué:** el cache de `onboarding-store` depende de que Zustand SIEMPRE genere arrays nuevos en `set`. Si alguien hace `set({ tareas: state.tareas })` (misma referencia) el cache no se invalidará.
- **Acción:** comentario claro en el store + invariante documentada en este plan.

### 2.3 🟢 Baja prioridad / mejoras futuras

#### Warnings preexistentes degradados
Estos están como `warn` en `eslint.config.mjs` por decisión histórica. Plan progresivo:
- `react-hooks/set-state-in-effect` (≈8 ocurrencias) — patrón intencional en form-sync, pero ideal migrar a `useSyncExternalStore` o derivar estado en render.
- `@typescript-eslint/no-explicit-any` (≈10 ocurrencias) — formularios dinámicos. Refactor por archivo.
- `@typescript-eslint/no-unused-vars` (≈30 ocurrencias, principalmente imports de íconos sin usar) — `eslint --fix` puede limpiar la mayoría.

#### `useShallow` para selectores con objeto
Si en el futuro algún componente necesita 4+ campos del mismo store, considerar `useShallow` para evitar overhead de selectores individuales. Actualmente no es necesario.

#### Migración progresiva a Server Components
Toda la app es `"use client"`. Algunas páginas (listados que solo muestran datos) podrían ser Server Components con fetch directo a Supabase server-side. Mayor complejidad pero mejor SEO/TTFB.

---

## 3. 🔍 Hallazgos originales — referencia histórica

Snapshot del audit del 2026-06-14 antes de cualquier cambio. Útil para entender la motivación detrás de cada fix.

### Bugs críticos detectados (mapeados a IDs B1-B15)

| ID | Hallazgo | Estado |
|----|----------|--------|
| B1 | Condición invertida en botón completar tarea (`checklist-board.tsx:196-197`) | ✅ Resuelto |
| B2 | Notificaciones duplicadas — `addNotification` sin dedupe + guard mal aplicado | ✅ Resuelto |
| B3 | `mockCiclos` filtrándose a localStorage + wipe destructivo | ✅ Resuelto |
| B4 | Mismo patrón en `onboarding-store.fetchTareas` | ✅ Resuelto |
| B5 | `notificaciones-store` sin persist + `window` SSR + `as any` | ✅ Resuelto |
| B6 | Cada página re-fetch al mount sin coordinar con `persist` | ⚠️ Mitigado (B3/B4 ya no pisan; queda optimizar fetch redundante) |
| B7 | Optional chaining inconsistente | ✅ Resuelto |
| B8 | Wizard usaba mismo campo para 2 exámenes | ✅ Resuelto |
| B9 | `validadores.ts` siempre 0% completitud | ✅ Resuelto |
| B10 | Comparaciones de fecha sin normalizar | ✅ Resuelto |
| B11 | Selectores Zustand "tontos" | ✅ Parcial (3 páginas hot; resto pendiente) |
| B12 | 16 lint errors | ✅ Resuelto |
| B13 | `getTareasByFase` llamado 2× por render en wizard | ✅ Resuelto (vía cache de B1.10) |
| B14 | Recordatorios huérfanos al recargar | ✅ Resuelto (vía persist + rehydrate de B5) |
| B15 | Enums replicados | ✅ Resuelto |

### Métricas de impacto del refactor

- **Riesgo de pérdida de datos:** alto → nulo (no se pisan datos persistidos con respuestas vacías).
- **Notificaciones duplicadas:** ocurría en cada re-render del dashboard → eliminado por idempotencia.
- **`getProgressByTrabajador` por trabajador:** O(N) en cada llamada → O(1) después del primer cómputo.
- **Build:** 0 errores antes, 0 errores después. Mantenido.
- **Lint:** 16 errores antes, 0 errores después.

---

## 4. Convenciones aprendidas (no romper)

Reglas implícitas del codebase descubiertas durante el refactor. Documentar para no violarlas en cambios futuros:

1. **Stores con `persist`:** nunca llamar `set({ X: [] })` desde un fetch si `X` ya tiene datos persistidos. Usar el patrón `if (!error && data && data.length > 0) set({ X: data })`.
2. **Mutaciones de estado en stores:** SIEMPRE producir nueva referencia de array/objeto (`[...arr, x]`, `arr.map(...)`, `{ ...obj, x }`). El cache de derivados depende de esto.
3. **Fechas:** usar `src/lib/fechas.ts`. Nunca `new Date(x) < new Date()` directo en lógica de negocio.
4. **Enums:** importar de `src/lib/enums.ts`. No declarar `"Abierto" | "En Atencion" | "Cerrado"` inline.
5. **Selectores Zustand:** `useStore(s => s.field)` en lugar de destructuring del store completo.
6. **Notificaciones con id semántico:** usar prefijos estables (`venc-${idTrabajador}-${label}`, `rem-${idTarea}`, etc.) para que la idempotencia funcione.
7. **`window`/`localStorage`:** envolver en `typeof window !== "undefined"` para tolerancia SSR.
8. **Next.js 16.2+ error boundaries:** API es `unstable_retry`, NO `reset` (cambio breaking introducido en 16.2).

---

## 5. Próximos pasos recomendados

Orden sugerido para la próxima iteración:

1. **Tests unitarios** (P3-18) — barrera de regresión para todo lo arreglado. Empezar con `validadores.ts` y `fechas.ts`.
2. **Logger central** — preparación para producción. Pequeño y aislado.
3. **Selectores granulares en páginas restantes** — mecánico, alto valor acumulado.
4. **Estado `hydrated` por store** — UX (eliminar parpadeos del dashboard).

Sin urgencia inmediata:
- Server Components migration.
- `useShallow` cuando aplique.
- Limpieza de warnings preexistentes.
