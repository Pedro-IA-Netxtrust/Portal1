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
      <body className="min-h-full flex text-text font-sans">
        {/* Main Panel */}
        <div className="flex w-full min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* App Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
            {/* Header / Topbar */}
            <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                <span className="text-xs font-bold text-text tracking-wider uppercase">
                  Base Central Operativa
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* System Status Indicators */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-alt border border-border text-primary rounded-lg text-xs font-bold shadow-sm">
                  <CloudLightning size={16} />
                  <span>Conexión Estable</span>
                </div>

                {/* Notifications Button */}
                <button className="relative p-2 rounded-lg hover:bg-bg-alt text-text-soft hover:text-primary transition-all">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-white"></span>
                </button>

                {/* System Alerts */}
                <button className="p-2 rounded-lg hover:bg-bg-alt text-text-soft hover:text-primary transition-all">
                  <ShieldAlert size={20} />
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
