"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useISS, useAstronauts } from "@/hooks/useISS";
import { Satellite, MapPin, Activity, Navigation, Radio, Compass } from "lucide-react";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const pathRef = useRef<any>(null);
  const { position, loading } = useISS(4000);
  const { astronauts } = useAstronauts();
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [coordsHistory, setCoordsHistory] = useState<[number, number][]>([]);

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

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !window.L || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      center: [0, 0],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    // Utilizando o tema dark premium do CartoDB para o mapa
    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Criar ícone neon personalizado para a ISS
    const icon = window.L.divIcon({
      className: "iss-neon-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #00D4FF;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 25px #00D4FF, 0 0 50px #00D4FF50;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <span style="color: #000; font-size: 16px; font-family: sans-serif;">🚀</span>
          <div style="
            position: absolute;
            inset: -12px;
            border: 2px solid #00D4FF;
            border-radius: 50%;
            animation: iss-pulse 2s ease-out infinite;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    markerRef.current = window.L.marker([0, 0], { icon }).addTo(map);

    // Linha de trajetória da ISS no mapa
    pathRef.current = window.L.polyline([], {
      color: "#00D4FF",
      weight: 3,
      opacity: 0.7,
      dashArray: "5, 10",
    }).addTo(map);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes iss-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !markerRef.current || !position || !mapInstanceRef.current) return;

    const latLng: [number, number] = [position.latitude, position.longitude];
    
    // Atualizar posição do marcador
    markerRef.current.setLatLng(latLng);
    
    // Centralizar mapa suavemente
    mapInstanceRef.current.panTo(latLng);

    // Atualizar trajetória
    setCoordsHistory(prev => {
      const next = [...prev, latLng].slice(-50); // manter os últimos 50 pontos
      if (pathRef.current) {
        pathRef.current.setLatLngs(next);
      }
      return next;
    });

  }, [position, leafletLoaded]);

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-120px)] flex flex-col justify-between">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
            Live Tracking & Mapa de Satélites
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Acompanhe a ISS (Estação Espacial Internacional) em tempo real navegando no espaço.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="py-1 px-3">
            <Satellite className="w-3.5 h-3.5 mr-1" />
            ISS Telemetry Active
          </Badge>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* ISS Live Stream Player at the Top */}
      <Card className="p-0 overflow-hidden relative border border-white/10 shadow-glow-small">
        <div className="bg-black/40 px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Câmera ao Vivo da ISS — NASA High Definition Live Stream</span>
          </div>
          <Badge variant="primary" className="text-[10px] uppercase font-mono">
            LIVE FEED
          </Badge>
        </div>
        <div className="aspect-video w-full max-h-[480px] bg-black">
          <iframe
            src="https://www.youtube.com/embed/vytmBNhc9ig?autoplay=1&mute=1"
            title="ISS Live Stream"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </Card>

      {/* Grid: Map left, telemetry card right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* Full Interactive Map */}
        <Card className="lg:col-span-8 p-0 overflow-hidden relative border border-white/10 min-h-[450px]">
          <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
          
          {/* Floating UI on top of map */}
          <div className="absolute top-4 left-4 z-10 pointer-events-auto">
            <div className="bg-space-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg flex items-center gap-3">
              <Compass className="w-5 h-5 text-[var(--color-primary)]" />
              <div className="text-xs">
                <p className="font-semibold text-white">Visualização de Órbita</p>
                <p className="text-[var(--color-text-muted)]">LEO (Low Earth Orbit)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Telemetry Right Panel */}
        <Card className="lg:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-[var(--color-primary)] tracking-widest block mb-1">TELEMETRIA OFICIAL</span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                International Space Station
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4 py-10 text-center text-[var(--color-text-muted)]">
                <Activity className="w-8 h-8 animate-spin text-[var(--color-primary)] mx-auto" />
                <p>Buscando coordenadas por rádio orbital...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Latitude</p>
                    <p className="text-lg font-mono font-bold text-white mt-1">
                      {position?.latitude.toFixed(4) || "0.0000"}°
                    </p>
                  </div>
                  <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Longitude</p>
                    <p className="text-lg font-mono font-bold text-white mt-1">
                      {position?.longitude.toFixed(4) || "0.0000"}°
                    </p>
                  </div>
                  <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Velocidade</p>
                    <p className="text-lg font-mono font-bold text-white mt-1">27,600 km/h</p>
                  </div>
                  <Navigation className="w-6 h-6 text-[var(--color-primary)]" />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Altitude</p>
                    <p className="text-lg font-mono font-bold text-white mt-1">
                      {position?.altitude.toFixed(0) || "420"} km
                    </p>
                  </div>
                  <Activity className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              </div>
            )}
          </div>

          {/* Astronauts list */}
          {astronauts && astronauts.length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
              <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                Tripulantes a Bordo ({astronauts.length})
              </p>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {astronauts.map((ast, i) => (
                  <Badge key={i} variant="default" className="text-xs py-1 px-2.5">
                    🚀 {ast.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
