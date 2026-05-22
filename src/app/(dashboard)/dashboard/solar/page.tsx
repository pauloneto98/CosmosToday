"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Sun, 
  Activity, 
  ExternalLink,
  Flame,
  Zap,
  Globe,
  Radio,
  Calendar,
  Search,
  Sparkles,
  Info
} from "lucide-react";
import { getSolarEvents, mockSolarEvents, getEventTypeLabel, getEventTypeColor, type SolarEvent } from "@/lib/nasa/donki";
import { saveToFavorites } from "@/app/actions/user";

export default function SolarPage() {
  const [events, setEvents] = useState<SolarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [selectedEvent, setSelectedEvent] = useState<SolarEvent | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [solarLevel, setSolarLevel] = useState<"calm" | "moderate" | "elevated" | "storm">("calm");

  useEffect(() => {
    fetchSolarEventsList();
  }, []);

  const fetchSolarEventsList = async () => {
    setLoading(true);
    try {
      const data = await getSolarEvents(startDate, endDate);
      const allEvents = data.events || [];
      // Sort: newest first
      allEvents.sort((a, b) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime());
      setEvents(allEvents);
      setUseMock(false);

      if (allEvents.some(e => e.type === "GST")) {
        setSolarLevel("storm");
      } else if (allEvents.some(e => e.type === "CME")) {
        setSolarLevel("elevated");
      } else if (allEvents.some(e => e.type === "FLR")) {
        setSolarLevel("moderate");
      } else {
        setSolarLevel("calm");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar clima solar:", error);
      setEvents(mockSolarEvents);
      setUseMock(true);
      setSolarLevel("moderate");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = async (event: SolarEvent) => {
    setSavingId(event.id);
    const dateText = new Date(event.beginTime).toLocaleDateString("pt-BR");
    
    try {
      const res = await saveToFavorites(
        `Clima Solar - ${getEventTypeLabel(event.type)} (${dateText})`,
        "solar",
        event.sourceUrl || "https://www.swpc.noaa.gov/",
        event.beginTime,
        `Monitoramento de atividade solar severa. Tipo de Evento: ${getEventTypeLabel(event.type)}. Iniciado em: ${event.beginTime}. Descrição: ${event.title}`,
        event.sourceUrl || "https://www.swpc.noaa.gov/"
      );

      if (res.success) {
        setSavedSuccess(event.id);
        setTimeout(() => setSavedSuccess(null), 3000);
      } else {
        alert(res.error || "Erro ao salvar favorito.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const levelConfig = {
    calm: { color: "#10B981", label: "Calmo", text: "Sem ameaças magnéticas ou flares de classe X nas últimas horas.", badge: "primary" },
    moderate: { color: "#F59E0B", label: "Moderado", text: "Flares solares moderados (Classe M) registrados recentemente. Sem perigo severo.", badge: "warning" },
    elevated: { color: "#F97316", label: "Elevado", text: "Ejeções de massa coronal (CME) direcionadas detectadas. Auroras ampliadas em latitudes médias.", badge: "warning" },
    storm: { color: "#EF4444", label: "Tempestade G1-G5", text: "Alerta de Tempestade Geomagnética severa. Possíveis instabilidades em redes elétricas de alta latitude e sinais de GPS.", badge: "danger" },
  };

  const flrCount = events.filter(e => e.type === "FLR").length;
  const cmeCount = events.filter(e => e.type === "CME").length;
  const gstCount = events.filter(e => e.type === "GST").length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sun className="w-8 h-8 text-amber-500 animate-pulse" />
            Clima Solar & Telemetria Espacial
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Monitore ventos cósmicos, explosões de plasma, auroras boreais e perturbações no escudo magnético terrestre usando a rede DONKI da NASA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            <Activity className="w-3.5 h-3.5 mr-1" />
            DONKI Space Weather Active
          </Badge>
          {useMock && <Badge variant="warning">Demo Mode</Badge>}
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Status Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-mono">STATUS GEOMAGNÉTICO</span>
                <h3 className="text-2xl font-bold text-white mt-1">Escudo Espacial Terrestre</h3>
              </div>
              <Sun className="w-10 h-10 text-amber-400" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG circular gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" className="stroke-white/5 fill-transparent" strokeWidth="8" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="60" 
                    className="fill-transparent transition-all duration-1000" 
                    strokeWidth="8"
                    stroke={levelConfig[solarLevel].color}
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - (solarLevel === "calm" ? 0.25 : solarLevel === "moderate" ? 0.5 : solarLevel === "elevated" ? 0.75 : 0.95))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-mono">Kp Index</span>
                  <span className="text-2xl font-bold text-white font-mono mt-0.5">
                    {solarLevel === "calm" ? "Kp 2" : solarLevel === "moderate" ? "Kp 4" : solarLevel === "elevated" ? "Kp 6" : "Kp 8+"}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <Badge variant={levelConfig[solarLevel].badge as any} className="py-1 px-3 text-sm">
                  Atividade: {levelConfig[solarLevel].label}
                </Badge>
                <p className="text-sm text-white/80 leading-relaxed">
                  {levelConfig[solarLevel].text}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-cyan-400" /> Magnetosfera Estável</span>
            <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-amber-400" /> Sinais HF Normais</span>
          </div>
        </Card>

        {/* Telemetry Stats Grid */}
        <Card className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-mono">CONTAGEM 30 DIAS</span>
            <h3 className="text-xl font-bold text-white">Eventos Solares Registrados</h3>
            
            <div className="space-y-3 font-mono">
              <div className="bg-white/3 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-white/80 flex items-center gap-1.5"><Flame className="w-4 h-4 text-amber-500" /> Flares Solares (FLR)</span>
                <span className="text-base font-bold text-amber-400">{flrCount}</span>
              </div>
              
              <div className="bg-white/3 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-white/80 flex items-center gap-1.5"><Zap className="w-4 h-4 text-red-500" /> Ejeções de Plasma (CME)</span>
                <span className="text-base font-bold text-red-400">{cmeCount}</span>
              </div>

              <div className="bg-white/3 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-white/80 flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-500" /> Tempestades Geomag. (GST)</span>
                <span className="text-base font-bold text-purple-400">{gstCount}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[var(--color-text-muted)] border-t border-white/5 pt-3">
            Kp &gt; 5 indica distúrbios significativos no campo geomagnético.
          </div>
        </Card>
      </div>

      {/* Date Search Bar */}
      <Card className="p-4 bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              Início do Monitoramento
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
              Fim do Monitoramento
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
          onClick={fetchSolarEventsList} 
          disabled={loading}
          className="w-full md:w-auto h-[42px] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Activity className="w-4 h-4 animate-spin" /> Atualizando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" /> Atualizar Filtros
            </>
          )}
        </Button>
      </Card>

      {/* Alerts Feed Section */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-2 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">Alertas de Clima Espacial Recentes</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Relatórios detalhados emitidos em tempo real pelo Space Weather Prediction Center.</p>
          </div>
          <Badge variant="primary" className="font-mono">Alerts Dynamic Live</Badge>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[var(--color-text-muted)] space-y-4">
            <Activity className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto" />
            <p className="animate-pulse">Varrendo o banco de dados DONKI e NOAA...</p>
          </div>
        ) : events.length === 0 ? (
          <Card className="py-16 text-center bg-white/5 border border-white/10">
            <Sun className="w-14 h-14 text-[var(--color-text-muted)] mx-auto mb-4 animate-spin" style={{ animationDuration: "20s" }} />
            <p className="text-[var(--color-text-muted)]">Sem atividade magnética severa reportada no período.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.beginTime).toLocaleDateString("pt-BR");
              const isSevere = event.type === "GST" || event.type === "CME";

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all bg-white/5 ${
                    isSevere 
                      ? "border-red-500/20 hover:border-red-500/40" 
                      : "border-white/10 hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <Badge variant={getEventTypeColor(event.type)}>
                        {getEventTypeLabel(event.type)}
                      </Badge>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{eventDate}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-2 leading-relaxed">
                      {event.title}
                    </h4>
                  </div>

                  <div className="flex gap-2 mt-5 border-t border-white/5 pt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 text-xs border border-white/10"
                    >
                      <Info className="w-3.5 h-3.5 mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveFavorite(event)}
                      disabled={savingId === event.id}
                      className="flex-1 text-xs"
                    >
                      {savingId === event.id ? (
                        "Salvando..."
                      ) : savedSuccess === event.id ? (
                        "Monitorado ✓"
                      ) : (
                        "Monitorar Flare"
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Solar Reader Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl w-full mx-4 bg-space-black/95 border border-white/15 rounded-2xl p-6 relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white text-2xl font-bold bg-white/5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-2.5 mb-4">
                <Sun className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: "15s" }} />
                <h4 className="text-xl font-bold text-white">DONKI Boletim — {getEventTypeLabel(selectedEvent.type)}</h4>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 mb-4 text-sm leading-relaxed text-white/80 font-mono">
                <p>
                  <strong>Identificação:</strong> {selectedEvent.id}
                </p>
                <p>
                  <strong>Início do Distúrbio:</strong> {new Date(selectedEvent.beginTime).toLocaleString("pt-BR")}
                </p>
                {selectedEvent.endTime && (
                  <p>
                    <strong>Conclusão / Pico:</strong> {new Date(selectedEvent.endTime).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>

              <div className="bg-white/3 border border-white/5 p-4 rounded-lg text-sm text-white/85 leading-relaxed mb-6 max-h-[160px] overflow-y-auto">
                <h5 className="font-semibold text-white mb-1.5">Mensagem NOAA Oficial:</h5>
                <p>{selectedEvent.title}</p>
              </div>

              <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                  Fechar
                </Button>
                {selectedEvent.sourceUrl && (
                  <a 
                    href={selectedEvent.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" className="flex items-center gap-1 border border-white/10 hover:border-amber-500">
                      <ExternalLink className="w-3.5 h-3.5" /> SWPC Alerta Link
                    </Button>
                  </a>
                )}
                <Button variant="primary" onClick={() => handleSaveFavorite(selectedEvent)}>
                  {savingId === selectedEvent.id ? (
                    "Salvando..."
                  ) : savedSuccess === selectedEvent.id ? (
                    "Favoritado ✓"
                  ) : (
                    "Favoritar Alerta"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
