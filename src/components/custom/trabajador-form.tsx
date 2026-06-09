"use client";

import React, { useState, useEffect } from "react";
import { Trabajador, useTrabajadoresStore } from "@/store/trabajadores-store";
import { useTrabajadoresSAPStore } from "@/store/trabajadores-sap-store";
import { X, Save, AlertCircle, CheckCircle, Info } from "lucide-react";

interface TrabajadorFormProps {
  trabajadorId?: string; // If provided, we are editing
  onClose: () => void;
}

export default function TrabajadorForm({ trabajadorId, onClose }: TrabajadorFormProps) {
  const { trabajadores, addTrabajador, updateTrabajador } = useTrabajadoresStore();
  const isEditing = !!trabajadorId;

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"personal" | "laboral" | "prevision" | "operativo" | "talento" | "sap">("personal");

  const { sapList, fetchSAPData, upsertSAPData } = useTrabajadoresSAPStore();

  const [sapData, setSapData] = useState({
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

  // Form State
  const [formData, setFormData] = useState<Omit<Trabajador, "id_trabajador">>({
    apellido_paterno: "",
    apellido_materno: "",
    nombre_1: "",
    nombre_2: "",
    sexo: "M",
    fecha_nacimiento: "",
    ciudad_nacimiento: "",
    nacionalidad: "Chilena",
    tipo_identificacion: "RUT",
    numero_identificacion: "",
    fecha_vencimiento_id: "",
    estado_civil: "Soltero",
    email_corporativo: "",
    email_personal: "",
    celular_personal: "",
    telefono_emergencia: "",
    nombre_contacto_emergencia: "",
    parentesco_emergencia: "",
    region: "",
    ciudad: "",
    comuna: "",
    calle: "",
    numero_domicilio: "",
    departamento_casa: "",
    afp: "",
    sistema_salud: "Fonasa",
    nombre_isapre: "",
    valor_plan_uf: 0,
    banco: "",
    tipo_cuenta: "Corriente",
    numero_cuenta: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
    tipo_contrato: "Indefinido",
    fecha_vencimiento_contrato: "",
    cargo: "",
    area_departamento: "",
    modalidad_trabajo: "Presencial",
    talla_chaqueta: "",
    talla_polera: "",
    calzado_seguridad: "",
    chaleco_geologo: "",
    respirador: "",
    vencimiento_carnet: "",
    vencimiento_altura_geo: "",
    vencimiento_psicosensometrico: "",
    vencimiento_licencia_conducir: "",
    titulo_profesional: "",
    mencion_titulo: "",
    universidad_titulo: "",
    postgrado_1: "",
    mencion_postgrado_1: "",
    universidad_postgrado_1: "",
    cursos_certificaciones: "",
    certificaciones_especificas: [],
    idiomas: [],
    anos_experiencia: 0,
    otras_habilidades: [],
    cv_actualizado: false,
    fecha_actualizacion_cv: "",
    cert_sap_lms: false,
    cert_soma_lms: false,
    cert_ti: false
  });

  // Tag Inputs State
  const [tagInputs, setTagInputs] = useState({
    certificaciones_especificas: "",
    idiomas: "",
    otras_habilidades: ""
  });

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof typeof tagInputs) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = tagInputs[field].trim();
      if (value) {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field as keyof typeof formData] as string[] || []), value]
        }));
        setTagInputs(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const removeTag = (field: keyof typeof tagInputs, index: number) => {
    setFormData(prev => {
      const arr = [...(prev[field as keyof typeof formData] as string[] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing data if editing
  useEffect(() => {
    fetchSAPData();
  }, [fetchSAPData]);

  useEffect(() => {
    if (isEditing && trabajadorId) {
      const existing = trabajadores.find(t => t.id_trabajador === trabajadorId);
      if (existing) {
        const { id_trabajador, ...rest } = existing;
        setFormData({
          ...rest,
          certificaciones_especificas: rest.certificaciones_especificas || [],
          idiomas: rest.idiomas || [],
          otras_habilidades: rest.otras_habilidades || [],
          anos_experiencia: rest.anos_experiencia || 0,
        });
      }
      
      const existingSap = sapList.find(s => s.id_trabajador === trabajadorId);
      if (existingSap) {
        setSapData({
          correo_adc_codelco: existingSap.correo_adc_codelco || "",
          aprobacion_correo_adc_codelco: existingSap.aprobacion_correo_adc_codelco || "",
          solicitud_cuenta_realizada_codelco: existingSap.solicitud_cuenta_realizada_codelco || "",
          cuenta_correo_activa_codelco: !!existingSap.cuenta_correo_activa_codelco,
          ticket_codelco: existingSap.ticket_codelco || "",
          correo_adc_sap: existingSap.correo_adc_sap || "",
          aprobacion_correo_adc_sap: existingSap.aprobacion_correo_adc_sap || "",
          solicitud_cuenta_sap: existingSap.solicitud_cuenta_sap || "",
          cuenta_sap_activa: !!existingSap.cuenta_sap_activa,
          ticket_sap: existingSap.ticket_sap || "",
          correo_adc_perfiles_sap: existingSap.correo_adc_perfiles_sap || "",
          aprobacion_correo_adc_perfiles_sap: existingSap.aprobacion_correo_adc_perfiles_sap || "",
          solicitud_perfiles_roles_sap: existingSap.solicitud_perfiles_roles_sap || "",
          ticket_perfiles_sap: existingSap.ticket_perfiles_sap || "",
          perfiles_sap_activos: !!existingSap.perfiles_sap_activos,
          requiere_datamart: !!existingSap.requiere_datamart,
          correo_adc_datamart: existingSap.correo_adc_datamart || "",
          aprobacion_correo_adc_datamart: existingSap.aprobacion_correo_adc_datamart || "",
          solicitud_datamart: existingSap.solicitud_datamart || "",
          datamart_activo: !!existingSap.datamart_activo,
          ticket_datamart: existingSap.ticket_datamart || "",
        });
      }
    }
  }, [isEditing, trabajadorId, trabajadores, sapList]);

  // Helper: Validar RUT Chileno
  const validarRutChileno = (rut: string): boolean => {
    // Limpiar puntos y guiones
    const valor = rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
    if (valor.length < 2) return false;

    const cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

    return dvCalculado === dv;
  };

  // Helper: Formatear RUT automáticamente mientras escribe
  const formatearRut = (value: string): string => {
    let clean = value.replace(/\./g, "").replace(/-/g, "").replace(/\s/g, "").toUpperCase();
    if (clean.length === 0) return "";
    
    // Extraer DV
    let dv = "";
    if (clean.length > 1) {
      dv = clean.slice(-1);
      clean = clean.slice(0, -1);
    } else {
      return clean;
    }

    // Formatear cuerpo con puntos
    let formatted = "";
    while (clean.length > 3) {
      formatted = "." + clean.slice(-3) + formatted;
      clean = clean.slice(0, -3);
    }
    formatted = clean + formatted;

    return `${formatted}-${dv}`;
  };

  // Helper: Validar y Formatear Celular E.164
  const formatearCelular = (value: string): string => {
    let clean = value.replace(/[^\d+]/g, ""); // Permitir solo números y el símbolo +
    if (!clean.startsWith("+") && clean.length > 0) {
      clean = "+" + clean;
    }
    return clean;
  };

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === "numero_identificacion" && formData.tipo_identificacion === "RUT") {
      finalValue = formatearRut(value);
    } else if (name === "celular_personal" || name === "telefono_emergencia") {
      finalValue = formatearCelular(value);
    } else if (name === "anos_experiencia" || name === "valor_plan_uf") {
      finalValue = parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Validate entire form / tab
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campos Requeridos Base
    if (!formData.nombre_1.trim()) newErrors.nombre_1 = "El primer nombre es obligatorio";
    if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = "El apellido paterno es obligatorio";
    if (!formData.apellido_materno.trim()) newErrors.apellido_materno = "El apellido materno es obligatorio";
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    if (!formData.numero_identificacion.trim()) newErrors.numero_identificacion = "El número de identificación es obligatorio";
    if (!formData.fecha_ingreso) newErrors.fecha_ingreso = "La fecha de ingreso laboral es obligatoria";

    // Validación RUT Chileno si corresponde
    if (formData.tipo_identificacion === "RUT" && formData.numero_identificacion) {
      if (!validarRutChileno(formData.numero_identificacion)) {
        newErrors.numero_identificacion = "El RUT ingresado no es válido";
      }
    }

    // Obligatoriedad de fecha de vencimiento de ID para extranjeros
    if (formData.tipo_identificacion !== "RUT" && !formData.fecha_vencimiento_id) {
      newErrors.fecha_vencimiento_id = "Vencimiento obligatorio para DNI/Pasaporte";
    }

    // Validación Email Corporativo
    if (!formData.email_corporativo.trim()) {
      newErrors.email_corporativo = "El correo corporativo es obligatorio";
    } else if (!formData.email_corporativo.endsWith("@monitoring.cl")) {
      newErrors.email_corporativo = "Debe utilizar el dominio corporativo @monitoring.cl";
    }

    // Validación de celular personal (E.164 simple: mínimo 8 dígitos y comenzar con +)
    if (!formData.celular_personal.trim()) {
      newErrors.celular_personal = "El celular personal es obligatorio";
    } else if (!formData.celular_personal.startsWith("+") || formData.celular_personal.length < 9) {
      newErrors.celular_personal = "Formato inválido. Ej: +56912345678";
    }

    // Validación de fecha de vencimiento de contrato a plazo fijo
    if (formData.tipo_contrato === "Plazo Fijo" && !formData.fecha_vencimiento_contrato) {
      newErrors.fecha_vencimiento_contrato = "Fecha obligatoria para contrato a plazo fijo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Switch tab to first error
      if (errors.nombre_1 || errors.apellido_paterno || errors.numero_identificacion || errors.fecha_vencimiento_id) {
        setActiveTab("personal");
      } else if (errors.email_corporativo || errors.celular_personal || errors.fecha_vencimiento_contrato) {
        setActiveTab("laboral");
      }
      return;
    }

    const mapToNull = (val: string) => val.trim() === "" ? null : val;

    const cleanSapData = {
      correo_adc_codelco: mapToNull(sapData.correo_adc_codelco),
      aprobacion_correo_adc_codelco: mapToNull(sapData.aprobacion_correo_adc_codelco),
      solicitud_cuenta_realizada_codelco: mapToNull(sapData.solicitud_cuenta_realizada_codelco),
      cuenta_correo_activa_codelco: sapData.cuenta_correo_activa_codelco,
      ticket_codelco: mapToNull(sapData.ticket_codelco),
      correo_adc_sap: mapToNull(sapData.correo_adc_sap),
      aprobacion_correo_adc_sap: mapToNull(sapData.aprobacion_correo_adc_sap),
      solicitud_cuenta_sap: mapToNull(sapData.solicitud_cuenta_sap),
      cuenta_sap_activa: sapData.cuenta_sap_activa,
      ticket_sap: mapToNull(sapData.ticket_sap),
      correo_adc_perfiles_sap: mapToNull(sapData.correo_adc_perfiles_sap),
      aprobacion_correo_adc_perfiles_sap: mapToNull(sapData.aprobacion_correo_adc_perfiles_sap),
      solicitud_perfiles_roles_sap: mapToNull(sapData.solicitud_perfiles_roles_sap),
      ticket_perfiles_sap: mapToNull(sapData.ticket_perfiles_sap),
      perfiles_sap_activos: sapData.perfiles_sap_activos,
      requiere_datamart: sapData.requiere_datamart,
      correo_adc_datamart: mapToNull(sapData.correo_adc_datamart),
      aprobacion_correo_adc_datamart: mapToNull(sapData.aprobacion_correo_adc_datamart),
      solicitud_datamart: mapToNull(sapData.solicitud_datamart),
      datamart_activo: sapData.datamart_activo,
      ticket_datamart: mapToNull(sapData.ticket_datamart),
    };

    if (isEditing && trabajadorId) {
      await updateTrabajador(trabajadorId, formData);
      await upsertSAPData(trabajadorId, cleanSapData);
    } else {
      const createdWorker = await addTrabajador(formData);
      if (createdWorker && createdWorker.id_trabajador) {
        await upsertSAPData(createdWorker.id_trabajador, cleanSapData);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
      <div className="w-full max-w-3xl h-full bg-surface border-l border-border flex flex-col shadow-2xl">
        {/* Form Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-surface-2">
          <div>
            <h2 className="text-lg font-bold text-text">
              {isEditing ? "Editar Ficha de Trabajador" : "Registrar Nuevo Trabajador"}
            </h2>
            <p className="text-xs font-medium text-text-soft">
              Complete todos los datos personales, previsionales y operativos
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg text-text-muted hover:text-text transition-colors border border-transparent hover:border-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Category Tabs */}
        <div className="flex px-6 border-b border-border bg-surface overflow-x-auto custom-scrollbar space-x-4">
          {[
            { id: "personal", label: "1. Identidad y Domicilio" },
            { id: "laboral", label: "2. Contacto y Laboral" },
            { id: "prevision", label: "3. Previsión y Banco" },
            { id: "operativo", label: "4. EPP y Operaciones" },
            { id: "sap", label: "5. Accesos TI y SAP" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-[11px] whitespace-nowrap font-bold tracking-wider uppercase border-b-2 transition-all ${
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IDENTIDAD Y DOMICILIO */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                Datos de Identificación
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Primer Nombre *</label>
                  <input
                    type="text"
                    name="nombre_1"
                    value={formData.nombre_1}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.nombre_1 ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.nombre_1 && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.nombre_1}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Segundo Nombre</label>
                  <input
                    type="text"
                    name="nombre_2"
                    value={formData.nombre_2 || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Apellido Paterno *</label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.apellido_paterno ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.apellido_paterno && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.apellido_paterno}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Apellido Materno *</label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.apellido_materno ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.apellido_materno && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.apellido_materno}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Sexo *</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha Nacimiento *</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.fecha_nacimiento ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.fecha_nacimiento && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.fecha_nacimiento}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Nacionalidad *</label>
                  <input
                    type="text"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900/80">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Identificación *</label>
                  <select
                    name="tipo_identificacion"
                    value={formData.tipo_identificacion}
                    onChange={(e) => {
                      handleChange(e);
                      // Clear ID number on change to reset formatters
                      setFormData(prev => ({ ...prev, numero_identificacion: "", tipo_identificacion: e.target.value as any }));
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="RUT">RUT (Chile)</option>
                    <option value="DNI">DNI (Extranjero)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Número Identidad *</label>
                  <input
                    type="text"
                    name="numero_identificacion"
                    placeholder={formData.tipo_identificacion === "RUT" ? "12.345.678-9" : "Número Identificación"}
                    value={formData.numero_identificacion}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.numero_identificacion ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.numero_identificacion && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.numero_identificacion}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">
                    Vencimiento Identidad {formData.tipo_identificacion !== "RUT" && " *"}
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento_id"
                    disabled={formData.tipo_identificacion === "RUT"}
                    value={formData.fecha_vencimiento_id || ""}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-40 transition-colors ${
                      errors.fecha_vencimiento_id ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.fecha_vencimiento_id && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.fecha_vencimiento_id}</p>}
                </div>
              </div>

              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mt-6">
                Datos de Residencia (Domicilio)
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Región</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Comuna</label>
                  <input
                    type="text"
                    name="comuna"
                    value={formData.comuna || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Calle</label>
                  <input
                    type="text"
                    name="calle"
                    value={formData.calle || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Nº y Depto</label>
                  <input
                    type="text"
                    name="numero_domicilio"
                    placeholder="Nº Domicilio / Depto"
                    value={formData.numero_domicilio || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTO Y LABORAL */}
          {activeTab === "laboral" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                Datos de Contacto
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Correo Corporativo *</label>
                  <input
                    type="email"
                    name="email_corporativo"
                    placeholder="ejemplo@monitoring.cl"
                    value={formData.email_corporativo}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.email_corporativo ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.email_corporativo ? (
                    <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.email_corporativo}</p>
                  ) : (
                    <p className="text-[9px] text-zinc-500 flex items-center gap-1"><Info size={10} /> Debe pertenecer al dominio @monitoring.cl</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Correo Personal</label>
                  <input
                    type="email"
                    name="email_personal"
                    value={formData.email_personal || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Celular Personal *</label>
                  <input
                    type="text"
                    name="celular_personal"
                    placeholder="+56912345678"
                    value={formData.celular_personal}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors ${
                      errors.celular_personal ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.celular_personal && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.celular_personal}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Contacto de Emergencia</label>
                  <input
                    type="text"
                    name="nombre_contacto_emergencia"
                    placeholder="Nombre Completo"
                    value={formData.nombre_contacto_emergencia || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mt-6">
                Ficha Laboral
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Fecha Ingreso *</label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Tipo Contrato *</label>
                  <select
                    name="tipo_contrato"
                    value={formData.tipo_contrato}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Indefinido">Indefinido</option>
                    <option value="Plazo Fijo">Plazo Fijo</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Práctica">Práctica</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">
                    Vencimiento Contrato {formData.tipo_contrato === "Plazo Fijo" && " *"}
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento_contrato"
                    disabled={formData.tipo_contrato === "Indefinido"}
                    value={formData.fecha_vencimiento_contrato || ""}
                    onChange={handleChange}
                    className={`w-full bg-zinc-900 border text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 disabled:opacity-40 transition-colors ${
                      errors.fecha_vencimiento_contrato ? "border-red-500/50" : "border-zinc-800"
                    }`}
                  />
                  {errors.fecha_vencimiento_contrato && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{errors.fecha_vencimiento_contrato}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Cargo Laboral</label>
                  <input
                    type="text"
                    name="cargo"
                    value={formData.cargo || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Área / Departamento</label>
                  <input
                    type="text"
                    name="area_departamento"
                    value={formData.area_departamento || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Modalidad de Trabajo *</label>
                  <select
                    name="modalidad_trabajo"
                    value={formData.modalidad_trabajo}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Teletrabajo">Teletrabajo</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREVISIÓN Y BANCO */}
          {activeTab === "prevision" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                Datos de Previsión y Salud
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">AFP</label>
                  <input
                    type="text"
                    name="afp"
                    placeholder="Ej: Habitat, Provida, Cuprum"
                    value={formData.afp || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Sistema de Salud</label>
                  <select
                    name="sistema_salud"
                    value={formData.sistema_salud || "Fonasa"}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Fonasa">Fonasa</option>
                    <option value="Isapre">Isapre</option>
                  </select>
                </div>
              </div>

              {formData.sistema_salud === "Isapre" && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-900/80 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Nombre Isapre</label>
                    <input
                      type="text"
                      name="nombre_isapre"
                      placeholder="Ej: Colmena, Banmédica"
                      value={formData.nombre_isapre || ""}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Valor Plan (UF)</label>
                    <input
                      type="number"
                      step="0.001"
                      name="valor_plan_uf"
                      value={formData.valor_plan_uf || 0}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mt-6">
                Datos Bancarios
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Banco</label>
                  <input
                    type="text"
                    name="banco"
                    value={formData.banco || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Tipo de Cuenta</label>
                  <select
                    name="tipo_cuenta"
                    value={formData.tipo_cuenta || "Corriente"}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Corriente">Cuenta Corriente</option>
                    <option value="Vista">Cuenta Vista</option>
                    <option value="CuentaRUT">Cuenta RUT</option>
                    <option value="Ahorro">Cuenta de Ahorro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Número de Cuenta</label>
                  <input
                    type="text"
                    name="numero_cuenta"
                    value={formData.numero_cuenta || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPERATIVO Y EPP */}
          {activeTab === "operativo" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                Tallas de Equipo de Protección Personal (EPP)
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Talla Chaqueta</label>
                  <input
                    type="text"
                    name="talla_chaqueta"
                    placeholder="Ej: S, M, L, XL"
                    value={formData.talla_chaqueta || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Talla Polera</label>
                  <input
                    type="text"
                    name="talla_polera"
                    value={formData.talla_polera || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Calzado de Seguridad</label>
                  <input
                    type="text"
                    name="calzado_seguridad"
                    placeholder="Nº Calzado"
                    value={formData.calzado_seguridad || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2 mt-6">
                Vencimientos y Licencias Operativas
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Vencimiento Altura Geográfica</label>
                  <input
                    type="date"
                    name="vencimiento_altura_geo"
                    value={formData.vencimiento_altura_geo || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Vencimiento Examen Psicosensométrico</label>
                  <input
                    type="date"
                    name="vencimiento_psicosensometrico"
                    value={formData.vencimiento_psicosensometrico || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Vencimiento Cédula Identidad</label>
                  <input
                    type="date"
                    name="vencimiento_carnet"
                    value={formData.vencimiento_carnet || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Vencimiento Licencia Conducir</label>
                  <input
                    type="date"
                    name="vencimiento_licencia_conducir"
                    value={formData.vencimiento_licencia_conducir || ""}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "sap" && (
            <div className="space-y-6">
              {/* 1. Cuenta de Correo Codelco */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900/80 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Cuenta de Correo Codelco
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC</label>
                    <input
                      type="date"
                      value={sapData.correo_adc_codelco}
                      onChange={e => setSapData({ ...sapData, correo_adc_codelco: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo AdC</label>
                    <input
                      type="date"
                      value={sapData.aprobacion_correo_adc_codelco}
                      onChange={e => setSapData({ ...sapData, aprobacion_correo_adc_codelco: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud de Cuenta Realizada</label>
                    <input
                      type="date"
                      value={sapData.solicitud_cuenta_realizada_codelco}
                      onChange={e => setSapData({ ...sapData, solicitud_cuenta_realizada_codelco: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket</label>
                    <input
                      type="text"
                      value={sapData.ticket_codelco}
                      onChange={e => setSapData({ ...sapData, ticket_codelco: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sapData.cuenta_correo_activa_codelco}
                        onChange={e => setSapData({ ...sapData, cuenta_correo_activa_codelco: e.target.checked })}
                        className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      />
                      <span className="group-hover:text-primary transition-colors">Cuenta correo activa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Cuenta SAP */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900/80 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Cuenta SAP
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC SAP</label>
                    <input
                      type="date"
                      value={sapData.correo_adc_sap}
                      onChange={e => setSapData({ ...sapData, correo_adc_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo SAP</label>
                    <input
                      type="date"
                      value={sapData.aprobacion_correo_adc_sap}
                      onChange={e => setSapData({ ...sapData, aprobacion_correo_adc_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud Cuenta SAP</label>
                    <input
                      type="date"
                      value={sapData.solicitud_cuenta_sap}
                      onChange={e => setSapData({ ...sapData, solicitud_cuenta_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket (3)</label>
                    <input
                      type="text"
                      value={sapData.ticket_sap}
                      onChange={e => setSapData({ ...sapData, ticket_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sapData.cuenta_sap_activa}
                        onChange={e => setSapData({ ...sapData, cuenta_sap_activa: e.target.checked })}
                        className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      />
                      <span className="group-hover:text-primary transition-colors">Cuenta SAP activa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Perfiles SAP */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900/80 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Perfiles SAP
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Correo a AdC Perfiles</label>
                    <input
                      type="date"
                      value={sapData.correo_adc_perfiles_sap}
                      onChange={e => setSapData({ ...sapData, correo_adc_perfiles_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo Perfiles</label>
                    <input
                      type="date"
                      value={sapData.aprobacion_correo_adc_perfiles_sap}
                      onChange={e => setSapData({ ...sapData, aprobacion_correo_adc_perfiles_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Solicitud Perfiles y Roles</label>
                    <input
                      type="date"
                      value={sapData.solicitud_perfiles_roles_sap}
                      onChange={e => setSapData({ ...sapData, solicitud_perfiles_roles_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">N° de Ticket</label>
                    <input
                      type="text"
                      value={sapData.ticket_perfiles_sap}
                      onChange={e => setSapData({ ...sapData, ticket_perfiles_sap: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center pt-6">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sapData.perfiles_sap_activos}
                        onChange={e => setSapData({ ...sapData, perfiles_sap_activos: e.target.checked })}
                        className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      />
                      <span className="group-hover:text-primary transition-colors">Perfiles SAP activos</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Datamart */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900/80 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Datamart
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-3 flex items-center pb-2">
                    <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sapData.requiere_datamart}
                        onChange={e => setSapData({ ...sapData, requiere_datamart: e.target.checked })}
                        className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                      />
                      <span className="group-hover:text-primary transition-colors">Requiere Datamart</span>
                    </label>
                  </div>

                  {sapData.requiere_datamart && (
                    <>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Correo a AdC Datamart</label>
                        <input
                          type="date"
                          value={sapData.correo_adc_datamart}
                          onChange={e => setSapData({ ...sapData, correo_adc_datamart: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Aprobación Correo Datamart</label>
                        <input
                          type="date"
                          value={sapData.aprobacion_correo_adc_datamart}
                          onChange={e => setSapData({ ...sapData, aprobacion_correo_adc_datamart: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">Solicitud de Datamart</label>
                        <input
                          type="date"
                          value={sapData.solicitud_datamart}
                          onChange={e => setSapData({ ...sapData, solicitud_datamart: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5 animate-fadeIn">
                        <label className="text-xs text-zinc-400 font-semibold">N° de Ticket (2)</label>
                        <input
                          type="text"
                          value={sapData.ticket_datamart}
                          onChange={e => setSapData({ ...sapData, ticket_datamart: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div className="flex items-center pt-6 animate-fadeIn">
                        <label className="flex items-center gap-2.5 text-xs text-white font-semibold cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={sapData.datamart_activo}
                            onChange={e => setSapData({ ...sapData, datamart_activo: e.target.checked })}
                            className="w-4 h-4 text-primary bg-zinc-950 border-zinc-800 rounded focus:ring-primary cursor-pointer"
                          />
                          <span className="group-hover:text-primary transition-colors">Datamart activo</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Form Footer */}
        <div className="h-20 px-6 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <div className="text-xs text-zinc-500">
            * Campos obligatorios
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 hover:shadow-lg hover:shadow-blue-600/20 transition-all"
            >
              <Save size={14} />
              Guardar Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
