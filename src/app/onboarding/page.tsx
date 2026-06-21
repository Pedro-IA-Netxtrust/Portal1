"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import DashboardOnboarding from "@/components/custom/dashboard-onboarding";
import { ArrowLeft, Activity } from "lucide-react";

export default function OnboardingDashboardPage() {
  const fetchTrabajadores = useTrabajadoresStore((s) => s.fetchTrabajadores);
  const fetchCiclos = useCicloVidaStore((s) => s.fetchCiclos);
  const fetchTareas = useOnboardingStore((s) => s.fetchTareas);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await Promise.all([fetchTrabajadores(), fetchCiclos(), fetchTareas()]);
      setLoading(false);
    };
    cargarDatos();
  }, [fetchTrabajadores, fetchCiclos, fetchTareas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Activity className="mx-auto text-brand-blue animate-spin" size={48} />
          <p className="text-slate-600">Cargando dashboard de incorporaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de Incorporaciones</h1>
              <p className="text-slate-600 mt-1">Monitoreo central de onboarding y ciclo de vida de trabajadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <DashboardOnboarding />
      </div>
    </div>
  );
}
