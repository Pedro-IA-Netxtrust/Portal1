"use client";

import React, { useState } from "react";
import { Trabajador } from "@/store/trabajadores-store";
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  FileText,
  User,
  Shield,
  CreditCard
} from "lucide-react";

interface TrabajadorDetalleProps {
  trabajador: Trabajador;
  onClose: () => void;
}

export default function TrabajadorDetalle({ trabajador, onClose }: TrabajadorDetalleProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "completo" | "epp">("resumen");

  // Helper: Calcular semáforo de vencimiento
  const getSemaforo = (fechaStr?: string) => {
    if (!fechaStr) return { status: "no-registrado", text: "No registrado", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" };
    
    const hoy = new Date();
    const vencimiento = new Date(fechaStr);
    
    // Clear time
    hoy.setHours(0,0,0,0);
    vencimiento.setHours(0,0,0,0);

    const diferenciaMs = vencimiento.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) {
      return { 
        status: "vencido", 
        text: `Vencido hace ${Math.abs(diferenciaDias)} días`, 
        color: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse" 
      };
    } else if (diferenciaDias <= 30) {
      return { 
        status: "por-vencer", 
        text: `Por vencer (${diferenciaDias} días)`, 
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20" 
      };
    } else {
      return { 
        status: "vigente", 
        text: "Vigente", 
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
      };
    }
  };

  const semaforos = [
    { name: "Cédula / Documento Identidad", date: trabajador.tipo_identificacion === "RUT" ? trabajador.vencimiento_carnet : trabajador.fecha_vencimiento_id },
    { name: "Licencia de Conducir", date: trabajador.vencimiento_licencia_conducir },
    { name: "Examen de Altura Geográfica", date: trabajador.vencimiento_altura_geo },
    { name: "Examen Psicosensométrico", date: trabajador.vencimiento_psicosensometrico }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
      <div className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/40">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-2xl font-bold">
              {trabajador.nombre_1[0]}{trabajador.apellido_paterno[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {trabajador.nombre_1} {trabajador.apellido_paterno}
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold uppercase">
                  {trabajador.tipo_identificacion}: {trabajador.numero_identificacion}
                </span>
              </h2>
              <p className="text-sm text-blue-400 font-medium">{trabajador.cargo || "Cargo no registrado"} • {trabajador.area_departamento || "Área no registrada"}</p>
              <div className="flex gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> Ingreso: {trabajador.fecha_ingreso}</span>
                <span className="flex items-center gap-1"><Briefcase size={12} /> {trabajador.tipo_contrato}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-zinc-800 bg-zinc-950 space-x-6">
          {[
            { id: "resumen", label: "Vista General" },
            { id: "completo", label: "Información Completa" },
            { id: "epp", label: "EPP & Operativo" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id 
                  ? "border-blue-500 text-blue-400" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RESUMEN Y SEMÁFOROS */}
          {activeTab === "resumen" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Traffic Lights / Semáforos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-blue-500" />
                  Semáforos de Cumplimiento Operativo
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {semaforos.map((sem) => {
                    const status = getSemaforo(sem.date);
                    return (
                      <div 
                        key={sem.name}
                        className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/30 border border-zinc-900 flex-wrap sm:flex-nowrap gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-zinc-300">{sem.name}</span>
                          <p className="text-[10px] text-zinc-500">
                            {sem.date ? `Vence: ${sem.date}` : "Sin registrar"}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-md border font-bold ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Contact & Details */}
              <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Canales de Contacto Directo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 font-bold block">CORPORATIVO</span>
                      <a href={`mailto:${trabajador.email_corporativo}`} className="text-xs text-white hover:underline truncate block">
                        {trabajador.email_corporativo}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-zinc-500 font-bold block">CELULAR</span>
                      <a href={`tel:${trabajador.celular_personal}`} className="text-xs text-white hover:underline block">
                        {trabajador.celular_personal}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* LMS Certifications */}
              <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Certificaciones de Seguridad y LMS
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/30 border border-zinc-900">
                    {trabajador.cert_sap_lms ? <CheckCircle2 className="text-emerald-500" size={14} /> : <X className="text-zinc-600" size={14} />}
                    <span className="text-xs font-semibold text-zinc-300">SAP LMS</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/30 border border-zinc-900">
                    {trabajador.cert_soma_lms ? <CheckCircle2 className="text-emerald-500" size={14} /> : <X className="text-zinc-600" size={14} />}
                    <span className="text-xs font-semibold text-zinc-300">SOMA LMS</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/30 border border-zinc-900">
                    {trabajador.cert_ti ? <CheckCircle2 className="text-emerald-500" size={14} /> : <X className="text-zinc-600" size={14} />}
                    <span className="text-xs font-semibold text-zinc-300">TI Aprobado</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INFORMACIÓN COMPLETA */}
          {activeTab === "completo" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Personal Data */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                  <User size={14} />
                  Ficha de Identidad
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Nombres</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.nombre_1} {trabajador.nombre_2 || ""}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Apellidos</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.apellido_paterno} {trabajador.apellido_materno}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Nacionalidad</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.nacionalidad}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Fecha Nacimiento</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.fecha_nacimiento}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Estado Civil</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.estado_civil || "Sin registrar"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Sexo</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.sexo === "M" ? "Masculino" : trabajador.sexo === "F" ? "Femenino" : "Otro"}</span>
                  </div>
                </div>
              </div>

              {/* Domicilio */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} />
                  Domicilio y Residencia
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Región</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.region || "Sin registrar"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Comuna</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.comuna || "Sin registrar"}</span>
                  </div>
                  <div className="col-span-2 flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Dirección</span>
                    <span className="text-zinc-200 font-semibold">
                      {trabajador.calle ? `${trabajador.calle} ${trabajador.numero_domicilio || ""}` : "Sin registrar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial & Healthcare */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                  <CreditCard size={14} />
                  Previsión, Salud y Datos Bancarios
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">AFP</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.afp || "Sin registrar"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Sistema Salud</span>
                    <span className="text-zinc-200 font-semibold">
                      {trabajador.sistema_salud || "Fonasa"} {trabajador.nombre_isapre ? `(${trabajador.nombre_isapre})` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Banco</span>
                    <span className="text-zinc-200 font-semibold">{trabajador.banco || "Sin registrar"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900/60">
                    <span className="text-zinc-500">Cuenta</span>
                    <span className="text-zinc-200 font-semibold">
                      {trabajador.tipo_cuenta ? `${trabajador.tipo_cuenta} Nº ${trabajador.numero_cuenta || ""}` : "Sin registrar"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EPP & OPERATIVO */}
          {activeTab === "epp" && (
            <div className="space-y-6 animate-fadeIn">
              {/* EPP Sizes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">
                  Tallas de EPP Asignadas
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">CHAQUETA</span>
                    <span className="text-lg font-bold text-white">{trabajador.talla_chaqueta || "—"}</span>
                  </div>
                  <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">POLERA</span>
                    <span className="text-lg font-bold text-white">{trabajador.talla_polera || "—"}</span>
                  </div>
                  <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg text-center">
                    <span className="text-[10px] text-zinc-500 font-bold block mb-1">CALZADO</span>
                    <span className="text-lg font-bold text-white">{trabajador.calzado_seguridad || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Formación Profesional */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                  <FileText size={14} />
                  Currículum y Formación Profesional
                </h4>
                <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 space-y-3 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Título Universitario / Técnico</span>
                    <span className="text-zinc-200 font-bold">{trabajador.titulo_profesional || "Sin registrar"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Universidad / Instituto</span>
                    <span className="text-zinc-200 font-bold">{trabajador.universidad_titulo || "Sin registrar"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
