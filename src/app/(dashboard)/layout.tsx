"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";
import { syncAndGetUser } from "@/app/actions/user";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();

  useEffect(() => {
    // Sincronizar usuário ao entrar no painel
    syncAndGetUser().then((res) => {
      if (res.success) {
        console.log("🌌 [DB Sync] Usuário sincronizado com o Supabase!");
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative cursor-none">
      <CustomCursor />
      <Sidebar />
      <Header />
      <motion.main
        initial={false}
        animate={{ 
          paddingLeft: sidebarOpen ? 256 : 80,
          paddingTop: 64,
        }}
        transition={{ duration: 0.2 }}
        className="min-h-screen p-6"
      >
        {children}
      </motion.main>
    </div>
  );
}