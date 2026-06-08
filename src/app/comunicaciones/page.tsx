"use client";

import { useEffect, useState } from "react";
import { Megaphone, CalendarHeart, Gift, History } from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useComunicacionesStore } from "@/store/comunicaciones-store";
import { GeneradorTarjetas } from "@/components/custom/comunicaciones/generador-tarjetas";
import { GeneradorClima } from "@/components/custom/comunicaciones/generador-clima";

function calcularProximosEventos(trabajadores: any[]) {
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();

  const eventos = trabajadores.map(t => {
    // Calcular cumpleaños
    const [yearN, mesN, diaN] = t.fecha_nacimiento.split("-").map(Number);
    let proxCumple = new Date(hoy.getFullYear(), mesN - 1, diaN);
    if (proxCumple < hoy) proxCumple.setFullYear(hoy.getFullYear() + 1);

    // Calcular aniversario
    const [yearI, mesI, diaI] = t.fecha_ingreso.split("-").map(Number);
    let proxAniversario = new Date(hoy.getFullYear(), mesI - 1, diaI);
    if (proxAniversario < hoy) proxAniversario.setFullYear(hoy.getFullYear() + 1);
    
    const añosCumplidos = proxAniversario.getFullYear() - yearI;

    return [
      {
        tipo: "Cumpleaños",
        trabajador: t,
        fecha: proxCumple,
        diasFaltantes: Math.ceil((proxCumple.getTime() - hoy.getTime()) / (1000 * 3600 * 24)),
        detalle: `${diaN}/${mesN}`
      },
      {
        tipo: "Aniversario",
        trabajador: t,
        fecha: proxAniversario,
        diasFaltantes: Math.ceil((proxAniversario.getTime() - hoy.getTime()) / (1000 * 3600 * 24)),
        detalle: `${añosCumplidos} años (${diaI}/${mesI})`
      }
    ];
  }).flat().filter(e => e.diasFaltantes <= 30).sort((a, b) => a.diasFaltantes - b.diasFaltantes);

  return eventos;
}

export default function ComunicacionesPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { historial, fetchHistorial } = useComunicacionesStore();
  const [activeTab, setActiveTab] = useState<"generador" | "dashboard" | "historial" | "clima">("dashboard");

  useEffect(() => {
    fetchTrabajadores();
    fetchHistorial();
  }, [fetchTrabajadores, fetchHistorial]);

  const proximosEventos = calcularProximosEventos(trabajadores);

  return (
    <div className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible">
      {/* HEADER - Oculto en impresión */}
      <header className="flex justify-between items-end mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Megaphone className="text-blue-500" size={32} />
            Comunicaciones y Reconocimientos
          </h1>
          <p className="text-zinc-400">
            Genera tarjetas corporativas de cumpleaños, aniversarios y reconocimientos para tu equipo.
          </p>
        </div>
      </header>

      {/* TABS - Oculto en impresión */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800 print:hidden">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-4 font-bold uppercase tracking-wider text-sm transition-all border-b-2 ${activeTab === "dashboard" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          Próximos Eventos
        </button>
        <button 
          onClick={() => setActiveTab("generador")}
          className={`pb-3 px-4 font-bold uppercase tracking-wider text-sm transition-all border-b-2 ${activeTab === "generador" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          Generador de Tarjetas
        </button>
        <button 
          onClick={() => setActiveTab("historial")}
          className={`pb-3 px-4 font-bold uppercase tracking-wider text-sm transition-all border-b-2 ${activeTab === "historial" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          Historial Enviados
        </button>
        <button 
          onClick={() => setActiveTab("clima")}
          className={`pb-3 px-4 font-bold uppercase tracking-wider text-sm transition-all border-b-2 ${activeTab === "clima" ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          Reportes Climáticos
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="print:block">
        
        {activeTab === "dashboard" && (
          <div className="animate-fadeIn print:hidden">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <CalendarHeart className="text-pink-500" /> Próximos 30 días
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proximosEventos.length === 0 ? (
                  <p className="text-zinc-500 col-span-full">No hay cumpleaños ni aniversarios en los próximos 30 días.</p>
                ) : (
                  proximosEventos.map((ev, i) => (
                    <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ev.tipo === "Cumpleaños" ? "bg-pink-500/20 text-pink-500" : "bg-emerald-500/20 text-emerald-500"}`}>
                          {ev.tipo === "Cumpleaños" ? <Gift size={18} /> : <Megaphone size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ev.trabajador.nombre_1} {ev.trabajador.apellido_paterno}</p>
                          <p className="text-xs text-zinc-400">{ev.tipo} - {ev.detalle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-400 block">
                          {ev.diasFaltantes === 0 ? "¡Hoy!" : `Faltan ${ev.diasFaltantes} d`}
                        </span>
                        <button 
                          onClick={() => setActiveTab("generador")}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors mt-1"
                        >
                          Crear Saludo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "generador" && (
          <div className="animate-fadeIn print:block">
            <GeneradorTarjetas />
          </div>
        )}

        {activeTab === "historial" && (
          <div className="animate-fadeIn print:hidden">
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Trabajador</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Mensaje (Resumen)</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No se han generado comunicados todavía.</td>
                    </tr>
                  ) : (
                    historial.map(h => (
                      <tr key={h.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(h.fecha_generacion).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-white">{h.nombre_trabajador}</td>
                        <td className="px-6 py-4">
                          <span className="badge badge-outline">{h.tipo}</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={h.mensaje}>{h.mensaje}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${h.estado === "Enviado" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : h.estado === "Impreso" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                            {h.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "clima" && (
          <div className="animate-fadeIn print:block">
            <GeneradorClima />
          </div>
        )}

      </div>
    </div>
  );
}
