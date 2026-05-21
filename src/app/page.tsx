"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ISSBadge } from "@/components/animations/ISSBadge";
import { StarField } from "@/components/animations/StarField";
import { Counter } from "@/components/animations/Counter";
import { ArrowRight, Rocket, Globe, Satellite, Sun, Moon, Star } from "lucide-react";

const EarthGlobe = dynamic(
  () => import("@/components/globe/EarthGlobe").then((mod) => ({ default: mod.EarthGlobe })),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center text-[var(--color-text-muted)]">Carregando...</div> }
);

const features = [
  { icon: Rocket, title: "Lançamentos", description: "Acompanhe lançamentos em tempo real" },
  { icon: Globe, title: "Terra do Espaço", description: "Imagens EPIC da Terra vista do espaço" },
  { icon: Satellite, title: "Satélites", description: "Mapa interativo de satélites em órbita" },
  { icon: Sun, title: "Clima Solar", description: "Tempestades solares e eventos solares" },
  { icon: Moon, title: "Marte", description: "Fotos dos rovers em Marte" },
  { icon: Star, title: "Exoplanetas", description: "Descobertas de planetas fuera do sistema solar" },
];

interface Plan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  description: string;
  features: string[];
  variant: "primary" | "secondary" | "ghost";
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    monthlyPrice: "R$0",
    yearlyPrice: "R$0",
    period: "/mês",
    description: "Para começar",
    features: ["Foto Astronômica do Dia", "ISS Tracker básico", "5 alertas por mês"],
    variant: "ghost",
  },
  {
    name: "Explorer",
    monthlyPrice: "R$14,90",
    yearlyPrice: "R$11,92",
    period: "/mês",
    popular: true,
    description: "Para entusiastas",
    features: ["Tudo do Free", "Downloads em HD", "Notificações push", "Mapa de satélites completo", "Alertas ilimitados"],
    variant: "primary",
  },
  {
    name: "Família",
    monthlyPrice: "R$24,90",
    yearlyPrice: "R$19,92",
    period: "/mês",
    description: "Para a família",
    features: ["Tudo do Explorer", "5 usuários", "Modo kids", "API access pessoal"],
    variant: "secondary",
  },
];

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen stars-bg hero-gradient">
      <StarField />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold font-[family-name:var(--font-display)]">
          <span className="text-[var(--color-primary)]">Cosmos</span>
          <span className="text-[var(--color-text)]">Daily</span>
        </motion.div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">Entrar</Button>
          <Button variant="primary" size="sm">Começar grátis</Button>
        </div>
      </nav>

      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-4">
              <ISSBadge />
              
              <h1 className="text-5xl lg:text-7xl font-bold font-[family-name:var(--font-display)] leading-tight">
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="block text-[var(--color-text)]">
                  O Universo
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="block text-[var(--color-primary)]">
                  Ao Vivo,
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="block text-[var(--color-text)]">
                  Todo Dia
                </motion.span>
              </h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl text-[var(--color-text-muted)] max-w-lg">
                Fotos, missões, asteroides e satélites da NASA em tempo real — em português
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
              <Button size="lg" shimmer>
                Começar grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="ghost" size="lg">Ver demo</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] border-2 border-[var(--color-bg)]" />
                ))}
              </div>
              <div>
                <div className="text-[var(--color-text)] font-medium">
                  <Counter end={12847} suffix="+ entusiastas" />
                </div>
                <div className="text-[var(--color-text-muted)] text-sm">⭐⭐⭐⭐⭐ 4.9/5</div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="h-[500px]">
            <EarthGlobe className="h-full" />
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)] mb-4">Explore o Universo</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Tudo que você precisa saber sobre o espaço, em um só lugar</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card hover className="h-full">
                  <feature.icon className="w-10 h-10 text-[var(--color-primary)] mb-4" />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{feature.title}</h3>
                  <p className="text-[var(--color-text-muted)]">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-4xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)] mb-4">Planos para Todos</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Escolha o plano ideal para você</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center items-center gap-3 mb-12">
            <span className={`text-sm ${!isAnnual ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>Mensal</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-white/10 rounded-full transition-colors"
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-[var(--color-primary)] rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
              Anual
            </span>
            <Badge variant="accent" className="ml-2">20% OFF</Badge>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className={`h-full relative ${plan.popular ? "ring-2 ring-[var(--color-primary)]" : ""}`}>
                  {plan.popular && <Badge variant="primary" className="absolute -top-3 left-1/2 -translate-x-1/2">Mais popular</Badge>}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-[var(--color-primary)]">
                        {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-[var(--color-text-muted)]">{plan.period}</span>
                    </div>
                    {isAnnual && plan.name !== "Free" && (
                      <p className="text-xs text-[var(--color-accent)] mt-1">Economia de R$35/ano</p>
                    )}
                    <p className="text-[var(--color-text-muted)] mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-[var(--color-text)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.variant} className="w-full">Assinar</Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-xl font-bold font-[family-name:var(--font-display)]">
              <span className="text-[var(--color-primary)]">Cosmos</span>
              <span className="text-[var(--color-text)]">Daily</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm mt-2">Não afiliado à NASA — dados via APIs públicas</p>
          </div>
          <div className="flex gap-6 text-[var(--color-text-muted)]">
            <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Sobre</Link>
            <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}