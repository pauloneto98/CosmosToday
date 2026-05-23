"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  Satellite, 
  Layers, 
  Box, 
  RefreshCw, 
  Flame, 
  CloudLightning, 
  ShieldAlert, 
  Activity, 
  Eye, 
  EyeOff, 
  Globe, 
  Info,
  MapPin,
  Compass,
  History,
  Lock,
  Sparkles,
  Crown
} from "lucide-react";
import type { NaturalEvent } from "@/app/api/nasa/eonet/route";
import { getUserSubscription } from "@/app/actions/user";
import Link from "next/link";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export default function SatellitesPage() {
  const [planType, setPlanType] = useState<string>("loading");

  useEffect(() => {
    getUserSubscription().then((res) => {
      if (res.success) {
        setPlanType(res.planType);
      } else {
        setPlanType("demo");
      }
    });
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const radarLayerRef = useRef<any>(null);
  
  // Estados climáticos e de eventos
  const [events, setEvents] = useState<NaturalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showRadar, setShowRadar] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NaturalEvent | null>(null);

  if (planType === "loading") {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--color-text-muted)] animate-pulse">Sincronizando coordenadas orbitais...</p>
      </div>
    );
  }

  if (planType === "demo") {
    return (
      <div className="h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full relative group"
        >
          {/* Neon Glow por trás do card */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
          
          <Card className="relative overflow-hidden p-8 border border-white/10 bg-[#0A0A1A]/95 backdrop-blur-xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <Badge variant="accent" className="mb-4 uppercase tracking-widest text-[9px] px-2.5 py-0.5">Recurso Premium</Badge>
            
            <h2 className="text-2xl font-black font-[family-name:var(--font-display)] text-white mb-3">
              Mapa de Satélites Completo
            </h2>
            
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
              O rastreamento orbital 2D/3D em tempo real e o mapa meteorológico de desastres naturais é um recurso exclusivo dos planos <strong>Explorer</strong> e <strong>Cosmos VIP</strong>.
            </p>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 w-full mb-6 text-left space-y-2">
              <p className="text-xs text-[var(--color-text)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Rastreie mais de 50 satélites ativos</span>
              </p>
              <p className="text-xs text-[var(--color-text)] flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Integração de Clima Espacial e NOAA</span>
              </p>
            </div>

            <Link href="/dashboard/settings" className="w-full">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-[0_0_15px_rgba(0,212,255,0.25)] py-3">
                Desbloquear por R$ 5/mês
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  };
  
  // Filtros ativos
  const [filterWildfires, setFilterWildfires] = useState(true);
  const [filterStorms, setFilterStorms] = useState(true);
  const [filterVolcanoes, setFilterVolcanoes] = useState(true);
  const [filterEarthquakes, setFilterEarthquakes] = useState(true);
  const [filterHistorical, setFilterHistorical] = useState(true);

  // Filtrar eventos de desastres naturais reactivamente
  const activeEvents = useMemo(() => {
    return events.filter(ev => {
      if (ev.category === "wildfires" && !filterWildfires) return false;
      if (ev.category === "severeStorms" && !filterStorms) return false;
      if (ev.category === "volcanoes" && !filterVolcanoes) return false;
      if (ev.category === "earthquakes" && !filterEarthquakes) return false;
      if (ev.closed && !filterHistorical) return false;
      return true;
    });
  }, [events, filterWildfires, filterStorms, filterVolcanoes, filterEarthquakes, filterHistorical]);

  // Carregar Leaflet dinamicamente
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      if (window.L) {
        setLeafletLoaded(true);
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    };

    loadLeaflet();
  }, []);

  // Inicializar Mapa
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L || mapInstanceRef.current) return;

    // Criar o mapa com tema dark
    const map = window.L.map(mapRef.current, {
      center: [10, 0],
      zoom: 2,
      zoomControl: true,
      attributionControl: false,
    });

    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Criar grupo de marcadores para gerenciar facilmente
    const markersGroup = window.L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Carregar Camada Climática em Tempo Real (RainViewer Radar)
    loadClimateRadar(map);

    // Buscar Eventos da EONET
    fetchNaturalEvents();

    // Estilos CSS para os marcadores neon personalizados
    const style = document.createElement("style");
    style.textContent = `
      .neon-marker-wildfires {
        animation: pulse-red 2s infinite;
      }
      .neon-marker-severeStorms {
        animation: pulse-blue 2s infinite;
      }
      .neon-marker-volcanoes {
        animation: pulse-orange 2s infinite;
      }
      .neon-marker-earthquakes {
        animation: pulse-purple 2s infinite;
      }
      .neon-marker-historical {
        opacity: 0.65 !important;
        filter: grayscale(0.55) drop-shadow(0 0 2px rgba(156, 163, 175, 0.5)) !important;
        animation: none !important;
      }
      @keyframes pulse-red {
        0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.7)); }
        50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.9)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.7)); }
      }
      @keyframes pulse-blue {
        0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(6, 182, 212, 0.7)); }
        50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.9)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(6, 182, 212, 0.7)); }
      }
      @keyframes pulse-orange {
        0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.7)); }
        50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.9)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.7)); }
      }
      @keyframes pulse-purple {
        0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.7)); }
        50% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.9)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(168, 85, 247, 0.7)); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
      radarLayerRef.current = null;
    };
  }, [leafletLoaded]);

  // Carregar Radar de Clima Real via RainViewer API
  const loadClimateRadar = async (map: any) => {
    try {
      const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      if (!response.ok) throw new Error("RainViewer API error");
      const data = await response.json();
      
      const radarTimestamps = data.radar.past;
      if (radarTimestamps && radarTimestamps.length > 0) {
        const latestTime = radarTimestamps[radarTimestamps.length - 1].time;
        
        // Camada de radar de precipitação
        const radarLayer = window.L.tileLayer(
          `https://tilecache.rainviewer.com/v2/radar/${latestTime}/256/{z}/{x}/{y}/2/1_1.png`,
          {
            opacity: 0.55,
            maxZoom: 19,
          }
        );

        if (showRadar) {
          radarLayer.addTo(map);
        }
        radarLayerRef.current = radarLayer;
      }
    } catch (error) {
      console.warn("⚠️ Não foi possível carregar radar climático real:", error);
    }
  };

  // Buscar eventos de desastres naturais da EONET
  const fetchNaturalEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nasa/eonet");
      if (!res.ok) throw new Error("Erro EONET API");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("❌ Erro ao buscar catástrofes naturais:", err);
    } finally {
      setLoading(false);
    }
  };

  // Alternar visualização da camada climática
  const toggleRadar = () => {
    const map = mapInstanceRef.current;
    const radar = radarLayerRef.current;
    if (!map || !radar) return;

    if (showRadar) {
      map.removeLayer(radar);
    } else {
      map.addLayer(radar);
    }
    setShowRadar(!showRadar);
  };

  // Atualizar marcadores no mapa quando eventos ou filtros mudarem
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group || !window.L) return;

    // Limpar marcadores anteriores
    group.clearLayers();

    activeEvents.forEach(ev => {
      let iconColor = "#00D4FF";
      let iconHtml = "📍";
      let markerClass = "";

      if (ev.category === "wildfires") {
        iconColor = "#EF4444"; // Vermelho
        iconHtml = "🔥";
        markerClass = "neon-marker-wildfires";
      } else if (ev.category === "severeStorms") {
        iconColor = "#06B6D4"; // Ciano
        iconHtml = "🌀";
        markerClass = "neon-marker-severeStorms";
      } else if (ev.category === "volcanoes") {
        iconColor = "#F97316"; // Laranja
        iconHtml = "🌋";
        markerClass = "neon-marker-volcanoes";
      } else if (ev.category === "earthquakes") {
        iconColor = "#A855F7"; // Roxo
        iconHtml = "⚡";
        markerClass = "neon-marker-earthquakes";
      }

      if (ev.closed) {
        markerClass += " neon-marker-historical";
      }

      // Marcador divIcon neon estilizado
      const customIcon = window.L.divIcon({
        className: `custom-natural-marker ${markerClass}`,
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${iconColor}20;
            border: 2px solid ${iconColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 0 10px ${iconColor}80;
          ">
            ${iconHtml}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = window.L.marker([ev.lat, ev.lng], { icon: customIcon });
      
      // Adicionar popup descritivo
      marker.bindPopup(`
        <div style="
          color: #ffffff;
          font-family: sans-serif;
          min-width: 200px;
          background: #0B0E14;
          border-radius: 8px;
        ">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: ${iconColor};">${ev.title}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #9CA3AF;">
            Categoria: ${ev.categoryLabel} 
            ${ev.closed 
              ? `<span style="color: #9CA3AF; border: 1px solid #ffffff30; padding: 1px 4px; border-radius: 4px; font-size: 9px; margin-left: 6px; background: #ffffff10; display: inline-block;">HISTÓRICO</span>` 
              : `<span style="color: #10B981; border: 1px solid #10B98130; padding: 1px 4px; border-radius: 4px; font-size: 9px; margin-left: 6px; background: #10B98110; display: inline-block; font-weight: bold;">ATIVO</span>`
            }
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.4; color: #E5E7EB;">${ev.description}</p>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #9CA3AF; border-top: 1px solid #ffffff15; padding-top: 6px;">
            <span>Fonte: ${ev.source}</span>
            <span>${new Date(ev.date).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      `, {
        className: 'custom-leaflet-popup'
      });

      // Evento de clique para selecionar no painel lateral
      marker.on("click", () => {
        setSelectedEvent(ev);
      });

      group.addLayer(marker);
    });

  }, [activeEvents]);

  // Função para centralizar no desastre natural ao clicar na lista
  const handleFocusEvent = (ev: NaturalEvent) => {
    setSelectedEvent(ev);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([ev.lat, ev.lng], 6, {
        animate: true,
        duration: 1.5
      });

      // Encontrar e abrir o popup do marcador
      const group = markersGroupRef.current;
      if (group) {
        group.eachLayer((layer: any) => {
          if (layer.getLatLng && layer.getLatLng().lat === ev.lat && layer.getLatLng().lng === ev.lng) {
            layer.openPopup();
          }
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Satellite className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
            Central de Monitoramento Climático & Catástrofes Orbitais
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Observe a Terra através de satélites climáticos com radar de chuvas em tempo real e rastreamento de desastres naturais da rede NASA EONET.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            <Globe className="w-3.5 h-3.5 mr-1" />
            NASA EONET & RainViewer Actives
          </Badge>
          {loading && <Activity className="w-4 h-4 text-[var(--color-primary)] animate-spin" />}
        </div>
      </div>

      {/* Painel de Filtros e Controles Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Controles Laterais */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <Card className="p-4 bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                Camadas Orbitais
              </h3>
              
              <button
                onClick={toggleRadar}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  showRadar
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-white/5 border-white/10 text-[var(--color-text-muted)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Radar de Chuva (Satélite)
                </span>
                {showRadar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </Card>

            <Card className="p-4 bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Filtro de Desastres</h3>
              
              <div className="space-y-2">
                {/* Incêndios */}
                <label className="flex items-center justify-between p-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white cursor-pointer hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    Incêndios Florestais
                  </span>
                  <input
                    type="checkbox"
                    checked={filterWildfires}
                    onChange={(e) => setFilterWildfires(e.target.checked)}
                    className="accent-red-500 h-4 w-4 rounded"
                  />
                </label>

                {/* Tempestades */}
                <label className="flex items-center justify-between p-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white cursor-pointer hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <CloudLightning className="w-4 h-4 text-cyan-400" />
                    Tempestades Severas
                  </span>
                  <input
                    type="checkbox"
                    checked={filterStorms}
                    onChange={(e) => setFilterStorms(e.target.checked)}
                    className="accent-cyan-500 h-4 w-4 rounded"
                  />
                </label>

                {/* Vulcões */}
                <label className="flex items-center justify-between p-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white cursor-pointer hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-orange-400" />
                    Vulcões Ativos
                  </span>
                  <input
                    type="checkbox"
                    checked={filterVolcanoes}
                    onChange={(e) => setFilterVolcanoes(e.target.checked)}
                    className="accent-orange-500 h-4 w-4 rounded"
                  />
                </label>

                {/* Terremotos */}
                <label className="flex items-center justify-between p-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white cursor-pointer hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Atividade Sísmica
                  </span>
                  <input
                    type="checkbox"
                    checked={filterEarthquakes}
                    onChange={(e) => setFilterEarthquakes(e.target.checked)}
                    className="accent-purple-500 h-4 w-4 rounded"
                  />
                </label>

                {/* Históricos */}
                <label className="flex items-center justify-between p-2 bg-white/3 border border-white/5 rounded-lg text-xs text-white cursor-pointer hover:bg-white/5 border-dashed border-white/10">
                  <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <History className="w-4 h-4 text-gray-400" />
                    Eventos Históricos
                  </span>
                  <input
                    type="checkbox"
                    checked={filterHistorical}
                    onChange={(e) => setFilterHistorical(e.target.checked)}
                    className="accent-gray-500 h-4 w-4 rounded"
                  />
                </label>
              </div>
            </Card>
          </div>

          <div className="py-4 text-center">
            <Button
              variant="ghost"
              onClick={fetchNaturalEvents}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar Satélite
            </Button>
          </div>
        </div>

        {/* MAPA INTERATIVO CENTRAL */}
        <div className="lg:col-span-2 relative">
          <Card className="p-0 overflow-hidden border border-white/10 relative">
            <div ref={mapRef} className="h-[550px] w-full z-10" />

            {/* Legenda Flutuante */}
            <div className="absolute bottom-4 left-4 z-20 bg-space-black/90 backdrop-blur-md p-3 rounded-lg border border-white/10 text-[10px] space-y-1.5 font-mono text-white/80">
              <p className="font-bold border-b border-white/10 pb-1 mb-1 text-white">LEGENDA SATÉLITE</p>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 block" /> Incêndios (Focos Térmicos)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" /> Ciclones & Tempestades</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 block" /> Vulcões em Erupção</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 block" /> Falhas & Terremotos</div>
              {showRadar && <div className="flex items-center gap-1.5 border-t border-white/10 pt-1 mt-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/60 block" /> Radar Precipitação Atmosférica</div>}
            </div>
          </Card>
        </div>

        {/* LISTA LATERAL DE CATÁSTROFES DETECTADAS */}
        <div className="lg:col-span-1 flex flex-col h-[550px] justify-between">
          <Card className="p-4 bg-white/5 border border-white/10 flex flex-col h-full overflow-hidden space-y-4">
            <div className="border-b border-white/10 pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Satélites Alertados</h3>
                <p className="text-[10px] text-[var(--color-text-muted)]">Últimos fenômenos atômicos/climáticos catalogados.</p>
              </div>
              <Badge variant="danger" className="text-[10px]">EONET LIVE</Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[360px] custom-scrollbar">
              {loading ? (
                <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs animate-pulse">
                  Buscando eventos orbitais...
                </div>
              ) : activeEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">
                  Sem catástrofes detectadas no radar.
                </div>
              ) : (
                activeEvents.map(ev => {
                  let badgeColor: "danger" | "warning" | "primary" | "secondary" | "default" = "default";
                  let itemColor = "border-white/10";
                  
                  if (ev.category === "wildfires") { badgeColor = "danger"; itemColor = "hover:border-red-500/30"; }
                  else if (ev.category === "severeStorms") { badgeColor = "primary"; itemColor = "hover:border-cyan-400/30"; }
                  else if (ev.category === "volcanoes") { badgeColor = "warning"; itemColor = "hover:border-orange-400/30"; }
                  else if (ev.category === "earthquakes") { badgeColor = "secondary"; itemColor = "hover:border-purple-400/30"; }

                  return (
                    <div
                      key={ev.id}
                      onClick={() => handleFocusEvent(ev)}
                      className={`p-2.5 bg-white/3 border ${itemColor} rounded-lg cursor-pointer transition-all hover:bg-white/5 text-left ${ev.closed ? "opacity-60 grayscale-[30%]" : ""}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">{ev.title}</span>
                        <div className="flex items-center gap-1">
                          <Badge variant={ev.closed ? "secondary" : badgeColor} className="text-[8px] py-0 px-1 capitalize">
                            {ev.categoryLabel}
                          </Badge>
                          {ev.closed && (
                            <Badge variant="default" className="text-[8px] py-0 px-1 bg-white/10 text-gray-300">
                              Histórico
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-2 mt-1">
                        {ev.description}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-[9px] text-[var(--color-text-muted)] font-mono">
                        <span>{ev.source}</span>
                        <span>{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Painel Detalhado do Evento Selecionado */}
            <AnimatePresence mode="wait">
              {selectedEvent ? (
                <motion.div
                  key={selectedEvent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-black/50 p-3 rounded-lg border border-white/10 text-xs space-y-2 mt-auto"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-white truncate max-w-[130px]">{selectedEvent.title}</strong>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="text-[var(--color-text-muted)] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-[var(--color-text-muted)] font-mono">
                    <div>LAT: <span className="text-white">{selectedEvent.lat.toFixed(4)}</span></div>
                    <div>LNG: <span className="text-white">{selectedEvent.lng.toFixed(4)}</span></div>
                  </div>

                  <p className="text-[10px] text-white/80 leading-normal">
                    {selectedEvent.description}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleFocusEvent(selectedEvent)}
                      className="w-full text-[9px] h-6 flex items-center justify-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> Focar no Mapa
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/3 p-3 rounded-lg border border-dashed border-white/10 text-[10px] text-[var(--color-text-muted)] text-center mt-auto">
                  Selecione um fenômeno no mapa ou lista para ver a análise térmica orbital.
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>

      </div>
    </div>
  );
}