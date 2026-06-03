"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Users, GitBranch, Briefcase, History,
  Calendar, CreditCard, ChevronDown, ChevronRight, Plus, Edit3,
  Trash2, UserMinus, UserCheck, UserPlus, X, Check, AlertTriangle,
  TrendingUp, Clock, Activity, Layers, RefreshCw, Save
} from "lucide-react";
import { useContratosStore, type ContratoUnidad, type ContratoCargo, type ContratoTrabajador } from "@/store/contratos-store";
import { useMandantesStore } from "@/store/mandantes-store";
import { useTrabajadoresStore } from "@/store/trabajadores-store";

// ─────────────────────────────────────────────────────────────
//  Helpers & constants
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "info",         label: "Información",  icon: Building2 },
  { id: "trabajadores", label: "Trabajadores", icon: Users },
  { id: "jerarquia",   label: "Jerarquía",    icon: GitBranch },
  { id: "cargos",      label: "Cargos",       icon: Briefcase },
  { id: "historial",   label: "Historial",    icon: History },
] as const;
type TabId = typeof TABS[number]["id"];

const NIVELES: ContratoCargo["nivel"][] = ["Operativo", "Supervisión", "Jefatura", "Gerencia"];
const NIVEL_COLOR: Record<string, string> = {
  Operativo:   "bg-zinc-700/50 text-zinc-300",
  Supervisión: "bg-blue-500/10 text-blue-400",
  Jefatura:    "bg-violet-500/10 text-violet-400",
  Gerencia:    "bg-amber-500/10 text-amber-400"
};
const ESTADO_COLOR: Record<string, string> = {
  Activo:          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cerrado:         "bg-zinc-700/50 text-zinc-500 border-zinc-600/30",
  "En Preparación":"bg-amber-500/10 text-amber-400 border-amber-500/20",
  Suspendido:      "bg-red-500/10 text-red-400 border-red-500/20"
};
const TIPO_HIST_COLOR: Record<string, string> = {
  Ingreso:          "text-emerald-400 bg-emerald-400/10",
  Reasignación:     "text-blue-400 bg-blue-400/10",
  Baja:             "text-red-400 bg-red-400/10",
  "Cambio Cargo":   "text-violet-400 bg-violet-400/10",
  "Nueva Unidad":   "text-cyan-400 bg-cyan-400/10",
  "Nuevo Cargo":    "text-indigo-400 bg-indigo-400/10",
  "Edición Contrato":"text-amber-400 bg-amber-400/10",
  Activación:       "text-emerald-400 bg-emerald-400/10",
  Suspensión:       "text-red-400 bg-red-400/10"
};

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateLong(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleString("es-CL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function progress(start: string, end: string) {
  const s = new Date(start).getTime(), e = new Date(end).getTime(), n = Date.now();
  if (n < s) return 0;
  if (n > e) return 100;
  return Math.round(((n - s) / (e - s)) * 100);
}

const inputClass = "w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600";
const selectClass = inputClass;

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${color}`}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────
//  TAB 1 — Información General
// ─────────────────────────────────────────────────────────────

function TabInfo({ contrato, id_contrato }: { contrato: any; id_contrato: string }) {
  const { mandantes } = useMandantesStore();
  const { updateContrato, addCentroCosto, removeCentroCosto } = useContratosStore();
  const mandante = mandantes.find(m => m.id_mandante === contrato.id_mandante);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre_contrato: contrato.nombre_contrato,
    codigo_contrato: contrato.codigo_contrato,
    estado: contrato.estado,
    fecha_inicio: contrato.fecha_inicio,
    fecha_termino: contrato.fecha_termino,
    id_mandante: contrato.id_mandante
  });
  const [newCC, setNewCC] = useState({ codigo_cc: "", nombre_cc: "" });
  const [addingCC, setAddingCC] = useState(false);

  const pct = progress(contrato.fecha_inicio, contrato.fecha_termino);

  const handleSave = () => {
    updateContrato(id_contrato, form);
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <SectionCard
        title="Datos del Contrato"
        action={
          editing
            ? <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-all"><X size={12} /> Cancelar</button>
                <button onClick={handleSave} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all"><Save size={12} /> Guardar</button>
              </div>
            : <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-all"><Edit3 size={12} /> Editar</button>
        }
      >
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Nombre del contrato</label><input className={inputClass} value={form.nombre_contrato} onChange={e => setForm(f => ({...f, nombre_contrato: e.target.value}))} /></div>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Código</label><input className={inputClass} value={form.codigo_contrato} onChange={e => setForm(f => ({...f, codigo_contrato: e.target.value}))} /></div>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Estado</label>
              <select className={selectClass} value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value as any}))}>
                {["Activo","En Preparación","Suspendido","Cerrado"].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Mandante</label>
              <select className={selectClass} value={form.id_mandante} onChange={e => setForm(f => ({...f, id_mandante: e.target.value}))}>
                {mandantes.filter(m => m.activo).map(m => <option key={m.id_mandante} value={m.id_mandante}>{m.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Fecha inicio</label><input type="date" className={inputClass} value={form.fecha_inicio} onChange={e => setForm(f => ({...f, fecha_inicio: e.target.value}))} /></div>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Fecha término</label><input type="date" className={inputClass} value={form.fecha_termino} onChange={e => setForm(f => ({...f, fecha_termino: e.target.value}))} /></div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Código</p><p className="text-sm font-mono text-zinc-300">{contrato.codigo_contrato}</p></div>
              <div><p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Estado</p><Badge label={contrato.estado} color={`border ${ESTADO_COLOR[contrato.estado]}`} /></div>
              <div><p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Inicio</p><p className="text-sm text-zinc-300">{formatDate(contrato.fecha_inicio)}</p></div>
              <div><p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Término</p><p className="text-sm text-zinc-300">{formatDate(contrato.fecha_termino)}</p></div>
            </div>
            {/* Timeline */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>{contrato.fecha_inicio}</span>
                <span className="font-semibold text-zinc-400">{pct}% transcurrido</span>
                <span>{contrato.fecha_termino}</span>
              </div>
              <div className="h-2 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${pct > 90 ? "from-amber-600 to-red-500" : "from-blue-600 to-cyan-500"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Mandante */}
      <SectionCard title="Mandante">
        {mandante ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-[10px] text-zinc-500 mb-1">Empresa</p><p className="text-sm font-semibold text-zinc-200">{mandante.nombre}</p></div>
            <div><p className="text-[10px] text-zinc-500 mb-1">RUT</p><p className="text-sm text-zinc-300 font-mono">{mandante.rut}</p></div>
            <div><p className="text-[10px] text-zinc-500 mb-1">Rubro</p><p className="text-sm text-zinc-300">{mandante.rubro ?? "—"}</p></div>
            <div><p className="text-[10px] text-zinc-500 mb-1">Contacto</p><p className="text-sm text-zinc-300">{mandante.contacto_nombre ?? "—"}</p></div>
            <div><p className="text-[10px] text-zinc-500 mb-1">Email</p><p className="text-sm text-zinc-300">{mandante.contacto_email ?? "—"}</p></div>
            <div><p className="text-[10px] text-zinc-500 mb-1">Teléfono</p><p className="text-sm text-zinc-300">{mandante.contacto_telefono ?? "—"}</p></div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Mandante no encontrado. Edita el contrato para asignarlo.</p>
        )}
      </SectionCard>

      {/* Centros de Costo */}
      <SectionCard
        title={`Centros de Costo (${contrato.centros_costo.length})`}
        action={
          <button onClick={() => setAddingCC(true)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-all">
            <Plus size={12} /> Agregar CC
          </button>
        }
      >
        <div className="space-y-2">
          {contrato.centros_costo.map((cc: any) => (
            <div key={cc.id_cc} className="flex items-center justify-between p-2.5 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-blue-400">{cc.codigo_cc}</span>
                <span className="text-sm text-zinc-300">{cc.nombre_cc}</span>
              </div>
              <button onClick={() => removeCentroCosto(id_contrato, cc.id_cc)} className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
            </div>
          ))}
          {addingCC && (
            <div className="flex gap-2 mt-2 p-3 bg-zinc-800 rounded-lg border border-blue-500/30">
              <input placeholder="Código CC" className={`${inputClass} flex-1`} value={newCC.codigo_cc} onChange={e => setNewCC(p => ({...p, codigo_cc: e.target.value}))} />
              <input placeholder="Nombre CC" className={`${inputClass} flex-2`} value={newCC.nombre_cc} onChange={e => setNewCC(p => ({...p, nombre_cc: e.target.value}))} />
              <button onClick={() => { if(newCC.codigo_cc && newCC.nombre_cc) { addCentroCosto(id_contrato, newCC); setNewCC({codigo_cc:"",nombre_cc:""}); setAddingCC(false); }}} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all"><Check size={14} /></button>
              <button onClick={() => setAddingCC(false)} className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-400 transition-all"><X size={14} /></button>
            </div>
          )}
          {contrato.centros_costo.length === 0 && !addingCC && (
            <p className="text-sm text-zinc-600 text-center py-3">Sin centros de costo asignados</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB 2 — Trabajadores asignados
// ─────────────────────────────────────────────────────────────

function TabTrabajadores({ contrato, id_contrato }: { contrato: any; id_contrato: string }) {
  const { trabajadores } = useTrabajadoresStore();
  const { asignarTrabajador, darBajaTrabajador, reasignarTrabajador, reactivarTrabajador } = useContratosStore();

  const [showInactivos, setShowInactivos] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalBaja, setModalBaja] = useState<ContratoTrabajador | null>(null);
  const [modalReasignar, setModalReasignar] = useState<ContratoTrabajador | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [reasignForm, setReasignForm] = useState({ id_unidad: "", nombre_unidad: "", id_cargo: "", nombre_cargo: "", nivel: "" });

  // Form para nueva asignación
  const [asignForm, setAsignForm] = useState({ id_trabajador: "", id_unidad: "", id_cargo: "", fecha_ingreso: new Date().toISOString().split("T")[0] });

  const asignados = contrato.trabajadores_asignados as ContratoTrabajador[];
  const activos = asignados.filter(a => a.activo);
  const inactivos = asignados.filter(a => !a.activo);

  // Trabajadores de la org que NO están asignados activamente
  const disponibles = trabajadores.filter(t =>
    !activos.find(a => a.id_trabajador === t.id_trabajador)
  );

  const handleAsignar = () => {
    const t = trabajadores.find(w => w.id_trabajador === asignForm.id_trabajador);
    if (!t) return;
    const cargo = contrato.cargos.find((c: any) => c.id_cargo === asignForm.id_cargo);
    const unidad = contrato.unidades.find((u: any) => u.id_unidad === asignForm.id_unidad);
    asignarTrabajador(id_contrato, {
      id_trabajador: t.id_trabajador,
      nombre: `${t.nombre_1} ${t.apellido_paterno}`,
      rut: t.numero_identificacion,
      id_unidad: unidad?.id_unidad,
      nombre_unidad: unidad?.nombre,
      id_cargo: cargo?.id_cargo,
      nombre_cargo: cargo?.nombre,
      nivel: cargo?.nivel ?? "Operativo",
      fecha_ingreso: asignForm.fecha_ingreso
    });
    setModalAsignar(false);
    setAsignForm({ id_trabajador: "", id_unidad: "", id_cargo: "", fecha_ingreso: new Date().toISOString().split("T")[0] });
  };

  const handleBaja = () => {
    if (!modalBaja || !motivoBaja.trim()) return;
    darBajaTrabajador(id_contrato, modalBaja.id_asignacion, motivoBaja);
    setModalBaja(null);
    setMotivoBaja("");
  };

  const handleReasignar = () => {
    if (!modalReasignar) return;
    const cargo = contrato.cargos.find((c: any) => c.id_cargo === reasignForm.id_cargo);
    const unidad = contrato.unidades.find((u: any) => u.id_unidad === reasignForm.id_unidad);
    reasignarTrabajador(id_contrato, modalReasignar.id_asignacion, {
      id_unidad: unidad?.id_unidad,
      nombre_unidad: unidad?.nombre,
      id_cargo: cargo?.id_cargo,
      nombre_cargo: cargo?.nombre,
      nivel: cargo?.nivel ?? modalReasignar.nivel
    });
    setModalReasignar(null);
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Activos", value: activos.length, color: "text-emerald-400 bg-emerald-400/10" },
          { label: "Inactivos", value: inactivos.length, color: "text-zinc-400 bg-zinc-700/30" },
          { label: "Total histórico", value: asignados.length, color: "text-blue-400 bg-blue-400/10" },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold ${s.color}`}>{s.value}</div>
            <p className="text-xs text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionCard
        title={`Dotación activa (${activos.length})`}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowInactivos(!showInactivos)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all">
              {showInactivos ? "Ocultar" : "Ver"} inactivos ({inactivos.length})
            </button>
            <button onClick={() => setModalAsignar(true)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-all">
              <UserPlus size={12} /> Asignar
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          {activos.length === 0 && <p className="text-sm text-zinc-600 text-center py-6">Sin trabajadores activos en este contrato</p>}
          {activos.map(a => (
            <div key={a.id_asignacion} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                  {a.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{a.nombre}</p>
                  <p className="text-xs text-zinc-500">{a.nombre_cargo ?? "Sin cargo"} · {a.nombre_unidad ?? "Sin unidad"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.nivel && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${NIVEL_COLOR[a.nivel] ?? "bg-zinc-700 text-zinc-400"}`}>{a.nivel}</span>}
                <span className="text-[10px] text-zinc-600">Desde {formatDate(a.fecha_ingreso)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setModalReasignar(a); setReasignForm({ id_unidad: a.id_unidad ?? "", nombre_unidad: a.nombre_unidad ?? "", id_cargo: a.id_cargo ?? "", nombre_cargo: a.nombre_cargo ?? "", nivel: a.nivel ?? "" }); }} title="Reasignar" className="p-1.5 rounded bg-zinc-700 hover:bg-blue-600/20 text-zinc-400 hover:text-blue-400 transition-all"><RefreshCw size={13} /></button>
                  <button onClick={() => setModalBaja(a)} title="Dar de baja" className="p-1.5 rounded bg-zinc-700 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-all"><UserMinus size={13} /></button>
                </div>
              </div>
            </div>
          ))}

          {showInactivos && inactivos.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
              <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Inactivos</p>
              {inactivos.map(a => (
                <div key={a.id_asignacion} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-bold">{a.nombre.split(" ").map(n => n[0]).slice(0, 2).join("")}</div>
                    <div>
                      <p className="text-sm text-zinc-400 line-through">{a.nombre}</p>
                      <p className="text-xs text-zinc-600">Baja: {a.motivo_baja ?? "—"}</p>
                    </div>
                  </div>
                  <button onClick={() => reactivarTrabajador(id_contrato, a.id_asignacion)} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-400/20 border border-zinc-700 transition-all">
                    <UserCheck size={12} /> Reactivar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Modal asignar */}
      {modalAsignar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2"><UserPlus size={16} className="text-blue-400" /> Asignar Trabajador</h3>
              <button onClick={() => setModalAsignar(false)} className="p-1 rounded text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Trabajador *</label>
                <select className={selectClass} value={asignForm.id_trabajador} onChange={e => setAsignForm(f => ({...f, id_trabajador: e.target.value}))}>
                  <option value="">Seleccionar trabajador...</option>
                  {disponibles.map(t => <option key={t.id_trabajador} value={t.id_trabajador}>{t.nombre_1} {t.apellido_paterno} — {t.numero_identificacion}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Unidad</label>
                <select className={selectClass} value={asignForm.id_unidad} onChange={e => setAsignForm(f => ({...f, id_unidad: e.target.value}))}>
                  <option value="">Sin unidad</option>
                  {contrato.unidades.filter((u: any) => u.activa).map((u: any) => <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Cargo</label>
                <select className={selectClass} value={asignForm.id_cargo} onChange={e => setAsignForm(f => ({...f, id_cargo: e.target.value}))}>
                  <option value="">Sin cargo</option>
                  {contrato.cargos.filter((c: any) => c.activo).map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre} ({c.nivel})</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Fecha de ingreso *</label>
                <input type="date" className={inputClass} value={asignForm.fecha_ingreso} onChange={e => setAsignForm(f => ({...f, fecha_ingreso: e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalAsignar(false)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm hover:border-zinc-600 transition-all">Cancelar</button>
              <button onClick={handleAsignar} disabled={!asignForm.id_trabajador} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all">Asignar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal baja */}
      {modalBaja && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2"><UserMinus size={16} className="text-red-400" /> Dar de baja</h3>
            <p className="text-sm text-zinc-400">¿Seguro que deseas dar de baja a <strong className="text-zinc-200">{modalBaja.nombre}</strong>?</p>
            <div className="space-y-1.5"><label className="text-xs text-zinc-500">Motivo *</label>
              <input className={inputClass} value={motivoBaja} onChange={e => setMotivoBaja(e.target.value)} placeholder="Ej: Término de contrato, renuncia..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalBaja(null)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm transition-all">Cancelar</button>
              <button onClick={handleBaja} disabled={!motivoBaja.trim()} className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-all">Confirmar Baja</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reasignar */}
      {modalReasignar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2"><RefreshCw size={16} className="text-blue-400" /> Reasignar — {modalReasignar.nombre}</h3>
            <div className="space-y-3">
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Nueva Unidad</label>
                <select className={selectClass} value={reasignForm.id_unidad} onChange={e => setReasignForm(f => ({...f, id_unidad: e.target.value, nombre_unidad: contrato.unidades.find((u: any) => u.id_unidad === e.target.value)?.nombre ?? ""}))}>
                  <option value="">Sin unidad</option>
                  {contrato.unidades.filter((u: any) => u.activa).map((u: any) => <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><label className="text-xs text-zinc-500">Nuevo Cargo</label>
                <select className={selectClass} value={reasignForm.id_cargo} onChange={e => setReasignForm(f => ({...f, id_cargo: e.target.value, nombre_cargo: contrato.cargos.find((c: any) => c.id_cargo === e.target.value)?.nombre ?? ""}))}>
                  <option value="">Sin cargo</option>
                  {contrato.cargos.filter((c: any) => c.activo).map((c: any) => <option key={c.id_cargo} value={c.id_cargo}>{c.nombre} ({c.nivel})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalReasignar(null)} className="flex-1 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm transition-all">Cancelar</button>
              <button onClick={handleReasignar} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all">Confirmar Reasignación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB 3 — Jerarquía (árbol expandible)
// ─────────────────────────────────────────────────────────────

function TabJerarquia({ contrato, id_contrato }: { contrato: any; id_contrato: string }) {
  const { addUnidad, removeUnidad } = useContratosStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingUnidad, setAddingUnidad] = useState(false);
  const [newU, setNewU] = useState({ nombre: "", descripcion: "", activa: true });

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const unidades: ContratoUnidad[] = contrato.unidades;
  const cargos: ContratoCargo[] = contrato.cargos;
  const asignados: ContratoTrabajador[] = contrato.trabajadores_asignados;

  return (
    <div className="space-y-4">
      <SectionCard
        title="Estructura de Faena"
        action={<button onClick={() => setAddingUnidad(true)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-all"><Plus size={12} /> Nueva Unidad</button>}
      >
        <div className="space-y-2">
          {addingUnidad && (
            <div className="p-3 bg-zinc-800 rounded-xl border border-blue-500/30 space-y-2 mb-3">
              <p className="text-xs font-semibold text-blue-400">Nueva unidad</p>
              <input placeholder="Nombre de la unidad *" className={inputClass} value={newU.nombre} onChange={e => setNewU(p => ({...p, nombre: e.target.value}))} />
              <input placeholder="Descripción (opcional)" className={inputClass} value={newU.descripcion} onChange={e => setNewU(p => ({...p, descripcion: e.target.value}))} />
              <div className="flex gap-2">
                <button onClick={() => { if(newU.nombre) { addUnidad(id_contrato, newU); setNewU({nombre:"",descripcion:"",activa:true}); setAddingUnidad(false); }}} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-semibold transition-all">Crear</button>
                <button onClick={() => setAddingUnidad(false)} className="flex-1 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg transition-all">Cancelar</button>
              </div>
            </div>
          )}

          {unidades.length === 0 && !addingUnidad && <p className="text-sm text-zinc-600 text-center py-6">No hay unidades en este contrato</p>}

          {unidades.map(u => {
            const uCargos = cargos.filter(c => c.id_unidad === u.id_unidad && c.activo);
            const uPersonas = asignados.filter(a => a.id_unidad === u.id_unidad && a.activo);
            const isOpen = expanded[u.id_unidad];

            return (
              <div key={u.id_unidad} className={`rounded-xl border transition-all ${u.activa ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-800 bg-zinc-900/20 opacity-50"}`}>
                {/* Unidad header */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-zinc-800/30 rounded-xl transition-colors"
                  onClick={() => toggle(u.id_unidad)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`transition-transform ${isOpen ? "rotate-90" : ""}`}><ChevronRight size={14} className="text-zinc-500" /></div>
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center"><Layers size={14} className="text-blue-400" /></div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{u.nombre}</p>
                      {u.descripcion && <p className="text-xs text-zinc-600">{u.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{uPersonas.length} persona{uPersonas.length !== 1 ? "s" : ""}</span>
                    {u.activa && <button onClick={e => { e.stopPropagation(); removeUnidad(id_contrato, u.id_unidad); }} className="p-1 rounded text-zinc-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={13} /></button>}
                  </div>
                </div>

                {/* Contenido expandido */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-1.5 border-t border-zinc-800/50 pt-3">
                    {uCargos.map(c => {
                      const cPersonas = uPersonas.filter(a => a.id_cargo === c.id_cargo);
                      return (
                        <div key={c.id_cargo} className="ml-5 border-l border-zinc-800 pl-4 pb-1">
                          <div className="flex items-center gap-2 py-1">
                            <Briefcase size={12} className="text-zinc-600" />
                            <span className="text-xs font-semibold text-zinc-400">{c.nombre}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${NIVEL_COLOR[c.nivel]}`}>{c.nivel}</span>
                          </div>
                          {cPersonas.map(a => (
                            <div key={a.id_asignacion} className="ml-5 border-l border-zinc-800/50 pl-3 py-1 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">{a.nombre.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
                              <span className="text-xs text-zinc-300">{a.nombre}</span>
                            </div>
                          ))}
                          {cPersonas.length === 0 && <p className="ml-5 text-[10px] text-zinc-700 pl-3 py-0.5">Sin personas asignadas</p>}
                        </div>
                      );
                    })}
                    {/* Personas sin cargo en esta unidad */}
                    {uPersonas.filter(a => !a.id_cargo).length > 0 && (
                      <div className="ml-5 border-l border-zinc-800 pl-4">
                        <div className="flex items-center gap-2 py-1"><span className="text-xs text-zinc-600">Sin cargo asignado</span></div>
                        {uPersonas.filter(a => !a.id_cargo).map(a => (
                          <div key={a.id_asignacion} className="ml-5 pl-3 py-1 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">{a.nombre.split(" ").map(n => n[0]).slice(0,2).join("")}</div>
                            <span className="text-xs text-zinc-300">{a.nombre}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {uCargos.length === 0 && uPersonas.length === 0 && <p className="ml-5 text-xs text-zinc-700 py-2">Unidad sin cargos ni personas asignadas</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB 4 — Cargos y Roles
// ─────────────────────────────────────────────────────────────

function TabCargos({ contrato, id_contrato }: { contrato: any; id_contrato: string }) {
  const { addCargo, updateCargo, removeCargo } = useContratosStore();
  const [addingCargo, setAddingCargo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ContratoCargo, "id_cargo">>({ nombre: "", nivel: "Operativo", activo: true });
  const [editForm, setEditForm] = useState<Partial<ContratoCargo>>({});

  const cargos: ContratoCargo[] = contrato.cargos;
  const unidades: ContratoUnidad[] = contrato.unidades;

  const handleAdd = () => {
    if (!form.nombre) return;
    addCargo(id_contrato, form);
    setForm({ nombre: "", nivel: "Operativo", activo: true });
    setAddingCargo(false);
  };

  const handleUpdate = (id: string) => {
    updateCargo(id_contrato, id, editForm);
    setEditingId(null);
  };

  return (
    <SectionCard
      title={`Catálogo de Cargos (${cargos.filter(c => c.activo).length} activos)`}
      action={<button onClick={() => setAddingCargo(!addingCargo)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-all"><Plus size={12} /> Nuevo Cargo</button>}
    >
      <div className="space-y-2">
        {addingCargo && (
          <div className="p-3 bg-zinc-800 rounded-xl border border-blue-500/30 grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <input placeholder="Nombre del cargo *" className={inputClass} value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))} />
            <select className={selectClass} value={form.nivel} onChange={e => setForm(p => ({...p, nivel: e.target.value as any}))}>
              {NIVELES.map(n => <option key={n}>{n}</option>)}
            </select>
            <select className={selectClass} value={form.id_unidad ?? ""} onChange={e => setForm(p => ({...p, id_unidad: e.target.value || undefined}))}>
              <option value="">Sin unidad</option>
              {unidades.filter(u => u.activa).map(u => <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>)}
            </select>
            <div className="md:col-span-3 flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-semibold">Agregar</button>
              <button onClick={() => setAddingCargo(false)} className="flex-1 py-1.5 border border-zinc-700 text-zinc-400 text-xs rounded-lg">Cancelar</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider py-2 pr-4">Cargo</th>
                <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider py-2 pr-4">Nivel</th>
                <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider py-2 pr-4">Unidad</th>
                <th className="text-left text-[10px] text-zinc-600 uppercase tracking-wider py-2">Estado</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {cargos.map(c => {
                const unidad = unidades.find(u => u.id_unidad === c.id_unidad);
                const isEditing = editingId === c.id_cargo;
                return (
                  <tr key={c.id_cargo} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-2.5 pr-4">
                      {isEditing
                        ? <input className={`${inputClass} py-1`} value={editForm.nombre ?? c.nombre} onChange={e => setEditForm(p => ({...p, nombre: e.target.value}))} />
                        : <span className={`font-medium ${c.activo ? "text-zinc-200" : "text-zinc-600 line-through"}`}>{c.nombre}</span>}
                    </td>
                    <td className="py-2.5 pr-4">
                      {isEditing
                        ? <select className={`${selectClass} py-1`} value={editForm.nivel ?? c.nivel} onChange={e => setEditForm(p => ({...p, nivel: e.target.value as any}))}>{NIVELES.map(n => <option key={n}>{n}</option>)}</select>
                        : <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${NIVEL_COLOR[c.nivel]}`}>{c.nivel}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-zinc-500">{unidad?.nombre ?? "Sin unidad"}</td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.activo ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700 text-zinc-500"}`}>{c.activo ? "Activo" : "Inactivo"}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing
                          ? <>
                              <button onClick={() => handleUpdate(c.id_cargo)} className="p-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-all"><Check size={13} /></button>
                              <button onClick={() => setEditingId(null)} className="p-1 rounded bg-zinc-700 text-zinc-400 transition-all"><X size={13} /></button>
                            </>
                          : <>
                              <button onClick={() => { setEditingId(c.id_cargo); setEditForm({ nombre: c.nombre, nivel: c.nivel }); }} className="p-1 rounded bg-zinc-700 text-zinc-400 hover:text-white transition-all"><Edit3 size={13} /></button>
                              <button onClick={() => removeCargo(id_contrato, c.id_cargo)} className="p-1 rounded bg-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                            </>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {cargos.length === 0 && <p className="text-sm text-zinc-600 text-center py-8">Sin cargos definidos para este contrato</p>}
        </div>
      </div>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  TAB 5 — Historial
// ─────────────────────────────────────────────────────────────

function TabHistorial({ contrato }: { contrato: any }) {
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const historial = [...(contrato.historial ?? [])].sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const tipos = ["Todos", ...Array.from(new Set(historial.map((h: any) => h.tipo)))];
  const filtered = filtroTipo === "Todos" ? historial : historial.filter((h: any) => h.tipo === filtroTipo);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tipos.map(t => (
          <button key={t} onClick={() => setFiltroTipo(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${filtroTipo === t ? "bg-blue-600 border-blue-500 text-white" : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="relative space-y-0">
        {filtered.length === 0 && <p className="text-sm text-zinc-600 text-center py-10">Sin movimientos registrados</p>}
        {filtered.map((h: any, i: number) => {
          const colorClass = TIPO_HIST_COLOR[h.tipo] ?? "text-zinc-400 bg-zinc-400/10";
          return (
            <div key={h.id} className="flex gap-4 pb-4 relative">
              {/* Timeline line */}
              {i < filtered.length - 1 && <div className="absolute left-[17px] top-8 bottom-0 w-px bg-zinc-800" />}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border border-zinc-800 ${colorClass.split(" ").filter(c => c.startsWith("bg-")).join(" ")}`}>
                <Activity size={14} className={colorClass.split(" ").filter(c => c.startsWith("text-")).join(" ")} />
              </div>
              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>{h.tipo}</span>
                    {h.nombre_trabajador && <span className="text-xs text-zinc-400 ml-2">· {h.nombre_trabajador}</span>}
                  </div>
                  <span className="text-[10px] text-zinc-600 flex-shrink-0">{formatDateLong(h.fecha)}</span>
                </div>
                <p className="text-sm text-zinc-300 mt-1.5">{h.detalle}</p>
                <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1"><Clock size={10} /> {h.usuario_accion}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function ContratoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { contratos } = useContratosStore();
  const { mandantes } = useMandantesStore();

  const [activeTab, setActiveTab] = useState<TabId>("info");

  const contrato = contratos.find(c => c.id_contrato === params.id);
  const mandante = mandantes.find(m => m.id_mandante === contrato?.id_mandante);

  if (!contrato) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle size={40} className="text-zinc-700 mx-auto" />
          <p className="text-zinc-500">Contrato no encontrado</p>
          <Link href="/contratos" className="text-blue-400 text-sm hover:underline">← Volver a contratos</Link>
        </div>
      </div>
    );
  }

  const activos = contrato.trabajadores_asignados.filter(a => a.activo).length;
  const pct = progress(contrato.fecha_inicio, contrato.fecha_termino);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-start gap-4">
            <button onClick={() => router.push("/contratos")} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mt-0.5 flex-shrink-0">
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs text-zinc-500">{contrato.codigo_contrato}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ESTADO_COLOR[contrato.estado]}`}>{contrato.estado}</span>
                {mandante && <span className="text-xs text-zinc-500">· {mandante.nombre}</span>}
              </div>
              <h1 className="text-xl font-bold text-white truncate">{contrato.nombre_contrato}</h1>
              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Users size={11} /> {activos} trabajadores</span>
                <span className="flex items-center gap-1"><Layers size={11} /> {contrato.unidades.filter(u => u.activa).length} unidades</span>
                <span className="flex items-center gap-1"><Briefcase size={11} /> {contrato.cargos.filter(c => c.activo).length} cargos</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> {pct}% transcurrido</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-zinc-800 -mb-px">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeTab === t.id
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === "info"         && <TabInfo          contrato={contrato} id_contrato={contrato.id_contrato} />}
        {activeTab === "trabajadores" && <TabTrabajadores  contrato={contrato} id_contrato={contrato.id_contrato} />}
        {activeTab === "jerarquia"    && <TabJerarquia     contrato={contrato} id_contrato={contrato.id_contrato} />}
        {activeTab === "cargos"       && <TabCargos        contrato={contrato} id_contrato={contrato.id_contrato} />}
        {activeTab === "historial"    && <TabHistorial     contrato={contrato} />}
      </div>
    </div>
  );
}
