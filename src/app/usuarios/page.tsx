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
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Encabezado */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedUserId(null)}
            className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCog className="text-blue-500" /> 
              Configuración de Permisos
            </h1>
            <p className="text-xs text-zinc-500">
              Administrando accesos para {selectedUser.nombre_1} {selectedUser.apellido_paterno}
            </p>
          </div>
        </div>

        {/* Tarjeta del Usuario */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-wrap gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/30">
            {selectedUser.nombre_1[0]}{selectedUser.apellido_paterno[0]}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="text-xl font-bold text-white">
              {selectedUser.nombre_1} {selectedUser.apellido_paterno} {selectedUser.apellido_materno}
            </h2>
            <p className="text-sm text-zinc-400 font-mono">{selectedUser.numero_identificacion}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
              {selectedUser.email_corporativo && (
                <span className="flex items-center gap-1.5"><Mail size={12}/> {selectedUser.email_corporativo}</span>
              )}
              {selectedUser.cargo && (
                <span className="flex items-center gap-1.5"><Building2 size={12}/> {selectedUser.cargo} ({selectedUser.area_departamento || 'Sin Unidad'})</span>
              )}
            </div>
          </div>

          {/* Switch Super Admin */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck size={16} className={isSuperAdmin ? "text-amber-400" : "text-zinc-600"}/> 
                Super Admin
              </p>
              <p className="text-[10px] text-zinc-500 max-w-[150px]">
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
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Grilla de Módulos */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings size={18} className="text-zinc-400" />
            Permisos por Módulo
          </h3>

          {isSuperAdmin ? (
            <div className="p-8 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center space-y-2">
              <ShieldCheck size={40} className="mx-auto text-amber-500" />
              <h4 className="text-amber-400 font-bold text-lg">Usuario Super Administrador</h4>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto">
                Este usuario tiene acceso irrestricto a todos los módulos del sistema. 
                Los permisos individuales por módulo son ignorados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULOS_SISTEMA.map((mod) => {
                const currentVal = userConfig.permisos[mod.id];
                return (
                  <div key={mod.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
                    <h4 className="font-bold text-zinc-200 mb-3">{mod.nombre}</h4>
                    
                    {/* Segmented Control */}
                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      {(["No Ver", "Ver y Operar", "Administrar"] as NivelAcceso[]).map((nivel) => {
                        const isSelected = currentVal === nivel;
                        return (
                          <button
                            key={nivel}
                            onClick={() => handlePermisoChange(mod.id, nivel)}
                            className={`flex-1 text-[11px] font-semibold py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                              isSelected 
                                ? nivel === "No Ver" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                  nivel === "Administrar" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                  "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                            }`}
                          >
                            {nivel === "No Ver" && <EyeOff size={12}/>}
                            {nivel === "Ver y Operar" && <Eye size={12}/>}
                            {nivel === "Administrar" && <Settings size={12}/>}
                            {nivel}
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="text-blue-400" size={24} />
            Administración de Usuarios
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Configura roles globales y permisos de acceso a módulos para todo el personal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Usuarios</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Super Admins</p>
            <p className="text-2xl font-bold text-white">{stats.superAdmins}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Con Accesos (Normales)</p>
            <p className="text-2xl font-bold text-white">{stats.conAccesos}</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden flex flex-col h-[600px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[250px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, RUT o email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <span className="text-xs text-zinc-500">{filteredUsers.length} encontrados</span>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-900/80 sticky top-0 z-10 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-bold tracking-wider">Usuario / Trabajador</th>
                <th className="px-4 py-3 font-bold tracking-wider">Cargo / Unidad</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Rol Global</th>
                <th className="px-4 py-3 font-bold tracking-wider text-center">Permisos (Módulos)</th>
                <th className="px-4 py-3 font-bold tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
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
                  <tr key={t.id_trabajador} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-200">{t.nombre_1} {t.apellido_paterno} {t.apellido_materno}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.numero_identificacion} • {t.email_corporativo || 'Sin email'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-300">{t.cargo || '—'}</p>
                      <p className="text-[10px] text-zinc-500">{t.area_departamento || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${
                        isSuper 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}>
                        {isSuper && <ShieldCheck size={12}/>}
                        {conf.rol_global}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {isSuper ? (
                        <span className="text-amber-500/80 text-[10px] font-bold">Acceso Total</span>
                      ) : (
                        <div className="flex justify-center gap-2">
                          {(modulosActivos > 0 || modulosAdmin > 0) ? (
                            <>
                              {modulosActivos > 0 && <span className="text-blue-400 font-semibold text-[10px]">{modulosActivos} lectura</span>}
                              {modulosAdmin > 0 && <span className="text-purple-400 font-semibold text-[10px]">{modulosAdmin} admin</span>}
                            </>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">Sin accesos</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedUserId(t.id_trabajador)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all"
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
