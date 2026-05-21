"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
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