"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  FileText, 
  Ticket, 
  Cpu, 
  GraduationCap, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
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
  History
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: Activity, badge: null },
    { name: "Trabajadores", href: "/trabajadores", icon: Users, badge: "Activo" },
    { name: "Busca Talento", href: "/talentos", icon: Star, badge: "Nuevo" },
    { name: "Asistencia", href: "/asistencia", icon: CalendarDays, badge: null },
    { name: "Alimentación", href: "/alimentacion", icon: Utensils, badge: "Nuevo" },
    { name: "Proveedores", href: "/proveedores", icon: Store, badge: "Nuevo" },
    { name: "Comunicaciones", href: "/comunicaciones", icon: Megaphone, badge: null },
    { name: "Contratos", href: "/contratos", icon: FileText, badge: null },
    { name: "Vehículos", href: "/vehiculos", icon: Car, badge: null },
    { name: "Inspecciones ECF 4", href: "/vehiculos/inspecciones", icon: ClipboardCheck, badge: null },
    { name: "Notebooks", href: "/notebooks", icon: Laptop, badge: null },
    { name: "Cursos y Exámenes", href: "/control", icon: GraduationCap, badge: null },
    { name: "Tickets IT", href: "/tickets", icon: Ticket, badge: null },
    { name: "Solicitudes", href: "/solicitudes", icon: ClipboardPen, badge: "New" },
    { name: "Auditoria", href: "/auditoria", icon: History, badge: null },
    { name: "Usuarios", href: "/usuarios", icon: UserCog, badge: "Config" },
  ];

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
          className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
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
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
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

              {/* Badge */}
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
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#0b1f47] text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg border border-white/10">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
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
