"use client";

import React, { useState, useEffect } from "react";
import { useWorkflowsStore, type WorkflowStage, type WorkflowTemplate } from "@/store/workflows-store";
import { 
  GitBranch, Mail, Send, Check, X, Info, Settings2, Sparkles, 
  Trash2, FileText, AlertCircle, Terminal, HelpCircle 
} from "lucide-react";

const STAGES: WorkflowStage[] = ["Pendiente", "En Revisión", "Aprobada", "Rechazada", "Cancelada"];

const STAGE_LABELS: Record<WorkflowStage, { label: string; desc: string; color: string }> = {
  "Pendiente":   { label: "Creación (Pendiente)", desc: "Se activa inmediatamente cuando el trabajador envía la solicitud.", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
  "En Revisión": { label: "En Revisión", desc: "Se activa cuando un administrador o revisor toma la solicitud para evaluar.", color: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
  "Aprobada":    { label: "Aprobación", desc: "Se gatilla cuando la solicitud es formalmente aprobada.", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
  "Rechazada":   { label: "Rechazo", desc: "Se gatilla cuando se rechaza la solicitud indicando los motivos.", color: "border-red-500/20 bg-red-500/5 text-red-400" },
  "Cancelada":   { label: "Cancelación", desc: "Se gatilla si el propio trabajador desiste y cancela la solicitud.", color: "border-zinc-700 bg-zinc-900/30 text-zinc-400" }
};

export default function FlujosPage() {
  const { 
    ticketTypes, 
    templates, 
    fetchWorkflowsData, 
    saveTemplate, 
    sentMailLog, 
    clearMailLog 
  } = useWorkflowsStore();

  const [activeTypeTab, setActiveTypeTab] = useState<string>("");
  const [activeStageTab, setActiveStageTab] = useState<WorkflowStage>("Pendiente");
  const [selectedMail, setSelectedMail] = useState<any | null>(null);

  // Carga inicial
  useEffect(() => {
    fetchWorkflowsData();
  }, [fetchWorkflowsData]);

  // Autoseleccionar primer tipo cuando se cargan
  useEffect(() => {
    if (ticketTypes.length > 0 && !activeTypeTab) {
      setActiveTypeTab(ticketTypes[0].id);
    }
  }, [ticketTypes, activeTypeTab]);

  // Plantilla activa seleccionada
  const activeTemplate = templates.find(
    t => t.ticket_type_id === activeTypeTab && t.stage === activeStageTab
  );

  // Form State
  const [formState, setFormState] = useState({
    notify_requester: false,
    notify_assignee: false,
    notify_unit_manager: false,
    notify_cc_recipients: false,
    email_subject: "",
    email_body: "",
    active: true
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sincronizar formulario con la plantilla seleccionada
  useEffect(() => {
    if (activeTemplate) {
      setFormState({
        notify_requester: activeTemplate.notify_requester,
        notify_assignee: activeTemplate.notify_assignee,
        notify_unit_manager: activeTemplate.notify_unit_manager,
        notify_cc_recipients: activeTemplate.notify_cc_recipients,
        email_subject: activeTemplate.email_subject,
        email_body: activeTemplate.email_body,
        active: activeTemplate.active
      });
    }
  }, [activeTemplate]);

  const handleCheckboxChange = (name: string) => {
    setFormState(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  const handleSave = async () => {
    if (!activeTypeTab) return;
    await saveTemplate({
      id: activeTemplate?.id,
      ticket_type_id: activeTypeTab,
      stage: activeStageTab,
      ...formState
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const insertVariable = (variable: string) => {
    setFormState(prev => ({
      ...prev,
      email_body: prev.email_body + ` {${variable}}`
    }));
  };

  const currentType = ticketTypes.find(t => t.id === activeTypeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <GitBranch className="text-violet-500" size={26} />
            Flujos de Información y Notificaciones
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Configure las reglas de envío y plantillas de correo para las etapas de cada tipo de solicitud
          </p>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CONFIGURATOR - 7 COLS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Selector de Tipo de Solicitud (Horizontal scrollable tabs) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 flex items-center gap-1.5 overflow-x-auto">
            {ticketTypes.map(t => {
              const active = t.id === activeTypeTab;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTypeTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    active 
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <span className="text-sm">{t.icon || "📋"}</span>
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Config Panel */}
          {currentType && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
              
              {/* Info Header */}
              <div className="bg-zinc-900/40 px-6 py-5 border-b border-zinc-900 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{currentType.icon}</span> Configurar {currentType.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{currentType.description || "Reglas de notificación por etapas"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-zinc-900 text-zinc-400 font-bold px-2.5 py-1 rounded border border-zinc-800">
                    Soporta Variables Dinámicas
                  </span>
                </div>
              </div>

              {/* Stage selector tabs */}
              <div className="grid grid-cols-5 border-b border-zinc-900 bg-zinc-950">
                {STAGES.map(s => {
                  const active = s === activeStageTab;
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveStageTab(s)}
                      className={`py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                        active 
                          ? "border-violet-500 text-violet-400 bg-violet-600/5 font-black" 
                          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                
                {/* Stage description */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${STAGE_LABELS[activeStageTab].color}`}>
                  <Info className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Detalle del Evento</h4>
                    <p className="text-xs text-zinc-300/80 mt-1 leading-relaxed">{STAGE_LABELS[activeStageTab].desc}</p>
                  </div>
                </div>

                {/* Destinatarios */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">1. Destinatarios de Notificación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { key: "notify_requester", label: "Trabajador Solicitante", desc: "Envía el correo al creador de la solicitud" },
                      { key: "notify_assignee", label: "Responsable / Encargado de Responder", desc: "Notifica al gestor asignado del contrato" },
                      { key: "notify_unit_manager", label: "Jefe de Unidad (Directo)", desc: "Notifica al supervisor de faena del solicitante" },
                      { key: "notify_cc_recipients", label: "Copias Configuradas (CC)", desc: "Notifica a los destinatarios CC del contrato" }
                    ].map(item => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => handleCheckboxChange(item.key)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all hover:bg-zinc-900 cursor-pointer ${
                          formState[item.key as keyof typeof formState]
                            ? "bg-violet-600/5 border-violet-500/40 text-violet-400"
                            : "bg-zinc-900/30 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                          formState[item.key as keyof typeof formState]
                            ? "bg-violet-600 border-violet-500 text-white"
                            : "bg-zinc-950 border-zinc-800 text-transparent"
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plantilla de correo */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">2. Plantilla de Correo</h3>
                  
                  {/* Asunto */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 font-semibold">Asunto del Correo</label>
                    <input
                      type="text"
                      value={formState.email_subject}
                      onChange={e => setFormState(prev => ({ ...prev, email_subject: e.target.value }))}
                      placeholder="Ej: Nueva solicitud {codigo_solicitud} de {tipo_solicitud}"
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="text-xs text-zinc-500 font-semibold">Cuerpo del Mensaje</label>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase mr-1.5 self-center">Insertar:</span>
                        {[
                          { val: "codigo_solicitud", lbl: "Código" },
                          { val: "nombre_solicitante", lbl: "Solicitante" },
                          { val: "tipo_solicitud", lbl: "Tipo" },
                          { val: "asunto", lbl: "Asunto" },
                          { val: "estado", lbl: "Estado" },
                          { val: "observaciones", lbl: "Notas" },
                          { val: "motivo_rechazo", lbl: "Motivo Rechazo" }
                        ].map(v => (
                          <button
                            type="button"
                            key={v.val}
                            onClick={() => insertVariable(v.val)}
                            className="text-[9px] bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all"
                          >
                            {v.lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={formState.email_body}
                      onChange={e => setFormState(prev => ({ ...prev, email_body: e.target.value }))}
                      placeholder="Escribe el cuerpo del correo..."
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-3 font-mono text-xs leading-relaxed focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, active: !prev.active }))}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        formState.active
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800 border-zinc-700 text-zinc-500"
                      }`}
                    >
                      {formState.active ? "✓ Flujo Activo" : "✗ Flujo Desactivado"}
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer"
                  >
                    {isSaved ? (
                      <>
                        <Check size={14} /> Guardado con Éxito
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Guardar Cambios de Etapa
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* SIMULATOR - 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Console Log Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Header */}
            <div className="bg-zinc-900/40 px-5 py-4 border-b border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal className="text-violet-500" size={16} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Bandeja de Simulación</h3>
              </div>
              {sentMailLog.length > 0 && (
                <button
                  onClick={clearMailLog}
                  className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer font-bold uppercase"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {sentMailLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400">Sin correos enviados</h4>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed max-w-[200px] mx-auto">
                      Crea o cambia el estado de una solicitud para simular la salida de correos en vivo.
                    </p>
                  </div>
                </div>
              ) : (
                sentMailLog.map(log => {
                  const isSelected = selectedMail?.id === log.id;
                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedMail(log)}
                      className={`w-full flex flex-col p-3 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? "bg-violet-600/10 border-violet-500 text-zinc-100" 
                          : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wide">
                          {log.tipo_solicitud}
                        </span>
                        <span className="text-[8px] text-zinc-600">
                          {new Date(log.fecha).toLocaleTimeString("es-CL", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-200 mt-1 truncate w-full">
                        {log.asunto}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] bg-zinc-900 text-zinc-500 font-semibold px-1.5 py-0.5 rounded border border-zinc-800">
                          Etapa: {log.stage}
                        </span>
                        <span className="text-[9px] text-zinc-600 truncate flex-1 font-mono">
                          Para: {log.destinatarios[0]}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Simulated Email Detail Viewer Modal */}
            {selectedMail && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-zinc-950 border border-zinc-850 rounded-2xl w-full max-w-xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
                  
                  {/* Title */}
                  <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Send size={13} className="text-violet-400" /> Correo Saliente (Simulación)
                    </h3>
                    <button 
                      onClick={() => setSelectedMail(null)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Mail Info */}
                  <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="space-y-1.5 text-xs border-b border-zinc-900 pb-3">
                      <div className="flex"><span className="w-16 font-bold text-zinc-500">DE:</span><span className="text-zinc-300">sistema-monitoring@company.com</span></div>
                      <div className="flex"><span className="w-16 font-bold text-zinc-500">PARA:</span><span className="text-violet-400 font-bold truncate flex-1">{selectedMail.destinatarios.join(", ")}</span></div>
                      <div className="flex"><span className="w-16 font-bold text-zinc-500">FECHA:</span><span className="text-zinc-400">{new Date(selectedMail.fecha).toLocaleString("es-CL")}</span></div>
                      <div className="flex"><span className="w-16 font-bold text-zinc-500">ASUNTO:</span><span className="text-zinc-200 font-bold">{selectedMail.asunto}</span></div>
                    </div>

                    {/* Mail Body Mock */}
                    <div className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-4 font-sans text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMail.cuerpo}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-violet-600/5 border border-violet-500/10 rounded-xl text-[10px] text-violet-400">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      <span>Este es un correo simulado generado por el despachador de flujos del portal en desarrollo.</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-zinc-900 flex justify-end bg-zinc-900/20">
                    <button
                      onClick={() => setSelectedMail(null)}
                      className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Cerrar Vista
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
