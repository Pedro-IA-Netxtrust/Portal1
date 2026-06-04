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
      className={`relative flex flex-col bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } ${className}`}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-wider">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg glow-primary">
            M
          </div>
          {!isCollapsed && (
            <span className="text-white text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              MONITORING
            </span>
          )}
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar trabajador o RUT..." 
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive 
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-blue-500" : "text-zinc-400"}`} />
              
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  item.badge === "New" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed view */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold border border-zinc-700 text-xs">
            OP
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">Operador General</p>
              <span className="text-[10px] text-zinc-500 block truncate">soporte@monitoring.cl</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
