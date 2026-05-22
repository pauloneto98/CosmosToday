"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Compass, Activity } from "lucide-react";

interface EarthGlobeProps {
  className?: string;
}

export function EarthGlobe({ className = "" }: EarthGlobeProps) {
  const [hovered, setHovered] = useState(false);
  const [telemetry, setTelemetry] = useState({
    lat: "28.5721° N",
    lng: "80.6480° W",
    alt: "418.5 km",
    speed: "27.560 km/h",
  });

  // Simulate real-time orbital telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLat = (Math.random() * 180 - 90).toFixed(4);
      const randomLng = (Math.random() * 360 - 180).toFixed(4);
      const latDir = parseFloat(randomLat) >= 0 ? "N" : "S";
      const lngDir = parseFloat(randomLng) >= 0 ? "E" : "W";
      
      setTelemetry({
        lat: `${Math.abs(parseFloat(randomLat)).toFixed(4)}° ${latDir}`,
        lng: `${Math.abs(parseFloat(randomLng)).toFixed(4)}° ${lngDir}`,
        alt: `${(415 + Math.random() * 10).toFixed(1)} km`,
        speed: `${(27540 + Math.random() * 40).toFixed(0)} km/h`,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center w-full h-full min-h-[400px] overflow-hidden select-none ${className}`}>
      {/* Background Star Ambient Glow */}
      <div className="absolute w-[350px] h-[350px] rounded-full bg-[var(--color-primary)]/10 blur-[80px]" />
      
      {/* Outer Atmosphere Glow Ring */}
      <motion.div
        animate={{
          boxShadow: hovered 
            ? "0 0 60px 15px rgba(0, 212, 255, 0.3), inset 0 0 40px 10px rgba(0, 212, 255, 0.15)"
            : "0 0 40px 5px rgba(0, 212, 255, 0.15), inset 0 0 20px 5px rgba(0, 212, 255, 0.05)",
          scale: hovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute w-[320px] h-[320px] rounded-full border border-[var(--color-primary)]/20 z-0 flex items-center justify-center"
      >
        {/* Pulsing Aura */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-cyan-400/10 pointer-events-none"
        />
      </motion.div>

      {/* Orbit Line with Satellite */}
      <div className="absolute w-[400px] h-[160px] rounded-full border border-dashed border-white/10 rotate-[-15deg] z-10 pointer-events-none">
        {/* Revolve Satellite Dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full"
        >
          <div className="absolute top-[-5px] left-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#00d4ff]">
            <div className="absolute inset-[-4px] rounded-full border border-cyan-400/40 animate-ping" />
          </div>
        </motion.div>
      </div>

      {/* Main Spinning Earth Sphere */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative z-10 w-[300px] h-[300px] rounded-full overflow-hidden border border-white/10 shadow-[20px_20px_60px_rgba(0,0,0,0.85),-20px_-20px_60px_rgba(0,212,255,0.08)]"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Shadow Overlay for Depth (Day/Night cycle effect) */}
        <div className="absolute inset-0 z-20 rounded-full pointer-events-none bg-[radial-gradient(circle_at_30%_30%,transparent_35%,rgba(0,0,0,0.85)_75%,#000_100%)]" />

        {/* High-Fidelity Earth Texture Image with slow rotation */}
        <motion.div
          className="w-full h-full bg-cover bg-center rounded-full"
          style={{ backgroundImage: "url('/realistic_earth_globe.png')" }}
          animate={{ rotate: 360 }}
          transition={{
            duration: hovered ? 35 : 70, // Spins faster on hover
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Sci-Fi Telemetry Panel Overlay */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-4 right-4 z-25 bg-[var(--color-bg)]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 space-y-2 text-xs font-mono text-[var(--color-text-muted)] w-48 shadow-lg pointer-events-none"
      >
        <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-bold border-b border-white/5 pb-1">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>STATUS ORBITAL</span>
        </div>
        <div className="grid grid-cols-2 gap-y-1">
          <span className="text-[var(--color-text-muted)]">ALTIT.:</span>
          <span className="text-white text-right">{telemetry.alt}</span>
          
          <span className="text-[var(--color-text-muted)]">VELOC.:</span>
          <span className="text-white text-right">{telemetry.speed}</span>
          
          <span className="text-[var(--color-text-muted)]">LAT:</span>
          <span className="text-white text-right font-medium text-cyan-400">{telemetry.lat}</span>
          
          <span className="text-[var(--color-text-muted)]">LNG:</span>
          <span className="text-white text-right font-medium text-cyan-400">{telemetry.lng}</span>
        </div>
      </motion.div>

      {/* Sci-Fi Compass Overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-4 left-4 z-25 bg-[var(--color-bg)]/80 backdrop-blur-md border border-white/10 rounded-lg p-2.5 flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)] shadow-lg pointer-events-none"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <span className="text-[var(--color-text)]">ISS TRACKER ACTIVE</span>
      </motion.div>
    </div>
  );
}