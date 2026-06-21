"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { Trabajador } from "@/store/trabajadores-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getCompletitudPorcentaje } from "@/lib/validadores";
import {
  CheckCircle2,
  Clock,
  FileText,
  Briefcase,
  AlertTriangle,
  Edit3,
} from "lucide-react";

interface MiPerfilProps {
  trabajador: Trabajador;
  onEditar?: () => void;
}

export default function MiPerfil({ trabajador, onEditar }: MiPerfilProps) {
  const { getCicloByTrabajador, estaActivo } = useCicloVidaStore(
    useShallow((s) => ({ getCicloByTrabajador: s.getCicloByTrabajador, estaActivo: s.estaActivo }))
  );
  const getProgressByTrabajador = useOnboardingStore((s) => s.getProgressByTrabajador);

  const ciclo = getCicloByTrabajador(trabajador.id_trabajador);
  const activo = estaActivo(trabajador.id_trabajador);
  const progress = getProgressByTrabajador(trabajador.id_trabajador);
  const completitud = getCompletitudPorcentaje(trabajador);

  // Alertas de vencimiento
  const getDiasRestantes = (fecha?: string | null): number | null => {
    if (!fecha) return null;
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const dias = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const alertasVencimiento = [];

  if (trabajador.vencimiento_licencia_conducir) {
    const dias = getDiasRestantes(trabajador.vencimiento_licencia_conducir);
    if (dias !== null && dias < 90) {
      alertasVencimiento.push({
        tipo: "licencia",
        titulo: "Licencia de conducir",
        dias,
        urgencia: dias < 30 ? "critica" : "advertencia",
      });
    }
  }

  if (trabajador.vencimiento_carnet) {
    const dias = getDiasRestantes(trabajador.vencimiento_carnet);
    if (dias !== null && dias < 90) {
      alertasVencimiento.push({
        tipo: "carnet",
        titulo: "Carnet de identidad",
        dias,
        urgencia: dias < 30 ? "critica" : "advertencia",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {trabajador.nombre_1} {trabajador.apellido_paterno}
            </h1>
            <p className="text-slate-600 mt-1">RUT: {trabajador.numero_identificacion}</p>
            <div className="flex items-center gap-4 mt-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  activo
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {ciclo?.estado_actual === "activo" ? "🟢 Activo" : "🟡 Pre-Incorporación"}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600">
                  {trabajador.cargo} • {trabajador.area_departamento}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onEditar}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit3 size={18} />
            Editar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          titulo="Perfil Completo"
          valor={`${completitud}%`}
          subtitulo={completitud === 100 ? "Todos los datos" : "Faltan datos"}
          icono={<CheckCircle2 size={24} className={completitud === 100 ? "text-emerald-600" : "text-amber-600"} />}
          color={completitud === 100 ? "emerald" : "amber"}
        />

        <StatCard
          titulo="Incorporación"
          valor={`${progress.porcentaje_total}%`}
          subtitulo={`${progress.tareas_completadas}/${progress.tareas_total} tareas`}
          icono={<FileText size={24} className="text-blue-600" />}
          color="blue"
        />

        <StatCard
          titulo="Estado Laboral"
          valor={trabajador.tipo_contrato}
          subtitulo={`Desde ${new Date(trabajador.fecha_ingreso).toLocaleDateString()}`}
          icono={<Briefcase size={24} className="text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Alertas */}
      {alertasVencimiento.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Próximos Vencimientos</h2>
          {alertasVencimiento.map((alerta) => (
            <div
              key={alerta.tipo}
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                alerta.urgencia === "critica"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <AlertTriangle
                size={20}
                className={alerta.urgencia === "critica" ? "text-red-600" : "text-amber-600"}
              />
              <div className="flex-1">
                <p className={`font-semibold ${
                  alerta.urgencia === "critica"
                    ? "text-red-900"
                    : "text-amber-900"
                }`}>
                  {alerta.titulo} vence en {alerta.dias} días
                </p>
                <p className={`text-sm ${
                  alerta.urgencia === "critica"
                    ? "text-red-700"
                    : "text-amber-700"
                }`}>
                  {alerta.urgencia === "critica"
                    ? "⚠️ CRÍTICO: Requiere renovación urgente"
                    : "📌 Pendiente: Agendar renovación"}
                </p>
              </div>
              <button className="px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-white rounded transition-colors">
                Más info
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Onboarding Progress */}
      {progress.porcentaje_total < 100 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mi Incorporación</h2>

          {/* Fases */}
          <div className="space-y-3">
            {progress.fases &&
              Object.values(progress.fases).map((fase) => (
                <div key={fase.fase}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 capitalize">
                      {fase.fase.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {fase.tareas_completadas}/{fase.tareas_total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        fase.completada
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${fase.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <Clock size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Próximos pasos</p>
              <p className="mt-1 opacity-90">
                Completa los datos y tareas pendientes para acelerar tu incorporación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mi Información */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Mi Información</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoSection
            titulo="Contacto"
            items={[
              { label: "Email", valor: trabajador.email_corporativo },
              { label: "Teléfono", valor: trabajador.celular_personal },
              { label: "Emergencia", valor: trabajador.nombre_contacto_emergencia || "No registrado" },
            ]}
          />

          <InfoSection
            titulo="Laboral"
            items={[
              { label: "Contrato", valor: trabajador.tipo_contrato },
              { label: "Modalidad", valor: trabajador.modalidad_trabajo },
              { label: "Ingreso", valor: new Date(trabajador.fecha_ingreso).toLocaleDateString() },
            ]}
          />

          <InfoSection
            titulo="Previsión"
            items={[
              { label: "AFP", valor: trabajador.afp || "No registrada" },
              { label: "Salud", valor: trabajador.sistema_salud || "No registrada" },
              { label: "Isapre", valor: trabajador.nombre_isapre || "Fonasa" },
            ]}
          />

          <InfoSection
            titulo="Bancos"
            items={[
              { label: "Banco", valor: trabajador.banco || "No registrado" },
              { label: "Tipo Cuenta", valor: trabajador.tipo_cuenta || "No especificado" },
              { label: "Número", valor: trabajador.numero_cuenta || "No registrado" },
            ]}
          />
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AccionRapida
          titulo="Descargar Certificado"
          descripcion="Certificado de trabajador"
          icono="📄"
          onClick={() => console.log("Descargar certificado")}
        />
        <AccionRapida
          titulo="Solicitar Permiso"
          descripcion="Enviar nueva solicitud"
          icono="📋"
          onClick={() => console.log("Abrir solicitudes")}
        />
        <AccionRapida
          titulo="Ver Historial"
          descripcion="Registro de cambios"
          icono="📊"
          onClick={() => console.log("Ver historial")}
        />
      </div>
    </div>
  );
}

function StatCard({
  titulo,
  valor,
  subtitulo,
  icono,
  color,
}: {
  titulo: string;
  valor: string;
  subtitulo: string;
  icono: React.ReactNode;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };

  return (
    <div className={`${bgColors[color]} border border-slate-200 rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>{icono}</div>
      </div>
      <p className="text-sm text-slate-600">{titulo}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{valor}</p>
      <p className="text-xs text-slate-600 mt-1">{subtitulo}</p>
    </div>
  );
}

function InfoSection({
  titulo,
  items,
}: {
  titulo: string;
  items: { label: string; valor: string }[];
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-3">{titulo}</h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="text-sm font-semibold text-slate-900">{item.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccionRapida({
  titulo,
  descripcion,
  icono,
  onClick,
}: {
  titulo: string;
  descripcion: string;
  icono: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white border border-slate-200 rounded-lg hover:border-brand-blue hover:shadow-md transition-all text-left"
    >
      <p className="text-2xl mb-2">{icono}</p>
      <p className="font-semibold text-slate-900">{titulo}</p>
      <p className="text-xs text-slate-600 mt-1">{descripcion}</p>
    </button>
  );
}
