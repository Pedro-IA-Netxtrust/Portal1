"use client";

import React, { useEffect, useMemo } from "react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useCicloVidaStore } from "@/store/ciclo-vida-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { CheckCircle2, Clock, TrendingUp, Zap } from "lucide-react";

export default function DashboardOnboarding() {
  const trabajadores = useTrabajadoresStore((s) => s.trabajadores);
  const fetchTrabajadores = useTrabajadoresStore((s) => s.fetchTrabajadores);

  const ciclos = useCicloVidaStore((s) => s.ciclos);
  const fetchCiclos = useCicloVidaStore((s) => s.fetchCiclos);

  const tareas = useOnboardingStore((s) => s.tareas);
  const fetchTareas = useOnboardingStore((s) => s.fetchTareas);
  const getProgressByTrabajador = useOnboardingStore(
    (s) => s.getProgressByTrabajador
  );

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([fetchTrabajadores(), fetchCiclos(), fetchTareas()]);
    };
    cargarDatos();
  }, [fetchTrabajadores, fetchCiclos, fetchTareas]);

  // Pre-calcular ciclos en onboarding una sola vez. `getProgressByTrabajador`
  // está cacheado por referencia de `tareas`, así que invocarlo es O(1).
  const {
    trabajadoresEnOnboarding,
    trabajadoresActivos,
    promedioCompletitudOnboarding,
    topTrabajadores,
  } = useMemo(() => {
    const ciclosOnboarding = ciclos.filter(
      (c) => c.estado_actual === "pre_incorporacion"
    );
    const ciclosActivos = ciclos.filter((c) => c.estado_actual === "activo");

    const tops = ciclosOnboarding
      .map((c) => {
        const t = trabajadores.find((tr) => tr.id_trabajador === c.id_trabajador);
        if (!t) return null;
        const progress = getProgressByTrabajador(c.id_trabajador);
        return {
          nombre: `${t.nombre_1} ${t.apellido_paterno}`,
          progreso: progress.porcentaje_total,
          tareas: `${progress.tareas_completadas}/${progress.tareas_total}`,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.progreso - a.progreso);

    const promedio =
      ciclosOnboarding.length > 0
        ? Math.round(
            tops.reduce((sum, t) => sum + t.progreso, 0) / ciclosOnboarding.length
          )
        : 0;

    return {
      trabajadoresEnOnboarding: ciclosOnboarding.length,
      trabajadoresActivos: ciclosActivos.length,
      promedioCompletitudOnboarding: promedio,
      topTrabajadores: tops.slice(0, 5),
    };
  }, [ciclos, trabajadores, getProgressByTrabajador]);

  const tareasCompletadas = useMemo(
    () => tareas.filter((t) => t.completada).length,
    [tareas]
  );
  const tareasTotal = tareas.length;

  // Tareas pendientes más urgentes (por fecha límite ascendente)
  const tareasPendientes = useMemo(() => {
    return tareas
      .filter((t) => !t.completada && t.fecha_limite)
      .sort((a, b) => {
        const fechaA = new Date(a.fecha_limite || "").getTime();
        const fechaB = new Date(b.fecha_limite || "").getTime();
        return fechaA - fechaB;
      })
      .slice(0, 5);
  }, [tareas]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="En Onboarding"
          valor={trabajadoresEnOnboarding}
          icono={<Zap size={24} className="text-amber-600" />}
          bg="bg-amber-50"
        />
        <KPICard
          label="Activos"
          valor={trabajadoresActivos}
          icono={<CheckCircle2 size={24} className="text-emerald-600" />}
          bg="bg-emerald-50"
        />
        <KPICard
          label="Progreso Promedio"
          valor={`${promedioCompletitudOnboarding}%`}
          icono={<TrendingUp size={24} className="text-blue-600" />}
          bg="bg-blue-50"
        />
        <KPICard
          label="Tareas Completadas"
          valor={`${tareasCompletadas}/${tareasTotal}`}
          icono={<Clock size={24} className="text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Gráfico simple de progreso */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Completitud Total</h2>
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-4 rounded-full transition-all"
            style={{ width: `${promedioCompletitudOnboarding}%` }}
          />
        </div>
        <p className="text-sm text-slate-600 mt-2">
          {promedioCompletitudOnboarding}% de completitud promedio en incorporaciones activas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trabajadores */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Incorporaciones</h3>
          <div className="space-y-3">
            {topTrabajadores.length > 0 ? (
              topTrabajadores.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{t.nombre}</p>
                    <p className="text-xs text-slate-600">{t.tareas}</p>
                  </div>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${t.progreso}%` }}
                    />
                  </div>
                  <span className="ml-3 font-bold text-sm text-slate-700 w-10 text-right">
                    {t.progreso}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-sm">No hay incorporaciones activas</p>
            )}
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tareas Próximas a Vencer</h3>
          <div className="space-y-3">
            {tareasPendientes.length > 0 ? (
              tareasPendientes.map((tarea) => {
                const diasRestantes = tarea.fecha_limite
                  ? Math.ceil(
                      (new Date(tarea.fecha_limite).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                return (
                  <div
                    key={tarea.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      diasRestantes !== null && diasRestantes < 3
                        ? "bg-red-50 border-l-red-500"
                        : "bg-amber-50 border-l-amber-500"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {tarea.nombre}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {tarea.responsable} • {new Date(tarea.fecha_limite || "").toLocaleDateString()}
                        </p>
                      </div>
                      {diasRestantes !== null && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                            diasRestantes < 3
                              ? "bg-red-200 text-red-900"
                              : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {diasRestantes}d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 text-sm">Sin tareas pendientes</p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas por Fase */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Completitud por Fase</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { fase: "Datos Personales", color: "bg-blue-100 text-blue-900" },
            { fase: "Laboral", color: "bg-purple-100 text-purple-900" },
            { fase: "Administración", color: "bg-amber-100 text-amber-900" },
            { fase: "Seguridad", color: "bg-red-100 text-red-900" },
            { fase: "Equipamiento", color: "bg-green-100 text-green-900" },
            { fase: "Operación", color: "bg-cyan-100 text-cyan-900" },
          ].map((f) => {
            const faseKey = f.fase.toLowerCase().replace(/ /g, "_") as
              | "datos_personales"
              | "laboral"
              | "administracion"
              | "seguridad"
              | "equipamiento"
              | "operacion";

            const tareasEnFase = tareas.filter((t) => t.fase === faseKey);
            const completadasEnFase = tareasEnFase.filter((t) => t.completada).length;
            const pct =
              tareasEnFase.length > 0
                ? Math.round((completadasEnFase / tareasEnFase.length) * 100)
                : 0;

            return (
              <div key={faseKey} className={`p-3 rounded-lg text-center ${f.color}`}>
                <p className="text-xs font-bold mb-2">{f.fase.split(" ")[0]}</p>
                <p className="text-xl font-bold">{pct}%</p>
                <p className="text-xs mt-1">
                  {completadasEnFase}/{tareasEnFase.length}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  valor,
  icono,
  bg,
}: {
  label: string;
  valor: number | string;
  icono: React.ReactNode;
  bg: string;
}) {
  return (
    <div className={`${bg} border border-slate-200 rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold text-slate-600 uppercase">{label}</p>
        <div>{icono}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{valor}</p>
    </div>
  );
}
