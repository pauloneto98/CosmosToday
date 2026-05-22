"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Orbit, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Search, 
  Calendar, 
  Info,
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  RefreshCw,
  Compass
} from "lucide-react";
import { getAsteroids, formatDistance, formatVelocity, mockAsteroids, type Asteroid } from "@/lib/nasa/neows";
import { saveToFavorites } from "@/app/actions/user";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell 
} from "recharts";

// Interface para dados dos cometas
export interface Comet {
  id: string;
  name: string;
  designation: string;
  orbit_period_years: number;
  eccentricity: number;
  semi_major_axis_au: number;
  inclination_deg: number;
  next_perihelion: string;
  last_perihelion: string;
  close_approach_date: string;
  miss_distance_km: number;
  miss_distance_au: number;
  velocity_kms: number;
  description: string;
  notable: boolean;
}

export default function AsteroidsPage() {
  const [activeTab, setActiveTab] = useState<"asteroids" | "comets">("asteroids");
  
  // Estados para Asteroides
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    return in3Days.toISOString().split("T")[0];
  });
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Estados para Cometas
  const [comets, setComets] = useState<Comet[]>([]);
  const [loadingComets, setLoadingComets] = useState(false);
  const [cometSearch, setCometSearch] = useState("");
  const [selectedComet, setSelectedComet] = useState<Comet | null>(null);
  const [savingCometId, setSavingCometId] = useState<string | null>(null);
  const [savedCometSuccess, setSavedCometSuccess] = useState<string | null>(null);

  // Efeitos de inicialização
  useEffect(() => {
    fetchAsteroidsList();
  }, []);

  useEffect(() => {
    if (activeTab === "comets" && comets.length === 0) {
      fetchCometsList();
    }
  }, [activeTab]);

  // Busca de Asteroides
  const fetchAsteroidsList = async () => {
    setLoading(true);
    try {
      const data = await getAsteroids(startDate, endDate);
      const allAsteroids = Object.values(data.near_earth_objects).flat();
      // Ordenar por menor distância (mais próximos primeiro)
      allAsteroids.sort((a, b) => {
        const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
        const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
        return distA - distB;
      });
      setAsteroids(allAsteroids);
      setUseMock(false);
    } catch (error) {
      console.error("❌ Erro ao obter dados do NeoWs:", error);
      setAsteroids(mockAsteroids);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  // Busca de Cometas
  const fetchCometsList = async () => {
    setLoadingComets(true);
    try {
      const res = await fetch("/api/nasa/comets");
      if (!res.ok) throw new Error("Erro na API de cometas");
      const data = await res.json();
      setComets(data.comets || []);
    } catch (error) {
      console.error("❌ Erro ao obter dados de cometas:", error);
      // Fallback em caso de falha da API
      setComets([
        {
          id: "comet-1p-fallback",
          name: "Halley (1P/Halley)",
          designation: "1P",
          orbit_period_years: 75.3,
          eccentricity: 0.967,
          semi_major_axis_au: 17.8,
          inclination_deg: 162.3,
          last_perihelion: "1986-02-09",
          next_perihelion: "2061-07-28",
          close_approach_date: "2061-07-28",
          miss_distance_au: 0.15,
          miss_distance_km: 22439680,
          velocity_kms: 54.5,
          description: "O cometa mais famoso da história. É o único cometa de curto período altamente ativo visível a olho nu da Terra.",
          notable: true,
        },
        {
          id: "comet-2p-fallback",
          name: "Encke (2P/Encke)",
          designation: "2P",
          orbit_period_years: 3.3,
          eccentricity: 0.848,
          semi_major_axis_au: 2.21,
          inclination_deg: 11.8,
          last_perihelion: "2023-10-22",
          next_perihelion: "2027-02-08",
          close_approach_date: "2027-02-08",
          miss_distance_au: 0.28,
          miss_distance_km: 41887403,
          velocity_kms: 28.3,
          description: "Possui o menor período orbital de qualquer cometa brilhante no Sistema Solar.",
          notable: true,
        }
      ]);
    } finally {
      setLoadingComets(false);
    }
  };

  // Salvar favoritos
  const handleSaveFavorite = async (asteroid: Asteroid) => {
    setSavingId(asteroid.id);
    const approach = asteroid.close_approach_data[0];
    const minD = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0);
    const maxD = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
    const dist = formatDistance(approach.miss_distance.kilometers);
    const vel = formatVelocity(approach.relative_velocity.kilometers_per_hour);
    
    try {
      const res = await saveToFavorites(
        `Asteroide ${asteroid.name}`,
        "asteroid",
        asteroid.nasa_jpl_url,
        approach.close_approach_date,
        `Monitoramento de aproximação do asteroide ${asteroid.name}. Diâmetro: ${minD}-${maxD} metros. Distância mínima de aproximação: ${dist}. Velocidade orbital relativa: ${vel}.`,
        asteroid.nasa_jpl_url
      );
      
      if (res.success) {
        setSavedSuccess(asteroid.id);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        alert(res.error || "Erro ao salvar asteroide.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveCometFavorite = async (comet: Comet) => {
    setSavingCometId(comet.id);
    const dist = (comet.miss_distance_km / 1_000_000).toFixed(1) + "M km";
    const vel = (comet.velocity_kms * 3600).toLocaleString("pt-BR") + " km/h";
    
    try {
      const res = await saveToFavorites(
        `Cometa ${comet.name}`,
        "comet",
        `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${comet.designation}`,
        comet.close_approach_date,
        `Acompanhamento orbital do cometa ${comet.name}. Período orbital: ${comet.orbit_period_years} anos. Excentricidade: ${comet.eccentricity}. Próxima aproximação: ${comet.close_approach_date} a uma distância de ${dist} com velocidade de ${vel}.`,
        `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${comet.designation}`
      );
      
      if (res.success) {
        setSavedCometSuccess(comet.id);
        setTimeout(() => setSavedCometSuccess(null), 3000);
      } else {
        alert(res.error || "Erro ao salvar cometa.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingCometId(null);
    }
  };

  // Filtragem de cometas pesquisados
  const filteredComets = comets.filter(
    c => 
      c.name.toLowerCase().includes(cometSearch.toLowerCase()) || 
      c.designation.toLowerCase().includes(cometSearch.toLowerCase())
  );

  // Dados para o gráfico de asteroides
  const chartData = asteroids.map((a) => {
    const approach = a.close_approach_data[0];
    const missKm = parseFloat(approach.miss_distance.kilometers);
    const diameterM = (a.estimated_diameter.meters.estimated_diameter_min + a.estimated_diameter.meters.estimated_diameter_max) / 2;
    const velocityKmh = parseFloat(approach.relative_velocity.kilometers_per_hour);
    return {
      name: a.name,
      distanceMillionKm: missKm / 1_000_000,
      sizeMeters: diameterM,
      velocityKmh: velocityKmh,
      hazardous: a.is_potentially_hazardous_asteroid,
      asteroidObj: a
    };
  });

  const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;
  const closestAsteroid = asteroids[0];

  // Métricas rápidas de cometas
  const notableCometsCount = comets.filter(c => c.notable).length;
  const closestComet = comets.reduce<Comet | null>((prev, curr) => {
    if (!prev) return curr;
    return curr.miss_distance_au < prev.miss_distance_au ? curr : prev;
  }, null);

  return (
    <div className="space-y-6">
      {/* Título Principal */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Orbit className="w-8 h-8 text-[var(--color-primary)] animate-spin" style={{ animationDuration: "12s" }} />
            Rastreador de Corpos Celestes
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Acompanhe objetos próximos da Terra (Asteroides, NEOs & Cometas Catalogados) monitorados em tempo real pelo Laboratório de Propulsão a Jato da NASA (JPL).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            NASA SSD/NeoWs API Active
          </Badge>
          {useMock && activeTab === "asteroids" && <Badge variant="warning">Demo Mode</Badge>}
        </div>
      </div>

      {/* Abas Modernas Glassmorphism */}
      <div className="flex border border-white/10 p-1 bg-white/5 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("asteroids")}
          className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
            activeTab === "asteroids"
              ? "bg-[var(--color-primary)] text-[var(--color-bg)] shadow-lg"
              : "text-[var(--color-text-muted)] hover:text-white"
          }`}
        >
          <Orbit className="w-4 h-4" />
          Asteroides Próximos
        </button>
        <button
          onClick={() => setActiveTab("comets")}
          className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
            activeTab === "comets"
              ? "bg-[var(--color-primary)] text-[var(--color-bg)] shadow-lg"
              : "text-[var(--color-text-muted)] hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Cometas & Órbitas
        </button>
      </div>

      {/* ABA DE ASTEROIDES */}
      {activeTab === "asteroids" && (
        <>
          {/* Filtros de data de Asteroides */}
          <Card className="p-4 bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4 items-end justify-between">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  Data de Início
                </label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  Data de Fim
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <Button 
              variant="primary" 
              onClick={fetchAsteroidsList} 
              disabled={loading}
              className="w-full md:w-auto h-[42px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Atualizar Busca
                </>
              )}
            </Button>
          </Card>

          {loading ? (
            <div className="py-20 text-center text-[var(--color-text-muted)] space-y-4">
              <Activity className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto" />
              <p className="animate-pulse">Calculando órbitas e distâncias de passagem para asteroides...</p>
            </div>
          ) : (
            <>
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Detectados no Período</span>
                    <p className="text-3xl font-mono font-bold text-white mt-1">{asteroids.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Orbit className="w-6 h-6" />
                  </div>
                </Card>

                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between relative overflow-hidden">
                  {hazardousCount > 0 && (
                    <div className="absolute inset-0 bg-red-500/2 animate-pulse pointer-events-none" />
                  )}
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Potencialmente Perigosos</span>
                    <p className={`text-3xl font-mono font-bold mt-1 ${hazardousCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {hazardousCount}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    hazardousCount > 0 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {hazardousCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                </Card>

                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Maior Proximidade</span>
                    {closestAsteroid ? (
                      <>
                        <p className="text-lg font-bold text-white mt-1 truncate max-w-[200px]">{closestAsteroid.name}</p>
                        <p className="text-xs text-[var(--color-primary)] font-mono">
                          {formatDistance(closestAsteroid.close_approach_data[0].miss_distance.kilometers)}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-white mt-1">Nenhum</p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Zap className="w-6 h-6" />
                  </div>
                </Card>
              </div>

              {/* Gráfico de Matriz Interativo */}
              {chartData.length > 0 && (
                <Card className="p-6 bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-lg text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                    Matriz de Relação Proximidade x Diâmetro
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">
                    Eixo X: Distância da Terra (Milhões de km) | Eixo Y: Diâmetro Médio (Metros) | Tamanho: Velocidade Orbital
                  </p>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <XAxis 
                          type="number" 
                          dataKey="distanceMillionKm" 
                          name="Distância" 
                          unit="M km" 
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="sizeMeters" 
                          name="Diâmetro" 
                          unit="m" 
                          stroke="#9CA3AF"
                          fontSize={11}
                          tickLine={false}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="velocityKmh" 
                          range={[60, 400]} 
                          name="Velocidade" 
                          unit=" km/h" 
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: "3 3" }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-space-black/95 border border-white/15 p-3 rounded-lg text-xs space-y-1">
                                  <p className="font-bold text-white">{data.name}</p>
                                  <p className="text-white/80">Distância: <span className="font-mono text-[var(--color-primary)]">{data.distanceMillionKm.toFixed(2)}M km</span></p>
                                  <p className="text-white/80">Diâmetro Médio: <span className="font-mono text-[var(--color-primary)]">{data.sizeMeters.toFixed(0)}m</span></p>
                                  <p className="text-white/80">Velocidade: <span className="font-mono text-amber-400">{(data.velocityKmh/1000).toFixed(0)}k km/h</span></p>
                                  <p className={`font-semibold ${data.hazardous ? "text-red-400" : "text-emerald-400"}`}>
                                    {data.hazardous ? "⚠️ Potencialmente Perigoso" : "✓ Seguro"}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter name="Asteroides" data={chartData}>
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.hazardous ? "#F87171" : "#00D4FF"}
                              onClick={() => setSelectedAsteroid(entry.asteroidObj)}
                              className="cursor-pointer hover:scale-125 transition-transform"
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Lista de Asteroides */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xl font-bold text-white">Asteroides Monitorados</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Ordenados por proximidade no período selecionado.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {asteroids.map((asteroid) => {
                    const approach = asteroid.close_approach_data[0];
                    const isHazardous = asteroid.is_potentially_hazardous_asteroid;
                    const sizeMin = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0);
                    const sizeMax = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0);

                    return (
                      <motion.div
                        key={asteroid.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all bg-white/5 ${
                          isHazardous 
                            ? "border-red-500/20 hover:border-red-500/40 animate-pulse-subtle" 
                            : "border-white/10 hover:border-[var(--color-primary)]/40"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white text-base truncate group-hover:text-[var(--color-primary)] transition-colors">
                              {asteroid.name}
                            </h4>
                            
                            <Badge variant={isHazardous ? "danger" : "primary"} pulse={isHazardous}>
                              {isHazardous ? "⚠️ Perigoso" : "✓ Seguro"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs bg-white/3 p-3 rounded-lg border border-white/5 font-mono">
                            <div>
                              <p className="text-[var(--color-text-muted)] text-[10px] uppercase">Dist. Mínima</p>
                              <p className="text-white font-semibold mt-0.5">{formatDistance(approach.miss_distance.kilometers)}</p>
                            </div>
                            <div>
                              <p className="text-[var(--color-text-muted)] text-[10px] uppercase">Diâmetro</p>
                              <p className="text-white font-semibold mt-0.5">{sizeMin}-{sizeMax}m</p>
                            </div>
                            <div>
                              <p className="text-[var(--color-text-muted)] text-[10px] uppercase">Velocidade</p>
                              <p className="text-white font-semibold mt-0.5">{formatVelocity(approach.relative_velocity.kilometers_per_hour)}</p>
                            </div>
                            <div>
                              <p className="text-[var(--color-text-muted)] text-[10px] uppercase">Aproximação</p>
                              <p className="text-white font-semibold mt-0.5">{new Date(approach.close_approach_date).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 border-t border-white/5 pt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedAsteroid(asteroid)}
                            className="flex-1 text-xs border border-white/10"
                          >
                            <Info className="w-3.5 h-3.5 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSaveFavorite(asteroid)}
                            disabled={savingId === asteroid.id}
                            className="flex-1 text-xs"
                          >
                            {savingId === asteroid.id ? (
                              "Salvando..."
                            ) : savedSuccess === asteroid.id ? (
                              "Monitorado ✓"
                            ) : (
                              "Monitorar Aprox."
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ABA DE COMETAS CATALOGADOS */}
      {activeTab === "comets" && (
        <>
          {/* Barra de pesquisa de cometas */}
          <Card className="p-4 bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Pesquisar cometa por nome ou designação (ex: Halley, 1P, Encke)..."
                value={cometSearch}
                onChange={(e) => setCometSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[var(--color-primary)] placeholder-[var(--color-text-muted)]/50"
              />
            </div>
            <Button
              variant="primary"
              onClick={fetchCometsList}
              disabled={loadingComets}
              className="w-full md:w-auto h-[42px] flex items-center justify-center gap-2"
            >
              {loadingComets ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Atualizar Catálogo
                </>
              )}
            </Button>
          </Card>

          {loadingComets ? (
            <div className="py-20 text-center text-[var(--color-text-muted)] space-y-4">
              <Activity className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto" />
              <p className="animate-pulse">Consultando banco de dados Small-Body do JPL e catalogando cometas periódicos...</p>
            </div>
          ) : (
            <>
              {/* Métricas Rápidas Cometas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Cometas no Catálogo</span>
                    <p className="text-3xl font-mono font-bold text-white mt-1">{filteredComets.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </Card>

                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Cometas Notáveis</span>
                    <p className="text-3xl font-mono font-bold text-white mt-1">{notableCometsCount}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                </Card>

                <Card className="bg-white/5 border border-white/10 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Maior Aproximação</span>
                    {closestComet ? (
                      <>
                        <p className="text-lg font-bold text-white mt-1 truncate max-w-[200px]">{closestComet.name}</p>
                        <p className="text-xs text-[var(--color-primary)] font-mono">
                          {closestComet.miss_distance_au.toFixed(3)} UA ({(closestComet.miss_distance_km / 1_000_000).toFixed(1)}M km)
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-white mt-1">Nenhum</p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "15s" }} />
                  </div>
                </Card>
              </div>

              {/* Grade de Cometas */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-xl font-bold text-white">Cometas Periódicos e Órbitas</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Lista de cometas catalogados, parâmetros orbitais e datas de encontros próximos com a Terra.</p>
                </div>

                {filteredComets.length === 0 ? (
                  <div className="py-12 text-center text-[var(--color-text-muted)]">
                    Nenhum cometa encontrado para a pesquisa "{cometSearch}". Tente pesquisar por designações conhecidas (1P, 2P, 67P, Hale-Bopp).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComets.map((comet) => (
                      <motion.div
                        key={comet.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all bg-white/5 ${
                          comet.notable 
                            ? "border-[var(--color-primary)]/30 hover:border-[var(--color-primary)]/70 shadow-glow-small" 
                            : "border-white/10 hover:border-[var(--color-primary)]/40"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white text-base truncate group-hover:text-[var(--color-primary)] transition-colors">
                              {comet.name}
                            </h4>
                            
                            <Badge variant={comet.notable ? "primary" : "default"}>
                              {comet.notable ? "★ Histórico/Notável" : `Designação: ${comet.designation}`}
                            </Badge>
                          </div>

                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 min-h-[32px]">
                            {comet.description}
                          </p>

                          {/* Orbit Specifications Panel */}
                          <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-white/5 text-xs font-mono">
                            <div className="flex justify-between items-center">
                              <span className="text-[var(--color-text-muted)]">Período Orbital:</span>
                              <span className="text-white font-semibold">{comet.orbit_period_years.toFixed(1)} anos</span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-[var(--color-text-muted)]">Excentricidade Orbital:</span>
                                <span className="text-cyan-400 font-semibold">{comet.eccentricity.toFixed(3)}</span>
                              </div>
                              {/* Barra de progresso visual de excentricidade (0 = circular, 1 = elíptica extrema) */}
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-[var(--color-primary)]" 
                                  style={{ width: `${comet.eccentricity * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-[var(--color-text-muted)]">Inclinação Orbital:</span>
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <Compass className="w-3 h-3" style={{ transform: `rotate(${comet.inclination_deg}deg)` }} />
                                {comet.inclination_deg.toFixed(1)}°
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-1.5 mt-1 text-[11px]">
                              <span className="text-[var(--color-primary)] font-semibold">Prox. Passagem:</span>
                              <span className="text-white font-bold">{new Date(comet.close_approach_date).toLocaleDateString("pt-BR")}</span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-[var(--color-text-muted)]">Dist. de Passagem:</span>
                              <span className="text-white font-bold">{(comet.miss_distance_km / 1_000_000).toFixed(1)}M km</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 border-t border-white/5 pt-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedComet(comet)}
                            className="flex-1 text-xs border border-white/10"
                          >
                            <Info className="w-3.5 h-3.5 mr-1" />
                            Órbita Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSaveCometFavorite(comet)}
                            disabled={savingCometId === comet.id}
                            className="flex-1 text-xs"
                          >
                            {savingCometId === comet.id ? (
                              "Salvando..."
                            ) : savedCometSuccess === comet.id ? (
                              "Monitorando ✓"
                            ) : (
                              "Monitorar Órbita"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* MODAL ESPECIFICAÇÕES DO ASTEROIDE */}
      <AnimatePresence>
        {selectedAsteroid && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedAsteroid(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full mx-4 bg-space-black/95 border border-white/15 rounded-2xl p-6 relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedAsteroid(null)}
                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Orbit className="w-6 h-6 text-[var(--color-primary)] animate-spin" style={{ animationDuration: "10s" }} />
                <h4 className="text-xl font-bold text-white">NEO Especificações — {selectedAsteroid.name}</h4>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 mb-4 text-sm leading-relaxed text-white/80">
                <p>
                  O asteroide <strong className="text-white">{selectedAsteroid.name}</strong> possui magnitude absoluta de <strong className="text-white">{selectedAsteroid.absolute_magnitude_h} H</strong>.
                  Sua aproximação orbital em relação à Terra ocorrerá no dia <span className="text-[var(--color-primary)] font-semibold">{new Date(selectedAsteroid.close_approach_data[0].close_approach_date).toLocaleDateString("pt-BR")}</span>.
                </p>
                <p>
                  Com um diâmetro estimado de <strong className="text-white">{selectedAsteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(0)}m a {selectedAsteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m</strong>,
                  sua distância mínima em relação à Terra atingirá <strong className="text-white">{formatDistance(selectedAsteroid.close_approach_data[0].miss_distance.kilometers)}</strong> (cerca de {parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.lunar).toFixed(1)} distâncias lunares).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs mb-6">
                <div>
                  <p className="text-[var(--color-text-muted)]">Magnitude Absoluta (H)</p>
                  <p className="text-white font-semibold mt-0.5">{selectedAsteroid.absolute_magnitude_h}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Sentry Object (Monitoramento de Impacto)</p>
                  <Badge variant={selectedAsteroid.is_sentry_object ? "danger" : "default"} className="mt-0.5">
                    {selectedAsteroid.is_sentry_object ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Velocidade Relativa</p>
                  <p className="text-white font-semibold mt-0.5">{formatVelocity(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_hour)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]">Corpo de Órbita Principal</p>
                  <p className="text-white font-semibold mt-0.5 capitalize">{selectedAsteroid.close_approach_data[0].orbiting_body}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setSelectedAsteroid(null)}>
                  Fechar
                </Button>
                {selectedAsteroid.nasa_jpl_url && (
                  <a 
                    href={selectedAsteroid.nasa_jpl_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" className="flex items-center gap-1 border border-white/10 hover:border-[var(--color-primary)]">
                      <ExternalLink className="w-3.5 h-3.5" /> JPL Catálogo
                    </Button>
                  </a>
                )}
                <Button variant="primary" onClick={() => handleSaveFavorite(selectedAsteroid)}>
                  Monitorar Aprox.
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ESPECIFICAÇÕES DO COMETA */}
      <AnimatePresence>
        {selectedComet && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedComet(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full mx-4 bg-space-black/95 border border-white/15 rounded-2xl p-6 relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedComet(null)}
                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[var(--color-primary)] animate-pulse" />
                <h4 className="text-xl font-bold text-white">Ficha de Órbita — {selectedComet.name}</h4>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 mb-4 text-sm leading-relaxed text-white/80">
                <p>
                  O cometa periódico <strong className="text-white">{selectedComet.name}</strong> (designado <strong className="text-white">{selectedComet.designation}</strong>) possui uma órbita elíptica extremamente fascinante e alongada.
                </p>
                <p>
                  {selectedComet.description}
                </p>
                <p>
                  Sua próxima passagem relevante próxima à Terra ocorrerá em <span className="text-[var(--color-primary)] font-semibold">{new Date(selectedComet.close_approach_date).toLocaleDateString("pt-BR")}</span>, chegando a uma distância de <strong className="text-white">{(selectedComet.miss_distance_km / 1_000_000).toFixed(1)} milhões de km</strong> da superfície terrestre, trafegando com velocidade de <strong className="text-white">{selectedComet.velocity_kms.toFixed(1)} km/s</strong> (aprox. {(selectedComet.velocity_kms * 3600).toLocaleString("pt-BR")} km/h).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs mb-6 font-mono">
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Período Orbital</p>
                  <p className="text-white font-semibold mt-0.5">{selectedComet.orbit_period_years.toFixed(1)} anos</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Excentricidade</p>
                  <p className="text-cyan-400 font-semibold mt-0.5">{selectedComet.eccentricity.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Semieixo Maior (a)</p>
                  <p className="text-white font-semibold mt-0.5">{selectedComet.semi_major_axis_au.toFixed(2)} UA</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Inclinação Orbital</p>
                  <p className="text-amber-400 font-semibold mt-0.5">{selectedComet.inclination_deg.toFixed(2)}°</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Último Periélio</p>
                  <p className="text-white font-semibold mt-0.5">{selectedComet.last_perihelion}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] uppercase text-[9px] tracking-wider">Próximo Periélio</p>
                  <p className="text-[var(--color-primary)] font-bold mt-0.5">{selectedComet.next_perihelion}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setSelectedComet(null)}>
                  Fechar
                </Button>
                <a 
                  href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${selectedComet.designation}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="flex items-center gap-1 border border-white/10 hover:border-[var(--color-primary)]">
                    <ExternalLink className="w-3.5 h-3.5" /> JPL Órbita 3D
                  </Button>
                </a>
                <Button variant="primary" onClick={() => handleSaveCometFavorite(selectedComet)}>
                  Monitorar Órbita
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
