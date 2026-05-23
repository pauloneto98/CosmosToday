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
import { ArrowRight, Rocket, Globe, Satellite, Sun, Moon, Star, Sparkles, ShieldAlert, Check, X } from "lucide-react";

const EarthGlobe = dynamic(
  () => import("@/components/globe/EarthGlobe").then((mod) => ({ default: mod.EarthGlobe })),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center text-[var(--color-text-muted)]">Carregando...</div> }
);

const features = [
  { icon: Rocket, title: "Lançamentos", description: "Acompanhe contagens regressivas e transmissões ao vivo de foguetes." },
  { icon: Globe, title: "Terra do Espaço", description: "Explore imagens de alta resolução diárias tiradas pela câmera EPIC da NASA." },
  { icon: Satellite, title: "Satélites em Órbita", description: "Navegue pelo mapa interativo de satélites artificiais cruzando o céu." },
  { icon: Sun, title: "Clima Espacial", description: "Monitore ventos solares, ejeções de massa coronal e auroras ativas." },
  { icon: Moon, title: "Marte Explorer", description: "Acesse fotos arquivadas e diárias enviadas pelos rovers Curiosity e Perseverance." },
  { icon: Star, title: "Exoplanetas", description: "Explore mundos alienígenas catalogados e descubra sua habitabilidade." },
];

interface Plan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  description: string;
  features: string[];
  restrictedFeatures?: string[];
  variant: "primary" | "secondary" | "ghost";
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Demo Limitada",
    monthlyPrice: "R$0",
    yearlyPrice: "R$0",
    period: "/3 dias",
    description: "Período de testes para exploração básica",
    features: [
      "Foto Astronômica do Dia (NASA APOD)",
      "Próximos lançamentos espaciais",
      "Galeria limitada a 2 fotos salvas",
    ],
    restrictedFeatures: [
      "Mapa de Satélites Completo",
      "Clima Solar e Tempestades em tempo real",
      "Live oficial da ISS integrada",
    ],
    variant: "ghost",
  },
  {
    name: "Explorer",
    monthlyPrice: "R$5",
    yearlyPrice: "R$4",
    period: "/mês",
    popular: true,
    description: "Acesso completo aos dados de Marte e ISS",
    features: [
      "Tudo da Demo Limitada",
      "ISS Tracker Completo e posições em tempo real",
      "Downloads e salvamento ilimitados na galeria",
      "Alertas de asteroides próximos",
      "Acesso completo às câmeras dos Rovers de Marte",
    ],
    restrictedFeatures: [
      "Mapa de Satélites 2D/3D Completo",
      "Live oficial da ISS integrada no painel",
    ],
    variant: "primary",
  },
  {
    name: "Cosmos VIP",
    monthlyPrice: "R$10",
    yearlyPrice: "R$8",
    period: "/mês",
    description: "Acesso total à ciência espacial suprema",
    features: [
      "Tudo do Explorer",
      "Mapa de Satélites 2D/3D interativo",
      "Transmissão ao vivo oficial da ISS (vídeo YouTube)",
      "Clima solar e índices NOAA Kp em tempo real",
      "Comparador de exoplanetas e gráficos de órbita",
      "Acesso à API CosmosDaily pessoal e suporte prioritário",
    ],
    variant: "secondary",
  },
];

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen stars-bg hero-gradient relative overflow-hidden">
      <StarField />

      {/* Ornamentos Celestiais em Linhas Finas (Design de Luxo) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-cyan-500/[0.04] rounded-full pointer-events-none z-0 animate-[spin_180s_linear_infinite]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-dashed border-violet-500/[0.03] rounded-full pointer-events-none z-0 animate-[spin_120s_linear_infinite]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/[0.02] rounded-full pointer-events-none z-0" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md bg-black/10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-2xl font-bold font-[family-name:var(--font-display)] flex items-center gap-2"
        >
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">Cosmos</span>
          <span className="text-[var(--color-text)]">Daily</span>
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </motion.div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-sm font-medium">Entrar</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm" className="text-sm font-bold shadow-[0_0_15px_rgba(0,212,255,0.2)]">Começar Agora</Button>
          </Link>
        </div>
      </nav>

      <section className="relative z-10 px-8 py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col gap-4">
              <div className="self-start">
                <ISSBadge />
              </div>
              
              <h1 className="text-5xl lg:text-8xl font-black font-[family-name:var(--font-display)] leading-none tracking-tight">
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="block text-[var(--color-text)]">
                  O Universo
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="block bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                  Ao Vivo,
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="block text-[var(--color-text)] text-4xl lg:text-6xl font-bold mt-2">
                  Direto das agências espaciais
                </motion.span>
              </h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg text-[var(--color-text-muted)] max-w-lg leading-relaxed">
                Fotos, missões, órbitas de satélites e clima solar em tempo real da NASA, ESA, SpaceX e CNSA — tudo em português.
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
              <Link href="/sign-up">
                <Button size="lg" shimmer className="font-bold shadow-[0_0_20px_rgba(0,212,255,0.3)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-black border-none hover:opacity-90">
                  Explorar em Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="lg" className="border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 text-white font-semibold">
                  Acessar Painel
                </Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] border-2 border-[var(--color-bg)] flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
                    ★
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[var(--color-text)] font-semibold text-sm">
                  <Counter end={14820} suffix="+ entusiastas do espaço" />
                </div>
                <div className="text-[var(--color-text-muted)] text-xs">Avaliação de ⭐⭐⭐⭐⭐ 4.95/5 em ciência de dados</div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="h-[550px] relative flex items-center justify-center">
            {/* Glow orb por trás do globo */}
            <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none z-0" />
            <EarthGlobe className="h-full w-full relative z-10" />
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO RECURSOS */}
      <section className="relative z-10 px-8 py-24 bg-black/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="primary" className="mb-4 text-xs font-semibold px-3 py-1">Recursos Avançados</Badge>
            <h2 className="text-4xl lg:text-5xl font-black font-[family-name:var(--font-display)] text-[var(--color-text)] mb-4">Ciência Espacial ao seu Alcance</h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">Nossas ferramentas integram as APIs mais robustas do mundo para trazer informações precisas.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card hover className="h-full relative overflow-hidden group border border-white/5 bg-white/[0.02] p-6 hover:border-[var(--color-primary)]/20 hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] transition-all">
                  {/* Glowing hover effects */}
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-[var(--color-primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/10 transition-colors" />
                  <feature.icon className="w-12 h-12 text-[var(--color-primary)] mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed relative z-10">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO DE PRICING */}
      <section className="relative z-10 px-8 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Badge variant="accent" className="mb-4 text-xs font-semibold px-3 py-1">Assinaturas</Badge>
            <h2 className="text-4xl lg:text-5xl font-black font-[family-name:var(--font-display)] text-[var(--color-text)] mb-4">Escolha seu Nível de Exploração</h2>
            <p className="text-[var(--color-text-muted)] text-lg">Assinaturas extremamente acessíveis para fomentar a curiosidade científica.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex justify-center items-center gap-4 mb-16">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>Mensal</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-white/10 rounded-full transition-colors focus:outline-none ring-1 ring-white/10"
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full shadow"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
              Anual
            </span>
            <Badge variant="accent" className="ml-2 font-bold px-2 py-0.5 animate-pulse">20% OFF</Badge>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Card className={`h-full relative overflow-hidden flex flex-col justify-between p-8 border ${
                  plan.popular 
                    ? "border-[var(--color-primary)]/40 bg-white/[0.03] shadow-[0_0_30px_rgba(0,212,255,0.1)]" 
                    : "border-white/5 bg-white/[0.01]"
                }`}>
                  {plan.popular && (
                    <Badge variant="primary" className="absolute top-4 right-4 text-[10px] px-2 py-0.5 uppercase tracking-widest font-black">Popular</Badge>
                  )}
                  
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">{plan.name}</h3>
                    
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-5xl font-black text-white">
                        {isAnnual ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-[var(--color-text-muted)] text-sm">{plan.period}</span>
                    </div>

                    {isAnnual && plan.name !== "Demo Limitada" && (
                      <p className="text-xs text-[var(--color-primary)] font-semibold mt-1 mb-3">
                        Economia de {plan.name === "Explorer" ? "R$12" : "R$24"}/ano
                      </p>
                    )}
                    
                    <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed mb-6 border-b border-white/5 pb-4">
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-xs text-[var(--color-text)] leading-relaxed">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.restrictedFeatures?.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-xs text-[var(--color-text-muted)] leading-relaxed opacity-50">
                          <X className="w-4 h-4 text-red-500/80 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/sign-up" className="w-full mt-auto">
                    <Button 
                      variant={plan.variant} 
                      className={`w-full font-bold py-3 ${
                        plan.popular 
                          ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-black border-none"
                          : ""
                      }`}
                    >
                      {plan.name === "Demo Limitada" ? "Experimentar Demo" : "Assinar Agora"}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 py-16 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="text-2xl font-bold font-[family-name:var(--font-display)] flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[var(--color-primary)]">Cosmos</span>
              <span className="text-[var(--color-text)]">Daily</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm mt-3">
              Não afiliado, patrocinado ou associado à NASA ou agências governamentais.<br />
              Todas as informações são processadas via APIs científicas públicas.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-[var(--color-text-muted)] font-medium">
            <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Sobre</Link>
            <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}