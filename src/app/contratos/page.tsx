"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { useContratosStore } from "@/store/contratos-store";
import { useMandantesStore } from "@/store/mandantes-store";
import ContratoForm from "@/components/custom/contrato-form";
import {
  Plus, Search, Layers, CreditCard, FileText,
  Activity, Edit3, ArrowRight, Trash2,
  Building2, Users, X, Check,
} from "lucide-react";

const ESTADO_COLOR: Record<string, string> = {
  Activo:           "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cerrado:          "bg-zinc-800 text-zinc-500 border-zinc-700",
  "En Preparacion": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Suspendido:       "bg-red-500/10 text-red-400 border-red-500/20"
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

function progress(start: string, end: string) {
  const s = new Date(start).getTime(), e = new Date(end).getTime(), n = Date.now();
  if (n < s) return 0;
  if (n > e) return 100;
  return Math.round(((n - s) / (e - s)) * 100);
}

// ─── Modal mandantes ──────────────────────────────────────────

function MandanteModal({ onClose }: { onClose: () => void }) {
  const { mandantes, addMandante, updateMandante, deleteMandante } = useMandantesStore(
    useShallow((s) => ({
      mandantes: s.mandantes,
      addMandante: s.addMandante,
      updateMandante: s.updateMandante,
      deleteMandante: s.deleteMandante,
    }))
  );
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ rut: "", nombre: "", razon_social: "", rubro: "", contacto_nombre: "", contacto_email: "", contacto_telefono: "", activo: true });

  const handleAdd = () => {
    if (!form.nombre || !form.rut) return;
    addMandante(form);
    setForm({ rut: "", nombre: "", razon_social: "", rubro: "", contacto_nombre: "", contacto_email: "", contacto_telefono: "", activo: true });
    setAdding(false);
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-600";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-base font-bold text-white flex items-center gap-2"><Building2 size={16} className="text-blue-400" /> Gestión de Mandantes</h2>
          <button onClick={onClose} className="p-1 rounded text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Lista */}
          <div className="space-y-2">
            {mandantes.map(m => (
              <div key={m.id_mandante} className="flex items-center justify-between p-3.5 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{m.nombre}</p>
                  <p className="text-xs text-zinc-500">{m.rut} · {m.rubro ?? "—"}</p>
                  {m.contacto_email && <p className="text-xs text-zinc-600">{m.contacto_email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${m.activo ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-700 border-zinc-600"}`}>{m.activo ? "Activo" : "Inactivo"}</span>
                  <button onClick={() => updateMandante(m.id_mandante, { activo: !m.activo })} className="p-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-400 transition-all" title={m.activo ? "Desactivar" : "Activar"}>{m.activo ? <X size={13} /> : <Check size={13} />}</button>
                  <button onClick={() => { if(confirm(`¿Eliminar mandante "${m.nombre}"?`)) deleteMandante(m.id_mandante); }} className="p-1.5 rounded bg-zinc-700 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Agregar nuevo */}
          {adding ? (
            <div className="p-4 bg-zinc-800 rounded-xl border border-blue-500/30 space-y-3">
              <p className="text-sm font-semibold text-blue-400">Nuevo mandante</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-xs text-zinc-500">RUT *</label><input placeholder="76.430.211-5" className={inputCls} value={form.rut} onChange={e => setForm(p => ({...p, rut: e.target.value}))} /></div>
                <div className="space-y-1"><label className="text-xs text-zinc-500">Nombre comercial *</label><input placeholder="Minera Escondida" className={inputCls} value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))} /></div>
                <div className="space-y-1"><label className="text-xs text-zinc-500">Razón social</label><input className={inputCls} value={form.razon_social} onChange={e => setForm(p => ({...p, razon_social: e.target.value}))} /></div>
                <div className="space-y-1"><label className="text-xs text-zinc-500">Rubro</label><input placeholder="Minería, Forestal..." className={inputCls} value={form.rubro} onChange={e => setForm(p => ({...p, rubro: e.target.value}))} /></div>
                <div className="space-y-1"><label className="text-xs text-zinc-500">Contacto</label><input className={inputCls} value={form.contacto_nombre} onChange={e => setForm(p => ({...p, contacto_nombre: e.target.value}))} /></div>
                <div className="space-y-1"><label className="text-xs text-zinc-500">Email</label><input type="email" className={inputCls} value={form.contacto_email} onChange={e => setForm(p => ({...p, contacto_email: e.target.value}))} /></div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAdding(false)} className="flex-1 py-1.5 border border-zinc-700 text-zinc-400 text-sm rounded-lg transition-all">Cancelar</button>
                <button onClick={handleAdd} disabled={!form.nombre || !form.rut} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg font-semibold transition-all">Guardar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2.5 border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Agregar mandante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function ContratosPage() {
  const { contratos, deleteContrato, fetchContratos } = useContratosStore(
    useShallow((s) => ({
      contratos: s.contratos,
      deleteContrato: s.deleteContrato,
      fetchContratos: s.fetchContratos,
    }))
  );
  const mandantes = useMandantesStore((s) => s.mandantes);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [mandantesOpen, setMandantesOpen] = useState(false);

  const handleEdit = (id: string) => { setSelectedContratoId(id); setFormOpen(true); };
  const handleCreate = () => { setSelectedContratoId(null); setFormOpen(true); };

  const filteredContratos = contratos.filter((c) => {
    const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
    const str = `${c.codigo_contrato} ${c.nombre_contrato} ${mandante?.nombre ?? ""}`.toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  const totalCount   = contratos.length;
  const activeCount  = contratos.filter(c => c.estado === "Activo").length;
  const totalCCs     = contratos.reduce((a, c) => a + c.centros_costo.length, 0);
  const totalPersonas = contratos.reduce((a, c) => a + c.trabajadores_asignados.filter(t => t.activo).length, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Contratos</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Unidades operativas · centros de costo · dotación</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMandantesOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-all">
            <Building2 size={15} /> Mandantes
          </button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-600/20">
            <Plus size={15} /> Nuevo Contrato
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Contratos",   value: totalCount,   icon: FileText,  color: "bg-blue-500/10 text-blue-400" },
          { label: "Contratos Activos", value: activeCount,  icon: Activity,  color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Centros de Costo",  value: totalCCs,     icon: CreditCard, color: "bg-purple-500/10 text-purple-400" },
          { label: "Personas Activas",  value: totalPersonas, icon: Users,    color: "bg-cyan-500/10 text-cyan-400" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.color}`}><Icon size={18} /></div>
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase">{s.label}</span>
                <span className="text-lg font-bold text-white">{s.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, código o mandante..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-600 transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredContratos.map(c => {
          const mandante = mandantes.find(m => m.id_mandante === c.id_mandante);
          const pct = progress(c.fecha_inicio, c.fecha_termino);
          const activos = c.trabajadores_asignados.filter(t => t.activo).length;

          return (
            <div key={c.id_contrato} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={12} className="text-zinc-600 flex-shrink-0" />
                    <span className="text-[11px] text-zinc-500 truncate">{mandante?.nombre ?? "Sin mandante"}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors leading-snug">{c.nombre_contrato}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${ESTADO_COLOR[c.estado]}`}>{c.estado}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Personas", value: activos, icon: Users },
                  { label: "Unidades", value: c.unidades.filter(u => u.activa).length, icon: Layers },
                  { label: "CCs", value: c.centros_costo.length, icon: CreditCard },
                ].map(m => {
                  const MIcon = m.icon;
                  return (
                    <div key={m.label} className="bg-zinc-900 rounded-lg p-2 text-center border border-zinc-800">
                      <MIcon size={12} className="text-zinc-600 mx-auto mb-0.5" />
                      <p className="text-base font-bold text-zinc-200">{m.value}</p>
                      <p className="text-[10px] text-zinc-600">{m.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Timeline */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>{formatDate(c.fecha_inicio)}</span>
                  <span>{pct}%</span>
                  <span>{formatDate(c.fecha_termino)}</span>
                </div>
                <div className="h-1.5 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${pct > 90 ? "from-amber-600 to-red-500" : "from-blue-600 to-cyan-500"} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50 mt-auto">
                <span className="text-[10px] text-zinc-600 font-mono">{c.codigo_contrato}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(c.id_contrato)} title="Editar" className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"><Edit3 size={13} /></button>
                  <button onClick={() => { if(confirm(`¿Eliminar ${c.codigo_contrato}?`)) deleteContrato(c.id_contrato); }} title="Eliminar" className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"><Trash2 size={13} /></button>
                  <Link href={`/contratos/${c.id_contrato}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all">
                    Ver <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {filteredContratos.length === 0 && (
          <div className="col-span-full p-12 text-center border border-zinc-800 border-dashed rounded-2xl">
            <FileText className="mx-auto text-zinc-700 mb-3" size={32} />
            <h4 className="text-zinc-400 font-bold text-sm">No se encontraron contratos</h4>
            <p className="text-xs text-zinc-600 mt-1">Modifica el criterio de búsqueda o crea uno nuevo.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {formOpen && (
        <ContratoForm
          contratoId={selectedContratoId || undefined}
          onClose={() => { setFormOpen(false); setSelectedContratoId(null); }}
        />
      )}
      {mandantesOpen && <MandanteModal onClose={() => setMandantesOpen(false)} />}
    </div>
  );
}
