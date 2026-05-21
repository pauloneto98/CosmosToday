import { nasaClient } from "./client";

export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null;
  pl_masse: number | null;
  pl_orbper: number | null;
  pl_orbsmax: number | null;
  pl_eqt: number | null;
  st_sptype: string | null;
  st_teff: number | null;
  st_rad: number | null;
  st_mass: number | null;
  sys_fn: string | null;
  disc_year: number | null;
  pl_disc: number | null;
  pl_facility: string | null;
}

export interface ExoplanetResponse {
  fields: string[];
  data: (string | number | null)[][];
}

export async function getExoplanets(limit: number = 100): Promise<ExoplanetResponse> {
  return nasaClient.fetch<ExoplanetResponse>("/exoplanetdb/v1/top10", {
    format: "json",
  }, {
    cacheTime: 24 * 60 * 60,
  });
}

export function parseExoplanet(fields: string[], data: string[]): Exoplanet {
  const obj: Record<string, string | number | null> = {};
  fields.forEach((field, i) => {
    obj[field] = data[i];
  });
  return obj as unknown as Exoplanet;
}

export function formatExoplanetSize(radius: number | null): string {
  if (radius === null) return "Desconhecido";
  if (radius < 1) return `${(radius * 1000).toFixed(0)} km`;
  return `${radius.toFixed(2)} x Terra`;
}

export function formatExoplanetTemp(temp: number | null): string {
  if (temp === null) return "Desconhecida";
  return `${temp}K (${(temp - 273).toFixed(0)}°C)`;
}

export function getHabitabilityClass(temp: number | null): "habitable" | "too-hot" | "too-cold" | "unknown" {
  if (temp === null) return "unknown";
  if (temp >= 253 && temp <= 323) return "habitable";
  if (temp > 323) return "too-hot";
  return "too-cold";
}

export const mockExoplanets: Exoplanet[] = [
  {
    pl_name: "Demo Exoplanet - Configure NASA_API_KEY",
    pl_rade: 1.12,
    pl_masse: 1.1,
    pl_orbper: 365,
    pl_orbsmax: 1.0,
    pl_eqt: 288,
    st_sptype: "G2V",
    st_teff: 5778,
    st_rad: 1.0,
    st_mass: 1.0,
    sys_fn: "Solar System",
    disc_year: 2024,
    pl_disc: 2024,
    pl_facility: "Demo",
  },
  {
    pl_name: "Kepler-186f",
    pl_rade: 1.17,
    pl_masse: null,
    pl_orbper: 130,
    pl_orbsmax: 0.35,
    pl_eqt: 233,
    st_sptype: "M1V",
    st_teff: 3786,
    st_rad: 0.52,
    st_mass: 0.48,
    sys_fn: "Kepler-186",
    disc_year: 2014,
    pl_disc: 2014,
    pl_facility: "Kepler",
  },
];