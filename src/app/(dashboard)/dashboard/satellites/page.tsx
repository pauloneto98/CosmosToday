"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Satellite, Layers, Box, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

const satelliteCategories = [
  { id: "iss", label: "ISS", color: "#00D4FF" },
  { id: "starlink", label: "Starlink", color: "#7B61FF" },
  { id: "weather", label: "Meteorológicos", color: "#FF6B35" },
  { id: "gps", label: "GPS", color: "#10B981" },
  { id: "comm", label: "Comunicações", color: "#F59E0B" },
];

export default function SatellitesPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [selectedCategory, setSelectedCategory] = useState("iss");
  const [leafletLoaded, setLeafletLoaded] = useState(false);

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
      center: [20, 0],
      zoom: 3,
      attributionControl: false,
    });

    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-text)]">
            Mapa de Satélites
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Visualização em tempo real de satélites em órbita
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded ${viewMode === "2d" ? "bg-[var(--color-primary)] text-[var(--color-bg)]" : "text-[var(--color-text-muted)]"}`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded ${viewMode === "3d" ? "bg-[var(--color-primary)] text-[var(--color-bg)]" : "text-[var(--color-text-muted)]"}`}
            >
              <Box className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2 flex-wrap">
          {satelliteCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-white/20 text-[var(--color-text)]"
                  : "bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div ref={mapRef} className="h-[calc(100vh-300px)] min-h-[500px]" />
      </Card>

      <div className="text-center py-4">
        <p className="text-[var(--color-text-muted)] text-sm">
          Configure Celestrak TLE no backend para dados reais de satélite
        </p>
      </div>
    </div>
  );
}