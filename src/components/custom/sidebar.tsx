"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  FileText, 
  Ticket, 
  GraduationCap, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Settings,
  Shield,
  Search,
  Car,
  Laptop,
  ClipboardCheck,
  ClipboardPen,
  CalendarDays,
  UserCog,
  Star,
  Utensils,
  Store,
  Megaphone,
  History,
  GitBranch,
  ShieldAlert,
  Warehouse
} from "lucide-react";

// Tipo minimo para los iconos de lucide-react. Aceptan { size, color, className,
// strokeWidth }; modelarlo asi nos evita el `any` en cada NavItem.
type LucideIconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
};
type LucideIcon = React.ComponentType<LucideIconProps>;

interface NavItem {
  type: "item";
  name: string;
  href: string;
  icon: LucideIcon;
  badge: string | null;
}

interface NavSubItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge: string | null;
}

interface NavGroup {
  type: "group";
  id: string;
  name: string;
  icon: LucideIcon;
  items: NavSubItem[];
}

type NavConfigItem = NavItem | NavGroup;

interface SidebarProps {
  className?: string;
}

// La nav es estatica: la elevamos al modulo para que no se recree en
// cada render y para que `useEffect` pueda omitirla como dep sin warning.
const NAV_CONFIG: NavConfigItem[] = [
  { type: "item", name: "Dashboard", href: "/", icon: Activity, badge: null },
  { type: "item", name: "Trabajadores", href: "/trabajadores", icon: Users, badge: "Activo" },
  {
    type: "group",
    id: "administracion",
    name: "Administración",
    icon: UserCog,
    items: [
      { name: "Contratos", href: "/contratos", icon: FileText, badge: null },
      { name: "Vehículos", href: "/vehiculos", icon: Car, badge: null },
      { name: "Proveedores", href: "/proveedores", icon: Store, badge: "Nuevo" },
      { name: "Busca Talento", href: "/talentos", icon: Star, badge: "Nuevo" },
      { name: "Notebooks", href: "/notebooks", icon: Laptop, badge: null },
      { name: "Auditoria", href: "/auditoria", icon: History, badge: null },
      { name: "Flujos de Información", href: "/flujos", icon: GitBranch, badge: "Nuevo" },
      { name: "Inventario de EPP", href: "/inventario", icon: Warehouse, badge: "Nuevo" },
    ]
  },
  {
    type: "group",
    id: "utilidades",
    name: "Utilidades",
    icon: Settings,
    items: [
      { name: "Acceso SAP", href: "/sap", icon: Shield, badge: "Nuevo" },
      { name: "Comunicaciones", href: "/comunicaciones", icon: Megaphone, badge: null },
      { name: "Asistencia", href: "/asistencia", icon: CalendarDays, badge: null },
      { name: "Reuniones", href: "/reuniones", icon: ClipboardCheck, badge: "Nuevo" },
      { name: "Alimentación", href: "/alimentacion", icon: Utensils, badge: "Nuevo" },
      { name: "Solicitudes", href: "/solicitudes", icon: ClipboardPen, badge: "New" },
      { name: "Entrega de EPP", href: "/epp", icon: ShieldAlert, badge: "Nuevo" },
    ]
  },
  {
    type: "group",
    id: "seguridad",
    name: "Seguridad",
    icon: Shield,
    items: [
      { name: "Inspección", href: "/vehiculos/inspecciones", icon: ClipboardCheck, badge: null },
      { name: "Cursos y Exámenes", href: "/control", icon: GraduationCap, badge: null },
    ]
  },
  { type: "item", name: "Tickets IT", href: "/tickets", icon: Ticket, badge: null },
  { type: "item", name: "Usuarios", href: "/usuarios", icon: UserCog, badge: "Config" }
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State to track which group folders are open (when expanded)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    administracion: false,
    utilidades: false,
    seguridad: false,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navConfig = NAV_CONFIG;

  // Auto-expand group if a subitem matches the active pathname on load/navigation
  useEffect(() => {
    const activeGroup = NAV_CONFIG.find(
      (item): item is NavGroup => 
        item.type === "group" && 
        item.items.some((sub) => pathname === sub.href || (sub.href !== "/" && pathname.startsWith(sub.href)))
    );
    if (activeGroup && activeGroup.id) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [pathname]);

  return (
    <aside 
      className={`relative flex flex-col bg-primary text-text-inverse transition-all duration-300 z-50 shadow-lg ${
        isCollapsed ? "w-20" : "w-64"
      } ${className}`}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-wider">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-primary font-black text-xl shadow-sm">
            M
          </div>
          {!isCollapsed && (
            <span className="text-text-inverse text-lg font-black tracking-widest">
              MONITORING
            </span>
          )}
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="px-4 py-5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <input 
              type="text" 
              placeholder="Buscar trabajador o RUT..." 
              className="w-full bg-white/10 border border-transparent text-white rounded-lg py-2 pl-9 pr-4 text-xs font-medium placeholder:text-white/50 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {navConfig.map((item) => {
          if (item.type === "item") {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all group relative ${
                  isActive 
                    ? "bg-[#112f68] text-white font-bold shadow-inner" 
                    : "text-white/75 font-semibold hover:text-white hover:bg-white/10"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-md"></div>
                )}
                <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-secondary" : "text-white/75"}`} />
                
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === "New" || item.badge === "Nuevo"
                      ? "bg-secondary text-white" 
                      : "bg-white/20 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed view */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0b1f47] text-white text-xs font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg border border-white/10">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          } else {
            // Dropdown Group Folder
            const GroupIcon = item.icon;
            const hasActiveSubitem = item.items.some(sub => pathname === sub.href || (sub.href !== "/" && pathname.startsWith(sub.href)));
            
            return (
              <div key={item.id} className="relative group/group-container">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all cursor-pointer ${
                    hasActiveSubitem && !isCollapsed
                      ? "text-white font-bold bg-white/5"
                      : "text-white/75 font-semibold hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={18} className={`flex-shrink-0 transition-transform ${hasActiveSubitem ? "text-secondary" : "text-white/75"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    openGroups[item.id] ? <ChevronDown size={14} className="text-white/50" /> : <ChevronRight size={14} className="text-white/50" />
                  )}
                </button>

                {/* Expanded Submenu Items */}
                {!isCollapsed && openGroups[item.id] && (
                  <div className="mt-1 pl-4 space-y-1 border-l border-white/10 ml-5 animate-slideDown">
                    {item.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href || (subItem.href !== "/" && pathname.startsWith(subItem.href));
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs transition-all ${
                            isSubActive
                              ? "bg-[#112f68]/85 text-white font-bold"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <SubIcon size={14} className="flex-shrink-0" />
                          <span className="truncate">{subItem.name}</span>
                          {subItem.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-secondary text-white ml-auto">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Collapsed Popover (hover menu) */}
                {isCollapsed && (
                  <div className="absolute left-full top-0 ml-2 w-56 bg-[#0b1f47] border border-white/10 rounded-xl py-2 shadow-2xl opacity-0 invisible group-hover/group-container:opacity-100 group-hover/group-container:visible transition-all duration-200 z-50">
                    <div className="text-white/50 text-[10px] font-bold px-3 py-1.5 border-b border-white/5 uppercase tracking-wider mb-1">
                      {item.name}
                    </div>
                    {item.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href || (subItem.href !== "/" && pathname.startsWith(subItem.href));
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all ${
                            isSubActive
                              ? "bg-[#112f68] text-white font-bold"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <SubIcon size={14} className="flex-shrink-0" />
                          <span className="truncate">{subItem.name}</span>
                          {subItem.badge && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-secondary text-white ml-auto">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            OP
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Operador General</p>
              <span className="text-[11px] text-white/60 font-medium block truncate">soporte@monitoring.cl</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
