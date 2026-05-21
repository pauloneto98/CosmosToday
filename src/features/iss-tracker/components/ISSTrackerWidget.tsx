"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useISS, useAstronauts } from "@/hooks/useISS";
import { Satellite, Users, MapPin, Activity, RotateCw } from "lucide-react";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

export function ISSTrackerWidget() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { position, loading } = useISS(5000);
  const { astronauts } = useAstronauts();
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
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const icon = window.L.divIcon({
      className: "iss-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #00D4FF;
          border-radius: 50%;
          box-shadow: 0 0 20px #00D4FF, 0 0 40px #00D4FF50;
          position: relative;
        ">
          <div style="
            position: absolute;
            inset: -8px;
            border: 2px solid #00D4FF;
            border-radius: 50%;
            animation: iss-pulse 2s ease-out infinite;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    markerRef.current = window.L.marker([0, 0], { icon }).addTo(map);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes iss-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !markerRef.current || !position) return;
    markerRef.current.setLatLng([position.latitude, position.longitude]);
  }, [position, leafletLoaded]);

  if (loading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton variant="rectangular" height={150} className="w-full rounded-lg" />
          <Skeleton variant="text" height={20} className="w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-text)]">ISS ao Vivo</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
          </span>
          <span className="text-xs text-[var(--color-primary)]">Live</span>
        </div>
      </div>

      <div ref={mapRef} className="h-[150px] rounded-lg overflow-hidden mb-3 bg-black/50" />

      {position && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-lg">
            <MapPin className="w-4 h-4 text-[var(--color-primary)] mx-auto mb-1" />
            <p className="text-xs text-[var(--color-text-muted)]">Latitude</p>
            <p className="text-sm font-mono text-[var(--color-text)]">{position.latitude.toFixed(2)}°</p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg">
            <MapPin className="w-4 h-4 text-[var(--color-primary)] mx-auto mb-1" />
            <p className="text-xs text-[var(--color-text-muted)]">Longitude</p>
            <p className="text-sm font-mono text-[var(--color-text)]">{position.longitude.toFixed(2)}°</p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg">
            <Activity className="w-4 h-4 text-[var(--color-primary)] mx-auto mb-1" />
            <p className="text-xs text-[var(--color-text-muted)]">Altitude</p>
            <p className="text-sm font-mono text-[var(--color-text)]">{position.altitude.toFixed(0)}km</p>
          </div>
        </div>
      )}

      {astronauts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Tripulação ({astronauts.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {astronauts.slice(0, 3).map((a, i) => (
              <Badge key={i} variant="default" className="text-xs">
                {a.name.split(" ").pop()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}