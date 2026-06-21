"use client";

import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Trabajador } from "@/store/trabajadores-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useControlStore } from "@/store/control-store";
import { validacionesPorFase, obtenerErroresPendientes } from "@/lib/validadores";
import { estaVencido } from "@/lib/fechas";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader,
} from "lucide-react";

type Fase = "datos_personales" | "laboral" | "administracion" | "seguridad_control" | "equipamiento" | "operacion";

const FASES: { id: Fase; nombre: string; descripcion: string }[] = [
  { id: "datos_personales", nombre: "Datos Personales", descripcion: "Información básica del trabajador" },
  { id: "laboral", nombre: "Laboral", descripcion: "Datos del contrato y asignación" },
  { id: "administracion", nombre: "Administración", descripcion: "Datos administrativos y tallas" },
  { id: "seguridad_control", nombre: "Seguridad", descripcion: "Exámenes y certificaciones" },
  { id: "equipamiento", nombre: "Equipamiento", descripcion: "Entrega de activos" },
  { id: "operacion", nombre: "Operación", descripcion: "Habilitación en sistemas" },
];

interface OnboardingWizardProps {
  trabajador: Trabajador;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function OnboardingWizard({ trabajador, onComplete, onCancel }: OnboardingWizardProps) {
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const transicionarEstado = useCicloVidaStore((s) => s.transicionarEstado);
  const { createTareasForTrabajador, getTareasByFase } = useOnboardingStore(
    useShallow((s) => ({
      createTareasForTrabajador: s.createTareasForTrabajador,
      getTareasByFase: s.getTareasByFase,
    }))
  );

  const faseActual = FASES[pasoActual];
  const esUltimoPaso = pasoActual === FASES.length - 1;
  const esPrimerPaso = pasoActual === 0;

  // Obtener errores de validación para la fase actual
  const erroresValidacion = obtenerErroresPendientes(trabajador, faseActual.id as keyof typeof validacionesPorFase);
  const puedeAvanzar = erroresValidacion.length === 0;

  const handleSiguiente = async () => {
    if (!puedeAvanzar) return;

    if (esUltimoPaso) {
      // Finalizar wizard
      await finalizarOnboarding();
    } else {
      setPasoActual(pasoActual + 1);
    }
  };

  const handleAtras = () => {
    if (esPrimerPaso) {
      onCancel?.();
    } else {
      setPasoActual(pasoActual - 1);
    }
  };

  const finalizarOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Crear checklist
      await createTareasForTrabajador(trabajador.id_trabajador);

      // 2. Transicionar a pre_incorporacion
      await transicionarEstado(
        trabajador.id_trabajador,
        "pre_incorporacion",
        "Completado wizard de onboarding"
      );

      onComplete?.();
    } catch (err) {
      console.error("Error finalizando onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <h2 className="text-sm font-bold text-slate-900 mb-8">Incorporación</h2>

        {/* Steps */}
        <div className="space-y-4 flex-1">
          {FASES.map((fase, idx) => {
            const isActive = idx === pasoActual;
            const isCompleted = idx < pasoActual;
            const hasTareas = getTareasByFase(trabajador.id_trabajador, fase.id).length > 0;

            return (
              <button
                key={fase.id}
                onClick={() => setPasoActual(idx)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    ) : (
                      <Circle size={20} className={isActive ? "text-white" : "text-slate-400"} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{fase.nombre}</p>
                    <p className="text-xs opacity-75 mt-0.5">{hasTareas ? `${getTareasByFase(trabajador.id_trabajador, fase.id).length} tareas` : ""}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-auto">
          <div className="mb-2">
            <p className="text-xs font-semibold text-slate-600">Progreso</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-blue to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((pasoActual + 1) / FASES.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            {pasoActual + 1} de {FASES.length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900">{faseActual.nombre}</h1>
          <p className="text-slate-600 mt-2">{faseActual.descripcion}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <FaseContent fase={faseActual.id} trabajador={trabajador} />

            {/* Validation Errors */}
            {!puedeAvanzar && erroresValidacion.length > 0 && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900">Datos faltantes</h3>
                    <ul className="mt-2 space-y-1 text-sm text-red-800">
                      {erroresValidacion.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-8 flex justify-between">
          <button
            onClick={handleAtras}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            {esPrimerPaso ? "Cancelar" : "Atrás"}
          </button>

          <button
            onClick={handleSiguiente}
            disabled={!puedeAvanzar || loading}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
              puedeAvanzar
                ? "bg-brand-blue text-white hover:bg-blue-700"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                {esUltimoPaso ? "Finalizar" : "Siguiente"}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Subcomponentes por fase
// ─────────────────────────────────────────────────────────────

interface FaseContentProps {
  fase: Fase;
  trabajador: Trabajador;
}

function FaseContent({ fase, trabajador }: FaseContentProps) {
  const { examenes, catalogoExamenes } = useControlStore(
    useShallow((s) => ({ examenes: s.examenes, catalogoExamenes: s.catalogoExamenes }))
  );

  // Busca el examen vigente más reciente del trabajador por nombre de catálogo.
  // "Vigente" = existe registro y NO está vencido (o no tiene fecha de vencimiento).
  const tieneExamenVigente = (nombreCatalogo: string): boolean => {
    const cat = catalogoExamenes.find(
      (c) => c.nombre.toLowerCase() === nombreCatalogo.toLowerCase()
    );
    if (!cat) return false;
    const registros = examenes.filter(
      (e) => e.id_trabajador === trabajador.id_trabajador && e.id_examen_catalogo === cat.id
    );
    if (registros.length === 0) return false;
    return registros.some((e) => !estaVencido(e.fecha_vencimiento));
  };

  const contenido: Record<Fase, React.ReactNode> = {
    datos_personales: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
            <p className="text-lg text-slate-900">{trabajador.nombre_1} {trabajador.nombre_2 || ""}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Apellidos</label>
            <p className="text-lg text-slate-900">{trabajador.apellido_paterno} {trabajador.apellido_materno}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">RUT/DNI</label>
            <p className="text-lg text-slate-900">{trabajador.numero_identificacion}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha Nacimiento</label>
            <p className="text-lg text-slate-900">{trabajador.fecha_nacimiento}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Domicilio</label>
          <p className="text-lg text-slate-900">
            {trabajador.calle} {trabajador.numero_domicilio}, {trabajador.comuna}, {trabajador.region}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Contacto</label>
          <p className="text-lg text-slate-900">{trabajador.email_corporativo}</p>
          <p className="text-slate-600">{trabajador.celular_personal}</p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">ℹ️ Completa todos los datos en el formulario de trabajador antes de continuar.</p>
        </div>
      </div>
    ),

    laboral: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cargo</label>
            <p className="text-lg text-slate-900">{trabajador.cargo || "No asignado"}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Área/Departamento</label>
            <p className="text-lg text-slate-900">{trabajador.area_departamento || "No asignado"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Contrato</label>
            <p className="text-lg text-slate-900">{trabajador.tipo_contrato}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Modalidad</label>
            <p className="text-lg text-slate-900">{trabajador.modalidad_trabajo}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Ingreso</label>
          <p className="text-lg text-slate-900">{trabajador.fecha_ingreso}</p>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">⚠️ Asegúrate de que todas las asignaciones laborales estén configuradas correctamente.</p>
        </div>
      </div>
    ),

    administracion: (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Datos Bancarios</label>
          <p className="text-slate-600">{trabajador.banco || "No completado"}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Previsión</label>
          <p className="text-slate-600">{trabajador.afp || "No completado"} / {trabajador.sistema_salud || "No completado"}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tallas EPP</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Chaqueta</p>
              <p className="font-semibold text-slate-900">{trabajador.talla_chaqueta || "–"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Polera</p>
              <p className="font-semibold text-slate-900">{trabajador.talla_polera || "–"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Calzado</p>
              <p className="font-semibold text-slate-900">{trabajador.calzado_seguridad || "–"}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">ℹ️ Todos los datos administrativos son esenciales para proceder.</p>
        </div>
      </div>
    ),

    seguridad_control: (
      <div className="space-y-6">
        <div className="space-y-3">
          <ChecklistItem
            completada={tieneExamenVigente("Preocupacional")}
            nombre="Examen Médico Pre-ocupacional"
            descripcion="Evaluación médica inicial"
          />
          <ChecklistItem
            completada={
              tieneExamenVigente("Psicosensométrico") ||
              !!(trabajador.vencimiento_psicosensometrico &&
                !estaVencido(trabajador.vencimiento_psicosensometrico))
            }
            nombre="Examen Psicosensométrico"
            descripcion="Evaluación psicológica y senso-motora"
          />
          <ChecklistItem
            completada={false}
            nombre="Charla de Inducción"
            descripcion="Inducción en políticas y procedimientos"
          />
          <ChecklistItem
            completada={false}
            nombre="Firma de Acuerdos"
            descripcion="Acuerdos confidencialidad, políticas, etc."
          />
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">📋 Coordina con Prevención para completar los exámenes requeridos.</p>
        </div>
      </div>
    ),

    equipamiento: (
      <div className="space-y-6">
        <div className="space-y-3">
          <ChecklistItem
            completada={false}
            nombre="Entrega de EPP"
            descripcion="Chaqueta, polera, calzado de seguridad"
          />
          <ChecklistItem
            completada={false}
            nombre="Asignación de Notebook"
            descripcion="Notebook y accesorios"
          />
          <ChecklistItem
            completada={false}
            nombre="Asignación de Vehículo"
            descripcion="Si aplica según cargo"
          />
          <ChecklistItem
            completada={false}
            nombre="Entrega de Credenciales"
            descripcion="Badge, tarjetas de acceso"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">📦 El equipamiento debe completarse antes de habilitar operación.</p>
        </div>
      </div>
    ),

    operacion: (
      <div className="space-y-6">
        <div className="space-y-3">
          <ChecklistItem
            completada={false}
            nombre="Registro en Asistencia"
            descripcion="Habilitar en sistema de asistencia"
          />
          <ChecklistItem
            completada={false}
            nombre="Acceso a Solicitudes"
            descripcion="Permisos en módulo de solicitudes"
          />
          <ChecklistItem
            completada={false}
            nombre="Acceso a Comunicaciones"
            descripcion="Integración con canales de comunicación"
          />
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-900">✅ Al finalizar, el trabajador estará habilitado para operar en el sistema.</p>
        </div>
      </div>
    ),
  };

  return contenido[fase] || <div>Fase no encontrada</div>;
}

function ChecklistItem({
  completada,
  nombre,
  descripcion,
}: {
  completada: boolean;
  nombre: string;
  descripcion: string;
}) {
  return (
    <div className={`p-3 border rounded-lg flex gap-3 ${completada ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
      <div className="mt-0.5">
        {completada ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : (
          <Circle size={20} className="text-slate-400" />
        )}
      </div>
      <div>
        <p className={`font-semibold ${completada ? "text-emerald-900" : "text-slate-900"}`}>{nombre}</p>
        <p className="text-sm text-slate-600">{descripcion}</p>
      </div>
    </div>
  );
}
