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
  UserCog
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
    { name: "Asistencia", href: "/asistencia", icon: CalendarDays, badge: "Nuevo" },
    { name: "Contratos", href: "/contratos", icon: FileText, badge: null },
    { name: "Vehículos", href: "/vehiculos", icon: Car, badge: null },
    { name: "Inspecciones ECF 4", href: "/vehiculos/inspecciones", icon: ClipboardCheck, badge: null },
    { name: "Notebooks", href: "/notebooks", icon: Laptop, badge: null },
    { name: "Cursos y Exámenes", href: "/control", icon: GraduationCap, badge: null },
    { name: "Tickets IT", href: "/tickets", icon: Ticket, badge: null },
    { name: "Solicitudes", href: "/solicitudes", icon: ClipboardPen, badge: "New" },
    { name: "Usuarios", href: "/usuarios", icon: UserCog, badge: "Config" },
  ];

  return (
    <aside 
      className={`relative flex flex-col bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } ${className}`}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wider">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-black text-lg">
            M
          </div>
          {!isCollapsed && (
            <span className="text-text-primary text-lg font-bold">
              MONITORING
            </span>
          )}
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-brand-blue transition-colors border border-transparent hover:border-border"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Buscar trabajador o RUT..." 
              className="w-full bg-bg-secondary border border-border text-text-primary rounded-md py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative ${
                isActive 
                  ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" 
                  : "text-text-secondary hover:text-brand-blue hover:bg-bg-secondary border border-transparent"
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-brand-blue" : "text-text-secondary"}`} />
              
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  item.badge === "New" 
                    ? "bg-warning/10 text-warning border border-warning/20" 
                    : "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed view */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-text-primary border border-text-secondary text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-level-2">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border bg-bg-secondary/50 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-brand-blue font-bold border border-border shadow-sm text-xs">
            OP
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">Operador General</p>
              <span className="text-[11px] text-text-secondary font-medium block truncate">soporte@monitoring.cl</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
