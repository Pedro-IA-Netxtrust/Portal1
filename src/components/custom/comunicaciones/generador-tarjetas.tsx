"use client";

import { useState, useRef } from "react";
import { Download, Printer, User, Mail } from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useComunicacionesStore, Plantilla, TipoComunicacion } from "@/store/comunicaciones-store";

export function GeneradorTarjetas() {
  const { trabajadores } = useTrabajadoresStore();
  const { plantillas, historial, addComunicado } = useComunicacionesStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContrato, setSelectedContrato] = useState("");
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState("");
  const [selectedPlantillaId, setSelectedPlantillaId] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const tarjetaRef = useRef<HTMLDivElement>(null);

  const trabajador = trabajadores.find(t => t.id_trabajador === selectedTrabajadorId);
  const plantilla = plantillas.find(p => p.id === selectedPlantillaId);

  // Derivados — agrupa por tipo_contrato (campo real del tipo Trabajador)
  const contratosUnicos = Array.from(new Set(trabajadores.map(t => t.tipo_contrato).filter(Boolean)));
  
  const trabajadoresFiltrados = trabajadores.filter(t => {
    const nameStr = `${t.nombre_1 || ""} ${t.apellido_paterno || ""}`.toLowerCase();
    const matchName = nameStr.includes(searchTerm.toLowerCase());
    const matchId = t.numero_identificacion
      ? t.numero_identificacion.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const matchContrato = selectedContrato ? t.tipo_contrato === selectedContrato : true;
    return (matchName || matchId) && matchContrato;
  });

  const historialTrabajador = historial.filter(h => h.id_trabajador === selectedTrabajadorId);

  // Pre-fill message when template changes
  const handlePlantillaChange = (id: string) => {
    setSelectedPlantillaId(id);
    const p = plantillas.find(x => x.id === id);
    if (p) setMensaje(p.mensaje_por_defecto);
  };

  const handlePrint = () => {
    if (!trabajador || !plantilla) return;
    window.print();
    // Guardar en el historial
    addComunicado({
      id_trabajador: trabajador.id_trabajador,
      nombre_trabajador: `${trabajador.nombre_1} ${trabajador.apellido_paterno}`,
      tipo: plantilla.tipo,
      mensaje: mensaje,
      estado: "Impreso"
    });
  };

  const handleMailTo = () => {
    if (!trabajador || !plantilla) return;
    const subject = encodeURIComponent(`${plantilla.nombre} - NetxTrust Portal`);
    const body = encodeURIComponent(`Hola ${trabajador.nombre_1},\n\n${mensaje}\n\nAtentamente,\nEquipo de Portal Monitoring.`);
    window.location.href = `mailto:${trabajador.email_corporativo || ""}?subject=${subject}&body=${body}`;
    
    addComunicado({
      id_trabajador: trabajador.id_trabajador,
      nombre_trabajador: `${trabajador.nombre_1} ${trabajador.apellido_paterno}`,
      tipo: plantilla.tipo,
      mensaje: mensaje,
      estado: "Borrador"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
      {/* PANEL DE CONFIGURACIÓN (Oculto en impresión) */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-text mb-4">Configurar Tarjeta</h2>
          
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-soft">Tipo Contrato</label>
                <select 
                  className="input text-sm"
                  value={selectedContrato}
                  onChange={e => { setSelectedContrato(e.target.value); setSelectedTrabajadorId(""); }}
                >
                  <option value="">Todos</option>
                  {contratosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-soft">Buscar (Nombre/ID)</label>
                <input 
                  type="text" 
                  className="input text-sm" 
                  placeholder="Ej. Juan Pérez..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setSelectedTrabajadorId(""); }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Trabajador Destinatario</label>
              <select 
                className="input"
                value={selectedTrabajadorId}
                onChange={e => setSelectedTrabajadorId(e.target.value)}
              >
                <option value="">Seleccione un trabajador ({trabajadoresFiltrados.length})</option>
                {trabajadoresFiltrados.map(t => (
                  <option key={t.id_trabajador} value={t.id_trabajador}>
                    {t.nombre_1} {t.apellido_paterno} - {t.cargo || "Sin cargo"}
                  </option>
                ))}
              </select>
            </div>

            {selectedTrabajadorId && historialTrabajador.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                <p className="font-bold mb-1">Historial del trabajador:</p>
                <ul className="list-disc pl-4 space-y-1 text-xs opacity-80">
                  {historialTrabajador.slice(0,3).map(h => (
                    <li key={h.id}>{new Date(h.fecha_generacion).toLocaleDateString()} - {h.tipo}: {h.mensaje.substring(0, 30)}...</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Motivo / Plantilla</label>
              <select 
                className="input"
                value={selectedPlantillaId}
                onChange={e => handlePlantillaChange(e.target.value)}
              >
                <option value="">Seleccione plantilla...</option>
                {plantillas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-soft">Mensaje Personalizado</label>
              <textarea 
                className="input resize-none"
                rows={4}
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje aquí..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            disabled={!trabajador || !plantilla}
            onClick={handlePrint}
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Imprimir / PDF
          </button>
          <button 
            disabled={!trabajador || !plantilla}
            onClick={handleMailTo}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Mail size={18} /> Preparar Correo
          </button>
        </div>
      </div>

      {/* ÁREA DE PREVISUALIZACIÓN (Visible y formateada para impresión) */}
      <div className="lg:col-span-8 flex justify-center items-start print:w-full">
        {!trabajador || !plantilla ? (
          <div className="w-full h-96 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-text-muted print:hidden">
            <User size={48} className="mb-4 opacity-50" />
            <p>Seleccione un trabajador y una plantilla para previsualizar</p>
          </div>
        ) : (
          <div 
            ref={tarjetaRef}
            className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl relative print:shadow-none print:max-w-none print:w-[210mm] print:h-[297mm]"
            style={{ 
              borderColor: plantilla.color_primario, 
              borderWidth: "8px",
              borderTopWidth: "32px"
            }}
          >
            {/* Cabecera Decorativa */}
            <div className="h-32 relative overflow-hidden" style={{ backgroundColor: plantilla.color_primario }}>
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20" style={{ backgroundColor: plantilla.color_secundario }}></div>
              <div className="absolute right-32 -bottom-20 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: plantilla.color_secundario }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl font-extrabold text-white tracking-wider uppercase text-center drop-shadow-md px-4">
                  {plantilla.nombre}
                </h1>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="p-12 pb-16 bg-[#FAFAFA]">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ¡Hola {trabajador.nombre_1} {trabajador.apellido_paterno}!
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                {trabajador.cargo || "Equipo de Operaciones"}
              </p>

              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {mensaje}
              </div>

              <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Enviado por</p>
                  <p className="text-xl font-bold text-gray-800">Recursos Humanos</p>
                  <p className="text-gray-500">Portal Monitoring</p>
                </div>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: plantilla.color_secundario + '20' }}
                >
                  <Star size={32} style={{ color: plantilla.color_secundario }} />
                </div>
              </div>
            </div>
            
            {/* Footer de Tarjeta */}
            <div className="h-4 w-full" style={{ backgroundColor: plantilla.color_secundario }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Para usar Star en la tarjeta
import { Star } from "lucide-react";
