"use client";

import React, { useState, useMemo } from "react";
import { 
  Shield, 
  Search, 
  UserCog, 
  ShieldCheck, 
  Settings, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Building2,
  Mail,
  Smartphone
} from "lucide-react";
import { useTrabajadoresStore } from "@/store/trabajadores-store";
import { useUsuariosStore, MODULOS_SISTEMA, NivelAcceso, RolGlobal } from "@/store/usuarios-store";

export default function UsuariosPage() {
  const { trabajadores, fetchTrabajadores } = useTrabajadoresStore();
  const { 
    roles, 
    permisos, 
    fetchConfiguracion, 
    setRolGlobal, 
    setPermisoModulo, 
    getUsuarioConfig 
  } = useUsuariosStore();

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  React.useEffect(() => {
    fetchTrabajadores();
    fetchConfiguracion();
  }, [fetchTrabajadores, fetchConfiguracion]);

  // Trabajadores activos para mostrar en la lista
  const trabajadoresActivos = useMemo(() => {
    return trabajadores;
  }, [trabajadores]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return trabajadoresActivos;
    const lower = search.toLowerCase();
    return trabajadoresActivos.filter(t => 
      `${t.nombre_1} ${t.apellido_paterno} ${t.apellido_materno}`.toLowerCase().includes(lower) ||
      t.numero_identificacion.includes(lower) ||
      t.email_corporativo?.toLowerCase().includes(lower)
    );
  }, [trabajadoresActivos, search]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return trabajadores.find(t => t.id_trabajador === selectedUserId) || null;
  }, [selectedUserId, trabajadores]);

  const userConfig = useMemo(() => {
    if (!selectedUserId) return null;
    return getUsuarioConfig(selectedUserId);
  }, [selectedUserId, roles, permisos, getUsuarioConfig]);

  // Contadores rápidos para el dashboard
  const stats = useMemo(() => {
    const total = trabajadoresActivos.length;
    const superAdmins = roles.filter(r => r.rol_global === "Super Admin").length;
    // Contamos usuarios "normales" que tienen al menos 1 permiso "Ver y Operar" o "Administrar"
    const conAccesos = new Set(
      permisos
        .filter(p => p.nivel_acceso !== "No Ver")
        .map(p => p.id_trabajador)
    ).size;

    return { total, superAdmins, conAccesos };
  }, [trabajadoresActivos, roles, permisos]);

  // Funciones de actualización
  const handleToggleSuperAdmin = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUserId) return;
    const newRol = e.target.checked ? "Super Admin" : "Usuario";
    setRolGlobal(selectedUserId, newRol);
  };

  const handlePermisoChange = (moduloId: string, nivel: NivelAcceso) => {
    if (!selectedUserId) return;
    setPermisoModulo(selectedUserId, moduloId, nivel);
  };

  // VISTAS
  if (selectedUser && userConfig) {
    const isSuperAdmin = userConfig.rol_global === "Super Admin";

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedUserId(null)}
            className="p-2 rounded-lg border border-border text-text-soft hover:text-text hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <UserCog className="text-primary" /> 
              Configuración de Permisos
            </h1>
            <p className="text-sm text-text-soft">
              Administrando accesos para {selectedUser.nombre_1} {selectedUser.apellido_paterno}
            </p>
          </div>
        </div>

        {/* Tarjeta del Usuario */}
        <div className="card flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
            {selectedUser.nombre_1[0]}{selectedUser.apellido_paterno[0]}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-xl font-bold text-text">
              {selectedUser.nombre_1} {selectedUser.apellido_paterno} {selectedUser.apellido_materno}
            </h2>
            <p className="text-sm text-text-soft font-mono font-bold mt-1">{selectedUser.numero_identificacion}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-text-muted font-semibold">
              {selectedUser.email_corporativo && (
                <span className="flex items-center gap-1.5"><Mail size={14}/> {selectedUser.email_corporativo}</span>
              )}
              {selectedUser.cargo && (
                <span className="flex items-center gap-1.5"><Building2 size={14}/> {selectedUser.cargo} ({selectedUser.area_departamento || 'Sin Unidad'})</span>
              )}
            </div>
          </div>

          {/* Switch Super Admin */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center gap-4">
            <div>
              <p className="text-sm font-bold text-text flex items-center gap-1.5">
                <ShieldCheck size={18} className={isSuperAdmin ? "text-warning" : "text-text-soft"}/> 
                Super Admin
              </p>
              <p className="text-xs text-text-soft mt-1 max-w-[150px]">
                Acceso total a todos los módulos sin restricciones.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isSuperAdmin}
                onChange={handleToggleSuperAdmin}
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
            </label>
          </div>
        </div>

        {/* Grilla de Módulos */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <Settings size={20} className="text-text-soft" />
            Permisos por Módulo
          </h3>

          {isSuperAdmin ? (
            <div className="p-8 rounded-2xl border border-warning/20 bg-warning/5 text-center space-y-3">
              <ShieldCheck size={48} className="mx-auto text-warning" />
              <h4 className="text-warning font-bold text-xl">Usuario Super Administrador</h4>
              <p className="text-text-soft text-sm max-w-lg mx-auto font-medium">
                Este usuario tiene acceso irrestricto a todos los módulos del sistema. 
                Los permisos individuales por módulo son ignorados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULOS_SISTEMA.map((mod) => {
                const currentVal = userConfig.permisos[mod.id];
                return (
                  <div key={mod.id} className="p-5 rounded-2xl border border-border bg-surface hover:border-primary/40 transition-colors">
                    <h4 className="font-bold text-text mb-4">{mod.nombre}</h4>
                    
                    {/* Segmented Control */}
                    <div className="flex bg-bg-alt p-1 rounded-xl border border-border">
                      {(["No Ver", "Ver y Operar", "Administrar"] as NivelAcceso[]).map((nivel) => {
                        const isSelected = currentVal === nivel;
                        return (
                          <button
                            key={nivel}
                            onClick={() => handlePermisoChange(mod.id, nivel)}
                            className={`flex-1 text-xs font-bold py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                              isSelected 
                                ? nivel === "No Ver" ? "bg-danger/10 text-danger shadow-sm border border-danger/20" :
                                  nivel === "Administrar" ? "bg-primary text-text-inverse shadow-sm" :
                                  "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                : "text-text-soft hover:text-text hover:bg-surface border border-transparent"
                            }`}
                          >
                            {nivel === "No Ver" && <EyeOff size={14}/>}
                            {nivel === "Ver y Operar" && <Eye size={14}/>}
                            {nivel === "Administrar" && <Settings size={14}/>}
                            <span className="hidden sm:inline">{nivel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL (Lista)
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            Administración de Usuarios
          </h1>
          <p className="text-sm text-text-soft mt-2 font-medium">Configura roles globales y permisos de acceso a módulos para todo el personal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-box flex items-center gap-5">
          <div className="p-4 rounded-xl bg-primary/10 text-primary">
            <UserCog size={28} />
          </div>
          <div>
            <p className="label">Total Usuarios</p>
            <p className="value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-box flex items-center gap-5">
          <div className="p-4 rounded-xl bg-warning/10 text-warning">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="label">Super Admins</p>
            <p className="value">{stats.superAdmins}</p>
          </div>
        </div>
        <div className="stat-box flex items-center gap-5">
          <div className="p-4 rounded-xl bg-success/10 text-success">
            <Eye size={28} />
          </div>
          <div>
            <p className="label">Con Accesos (Normales)</p>
            <p className="value">{stats.conAccesos}</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="table-shell flex flex-col h-[600px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-border bg-surface/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-3 h-5 w-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, RUT o email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <span className="badge badge-outline">{filteredUsers.length} encontrados</span>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-text-soft uppercase bg-surface sticky top-0 z-10 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Usuario / Trabajador</th>
                <th className="px-6 py-4 font-bold tracking-wider">Cargo / Unidad</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Rol Global</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Permisos (Módulos)</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredUsers.map((t) => {
                const conf = getUsuarioConfig(t.id_trabajador);
                const isSuper = conf.rol_global === "Super Admin";
                
                let modulosActivos = 0;
                let modulosAdmin = 0;
                if (!isSuper) {
                  Object.values(conf.permisos).forEach(nivel => {
                    if (nivel === "Ver y Operar") modulosActivos++;
                    if (nivel === "Administrar") modulosAdmin++;
                  });
                }

                return (
                  <tr key={t.id_trabajador} className="hover:bg-bg-alt/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-text">{t.nombre_1} {t.apellido_paterno} {t.apellido_materno}</p>
                      <p className="text-xs text-text-soft font-mono mt-1 font-semibold">{t.numero_identificacion} • {t.email_corporativo || 'Sin email'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-text">{t.cargo || '—'}</p>
                      <p className="text-xs text-text-soft mt-0.5 font-medium">{t.area_departamento || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${
                        isSuper 
                          ? "badge-orange" 
                          : "badge-outline"
                      }`}>
                        {isSuper && <ShieldCheck size={14}/>}
                        {conf.rol_global}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs">
                      {isSuper ? (
                        <span className="badge badge-orange">Acceso Total</span>
                      ) : (
                        <div className="flex justify-center gap-2">
                          {(modulosActivos > 0 || modulosAdmin > 0) ? (
                            <>
                              {modulosActivos > 0 && <span className="badge badge-blue">{modulosActivos} lectura</span>}
                              {modulosAdmin > 0 && <span className="badge bg-primary/20 text-primary">{modulosAdmin} admin</span>}
                            </>
                          ) : (
                            <span className="text-text-muted font-bold text-xs">Sin accesos</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedUserId(t.id_trabajador)}
                        className="opacity-0 group-hover:opacity-100 btn btn-secondary py-2 min-h-0 text-xs px-4"
                      >
                        Configurar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
