"use client";

import { motion } from "framer-motion";
import { useISSPosition } from "@/hooks/useISSPosition";
import { Badge } from "@/components/ui/Badge";

export function ISSBadge() {
  const { position, loading } = useISSPosition();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="inline-flex items-center gap-2 glass px-4 py-2"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-primary)]"></span>
      </span>
      
      <span className="text-sm text-[var(--color-text)]">
        🛸 ISS
      </span>
      
      {loading ? (
        <span className="text-xs text-[var(--color-text-muted)]">Carregando...</span>
      ) : position ? (
        <Badge variant="primary">
          {position.altitude.toFixed(0)}km altitude
        </Badge>
      ) : (
        <Badge variant="default">Offline</Badge>
      )}
    </motion.div>
  );
}