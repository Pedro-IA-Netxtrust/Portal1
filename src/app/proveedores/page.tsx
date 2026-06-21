"use client";

import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useProveedoresStore, Proveedor } from "@/store/proveedores-store";
import { Store, Plus, Search, Filter, Edit, Trash2, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";

export default function ProveedoresPage() {
  const { 
    proveedores, 
    categorias, 
    fetchProveedores, 
    fetchCategorias, 
    addProveedor, 
    updateProveedor, 
    deleteProveedor,
    addCategoria
  } = useProveedoresStore(
    useShallow((s) => ({
      proveedores: s.proveedores,
      categorias: s.categorias,
      fetchProveedores: s.fetchProveedores,
      fetchCategorias: s.fetchCategorias,
      addProveedor: s.addProveedor,
      updateProveedor: s.updateProveedor,
      deleteProveedor: s.deleteProveedor,
      addCategoria: s.addCategoria,
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("Todas");

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Category inline state
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<Proveedor>>({
    nombre: "",
    rut: "",
    categoria: "",
    estado: "Activo",
    contacto_nombre: "",
    contacto_email: "",
    contacto_telefono: ""
  });

  // Fetch data on mount
  useEffect(() => {
    fetchProveedores();
    fetchCategorias();
  }, [fetchProveedores, fetchCategorias]);

  const filteredProveedores = proveedores.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.rut.includes(searchTerm);
    const matchesCat = filterCategoria === "Todas" || p.categoria === filterCategoria;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (prov?: Proveedor) => {
    setShowNewCatInput(false);
    setNewCatName("");
    if (prov) {
      setEditingId(prov.id_proveedor);
      setFormData(prov);
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        rut: "",
        categoria: categorias[0]?.nombre || "Alimentación",
        estado: "Activo",
        contacto_nombre: "",
        contacto_email: "",
        contacto_telefono: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nombre || !formData.rut) return;

    if (editingId) {
      updateProveedor(editingId, formData);
    } else {
      addProveedor(formData as Omit<Proveedor, "id_proveedor" | "fecha_creacion">);
    }
    setIsModalOpen(false);
  };

  const handleAddNewCat = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    const exists = categorias.some(c => c.nombre.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert("Esta categoría ya existe.");
      return;
    }

    await addCategoria(trimmed);
    setFormData(prev => ({ ...prev, categoria: trimmed }));
    setNewCatName("");
    setShowNewCatInput(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Alimentación": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Tecnología": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "Vehículos": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Transporte": return "text-purple-450 bg-purple-500/10 border-purple-500/20";
      case "Servicios Generales": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      default: return "text-zinc-400 bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <Store className="text-primary" size={32} />
            Proveedores
          </h1>
          <p className="text-sm font-medium text-text-soft mt-1">
            Gestión de proveedores de servicios y contratistas de faena.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Proveedor
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar por Nombre o RUT..."
            className="input pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-text-muted" />
          <select 
            className="input min-h-0 py-2.5 w-auto" 
            value={filterCategoria} 
            onChange={e => setFilterCategoria(e.target.value)}
          >
            <option value="Todas">Todas las Categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProveedores.map(p => (
          <div key={p.id_proveedor} className="card p-5 group hover:border-primary/50 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{p.nombre}</h3>
                <p className="text-xs text-text-soft font-mono mt-0.5">{p.rut}</p>
              </div>
              <span className={`badge px-2.5 py-1 text-[10px] uppercase tracking-wider ${getCategoryColor(p.categoria)}`}>
                {p.categoria}
              </span>
            </div>

            <div className="space-y-2 mt-4 flex-1">
              {p.contacto_nombre && (
                <div className="text-sm font-medium text-text flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-text-muted"><Store size={12}/></div>
                  {p.contacto_nombre}
                </div>
              )}
              {p.contacto_email && (
                <div className="text-xs text-text-soft flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-text-muted"><Mail size={12}/></div>
                  {p.contacto_email}
                </div>
              )}
              {p.contacto_telefono && (
                <div className="text-xs text-text-soft flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-text-muted"><Phone size={12}/></div>
                  {p.contacto_telefono}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
              <span className={`flex items-center gap-1.5 text-xs font-bold ${p.estado === 'Activo' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {p.estado === 'Activo' ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {p.estado}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(p)} className="p-1.5 rounded bg-surface-2 text-text-muted hover:text-primary cursor-pointer"><Edit size={14}/></button>
                <button onClick={() => { if (confirm("¿Eliminar este proveedor?")) deleteProveedor(p.id_proveedor); }} className="p-1.5 rounded bg-surface-2 text-text-muted hover:text-danger cursor-pointer"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProveedores.length === 0 && (
        <div className="card p-12 text-center text-text-soft text-sm font-medium border-dashed">
          No se encontraron proveedores.
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-5">
            <h2 className="text-xl font-bold text-text">{editingId ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Razón Social / Nombre</label>
                  <input type="text" className="input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="label">RUT</label>
                  <input type="text" className="input" value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} />
                </div>
                
                <div>
                  <label className="label flex justify-between items-center">
                    <span>Categoría</span>
                    <button 
                      type="button"
                      onClick={() => setShowNewCatInput(!showNewCatInput)}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer select-none"
                    >
                      {showNewCatInput ? "Cancelar" : "+ Nuevo Tipo"}
                    </button>
                  </label>
                  {showNewCatInput ? (
                    <div className="flex gap-2 mt-1 animate-fadeIn">
                      <input 
                        type="text" 
                        placeholder="Ej: Seguridad" 
                        className="input py-2 text-xs flex-1"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={handleAddNewCat}
                        className="btn btn-primary px-3 text-xs min-h-0 py-2"
                      >
                        Crear
                      </button>
                    </div>
                  ) : (
                    <select className="input" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Contacto Principal</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Nombre Contacto</label>
                    <input type="text" className="input" value={formData.contacto_nombre} onChange={e => setFormData({...formData, contacto_nombre: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Email</label>
                      <input type="email" className="input" value={formData.contacto_email} onChange={e => setFormData({...formData, contacto_email: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Teléfono</label>
                      <input type="text" className="input" value={formData.contacto_telefono} onChange={e => setFormData({...formData, contacto_telefono: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="label">Estado</label>
                <select className="input" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as "Activo" | "Inactivo"})}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>Guardar Proveedor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
