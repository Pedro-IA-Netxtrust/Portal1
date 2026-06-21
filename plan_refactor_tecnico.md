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
| 🟢 B11 | **Selectores Zustand "tontos"** (`const { trabajadores } = useStore()` se suscribe a todo el store). | 22 páginas + 16 componentes (ver §2.1 P1-9 ext) | Migrado a selectores granulares / `useShallow`. Memoizados derivados pesados en dashboard-onboarding. |

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
- `src/lib/logger.ts` — logger estructurado con `createLogger(scope)`.
- `src/app/error.tsx` — boundary de segmento raíz.
- `src/app/global-error.tsx` — fallback de último recurso.
- `vitest.config.ts` + `src/__tests__/` — suite Vitest (6 archivos, 78 tests).

### 1.6 Verificación final aplicada

- `npx tsc --noEmit` → 0 errores.
- `npx eslint <archivos modificados>` → 0 errores nuevos (solo warnings preexistentes ya degradados por la config del proyecto).
- `npx next build` → exitoso, 26 estáticas + 3 dinámicas.

### 1.7 Iteración 2026-06-14: cierre de prioridad alta y media

Resumen de la pasada que cerró todos los items 🔴 + 🟡 del roadmap previo (ver detalle en §2):

- **Selectores granulares (P1-9 ext):** 22 páginas + 16 componentes migrados a `useShallow`/selectores individuales.
- **Tests unitarios (P3-18):** Vitest configurado (`vitest.config.ts` con `resolve.tsconfigPaths`), 70 tests verdes en 4 archivos cubriendo `fechas`, `validadores`, `bloqueos-contextuales` y el cache de `onboarding-store`.
- **Logger central:** `src/lib/logger.ts` con `createLogger(scope)` y sink swappable; 18 stores migrados de `console.*`.
- **Flag `hydrated`:** 23 stores con `persist` + dashboards (`/`, `dashboard-onboarding`) consumen el flag para evitar flicker de "0%".
- **Side-effects aislados:** `createTareasForTrabajador` ya no aborta el alta de tareas si falla notificación o auditoría.
- **Invariante de cache documentada:** comentario inline + convención #9.

Verificación final tras la iteración: `tsc --noEmit` ✅, `next build` ✅, `npm run lint` ✅ (0 errors, warnings preexistentes), `npm test` ✅ (70/70).

### 1.8 Iteración 2026-06-20: limpieza progresiva de warnings ESLint

Reducción de **237 → 16 warnings** (0 errors). Cuatro fases; las tres primeras completadas y verificadas:

| Fase | Regla | Antes | Después | Enfoque |
|------|-------|-------|---------|---------|
| 🟢 1 | `@typescript-eslint/no-unused-vars` | ~128 | 1 | Eliminar imports/vars muertos; prefijo `_` en parámetros de signatura obligatoria; regla en `eslint.config.mjs` con `argsIgnorePattern: "^_"`. |
| 🟢 2 | `@typescript-eslint/no-explicit-any` | ~86 | 0 | Tipos explícitos por archivo (`ControlFormData`, `MappedWorker`, `Solicitud`, uniones de payload, etc.); `import type` entre stores para evitar ciclos. |
| 🟢 3 | `react-hooks/exhaustive-deps` | 8 | 0 | Deps faltantes añadidas; datos estáticos extraídos (`NAV_CONFIG` en sidebar); guards documentados donde evitan loops. |
| 🟡 4 | `react-hooks/set-state-in-effect` | ~15 | 15 | Pendiente — form-sync intencional; migrar a derivación en render o `useSyncExternalStore`. |

**Único warning restante de Fase 1:** import sin usar en `trabajador-form.tsx:15`.

**Archivos con `set-state-in-effect` pendientes (15):** `control/page`, `epp/page`, `flujos/page` ×2, `inventario/page`, `page.tsx`, `reuniones/page`, `vehiculos/inspecciones/page`, `activo-form`, `comunicaciones/generador-clima`, `contrato-form`, `control/asignar-control-modal`, `sidebar`, `ticket-form`, `trabajador-form`.

Verificación 2026-06-20: `tsc --noEmit` ✅, `npm test` ✅ (78/78), `next build` ✅, `eslint .` ✅ (0 errors, 16 warnings).

---

## 2. 📋 Plan pendiente (roadmap)

### 2.1 🔴 Alta prioridad

#### 🟢 P1-9 ext — Aplicar selectores granulares al resto de páginas (COMPLETADO 2026-06-14)
- **Estado:** todas las páginas y componentes migrados. Se eligió `useShallow` (zustand/react/shallow) para conservar la ergonomía del destructuring sin re-renders extra.
- **Páginas migradas:** `asistencia`, `comunicaciones`, `contratos`, `contratos/[id]`, `control`, `epp`, `inventario`, `tickets`, `vehiculos`, `vehiculos/inspecciones`, `solicitudes/*`, `usuarios`, `auditoria`, `proveedores`, `reuniones`, `sap`, `notebooks`, `talentos`, `flujos`, `onboarding`, `alimentacion`, `trabajadores/[id]`.
- **Componentes migrados:** `onboarding-wizard`, `trabajador-form`, `contrato-form`, `ticket-form`, `ticket-detalle`, `activo-form`, `activo-asignar`, `checklist-board`, `checklist-express`, `checklist-auditoria`, `checklist-diario`, `trabajador-detalle`, `alertas-trabajador`, `ciclo-vida-indicador`, `mi-perfil`, `comunicaciones/generador-tarjetas`.
- **Verificación:** `tsc --noEmit` y `next build` OK.

#### 🟢 P3-18 — Tests unitarios de funciones puras (COMPLETADO 2026-06-14)
- **Stack:** Vitest 4.x + happy-dom + `vite-tsconfig-paths` (vía `resolve.tsconfigPaths`). Scripts `npm test`, `npm run test:watch`, `npm run test:ui`.
- **Cobertura:**
  - `src/__tests__/lib/fechas.test.ts` — 14 tests (`diasRestantes`, `estaVencido`, `venceEn`).
  - `src/__tests__/lib/validadores.test.ts` — 16 tests, incluida regresión explícita de B9 (vacío → 0%, completo → 100%, escalera intermedia).
  - `src/__tests__/lib/bloqueos-contextuales.test.ts` — 30 tests para los 5 helpers de bloqueo + `getEstadoLaboralDerivado` + `getAlertasUrgencia`.
  - `src/__tests__/store/onboarding-store.test.ts` — 10 tests del cache (memoización por referencia, invalidación por nuevo array, anti-patrón de mutación in-place documentado como regresión).
- **Resultado:** **78 tests pasando** (6 archivos; añadidos `notificaciones-store.test.ts` y `ciclo-vida-store.test.ts` en iteración posterior).

### 2.2 🟡 Prioridad media

#### 🟢 Logging estructurado centralizado (COMPLETADO 2026-06-14)
- **Implementación:** `src/lib/logger.ts` expone `createLogger(scope)` con niveles `debug | info | warn | error`, sink swappable (`setSink`) y nivel mínimo configurable (`setMinLevel`). El sink default usa `console.*` con prefijo `[scope]`. En tests/prod se puede inyectar Sentry/Logflare con `setSink`.
- **Migración:** los 18 stores con logging activo migrados de `console.*` al logger (`onboarding-store`, `ciclo-vida-store`, `trabajadores-store`, `contratos-store`, `activos-store`, `inventario-store`, `proveedores-store`, `tickets-store`, `epp-store`, `control-store`, `workflows-store`, `solicitudes-store`, `reuniones-store`, `trabajadores-sap-store`, `asistencia-store`, `comunicaciones-store`, `auditoria-store`, `usuarios-store`, `alimentacion-store`, `mandantes-store`, `inspecciones-store`, `notificaciones-store`).

#### 🟢 Estado `hydrated` por store (COMPLETADO 2026-06-14)
- **Implementación:** flag manual `hydrated: boolean` en cada store con `persist` (23 stores). Inicial `false`; `onRehydrateStorage: () => (state) => { if (state) state.hydrated = true; }` lo lleva a `true` al terminar la rehidratación.
- **Consumo en UI:**
  - `src/app/page.tsx` (dashboard home): combina `trabajadoresHydrated && contratosHydrated && activosHydrated && ciclosHydrated && tareasHydrated` antes de renderizar KPIs reales; muestra el banner "Cargando Tablero Operativo Unificado..." mientras tanto.
  - `src/components/custom/dashboard-onboarding.tsx`: añade `DashboardOnboardingSkeleton` que se muestra hasta que `useTrabajadoresStore`, `useCicloVidaStore` y `useOnboardingStore` reportan `hydrated`.

#### 🟢 Refactor de `onboarding-store.createTareasForTrabajador` (COMPLETADO 2026-06-14)
- **Estado anterior:** secuencia "insert → set → notify → schedule → audit" en un único try/catch. Si la programación de recordatorios o la auditoría fallaba, el método retornaba `false` aunque las tareas ya estaban persistidas en Supabase y en el store.
- **Refactor aplicado:** se separa en dos fases:
  1. **Camino crítico** (insert + actualización del store) en su propio try/catch; si falla, no hay side-effects.
  2. **Side-effects** (notificación de creación, scheduling de recordatorios, auditoría) cada uno en su propio try/catch independiente. Una falla aquí queda en `log.warn` pero no aborta el éxito ya consolidado en (1).
- **Por qué este enfoque:** rollback de las tareas insertadas no es viable sin transacciones reales en Supabase y los side-effects son secundarios al estado canónico (las tareas). Documentado en el código.

#### 🟢 Documentación inline de las invariantes del cache (COMPLETADO 2026-06-14)
- **Implementación:** comentario extenso en `src/store/onboarding-store.ts` justo antes de `PROGRESS_CACHE` y `TAREAS_POR_TRABAJADOR_CACHE`, listando ejemplos OK/BUG. Convención #9 añadida en este documento.

### 2.3 🟢 Baja prioridad / mejoras futuras

#### 🟡 Warnings ESLint — Fase 4 pendiente (16 restantes, ver §1.8)
- 🟢 `@typescript-eslint/no-explicit-any` — **0 warnings** (completado 2026-06-20).
- 🟢 `react-hooks/exhaustive-deps` — **0 warnings** (completado 2026-06-20).
- 🟡 `@typescript-eslint/no-unused-vars` — **1 warning** (`trabajador-form.tsx:15`, import sin usar).
- 🟡 `react-hooks/set-state-in-effect` — **15 warnings** en 14 archivos (form-sync al montar/editar). Estrategias: derivar en render, key de reset, o supresión documentada caso a caso.

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
| B11 | Selectores Zustand "tontos" | ✅ Resuelto (22 páginas + 16 componentes) |
| B12 | 16 lint errors | ✅ Resuelto |
| B13 | `getTareasByFase` llamado 2× por render en wizard | ✅ Resuelto (vía cache de B1.10) |
| B14 | Recordatorios huérfanos al recargar | ✅ Resuelto (vía persist + rehydrate de B5) |
| B15 | Enums replicados | ✅ Resuelto |

### Métricas de impacto del refactor

- **Riesgo de pérdida de datos:** alto → nulo (no se pisan datos persistidos con respuestas vacías).
- **Notificaciones duplicadas:** ocurría en cada re-render del dashboard → eliminado por idempotencia.
- **`getProgressByTrabajador` por trabajador:** O(N) en cada llamada → O(1) después del primer cómputo.
- **Build:** 0 errores antes, 0 errores después. Mantenido.
- **Lint errors:** 16 antes → 0 después (2026-06-14).
- **Lint warnings:** 237 antes → 16 después (2026-06-20; ver §1.8).

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
9. **Cache de `onboarding-store` (WeakMap por identidad de array):** las llaves de `PROGRESS_CACHE` y `TAREAS_POR_TRABAJADOR_CACHE` son la referencia del array `tareas`. Cualquier `set({ tareas: ... })` debe producir una **nueva referencia** (`[...]`, `.map`, `.filter`); nunca reasignar la misma referencia ni mutar in-place (`push`, `splice`), porque el cache depende de identidad para invalidarse.

---

## 5. Próximos pasos recomendados

Orden sugerido para la próxima iteración:

1. **🔴 Fase 4 lint — `set-state-in-effect` (15 warnings)** — único bloque grande pendiente de la limpieza ESLint. Archivos listados en §1.8. Priorizar formularios de alta frecuencia (`trabajador-form`, `ticket-form`, `contrato-form`) y el auto-expand del sidebar.
2. **Cerrar Fase 1 residual** — eliminar el import sin usar en `trabajador-form.tsx:15` (1 warning).
3. **Wire del logger en producción** — el sink default es `console.*`. Falta un adaptador real (Sentry / Logflare / Datadog) y un punto único de inicialización (probablemente `src/app/layout.tsx` o `logger-init.tsx`).
4. **Optimizar fetch redundante (B6)** — varias páginas siguen disparando `fetchX()` al montar aunque persist ya hidrató. Con el flag `hydrated` ya disponible, gatear el fetch a "si está hidratado y han pasado N minutos desde el último fetch".
5. **Ampliar cobertura de tests** — 78 tests en lib + 3 stores; queda la mayoría de stores sin test. Patrón de mocks ya establecido en `onboarding-store.test.ts`.

Sin urgencia inmediata:
- Migración progresiva a Server Components (toda la app es `"use client"`).
- Cobertura E2E con Playwright para los flujos críticos (alta de trabajador, asignación de activos, completado de checklist).
