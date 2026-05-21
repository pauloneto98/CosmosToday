"use client";

import { useAppStore } from "@/store/app-store";
import { Search, Bell, User } from "lucide-react";
import { motion } from "framer-motion";

import { UserButton } from "@clerk/nextjs";

export function Header() {
  const { sidebarOpen } = useAppStore();

  return (
    <motion.header
      initial={false}
      animate={{ 
        paddingLeft: sidebarOpen ? 256 : 80 
      }}
      className="fixed top-0 right-0 left-0 h-16 bg-[var(--color-surface)]/80 backdrop-blur-lg border-b border-white/5 z-30"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-secondary)] rounded-full" />
          </button>
          
          <div className="flex items-center justify-center pl-1">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-full border border-cyan-500/30",
                  userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}