"use client";

import React, { useState } from "react";

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
  CreditCard,
  Edit,
  Stethoscope,
  GraduationCap
} from "lucide-react";
import TrabajadorForm from "./trabajador-form";
import { useTrabajadoresStore, Trabajador } from "@/store/trabajadores-store";
import { useTrabajadoresSAPStore } from "@/store/trabajadores-sap-store";
import { useControlStore } from "@/store/control-store";
import { AsignarControlModal } from "./control/asignar-control-modal";

interface TrabajadorDetalleProps {
  trabajador: Trabajador;
  onClose: () => void;
}

export default function TrabajadorDetalle({ trabajador, onClose }: TrabajadorDetalleProps) {
  const { updateTrabajador } = useTrabajadoresStore();
  const { documentos, examenes, cursos, catalogoDocumentos, catalogoExamenes, catalogoCursos } = useControlStore();
  const [activeTab, setActiveTab] = useState<"resumen" | "completo" | "epp" | "control" | "sap">("resumen");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSap, setIsEditingSap] = useState(false);
  const [modalControl, setModalControl] = useState<{ isOpen: boolean, type: "documento"|"curso"|"examen" }>({ isOpen: false, type: "documento" });

  const { sapList, fetchSAPData, upsertSAPData } = useTrabajadoresSAPStore();

  React.useEffect(() => {
    fetchSAPData();
  }, [fetchSAPData]);

  const sapRecord = sapList.find(s => s.id_trabajador === trabajador.id_trabajador);

  const [sapFormData, setSapFormData] = useState({
    correo_adc_codelco: "",
    aprobacion_correo_adc_codelco: "",
    solicitud_cuenta_realizada_codelco: "",
    cuenta_correo_activa_codelco: false,
    ticket_codelco: "",
    correo_adc_sap: "",
    aprobacion_correo_adc_sap: "",
    solicitud_cuenta_sap: "",
    cuenta_sap_activa: false,
    ticket_sap: "",
    correo_adc_perfiles_sap: "",
    aprobacion_correo_adc_perfiles_sap: "",
    solicitud_perfiles_roles_sap: "",
    ticket_perfiles_sap: "",
    perfiles_sap_activos: false,
    requiere_datamart: false,
    correo_adc_datamart: "",
    aprobacion_correo_adc_datamart: "",
    solicitud_datamart: "",
    datamart_activo: false,
    ticket_datamart: ""
  });

  const handleEditSapOpen = () => {
    if (sapRecord) {
      setSapFormData({
        correo_adc_codelco: sapRecord.correo_adc_codelco || "",
        aprobacion_correo_adc_codelco: sapRecord.aprobacion_correo_adc_codelco || "",
        solicitud_cuenta_realizada_codelco: sapRecord.solicitud_cuenta_realizada_codelco || "",
        cuenta_correo_activa_codelco: !!sapRecord.cuenta_correo_activa_codelco,
        ticket_codelco: sapRecord.ticket_codelco || "",
        correo_adc_sap: sapRecord.correo_adc_sap || "",
        aprobacion_correo_adc_sap: sapRecord.aprobacion_correo_adc_sap || "",
        solicitud_cuenta_sap: sapRecord.solicitud_cuenta_sap || "",
        cuenta_sap_activa: !!sapRecord.cuenta_sap_activa,
        ticket_sap: sapRecord.ticket_sap || "",
        correo_adc_perfiles_sap: sapRecord.correo_adc_perfiles_sap || "",
        aprobacion_correo_adc_perfiles_sap: sapRecord.aprobacion_correo_adc_perfiles_sap || "",
        solicitud_perfiles_roles_sap: sapRecord.solicitud_perfiles_roles_sap || "",
        ticket_perfiles_sap: sapRecord.ticket_perfiles_sap || "",
        perfiles_sap_activos: !!sapRecord.perfiles_sap_activos,
        requiere_datamart: !!sapRecord.requiere_datamart,
        correo_adc_datamart: sapRecord.correo_adc_datamart || "",
        aprobacion_correo_adc_datamart: sapRecord.aprobacion_correo_adc_datamart || "",
        solicitud_datamart: sapRecord.solicitud_datamart || "",
        datamart_activo: !!sapRecord.datamart_activo,
        ticket_datamart: sapRecord.ticket_datamart || "",
      });
    } else {
      setSapFormData({
        correo_adc_codelco: "",
        aprobacion_correo_adc_codelco: "",
        solicitud_cuenta_realizada_codelco: "",
        cuenta_correo_activa_codelco: false,
        ticket_codelco: "",
        correo_adc_sap: "",
        aprobacion_correo_adc_sap: "",
        solicitud_cuenta_sap: "",
        cuenta_sap_activa: false,
        ticket_sap: "",
        correo_adc_perfiles_sap: "",
        aprobacion_correo_adc_perfiles_sap: "",
        solicitud_perfiles_roles_sap: "",
        ticket_perfiles_sap: "",
        perfiles_sap_activos: false,
        requiere_datamart: false,
        correo_adc_datamart: "",
        aprobacion_correo_adc_datamart: "",
        solicitud_datamart: "",
        datamart_activo: false,
        ticket_datamart: ""
      });
    }
    setIsEditingSap(true);
  };

  const handleSapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mapToNull = (val: string) => val.trim() === "" ? null : val;
    const cleanSapData = {
      correo_adc_codelco: mapToNull(sapFormData.correo_adc_codelco),
      aprobacion_correo_adc_codelco: mapToNull(sapFormData.aprobacion_correo_adc_codelco),
      solicitud_cuenta_realizada_codelco: mapToNull(sapFormData.solicitud_cuenta_realizada_codelco),
      cuenta_correo_activa_codelco: sapFormData.cuenta_correo_activa_codelco,
      ticket_codelco: mapToNull(sapFormData.ticket_codelco),
      correo_adc_sap: mapToNull(sapFormData.correo_adc_sap),
      aprobacion_correo_adc_sap: mapToNull(sapFormData.aprobacion_correo_adc_sap),
      solicitud_cuenta_sap: mapToNull(sapFormData.solicitud_cuenta_sap),
      cuenta_sap_activa: sapFormData.cuenta_sap_activa,
      ticket_sap: mapToNull(sapFormData.ticket_sap),
      correo_adc_perfiles_sap: mapToNull(sapFormData.correo_adc_perfiles_sap),
      aprobacion_correo_adc_perfiles_sap: mapToNull(sapFormData.aprobacion_correo_adc_perfiles_sap),
      solicitud_perfiles_roles_sap: mapToNull(sapFormData.solicitud_perfiles_roles_sap),
      ticket_perfiles_sap: mapToNull(sapFormData.ticket_perfiles_sap),
      perfiles_sap_activos: sapFormData.perfiles_sap_activos,
      requiere_datamart: sapFormData.requiere_datamart,
      correo_adc_datamart: mapToNull(sapFormData.correo_adc_datamart),
      aprobacion_correo_adc_datamart: mapToNull(sapFormData.aprobacion_correo_adc_datamart),
      solicitud_datamart: mapToNull(sapFormData.solicitud_datamart),
      datamart_activo: sapFormData.datamart_activo,
      ticket_datamart: mapToNull(sapFormData.ticket_datamart),
    };
    await upsertSAPData(trabajador.id_trabajador, cleanSapData);
    setIsEditingSap(false);
  };
  
  // Estado para Edición in-situ de Formación y Talento
  const [isEditingFormacion, setIsEditingFormacion] = useState(false);
  const [formacionData, setFormacionData] = useState({
    titulo_profesional: trabajador.titulo_profesional || "",
    universidad_titulo: trabajador.universidad_titulo || "",
    anos_experiencia: trabajador.anos_experiencia || 0,
    idiomas: trabajador.idiomas || [],
    certificaciones_especificas: trabajador.certificaciones_especificas || [],
    otras_habilidades: trabajador.otras_habilidades || [],
    cert_sap_lms: !!trabajador.cert_sap_lms,
    cert_soma_lms: !!trabajador.cert_soma_lms,
    cert_ti: !!trabajador.cert_ti
  });
  
  const [tagInputs, setTagInputs] = useState({
    idiomas: "",
    certificaciones_especificas: "",
    otras_habilidades: ""
  });

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof typeof tagInputs) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInputs[field].trim();
      if (value) {
        setFormacionData(prev => ({
          ...prev,
          [field]: [...(prev[field as keyof typeof formacionData] as string[] || []), value]
        }));
        setTagInputs(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const removeTag = (field: keyof typeof tagInputs, index: number) => {
    setFormacionData(prev => {
      const arr = [...(prev[field as keyof typeof formacionData] as string[] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleFormacionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTrabajador(trabajador.id_trabajador, formacionData);
    setIsEditingFormacion(false);
  };

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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
              title="Editar Trabajador"
            >
              <Edit size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-zinc-800 bg-zinc-950 space-x-6">
          {[
            { id: "resumen", label: "Vista General" },
            { id: "completo", label: "Información Completa" },
            { id: "epp", label: "EPP & Operativo" },
            { id: "control", label: "Acreditaciones & Control" },
            { id: "sap", label: "Accesos TI y SAP" }
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

              {/* Formación Profesional y Talento */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} />
                    Talento y Formación
                  </h4>
                  <button 
                    onClick={() => setIsEditingFormacion(true)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                  >
                    <Edit size={12} /> Editar
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-text-soft">Título Profesional</span>
                      <span className="text-text font-bold text-right ml-2">{trabajador.titulo_profesional || "Sin registrar"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-soft">Universidad / Inst.</span>
                      <span className="text-text font-bold text-right ml-2">{trabajador.universidad_titulo || "Sin registrar"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-border/50 pt-2">
                      <span className="text-text-soft">Experiencia Relevante</span>
                      <span className="text-text font-bold text-right ml-2">{trabajador.anos_experiencia ? `${trabajador.anos_experiencia} años` : "No especificada"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-4 text-sm">
                    <div>
                      <span className="text-xs text-text-muted font-bold block mb-2 uppercase tracking-wider">Idiomas</span>
                      <div className="flex flex-wrap gap-1.5">
                        {trabajador.idiomas?.length ? (
                          trabajador.idiomas.map((tag, i) => <span key={i} className="badge badge-outline">{tag}</span>)
                        ) : (
                          <span className="text-text-muted text-xs italic">No especificado</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold block mb-2 uppercase tracking-wider">Certificaciones</span>
                      <div className="flex flex-wrap gap-1.5">
                        {trabajador.certificaciones_especificas?.length ? (
                          trabajador.certificaciones_especificas.map((tag, i) => <span key={i} className="badge bg-primary/10 text-primary border border-primary/20">{tag}</span>)
                        ) : (
                          <span className="text-text-muted text-xs italic">No especificadas</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold block mb-2 uppercase tracking-wider">Habilidades Adicionales</span>
                      <div className="flex flex-wrap gap-1.5">
                        {trabajador.otras_habilidades?.length ? (
                          trabajador.otras_habilidades.map((tag, i) => <span key={i} className="badge bg-bg text-text border border-border">{tag}</span>)
                        ) : (
                          <span className="text-text-muted text-xs italic">No especificadas</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted font-bold block mb-2 uppercase tracking-wider">Habilitantes LMS</span>
                      <div className="flex gap-4 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${trabajador.cert_sap_lms ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>SAP</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${trabajador.cert_soma_lms ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>SOMA</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${trabajador.cert_ti ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-500 border-zinc-700"}`}>TI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACREDITACIONES Y CONTROL */}
          {activeTab === "control" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Documentos y Pases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> Documentos y Pases
                  </h4>
                  <button onClick={() => setModalControl({ isOpen: true, type: "documento" })} className="btn btn-primary text-[10px] py-1 px-2 h-auto min-h-0">
                    + Asignar Pase
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentos.filter(d => d.id_trabajador === trabajador.id_trabajador).map(doc => {
                    const cat = catalogoDocumentos.find(c => c.id === doc.id_documento_catalogo);
                    return (
                      <div key={doc.id} className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-text">{cat?.nombre || "Documento"}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.estado === "Vigente" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : doc.estado === "Vencido" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                            {doc.estado}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted space-y-1">
                          <p>Nº: <span className="text-text-soft">{doc.numero_documento || "N/A"}</span></p>
                          <p>Vence: <span className="text-text-soft font-semibold">{doc.fecha_vencimiento || "Sin Vencimiento"}</span></p>
                        </div>
                      </div>
                    );
                  })}
                  {documentos.filter(d => d.id_trabajador === trabajador.id_trabajador).length === 0 && (
                    <div className="col-span-full p-4 border border-dashed border-border rounded-xl text-center text-zinc-500 text-sm">
                      No hay documentos o pases registrados
                    </div>
                  )}
                </div>
              </div>

              {/* Exámenes Médicos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope size={14} /> Exámenes de Salud Ocupacional
                  </h4>
                  <button onClick={() => setModalControl({ isOpen: true, type: "examen" })} className="btn btn-primary text-[10px] py-1 px-2 h-auto min-h-0">
                    + Registrar Examen
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examenes.filter(e => e.id_trabajador === trabajador.id_trabajador).map(ex => {
                    const cat = catalogoExamenes.find(c => c.id === ex.id_examen_catalogo);
                    return (
                      <div key={ex.id} className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-text">{cat?.nombre || "Examen"}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ex.resultado.includes("Aprobado") ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : ex.resultado === "Rechazado" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                            {ex.resultado}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted space-y-1">
                          <p>Realizado: <span className="text-text-soft">{ex.fecha_realizacion}</span></p>
                          <p>Vence: <span className="text-text-soft font-semibold">{ex.fecha_vencimiento || "N/A"}</span></p>
                        </div>
                      </div>
                    );
                  })}
                  {examenes.filter(e => e.id_trabajador === trabajador.id_trabajador).length === 0 && (
                    <div className="col-span-full p-4 border border-dashed border-border rounded-xl text-center text-zinc-500 text-sm">
                      No hay exámenes médicos registrados
                    </div>
                  )}
                </div>
              </div>

              {/* Cursos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap size={14} /> Cursos de Capacitación
                  </h4>
                  <button onClick={() => setModalControl({ isOpen: true, type: "curso" })} className="btn btn-primary text-[10px] py-1 px-2 h-auto min-h-0">
                    + Añadir Curso
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cursos.filter(c => c.id_trabajador === trabajador.id_trabajador).map(cu => {
                    const cat = catalogoCursos.find(c => c.id === cu.id_curso_catalogo);
                    return (
                      <div key={cu.id} className="p-4 rounded-xl bg-surface border border-border shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-text">{cat?.nombre || "Curso"}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cu.estado === "Aprobado" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : cu.estado === "Reprobado" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                            {cu.estado}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted space-y-1">
                          <p>Institución: <span className="text-text-soft">{cu.institucion || "N/A"}</span></p>
                          <p>Vence: <span className="text-text-soft font-semibold">{cu.fecha_vencimiento || "N/A"}</span></p>
                        </div>
                      </div>
                    );
                  })}
                  {cursos.filter(c => c.id_trabajador === trabajador.id_trabajador).length === 0 && (
                    <div className="col-span-full p-4 border border-dashed border-border rounded-xl text-center text-zinc-500 text-sm">
                      No hay cursos registrados
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sap" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} /> Accesos TI y Credenciales SAP
                </h4>
                <button 
                  onClick={handleEditSapOpen}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                >
                  <Edit size={12} /> Editar Accesos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Correo Codelco */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-bold text-sm text-text">Correo Codelco</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sapRecord?.cuenta_correo_activa_codelco 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : sapRecord?.solicitud_cuenta_realizada_codelco
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}>
                      {sapRecord?.cuenta_correo_activa_codelco ? "Activa" : sapRecord?.solicitud_cuenta_realizada_codelco ? "Solicitada" : "No iniciada"}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-muted">
                    <div className="flex justify-between"><span className="text-text-soft">Correo a AdC:</span> <span className="text-text font-medium">{sapRecord?.correo_adc_codelco || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Aprobación AdC:</span> <span className="text-text font-medium">{sapRecord?.aprobacion_correo_adc_codelco || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Solicitud Cuenta:</span> <span className="text-text font-medium">{sapRecord?.solicitud_cuenta_realizada_codelco || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">N° Ticket:</span> <span className="text-text font-bold">{sapRecord?.ticket_codelco || "—"}</span></div>
                  </div>
                </div>

                {/* 2. Cuenta SAP */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-bold text-sm text-text">Cuenta SAP</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sapRecord?.cuenta_sap_activa 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : sapRecord?.solicitud_cuenta_sap
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}>
                      {sapRecord?.cuenta_sap_activa ? "Activa" : sapRecord?.solicitud_cuenta_sap ? "Solicitada" : "No iniciada"}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-muted">
                    <div className="flex justify-between"><span className="text-text-soft">Correo a AdC:</span> <span className="text-text font-medium">{sapRecord?.correo_adc_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Aprobación AdC:</span> <span className="text-text font-medium">{sapRecord?.aprobacion_correo_adc_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Solicitud Cuenta:</span> <span className="text-text font-medium">{sapRecord?.solicitud_cuenta_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">N° Ticket (3):</span> <span className="text-text font-bold">{sapRecord?.ticket_sap || "—"}</span></div>
                  </div>
                </div>

                {/* 3. Perfiles SAP */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-bold text-sm text-text">Perfiles SAP</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sapRecord?.perfiles_sap_activos 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : sapRecord?.solicitud_perfiles_roles_sap
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                    }`}>
                      {sapRecord?.perfiles_sap_activos ? "Activos" : sapRecord?.solicitud_perfiles_roles_sap ? "Solicitados" : "No iniciados"}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-text-muted">
                    <div className="flex justify-between"><span className="text-text-soft">Correo a AdC:</span> <span className="text-text font-medium">{sapRecord?.correo_adc_perfiles_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Aprobación AdC:</span> <span className="text-text font-medium">{sapRecord?.aprobacion_correo_adc_perfiles_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">Solicitud Perfiles:</span> <span className="text-text font-medium">{sapRecord?.solicitud_perfiles_roles_sap || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-text-soft">N° Ticket:</span> <span className="text-text font-bold">{sapRecord?.ticket_perfiles_sap || "—"}</span></div>
                  </div>
                </div>

                {/* 4. Datamart */}
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-bold text-sm text-text">Datamart</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      !sapRecord?.requiere_datamart
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        : sapRecord?.datamart_activo 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : sapRecord?.solicitud_datamart
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {!sapRecord?.requiere_datamart ? "No requerido" : sapRecord?.datamart_activo ? "Activo" : sapRecord?.solicitud_datamart ? "Solicitado" : "Requerido"}
                    </span>
                  </div>
                  {sapRecord?.requiere_datamart ? (
                    <div className="space-y-1.5 text-xs text-text-muted">
                      <div className="flex justify-between"><span className="text-text-soft">Correo a AdC:</span> <span className="text-text font-medium">{sapRecord?.correo_adc_datamart || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-text-soft">Aprobación AdC:</span> <span className="text-text font-medium">{sapRecord?.aprobacion_correo_adc_datamart || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-text-soft">Solicitud Datamart:</span> <span className="text-text font-medium">{sapRecord?.solicitud_datamart || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-text-soft">N° Ticket (2):</span> <span className="text-text font-bold">{sapRecord?.ticket_datamart || "—"}</span></div>
                    </div>
                  ) : (
                    <div className="h-[76px] flex items-center justify-center text-xs text-text-muted italic">
                      Este trabajador no requiere acceso a Datamart
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <TrabajadorForm 
          trabajadorId={trabajador.id_trabajador} 
          onClose={() => setIsEditing(false)} 
        />
      )}

      {modalControl.isOpen && (
        <AsignarControlModal
          type={modalControl.type}
          trabajadorId={trabajador.id_trabajador}
          onClose={() => setModalControl({ isOpen: false, type: "documento" })}
        />
      )}

      {isEditingSap && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Shield className="text-primary" size={20}/> Editar Accesos TI y SAP</h2>
              <button onClick={() => setIsEditingSap(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSapSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* 1. Correo Codelco */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">Cuenta de Correo Codelco</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.correo_adc_codelco} onChange={e => setSapFormData({...sapFormData, correo_adc_codelco: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo AdC</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.aprobacion_correo_adc_codelco} onChange={e => setSapFormData({...sapFormData, aprobacion_correo_adc_codelco: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud Realizada</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.solicitud_cuenta_realizada_codelco} onChange={e => setSapFormData({...sapFormData, solicitud_cuenta_realizada_codelco: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket</label>
                    <input type="text" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.ticket_codelco} onChange={e => setSapFormData({...sapFormData, ticket_codelco: e.target.value})} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                        checked={sapFormData.cuenta_correo_activa_codelco} onChange={e => setSapFormData({...sapFormData, cuenta_correo_activa_codelco: e.target.checked})} />
                      <span className="group-hover:text-primary transition-colors">Cuenta correo activa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Cuenta SAP */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">Cuenta SAP</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC SAP</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.correo_adc_sap} onChange={e => setSapFormData({...sapFormData, correo_adc_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo SAP</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.aprobacion_correo_adc_sap} onChange={e => setSapFormData({...sapFormData, aprobacion_correo_adc_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud SAP</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.solicitud_cuenta_sap} onChange={e => setSapFormData({...sapFormData, solicitud_cuenta_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket (3)</label>
                    <input type="text" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.ticket_sap} onChange={e => setSapFormData({...sapFormData, ticket_sap: e.target.value})} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                        checked={sapFormData.cuenta_sap_activa} onChange={e => setSapFormData({...sapFormData, cuenta_sap_activa: e.target.checked})} />
                      <span className="group-hover:text-primary transition-colors">Cuenta SAP activa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Perfiles SAP */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">Perfiles SAP</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC Perfiles</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.correo_adc_perfiles_sap} onChange={e => setSapFormData({...sapFormData, correo_adc_perfiles_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo Perfiles</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.aprobacion_correo_adc_perfiles_sap} onChange={e => setSapFormData({...sapFormData, aprobacion_correo_adc_perfiles_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud Perfiles y Roles</label>
                    <input type="date" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.solicitud_perfiles_roles_sap} onChange={e => setSapFormData({...sapFormData, solicitud_perfiles_roles_sap: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket</label>
                    <input type="text" className="input bg-zinc-900 border-zinc-800" 
                      value={sapFormData.ticket_perfiles_sap} onChange={e => setSapFormData({...sapFormData, ticket_perfiles_sap: e.target.value})} />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                        checked={sapFormData.perfiles_sap_activos} onChange={e => setSapFormData({...sapFormData, perfiles_sap_activos: e.target.checked})} />
                      <span className="group-hover:text-primary transition-colors">Perfiles SAP activos</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Datamart */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-1.5">Datamart</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-3 flex items-center pb-2">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                        checked={sapFormData.requiere_datamart} onChange={e => setSapFormData({...sapFormData, requiere_datamart: e.target.checked})} />
                      <span className="group-hover:text-primary transition-colors">Requiere Datamart</span>
                    </label>
                  </div>

                  {sapFormData.requiere_datamart && (
                    <>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Correo a AdC Datamart</label>
                        <input type="date" className="input bg-zinc-900 border-zinc-800" 
                          value={sapFormData.correo_adc_datamart} onChange={e => setSapFormData({...sapFormData, correo_adc_datamart: e.target.value})} />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo Datamart</label>
                        <input type="date" className="input bg-zinc-900 border-zinc-800" 
                          value={sapFormData.aprobacion_correo_adc_datamart} onChange={e => setSapFormData({...sapFormData, aprobacion_correo_adc_datamart: e.target.value})} />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Solicitud Datamart</label>
                        <input type="date" className="input bg-zinc-900 border-zinc-800" 
                          value={sapFormData.solicitud_datamart} onChange={e => setSapFormData({...sapFormData, solicitud_datamart: e.target.value})} />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">N° de Ticket (2)</label>
                        <input type="text" className="input bg-zinc-900 border-zinc-800" 
                          value={sapFormData.ticket_datamart} onChange={e => setSapFormData({...sapFormData, ticket_datamart: e.target.value})} />
                      </div>
                      <div className="flex items-center pt-6 animate-fadeIn">
                        <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                            checked={sapFormData.datamart_activo} onChange={e => setSapFormData({...sapFormData, datamart_activo: e.target.checked})} />
                          <span className="group-hover:text-primary transition-colors">Datamart activo</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/40 rounded-b-2xl">
              <button type="button" onClick={() => setIsEditingSap(false)} className="btn btn-secondary py-2 min-h-0 text-sm">Cancelar</button>
              <button type="button" onClick={handleSapSubmit} className="btn py-2 min-h-0 text-sm bg-primary text-white hover:bg-primary-hover border-none">Guardar Accesos</button>
            </div>
          </div>
        </div>
      )}

      {isEditingFormacion && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="text-primary" size={20}/> Editar Formación y Talento</h2>
              <button onClick={() => setIsEditingFormacion(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleFormacionSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Título Profesional / Técnico</label>
                  <input type="text" className="input bg-zinc-900 border-zinc-800" 
                    value={formacionData.titulo_profesional} onChange={e => setFormacionData({...formacionData, titulo_profesional: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Universidad / Instituto</label>
                  <input type="text" className="input bg-zinc-900 border-zinc-800" 
                    value={formacionData.universidad_titulo} onChange={e => setFormacionData({...formacionData, universidad_titulo: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Años de Experiencia Relevante</label>
                  <input type="number" className="input bg-zinc-900 border-zinc-800" 
                    value={formacionData.anos_experiencia} onChange={e => setFormacionData({...formacionData, anos_experiencia: parseInt(e.target.value)||0})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Idiomas (Enter o coma)</label>
                  <div className="input bg-zinc-900 border-zinc-800 p-1.5 flex flex-wrap gap-1.5 items-center min-h-[42px]">
                    {formacionData.idiomas.map((tag, idx) => (
                      <span key={idx} className="badge badge-outline text-[10px] flex items-center gap-1">{tag}
                        <button type="button" onClick={() => removeTag("idiomas", idx)} className="hover:text-red-400"><X size={10} /></button>
                      </span>
                    ))}
                    <input type="text" className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-white"
                      value={tagInputs.idiomas} onChange={e => setTagInputs({...tagInputs, idiomas: e.target.value})} onKeyDown={e => handleTagKeyDown(e, "idiomas")} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Certificaciones Específicas</label>
                  <div className="input bg-zinc-900 border-zinc-800 p-1.5 flex flex-wrap gap-1.5 items-center min-h-[42px]">
                    {formacionData.certificaciones_especificas.map((tag, idx) => (
                      <span key={idx} className="badge bg-primary/10 text-primary border border-primary/20 text-[10px] flex items-center gap-1">{tag}
                        <button type="button" onClick={() => removeTag("certificaciones_especificas", idx)} className="hover:text-primary-hover"><X size={10} /></button>
                      </span>
                    ))}
                    <input type="text" className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-white"
                      value={tagInputs.certificaciones_especificas} onChange={e => setTagInputs({...tagInputs, certificaciones_especificas: e.target.value})} onKeyDown={e => handleTagKeyDown(e, "certificaciones_especificas")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Otras Habilidades</label>
                  <div className="input bg-zinc-900 border-zinc-800 p-1.5 flex flex-wrap gap-1.5 items-center min-h-[42px]">
                    {formacionData.otras_habilidades.map((tag, idx) => (
                      <span key={idx} className="badge bg-zinc-800 text-zinc-200 border border-zinc-700 text-[10px] flex items-center gap-1">{tag}
                        <button type="button" onClick={() => removeTag("otras_habilidades", idx)} className="hover:text-red-400"><X size={10} /></button>
                      </span>
                    ))}
                    <input type="text" className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-white"
                      value={tagInputs.otras_habilidades} onChange={e => setTagInputs({...tagInputs, otras_habilidades: e.target.value})} onKeyDown={e => handleTagKeyDown(e, "otras_habilidades")} />
                  </div>
                </div>
              </div>

              {/* Certificaciones Habilitantes Obligatorias */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <span className="text-xs text-zinc-400 font-bold block mb-1">Certificaciones Habilitantes Obligatorias (LMS)</span>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      checked={formacionData.cert_sap_lms} onChange={e => setFormacionData({...formacionData, cert_sap_lms: e.target.checked})} />
                    <span className="group-hover:text-primary transition-colors">SAP LMS</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      checked={formacionData.cert_soma_lms} onChange={e => setFormacionData({...formacionData, cert_soma_lms: e.target.checked})} />
                    <span className="group-hover:text-primary transition-colors">SOMA LMS</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      checked={formacionData.cert_ti} onChange={e => setFormacionData({...formacionData, cert_ti: e.target.checked})} />
                    <span className="group-hover:text-primary transition-colors">Aprobación TI</span>
                  </label>
                </div>
              </div>
            </form>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/40 rounded-b-2xl">
              <button type="button" onClick={() => setIsEditingFormacion(false)} className="btn btn-secondary py-2 min-h-0 text-sm">Cancelar</button>
              <button type="button" onClick={handleFormacionSubmit} className="btn py-2 min-h-0 text-sm bg-primary text-white hover:bg-primary-hover border-none">Guardar Formación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
