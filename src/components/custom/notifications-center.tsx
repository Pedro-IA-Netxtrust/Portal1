"use client";

import React, { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Check,
} from "lucide-react";
import {
  useNotificacionesStore,
  Notificacion,
  NivelNotificacion,
} from "@/store/notificaciones-store";

const NIVEL_CONFIG: Record<
  NivelNotificacion,
  { icon: React.ReactNode; bg: string; text: string; dot: string }
> = {
  info: {
    icon: <Info size={18} />,
    bg: "bg-blue-50",
    text: "text-blue-900",
    dot: "bg-blue-500",
  },
  advertencia: {
    icon: <AlertTriangle size={18} />,
    bg: "bg-amber-50",
    text: "text-amber-900",
    dot: "bg-amber-500",
  },
  critica: {
    icon: <AlertCircle size={18} />,
    bg: "bg-red-50",
    text: "text-red-900",
    dot: "bg-red-500",
  },
  exito: {
    icon: <CheckCircle2 size={18} />,
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
  },
};

function formatFecha(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotificationsCenter() {
  const [open, setOpen] = useState(false);
  const { notificaciones, markRead, removeNotification, clear } =
    useNotificacionesStore(
      useShallow((s) => ({
        notificaciones: s.notificaciones,
        markRead: s.markRead,
        removeNotification: s.removeNotification,
        clear: s.clear,
      }))
    );

  const noLeidas = notificaciones.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={22} className="text-slate-600" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-slate-700" />
                <h3 className="font-bold text-slate-900">Notificaciones</h3>
                {noLeidas > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                    {noLeidas} nuevas
                  </span>
                )}
              </div>
              {notificaciones.length > 0 && (
                <button
                  onClick={clear}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell size={26} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    No tienes notificaciones
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notificaciones.map((n) => (
                    <NotificacionItem
                      key={n.id}
                      noti={n}
                      onMarkRead={() => markRead(n.id)}
                      onRemove={() => removeNotification(n.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificacionItem({
  noti,
  onMarkRead,
  onRemove,
}: {
  noti: Notificacion;
  onMarkRead: () => void;
  onRemove: () => void;
}) {
  const config = NIVEL_CONFIG[noti.nivel || "info"];

  return (
    <li
      className={`p-3 flex gap-3 transition-colors ${
        noti.read ? "bg-white" : config.bg
      } hover:bg-slate-50`}
    >
      <div className={`${config.text} flex-shrink-0 mt-0.5`}>{config.icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {!noti.read && (
            <span
              className={`${config.dot} w-2 h-2 rounded-full flex-shrink-0 mt-1.5`}
            />
          )}
          <p
            className={`text-sm font-semibold ${
              noti.read ? "text-slate-700" : config.text
            }`}
          >
            {noti.titulo}
          </p>
        </div>
        {noti.mensaje && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {noti.mensaje}
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-1">{formatFecha(noti.fecha)}</p>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        {!noti.read && (
          <button
            onClick={onMarkRead}
            className="p-1 rounded hover:bg-slate-200 text-slate-500"
            title="Marcar como leída"
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-slate-200 text-slate-400"
          title="Eliminar"
        >
          <X size={14} />
        </button>
      </div>
    </li>
  );
}
