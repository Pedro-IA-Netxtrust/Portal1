import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export type RolGlobal = "Super Admin" | "Usuario";
export type NivelAcceso = "No Ver" | "Ver y Operar" | "Administrar";

export interface ModuloSistema {
  id: string;
  nombre: string;
}

export const MODULOS_SISTEMA: ModuloSistema[] = [
  { id: "dashboard", nombre: "Dashboard" },
  { id: "trabajadores", nombre: "Trabajadores" },
  { id: "asistencia", nombre: "Asistencia" },
  { id: "contratos", nombre: "Contratos" },
  { id: "vehiculos", nombre: "Vehículos" },
  { id: "inspecciones", nombre: "Inspecciones ECF 4" },
  { id: "notebooks", nombre: "Notebooks" },
  { id: "control", nombre: "Cursos y Exámenes" },
  { id: "tickets", nombre: "Tickets IT" },
  { id: "solicitudes", nombre: "Solicitudes" },
];

export interface RolGlobalDB {
  id_trabajador: string;
  rol_global: RolGlobal;
}

export interface PermisoModuloDB {
  id_trabajador: string;
  modulo_id: string;
  nivel_acceso: NivelAcceso;
}

// Interfaz para la vista
export interface UsuarioConfig {
  id_trabajador: string;
  rol_global: RolGlobal;
  permisos: Record<string, NivelAcceso>; // modulo_id -> NivelAcceso
}

interface UsuariosState {
  roles: RolGlobalDB[];
  permisos: PermisoModuloDB[];
  
  fetchConfiguracion: () => Promise<void>;
  setRolGlobal: (id_trabajador: string, rol_global: RolGlobal) => Promise<void>;
  setPermisoModulo: (id_trabajador: string, modulo_id: string, nivel_acceso: NivelAcceso) => Promise<void>;
  
  // Helpers
  getUsuarioConfig: (id_trabajador: string) => UsuarioConfig;
}

export const useUsuariosStore = create<UsuariosState>()(
  persist(
    (set, get) => ({
      roles: [{ id_trabajador: "t-1", rol_global: "Super Admin" }], // Mock default para que t-1 sea Super Admin
      permisos: [],

      fetchConfiguracion: async () => {
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from("usuarios_roles_globales")
            .select("*");
          
          if (rolesError) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[usuarios-store] Tabla de roles no disponible. Usando datos locales.", rolesError.message);
            }
            return;
          }

          const { data: permisosData, error: permisosError } = await supabase
            .from("usuarios_permisos_modulos")
            .select("*");

          if (permisosError) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[usuarios-store] Tabla de permisos no disponible. Usando datos locales.", permisosError.message);
            }
            return;
          }

          if (rolesData) {
            set({ roles: rolesData });
          }
          if (permisosData) {
            set({ permisos: permisosData });
          }

        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[usuarios-store] Fallo de red al conectar con Supabase:", err);
          }
        }
      },

      setRolGlobal: async (id_trabajador, rol_global) => {
        set((state) => {
          const roles = [...state.roles];
          const index = roles.findIndex((r) => r.id_trabajador === id_trabajador);
          if (index >= 0) {
            roles[index] = { ...roles[index], rol_global };
          } else {
            roles.push({ id_trabajador, rol_global });
          }
          return { roles };
        });

        try {
          const { error } = await supabase
            .from("usuarios_roles_globales")
            .upsert({ id_trabajador, rol_global }, { onConflict: 'id_trabajador' });
          
          if (error) throw error;
        } catch (err) {
          console.warn("Fallo persistiendo rol en Supabase:", err);
        }
      },

      setPermisoModulo: async (id_trabajador, modulo_id, nivel_acceso) => {
        set((state) => {
          const permisos = [...state.permisos];
          const index = permisos.findIndex(
            (p) => p.id_trabajador === id_trabajador && p.modulo_id === modulo_id
          );
          if (index >= 0) {
            permisos[index] = { ...permisos[index], nivel_acceso };
          } else {
            permisos.push({ id_trabajador, modulo_id, nivel_acceso });
          }
          return { permisos };
        });

        try {
          const { error } = await supabase
            .from("usuarios_permisos_modulos")
            .upsert(
              { id_trabajador, modulo_id, nivel_acceso },
              { onConflict: 'id_trabajador, modulo_id' }
            );

          if (error) throw error;
        } catch (err) {
          console.warn("Fallo persistiendo permiso en Supabase:", err);
        }
      },

      getUsuarioConfig: (id_trabajador) => {
        const { roles, permisos } = get();
        const rolBase = roles.find((r) => r.id_trabajador === id_trabajador)?.rol_global || "Usuario";
        const permisosTrabajador = permisos.filter((p) => p.id_trabajador === id_trabajador);
        
        const configPermisos: Record<string, NivelAcceso> = {};
        
        // Inicializar todos los módulos en "No Ver" o con su valor guardado
        MODULOS_SISTEMA.forEach((mod) => {
          const guardado = permisosTrabajador.find((p) => p.modulo_id === mod.id);
          configPermisos[mod.id] = guardado ? guardado.nivel_acceso : "No Ver";
        });

        return {
          id_trabajador,
          rol_global: rolBase,
          permisos: configPermisos
        };
      }
    }),
    {
      name: "monitoring-usuarios-v1"
    }
  )
);
