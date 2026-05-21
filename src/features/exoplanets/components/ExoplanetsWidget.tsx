"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { getExoplanets, mockExoplanets, formatExoplanetSize, formatExoplanetTemp, getHabitabilityClass, type Exoplanet } from "@/lib/nasa/exoplanets";
import { Star, Thermometer, Ruler, Calendar } from "lucide-react";

export function ExoplanetsWidget() {
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    fetchExoplanets();
  }, []);

  const fetchExoplanets = async () => {
    setLoading(true);
    try {
      const data = await getExoplanets(10);
      const parsed = data.data.map(row => {
        const obj: Record<string, string | number | null> = {};
        data.fields.forEach((field, i) => {
          obj[field] = row[i];
        });
        return obj as unknown as Exoplanet;
      });
      setExoplanets(parsed.slice(0, 5));
      setUseMock(false);
    } catch {
      setExoplanets(mockExoplanets);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={80} className="w-full" />
          <Skeleton variant="text" height={24} className="w-1/2" />
        </div>
      </Card>
    );
  }

  if (exoplanets.length === 0) {
    return (
      <Card className="cursor-pointer hover:border-[var(--color-primary)]/50" onClick={fetchExoplanets}>
        <div className="flex flex-col items-center justify-center py-8">
          <Star className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
          <p className="text-[var(--color-text-muted)] mb-2">Exoplanetas</p>
          <p className="text-sm text-[var(--color-primary)]">Clique para carregar</p>
        </div>
      </Card>
    );
  }

  const featured = exoplanets[0];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">Exoplanetas</h3>
        </div>
        {useMock && <Badge variant="warning">Demo</Badge>}
      </div>

      <div className="p-4 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={
            getHabitabilityClass(featured.pl_eqt) === "habitable" ? "primary" :
            getHabitabilityClass(featured.pl_eqt) === "too-hot" ? "danger" :
            getHabitabilityClass(featured.pl_eqt) === "too-cold" ? "warning" : "secondary"
          }>
            {getHabitabilityClass(featured.pl_eqt) === "habitable" ? "✓ Potencialmente habitável" :
             getHabitabilityClass(featured.pl_eqt) === "too-hot" ? "Muito quente" :
             getHabitabilityClass(featured.pl_eqt) === "too-cold" ? "Muito frio" : "Desconhecido"}
          </Badge>
        </div>
        <h4 className="text-lg font-bold text-[var(--color-text)]">{featured.pl_name}</h4>
      </div>

      <div className="space-y-3">
        {exoplanets.slice(1).map((exo, index) => (
          <motion.div
            key={exo.pl_name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-2 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text)]">{exo.pl_name}</span>
              <Badge variant="default" className="text-xs">
                {exo.disc_year || "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {formatExoplanetSize(exo.pl_rade)}
              </span>
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {formatExoplanetTemp(exo.pl_eqt)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <button onClick={fetchExoplanets} className="w-full mt-3 text-sm text-[var(--color-primary)] hover:underline">
        Atualizar →
      </button>
    </Card>
  );
}