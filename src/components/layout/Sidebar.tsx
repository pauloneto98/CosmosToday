"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { 
  Home, 
  Image, 
  Map, 
  Satellite, 
  Orbit, 
  Sun, 
  Newspaper, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { syncAndGetUser } from "@/app/actions/user";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Image, label: "Galeria", href: "/dashboard/gallery" },
  { icon: Map, label: "Mapa", href: "/dashboard/map" },
  { icon: Satellite, label: "Satélites", href: "/dashboard/satellites" },
  { icon: Orbit, label: "Asteroides", href: "/dashboard/asteroids" },
  { icon: Sun, label: "Clima Solar", href: "/dashboard/solar" },
  { icon: Newspaper, label: "Notícias", href: "/dashboard/news" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    syncAndGetUser().then((res) => {
      if (res.success && res.user?.role === "admin") {
        setIsAdmin(true);
      }
    });
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      className="fixed left-0 top-0 h-screen bg-[var(--color-surface)] border-r border-white/5 z-40"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold font-[family-name:var(--font-display)]"
              >
                <span className="text-[var(--color-primary)]">Cosmos</span>
                <span className="text-[var(--color-text)]">Daily</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-[var(--color-text-muted)]" />
            ) : (
              <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" 
                    : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* Link do Admin condicional */}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border border-amber-500/20 bg-amber-500/5
                ${pathname === "/dashboard/admin" 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-400"}
              `}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    Admin Panel
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/5">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[var(--color-text-muted)] text-center"
              >
                v1.0.0
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}