"use client";

import { useState, useEffect } from "react";

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

export function useISSPosition() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        if (!response.ok) throw new Error("Failed to fetch ISS position");
        const data = await response.json();
        setPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          velocity: data.velocity,
          timestamp: data.timestamp,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  return { position, loading, error };
}

export function useISSCoordinates(): string {
  const { position } = useISSPosition();

  if (!position) return "Carregando...";

  const lat = position.latitude.toFixed(2);
  const lon = position.longitude.toFixed(2);

  return `${lat}°, ${lon}°`;
}