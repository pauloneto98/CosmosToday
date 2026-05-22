"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDistance, formatVelocity, mockAsteroids, type Asteroid } from "@/lib/nasa/neows";
import { AlertTriangle, Orbit, TrendingUp } from "lucide-react";

export function AsteroidsWidget() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchAsteroids();
  }, []);

  const fetchAsteroids = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nasa/asteroids");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const allAsteroids: Asteroid[] = Object.values(data.near_earth_objects).flat() as Asteroid[];
      setAsteroids(allAsteroids.slice(0, 10));
      setUseMock(false);
    } catch {
      setAsteroids(mockAsteroids);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="text" height={24} className="w-1/2" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} className="w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (asteroids.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchAsteroids}>
        <div className="flex flex-col items-center justify-center py-8">
          <Orbit className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Asteroides próximos da Terra</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Asteroides</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {asteroids.map((asteroid, index) => {
          const approach = asteroid.close_approach_data[0];
          return (
            <motion.div
              key={asteroid.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {asteroid.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                    <span>{formatDistance(approach.miss_distance.kilometers)}</span>
                    <span>{formatVelocity(approach.relative_velocity.kilometers_per_hour)}</span>
                  </div>
                </div>
                {asteroid.is_potentially_hazardous_asteroid && (
                  <Badge variant="danger" pulse>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Perigoso
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Diâmetro: {asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}-
                {asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m
              </p>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={fetchAsteroids}
        className="w-full mt-4 text-sm text-[var(--color-primary)] hover:underline"
      >
        Atualizar →
      </button>
    </Card>
  );
}