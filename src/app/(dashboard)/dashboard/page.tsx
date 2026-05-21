"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { APODWidget } from "@/features/apod/components/APODWidget";
import { AsteroidsWidget } from "@/features/asteroids/components/AsteroidsWidget";
import { SolarWeatherWidget } from "@/features/solar-weather/components/SolarWeatherWidget";
import { EPICWidget } from "@/features/earth-imagery/components/EPICWidget";
import { LaunchesWidget } from "@/features/launches/components/LaunchesWidget";
import { ISSTrackerWidget } from "@/features/iss-tracker/components/ISSTrackerWidget";
import { MarsRoverWidget } from "@/features/mars-rover/components/MarsRoverWidget";
import { ExoplanetsWidget } from "@/features/exoplanets/components/ExoplanetsWidget";
import { NewsWidget } from "@/features/news/components/NewsWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)]">
            Dashboard
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Bem-vindo ao CosmosDaily
          </p>
        </div>
        <Badge variant="primary">Free Plan</Badge>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <APODWidget />
        <ISSTrackerWidget />
        <AsteroidsWidget />
        <SolarWeatherWidget />
        <EPICWidget />
        <LaunchesWidget />
        <MarsRoverWidget />
        <ExoplanetsWidget />
        <NewsWidget />
      </div>

      <div className="text-center py-8">
        <p className="text-[var(--color-text-muted)] text-sm">
          Configure NASA_API_KEY no .env.local para dados reais
        </p>
      </div>
    </div>
  );
}