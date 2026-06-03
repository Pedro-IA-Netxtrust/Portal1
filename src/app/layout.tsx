import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/custom/sidebar";
import { Bell, CloudLightning, ShieldAlert } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Monitoring SPA",
  description: "Sistema centralizado de control operativo, contratos y recursos de personal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-zinc-950 text-zinc-100 font-sans">
        {/* Main Panel */}
        <div className="flex w-full min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* App Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header / Topbar */}
            <header className="h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
                  Base Central Operativa
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* System Status Indicators */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-xs font-medium">
                  <CloudLightning size={12} />
                  <span>Conexión Estable</span>
                </div>

                {/* Notifications Button */}
                <button className="relative p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-800">
                  <Bell size={16} />
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                </button>

                {/* System Alerts */}
                <button className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-800">
                  <ShieldAlert size={16} />
                </button>
              </div>
            </header>

            {/* Scrollable Content Container */}
            <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
