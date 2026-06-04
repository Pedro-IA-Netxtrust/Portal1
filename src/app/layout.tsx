import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/custom/sidebar";
import { Bell, CloudLightning, ShieldAlert } from "lucide-react";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground font-sans">
        {/* Main Panel */}
        <div className="flex w-full min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* App Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header / Topbar */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-10 shadow-level-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse"></span>
                <span className="text-xs font-bold text-text-primary tracking-wider uppercase">
                  Base Central Operativa
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* System Status Indicators */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border text-brand-blue rounded-md text-xs font-semibold">
                  <CloudLightning size={14} />
                  <span>Conexión Estable</span>
                </div>

                {/* Notifications Button */}
                <button className="relative p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-brand-blue transition-colors border border-transparent hover:border-border">
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-warning border-2 border-white"></span>
                </button>

                {/* System Alerts */}
                <button className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-brand-blue transition-colors border border-transparent hover:border-border">
                  <ShieldAlert size={18} />
                </button>
              </div>
            </header>

            {/* Scrollable Content Container */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
