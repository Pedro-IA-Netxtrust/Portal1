"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import CicloVidaIndicador from "@/components/custom/ciclo-vida-indicador";
import ChecklistBoard from "@/components/custom/checklist-board";
import MiPerfil from "@/components/custom/mi-perfil";
import TrabajadorForm from "@/components/custom/trabajador-form";
import EstadoLaboral from "@/components/custom/estado-laboral";
import AlertasTrabajador from "@/components/custom/alertas-trabajador";
import {
  ArrowLeft,
  Activity,
  FileText,
  User,
  Briefcase,
  AlertCircle,
} from "lucide-react";

type TabType = "perfil" | "ciclo_vida" | "onboarding" | "editar";

export default function TrabajadorDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [tabActiva, setTabActiva] = useState<TabType>("perfil");
  const [loading, setLoading] = useState(true);

  // Stores
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore(
    useShallow((s) => ({ trabajadores: s.trabajadores, fetchTrabajadores: s.fetchTrabajadores }))
  );
  const { fetchCiclos, getCicloByTrabajador } = useCicloVidaStore(
    useShallow((s) => ({ fetchCiclos: s.fetchCiclos, getCicloByTrabajador: s.getCicloByTrabajador }))
  );
  const fetchTareas = useOnboardingStore((s) => s.fetchTareas);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await Promise.all([fetchTrabajadores(), fetchCiclos(), fetchTareas()]);
      setLoading(false);
    };
    cargarDatos();
  }, [fetchTrabajadores, fetchCiclos, fetchTareas]);

  const trabajador = trabajadores.find((t) => t.id_trabajador === id);
  const ciclo = trabajador ? getCicloByTrabajador(trabajador.id_trabajador) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Activity className="mx-auto text-brand-blue animate-spin" size={48} />
          <p className="text-slate-600">Cargando información del trabajador...</p>
        </div>
      </div>
    );
  }

  if (!trabajador) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/trabajadores" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Trabajador no encontrado</h1>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">El trabajador con ID {id} no existe en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/trabajadores" className="text-slate-500 hover:text-slate-700">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {trabajador.nombre_1} {trabajador.apellido_paterno}
                </h1>
                <p className="text-slate-600">RUT: {trabajador.numero_identificacion}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200">
            {[
              { id: "perfil" as TabType, label: "Mi Perfil", icono: <User size={18} /> },
              { id: "ciclo_vida" as TabType, label: "Ciclo de Vida", icono: <Activity size={18} /> },
              { id: "onboarding" as TabType, label: "Onboarding", icono: <FileText size={18} /> },
              { id: "editar" as TabType, label: "Editar", icono: <Briefcase size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  tabActiva === tab.id
                    ? "text-brand-blue border-brand-blue"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                {tab.icono}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Alerts and State */}
        <div className="space-y-4 mb-6">
          <AlertasTrabajador 
            trabajador={trabajador}
            ciclo={ciclo}
          />
          <EstadoLaboral 
            trabajador={trabajador}
            ciclo={ciclo}
            compact={false}
          />
        </div>

        {tabActiva === "perfil" && <MiPerfil trabajador={trabajador} onEditar={() => setTabActiva("editar")} />}

        {tabActiva === "ciclo_vida" && <CicloVidaIndicador idTrabajador={trabajador.id_trabajador} />}

        {tabActiva === "onboarding" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Checklist de Incorporación</p>
                <p className="mt-1">Completa todas las tareas para habilitar al trabajador en operación.</p>
              </div>
            </div>
            <ChecklistBoard idTrabajador={trabajador.id_trabajador} editable={true} />
          </div>
        )}

        {tabActiva === "editar" && (
          <TrabajadorForm
            trabajadorId={trabajador.id_trabajador}
            onClose={() => setTabActiva("perfil")}
          />
        )}
      </div>
    </div>
  );
}
