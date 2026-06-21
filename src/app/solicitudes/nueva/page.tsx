"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  CalendarRange,
  Laptop,
  Stethoscope,
  Home,
  RotateCcw,
  FileText,
  Hash,
  AlertTriangle
} from "lucide-react";
import { useSolicitudesStore, type TipoSolicitud, type PayloadVacaciones, type PayloadPermisoConGoce, type PayloadPermisoSinGoce, type PayloadCambioEquipo, type PayloadCambioTurno, type PayloadTeletrabajo, type PayloadLicenciaMedica, type PayloadOtro } from "@/store/solicitudes-store";

// ─── Tipos con metadatos de UI ─────────────────────────────────────────────────

const TIPOS_CONFIG: { tipo: TipoSolicitud; emoji: string; descripcion: string; icon: React.ElementType }[] = [
  { tipo: "Vacaciones",         emoji: "🏖️", descripcion: "Días de descanso anual",              icon: CalendarRange },
  { tipo: "Permiso con Goce",   emoji: "✅", descripcion: "Permiso con remuneración",             icon: CalendarRange },
  { tipo: "Permiso sin Goce",   emoji: "📋", descripcion: "Permiso sin remuneración",             icon: CalendarRange },
  { tipo: "Cambio de Equipo",   emoji: "💻", descripcion: "Solicitud de equipo nuevo o reemplazo", icon: Laptop },
  { tipo: "Cambio de Turno",    emoji: "🔄", descripcion: "Cambio de horario o turno",            icon: RotateCcw },
  { tipo: "Teletrabajo",        emoji: "🏠", descripcion: "Solicitud de trabajo remoto",          icon: Home },
  { tipo: "Licencia Médica",    emoji: "🏥", descripcion: "Registro de licencia médica",          icon: Stethoscope },
  { tipo: "Otro",               emoji: "📌", descripcion: "Otra solicitud no listada",            icon: FileText },
];

// ─── Campo genérico ────────────────────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-zinc-600";
const selectClass = `${inputClass}`;

// ─── Formularios dinámicos por tipo ───────────────────────────────────────────

function FormVacaciones({ onChange }: { onChange: (p: PayloadVacaciones) => void }) {
  const [data, setData] = useState<PayloadVacaciones>({ fecha_inicio: "", fecha_fin: "", dias_habiles: 0, motivo: "" });

  const update = (patch: Partial<PayloadVacaciones>) => {
    const next = { ...data, ...patch };
    if (next.fecha_inicio && next.fecha_fin) {
      const ini = new Date(next.fecha_inicio);
      const fin = new Date(next.fecha_fin);
      let dias = 0;
      const cur = new Date(ini);
      while (cur <= fin) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) dias++;
        cur.setDate(cur.getDate() + 1);
      }
      next.dias_habiles = dias;
    }
    setData(next);
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Fecha inicio" required>
        <input type="date" value={data.fecha_inicio} onChange={e => update({ fecha_inicio: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Fecha término" required>
        <input type="date" value={data.fecha_fin} min={data.fecha_inicio} onChange={e => update({ fecha_fin: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Días hábiles (calculado automáticamente)">
        <input type="number" value={data.dias_habiles} readOnly className={`${inputClass} bg-zinc-900 cursor-not-allowed`} />
      </FormField>
      <FormField label="Motivo (opcional)">
        <input type="text" value={data.motivo ?? ""} onChange={e => update({ motivo: e.target.value })} placeholder="Ej: Vacaciones de invierno" className={inputClass} />
      </FormField>
    </div>
  );
}

function FormPermiso({ tipo: _tipo, onChange }: { tipo: "Permiso con Goce" | "Permiso sin Goce"; onChange: (p: PayloadPermisoConGoce | PayloadPermisoSinGoce) => void }) {
  const [data, setData] = useState({ fecha_inicio: "", fecha_fin: "", dias_habiles: 0, motivo: "" });

  const update = (patch: Partial<typeof data>) => {
    const next = { ...data, ...patch };
    if (next.fecha_inicio && next.fecha_fin) {
      const ini = new Date(next.fecha_inicio);
      const fin = new Date(next.fecha_fin);
      let dias = 0;
      const cur = new Date(ini);
      while (cur <= fin) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) dias++;
        cur.setDate(cur.getDate() + 1);
      }
      next.dias_habiles = dias;
    }
    setData(next);
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Fecha inicio" required>
        <input type="date" value={data.fecha_inicio} onChange={e => update({ fecha_inicio: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Fecha término" required>
        <input type="date" value={data.fecha_fin} min={data.fecha_inicio} onChange={e => update({ fecha_fin: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Días hábiles (calculado automáticamente)">
        <input type="number" value={data.dias_habiles} readOnly className={`${inputClass} bg-zinc-900 cursor-not-allowed`} />
      </FormField>
      <FormField label="Motivo" required>
        <input type="text" value={data.motivo} onChange={e => update({ motivo: e.target.value })} placeholder="Ej: Trámite médico familiar" className={inputClass} />
      </FormField>
    </div>
  );
}

function FormCambioEquipo({ onChange }: { onChange: (p: PayloadCambioEquipo) => void }) {
  const [data, setData] = useState<PayloadCambioEquipo>({
    tipo_equipo: "Notebook",
    descripcion_solicitud: "",
    motivo: "Falla",
    activo_actual: ""
  });

  const update = (patch: Partial<PayloadCambioEquipo>) => {
    const next = { ...data, ...patch };
    setData(next);
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Tipo de equipo" required>
        <select value={data.tipo_equipo} onChange={e => update({ tipo_equipo: e.target.value as PayloadCambioEquipo["tipo_equipo"] })} className={selectClass}>
          {["Notebook", "Monitor", "Teclado", "Mouse", "Auriculares", "Teléfono", "Otro"].map(t => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Motivo" required>
        <select value={data.motivo} onChange={e => update({ motivo: e.target.value as PayloadCambioEquipo["motivo"] })} className={selectClass}>
          {["Falla", "Obsolescencia", "Nuevo Ingreso", "Actualización"].map(m => <option key={m}>{m}</option>)}
        </select>
      </FormField>
      <FormField label="Código activo actual">
        <input type="text" value={data.activo_actual ?? ""} onChange={e => update({ activo_actual: e.target.value })} placeholder="Ej: NB-2024-014" className={inputClass} />
      </FormField>
      <div className="md:col-span-2">
        <FormField label="Descripción de la solicitud" required>
          <textarea
            value={data.descripcion_solicitud}
            onChange={e => update({ descripcion_solicitud: e.target.value })}
            rows={3}
            placeholder="Describe el problema o la necesidad en detalle..."
            className={`${inputClass} resize-none`}
          />
        </FormField>
      </div>
    </div>
  );
}

function FormCambioTurno({ onChange }: { onChange: (p: PayloadCambioTurno) => void }) {
  const [data, setData] = useState<PayloadCambioTurno>({ turno_actual: "", turno_solicitado: "", fecha_efectiva: "", motivo: "" });
  const update = (patch: Partial<PayloadCambioTurno>) => { const next = { ...data, ...patch }; setData(next); onChange(next); };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Turno actual" required>
        <input type="text" value={data.turno_actual} onChange={e => update({ turno_actual: e.target.value })} placeholder="Ej: 08:00 - 17:00" className={inputClass} />
      </FormField>
      <FormField label="Turno solicitado" required>
        <input type="text" value={data.turno_solicitado} onChange={e => update({ turno_solicitado: e.target.value })} placeholder="Ej: 07:00 - 16:00" className={inputClass} />
      </FormField>
      <FormField label="Fecha efectiva" required>
        <input type="date" value={data.fecha_efectiva} onChange={e => update({ fecha_efectiva: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Motivo" required>
        <input type="text" value={data.motivo} onChange={e => update({ motivo: e.target.value })} placeholder="Motivo del cambio" className={inputClass} />
      </FormField>
    </div>
  );
}

function FormTeletrabajo({ onChange }: { onChange: (p: PayloadTeletrabajo) => void }) {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const [data, setData] = useState<PayloadTeletrabajo>({ fecha_inicio: "", modalidad: "Temporal", dias_semana: [], motivo: "" });
  const update = (patch: Partial<PayloadTeletrabajo>) => { const next = { ...data, ...patch }; setData(next); onChange(next); };

  const toggleDia = (dia: string) => {
    const sel = data.dias_semana.includes(dia)
      ? data.dias_semana.filter(d => d !== dia)
      : [...data.dias_semana, dia];
    update({ dias_semana: sel });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Fecha inicio" required>
        <input type="date" value={data.fecha_inicio} onChange={e => update({ fecha_inicio: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Modalidad" required>
        <select value={data.modalidad} onChange={e => update({ modalidad: e.target.value as "Permanente" | "Temporal" })} className={selectClass}>
          <option>Temporal</option>
          <option>Permanente</option>
        </select>
      </FormField>
      {data.modalidad === "Temporal" && (
        <FormField label="Fecha fin">
          <input type="date" value={data.fecha_fin ?? ""} min={data.fecha_inicio} onChange={e => update({ fecha_fin: e.target.value })} className={inputClass} />
        </FormField>
      )}
      <div className="md:col-span-2">
        <FormField label="Días de teletrabajo" required>
          <div className="flex flex-wrap gap-2 mt-1">
            {diasSemana.map(dia => (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  data.dias_semana.includes(dia)
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {dia}
              </button>
            ))}
          </div>
        </FormField>
      </div>
      <div className="md:col-span-2">
        <FormField label="Motivo" required>
          <textarea value={data.motivo} onChange={e => update({ motivo: e.target.value })} rows={2} placeholder="Justificación de la solicitud" className={`${inputClass} resize-none`} />
        </FormField>
      </div>
    </div>
  );
}

function FormLicencia({ onChange }: { onChange: (p: PayloadLicenciaMedica) => void }) {
  const [data, setData] = useState<PayloadLicenciaMedica>({ fecha_inicio: "", dias: 0, tipo: "Común" });
  const update = (patch: Partial<PayloadLicenciaMedica>) => { const next = { ...data, ...patch }; setData(next); onChange(next); };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Fecha inicio" required>
        <input type="date" value={data.fecha_inicio} onChange={e => update({ fecha_inicio: e.target.value })} className={inputClass} />
      </FormField>
      <FormField label="Número de días" required>
        <input type="number" min={1} value={data.dias} onChange={e => update({ dias: parseInt(e.target.value) })} className={inputClass} />
      </FormField>
      <FormField label="Tipo de licencia" required>
        <select value={data.tipo} onChange={e => update({ tipo: e.target.value as PayloadLicenciaMedica["tipo"] })} className={selectClass}>
          {["Común", "Reposo Maternal", "Accidente Laboral"].map(t => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Número de licencia">
        <input type="text" value={data.numero_licencia ?? ""} onChange={e => update({ numero_licencia: e.target.value })} placeholder="Número del documento" className={inputClass} />
      </FormField>
    </div>
  );
}

function FormOtro({ onChange }: { onChange: (p: PayloadOtro) => void }) {
  const [desc, setDesc] = useState("");
  return (
    <FormField label="Descripción de la solicitud" required>
      <textarea
        value={desc}
        onChange={e => { setDesc(e.target.value); onChange({ descripcion: e.target.value }); }}
        rows={4}
        placeholder="Describe tu solicitud con el mayor detalle posible..."
        className={`${inputClass} resize-none`}
      />
    </FormField>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const addSolicitud = useSolicitudesStore((s) => s.addSolicitud);

  const [step, setStep] = useState<"select" | "form">("select");
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoSolicitud | null>(null);
  // Payload se construye dinamicamente segun el tipo seleccionado.
  // Cada FormXxx invoca `setPayload` con su shape concreto; aqui solo
  // se reenvia a `addSolicitud` que acepta union de payloads.
  const [payload, setPayload] = useState<
    | PayloadVacaciones
    | PayloadPermisoConGoce
    | PayloadPermisoSinGoce
    | PayloadCambioEquipo
    | PayloadCambioTurno
    | PayloadTeletrabajo
    | PayloadLicenciaMedica
    | PayloadOtro
    | null
  >(null);
  const [asunto, setAsunto] = useState("");
  const [prioridad, setPrioridad] = useState<"Normal" | "Urgente">("Normal");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoSeleccionado || !payload || !asunto.trim()) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }
    setError("");
    setEnviando(true);
    addSolicitud({
      tipo: tipoSeleccionado,
      prioridad,
      asunto,
      payload,
      id_trabajador_solicitante: "t-current",
      nombre_solicitante: "Operador General",
      area: "General"
    });
    setTimeout(() => {
      setEnviando(false);
      router.push("/solicitudes");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => step === "form" ? setStep("select") : router.back()}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-violet-400" />
              Nueva Solicitud
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {step === "select" ? "Selecciona el tipo de solicitud" : `Tipo: ${tipoSeleccionado}`}
            </p>
          </div>
        </div>
        {/* Progress */}
        <div className="max-w-3xl mx-auto mt-4">
          <div className="flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step === "select" || step === "form" ? "bg-violet-500" : "bg-zinc-700"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step === "form" ? "bg-violet-500" : "bg-zinc-700"}`} />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
            <span>1. Tipo</span>
            <span>2. Detalle</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* STEP 1 — Select type */}
        {step === "select" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 mb-5">¿Qué tipo de solicitud deseas crear?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPOS_CONFIG.map(({ tipo, emoji, descripcion }) => (
                <button
                  key={tipo}
                  onClick={() => { setTipoSeleccionado(tipo); setStep("form"); }}
                  className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-violet-500/50 hover:bg-zinc-900/80 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-violet-600/20 transition-colors">
                    {emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">{tipo}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{descripcion}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Form */}
        {step === "form" && tipoSeleccionado && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Encabezado */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={15} className="text-violet-400" />
                <span className="text-sm font-semibold text-zinc-300">Datos generales</span>
              </div>
              <FormField label="Asunto / Título de la solicitud" required>
                <input
                  type="text"
                  value={asunto}
                  onChange={e => setAsunto(e.target.value)}
                  placeholder="Ej: Solicitud de vacaciones julio 2026"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Prioridad">
                <div className="flex gap-2">
                  {(["Normal", "Urgente"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrioridad(p)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        prioridad === p
                          ? p === "Urgente"
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-violet-600 border-violet-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {p === "Urgente" ? "⚡ Urgente" : "✓ Normal"}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Formulario específico */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{TIPOS_CONFIG.find(t => t.tipo === tipoSeleccionado)?.emoji}</span>
                <span className="text-sm font-semibold text-zinc-300">{tipoSeleccionado}</span>
              </div>

              {tipoSeleccionado === "Vacaciones" && <FormVacaciones onChange={setPayload} />}
              {tipoSeleccionado === "Permiso con Goce" && <FormPermiso tipo="Permiso con Goce" onChange={setPayload} />}
              {tipoSeleccionado === "Permiso sin Goce" && <FormPermiso tipo="Permiso sin Goce" onChange={setPayload} />}
              {tipoSeleccionado === "Cambio de Equipo" && <FormCambioEquipo onChange={setPayload} />}
              {tipoSeleccionado === "Cambio de Turno" && <FormCambioTurno onChange={setPayload} />}
              {tipoSeleccionado === "Teletrabajo" && <FormTeletrabajo onChange={setPayload} />}
              {tipoSeleccionado === "Licencia Médica" && <FormLicencia onChange={setPayload} />}
              {tipoSeleccionado === "Otro" && <FormOtro onChange={setPayload} />}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3 text-sm">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="flex-1 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-all"
              >
                ← Cambiar tipo
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/30"
              >
                {enviando ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
