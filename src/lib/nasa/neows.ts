import { nasaClient } from "./client";

export interface Asteroid {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string; lunar: string };
    orbiting_body: string;
  }>;
  nasa_jpl_url: string;
  is_sentry_object: boolean;
}

export interface NeoWResponse {
  element_count: number;
  near_earth_objects: Record<string, Asteroid[]>;
}

export async function getAsteroids(startDate: string, endDate: string): Promise<NeoWResponse> {
  return nasaClient.fetch<NeoWResponse>("/neo/rest/v1/feed", {
    start_date: startDate,
    end_date: endDate,
  }, {
    cacheTime: 60 * 60,
  });
}

export function formatDistance(km: string): string {
  const num = parseFloat(km);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M km`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k km`;
  }
  return `${num.toFixed(0)} km`;
}

export function formatVelocity(kmh: string): string {
  const num = parseFloat(kmh);
  return `${(num / 1000).toFixed(1)}k km/h`;
}

export const mockAsteroids: Asteroid[] = [
  {
    id: "1234567",
    name: "(2024 Demo)",
    absolute_magnitude_h: 20.5,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.2, estimated_diameter_max: 0.5 },
      meters: { estimated_diameter_min: 200, estimated_diameter_max: 500 },
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [
      {
        close_approach_date: new Date().toISOString().split("T")[0],
        relative_velocity: { kilometers_per_hour: "35000" },
        miss_distance: { kilometers: "1200000", lunar: "3120" },
        orbiting_body: "Earth",
      },
    ],
    nasa_jpl_url: "https://www.jpl.nasa.gov",
    is_sentry_object: false,
  },
  {
    id: "2345678",
    name: "(2023 Demo)",
    absolute_magnitude_h: 22.1,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.3 },
      meters: { estimated_diameter_min: 100, estimated_diameter_max: 300 },
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [
      {
        close_approach_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        relative_velocity: { kilometers_per_hour: "42000" },
        miss_distance: { kilometers: "850000", lunar: "2210" },
        orbiting_body: "Earth",
      },
    ],
    nasa_jpl_url: "https://www.jpl.nasa.gov",
    is_sentry_object: false,
  },
];