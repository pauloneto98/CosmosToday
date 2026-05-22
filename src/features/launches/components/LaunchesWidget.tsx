"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { mockLaunches, formatCountdown, getStatusColor, type Launch } from "@/lib/external/launch-library";
import { Rocket, Clock, Play, ExternalLink } from "lucide-react";

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 text-xs">
      <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
      <span className="text-[var(--color-text)] font-mono">
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

export function LaunchesWidget() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchLaunches();
  }, []);

  const fetchLaunches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nasa/launches");
      if (!res.ok) throw new Error("API error");
      const data: Launch[] = await res.json();
      setLaunches(data.slice(0, 5));
      setUseMock(false);
    } catch {
      setLaunches(mockLaunches);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} className="w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (launches.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchLaunches}>
        <div className="flex flex-col items-center justify-center py-8">
          <Rocket className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Lançamentos</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Lançamentos</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
        {launches.map((launch, index) => (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {launch.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {launch.rocket?.configuration.name || "Rocket"} • {launch.pad?.location.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Countdown targetDate={launch.window_start} />
                  <Badge variant={getStatusColor(launch.status.abbrev)} className="text-[10px]">
                    {launch.status.abbrev}
                  </Badge>
                </div>
              </div>
              {launch.webcast_live && (
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <Play className="w-4 h-4 text-red-400" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={fetchLaunches} className="w-full mt-3 text-sm text-[var(--color-primary)] hover:underline">
        Atualizar →
      </button>
    </Card>
  );
}