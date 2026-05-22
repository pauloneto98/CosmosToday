"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockSolarEvents, getEventTypeLabel, getEventTypeColor, type SolarEvent } from "@/lib/nasa/donki";
import { Sun, Activity, ExternalLink } from "lucide-react";

export function SolarWeatherWidget() {
  const [events, setEvents] = useState<SolarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [level, setLevel] = useState<"calm" | "moderate" | "elevated" | "storm">("calm");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nasa/solar");
      if (!res.ok) throw new Error("API error");
      const data: { events: SolarEvent[] } = await res.json();

      setEvents(data.events.slice(0, 8));
      setUseMock(false);

      if (data.events.some(e => e.type === "GST")) {
        setLevel("storm");
      } else if (data.events.some(e => e.type === "CME")) {
        setLevel("elevated");
      } else if (data.events.some(e => e.type === "FLR")) {
        setLevel("moderate");
      }
    } catch {
      setEvents(mockSolarEvents);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  const levelConfig = {
    calm: { color: "#10B981", label: "Calmo", bg: "bg-green-500/20" },
    moderate: { color: "#F59E0B", label: "Moderado", bg: "bg-yellow-500/20" },
    elevated: { color: "#F97316", label: "Elevado", bg: "bg-orange-500/20" },
    storm: { color: "#EF4444", label: "Tempestade", bg: "bg-red-500/20" },
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="circular" width={80} height={80} className="mx-auto mb-4" />
          <Skeleton variant="text" height={24} className="w-1/2 mx-auto" />
          <Skeleton variant="text" height={16} className="w-full" />
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchEvents}>
        <div className="flex flex-col items-center justify-center py-8">
          <Sun className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Clima Solar</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Clima Solar</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="flex flex-col items-center mb-4">
        <div className={`relative w-24 h-12 rounded-t-full ${levelConfig[level].bg} flex items-end justify-center overflow-hidden`}>
          <div 
            className="w-16 h-16 rounded-full transition-all duration-500"
            style={{ 
              background: `conic-gradient(from 180deg, ${levelConfig[level].color} 0%, ${levelConfig[level].color} 60%, transparent 60%)`,
            }}
          />
        </div>
        <Badge variant={level === "storm" ? "danger" : level === "elevated" ? "warning" : "primary"} className="mt-2">
          {levelConfig[level].label}
        </Badge>
      </div>

      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-2 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <Badge variant={getEventTypeColor(event.type)}>
                {getEventTypeLabel(event.type)}
              </Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {new Date(event.beginTime).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text)] mt-1 truncate">
              {event.title}
            </p>
          </motion.div>
        ))}
      </div>

      <button
        onClick={fetchEvents}
        className="w-full mt-3 text-sm text-[var(--color-primary)] hover:underline"
      >
        Atualizar →
      </button>
    </Card>
  );
}