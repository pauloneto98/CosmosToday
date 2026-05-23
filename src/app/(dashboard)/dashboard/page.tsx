"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { APODWidget } from "@/features/apod/components/APODWidget";
import { AsteroidsWidget } from "@/features/asteroids/components/AsteroidsWidget";
import { SolarWeatherWidget } from "@/features/solar-weather/components/SolarWeatherWidget";
import { EPICWidget } from "@/features/earth-imagery/components/EPICWidget";
import { LaunchesWidget } from "@/features/launches/components/LaunchesWidget";
import { ISSTrackerWidget } from "@/features/iss-tracker/components/ISSTrackerWidget";
import { MarsRoverWidget } from "@/features/mars-rover/components/MarsRoverWidget";
import { ExoplanetsWidget } from "@/features/exoplanets/components/ExoplanetsWidget";
import { NewsWidget } from "@/features/news/components/NewsWidget";
import { getUserSubscription } from "@/app/actions/user";
import { Sparkles, Crown } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [planType, setPlanType] = useState<string>("demo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSubscription().then((res) => {
      if (res.success) {
        setPlanType(res.planType);
      }
      setLoading(false);
    });
  }, []);

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
            Bem-vindo ao CosmosDaily — Seu portal de exploração espacial
          </p>
        </div>
        
        {!loading && (
          <div>
            {planType === "explorer" ? (
              <Badge variant="primary" pulse className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-200" />
                Explorer
              </Badge>
            ) : planType === "family" ? (
              <Badge variant="accent" pulse className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-200 animate-bounce" />
                Cosmos VIP
              </Badge>
            ) : (
              <Badge variant="warning">Demo Limitada</Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Banner Persuasivo para Usuários Demo */}
      {!loading && planType === "demo" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,212,255,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0" />
            <p className="text-sm text-cyan-200/90 font-medium text-center sm:text-left">
              Você está no plano de <strong>Demo Gratuita Limitada</strong>. Faça o upgrade por apenas R$ 5 para liberar satélites, ISS ao vivo e clima espacial NOAA!
            </p>
          </div>
          <Link href="/dashboard/settings" className="relative z-10">
            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold whitespace-nowrap shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              Fazer Upgrade
            </Button>
          </Link>
        </motion.div>
      )}

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
          Todos os dados são carregados em tempo real de servidores públicos científicos.
        </p>
      </div>
    </div>
  );
}