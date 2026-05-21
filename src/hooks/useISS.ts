"use client";

import { useState, useEffect, useCallback } from "react";

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

interface ISSTracking {
  position: ISSPosition | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useISS(pollInterval: number = 5000): ISSTracking {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, pollInterval);
    return () => clearInterval(interval);
  }, [fetchPosition, pollInterval]);

  return { position, loading, error, refresh: fetchPosition };
}

export function useAstronauts() {
  const [astronauts, setAstronauts] = useState<Array<{ name: string; craft: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAstronauts = async () => {
      try {
        const response = await fetch("http://api.open-notify.org/astros");
        if (!response.ok) throw new Error("Failed to fetch astronauts");
        
        const data = await response.json();
        const issAstronauts = data.people.filter((p: { craft: string }) => p.craft === "ISS");
        setAstronauts(issAstronauts);
      } catch {
        setAstronauts([
          { name: "Demo Astronaut 1", craft: "ISS" },
          { name: "Demo Astronaut 2", craft: "ISS" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAstronauts();
    const interval = setInterval(fetchAstronauts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { astronauts, loading };
}