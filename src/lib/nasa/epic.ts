import { nasaClient } from "./client";

export interface EPICImage {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  centroid_coordinates: { lat: number; lon: number };
  dscovr_j2000_position: { x: number; y: number; z: number };
  lunar_j2000_position: { x: number; y: number; z: number };
  sun_j2000_position: { x: number; y: number; z: number };
  attitude_quaternions: { q0: number; q1: number; q2: number; q3: number };
  img_type: "NAT" | "ENH" | "Aerosol";
}

export async function getEPICImages(date?: string): Promise<EPICImage[]> {
  const targetDate = date || new Date().toISOString().split("T")[0].replace(/-/g, "/");
  return nasaClient.fetch<EPICImage[]>(`/EPIC/api/natural/date/${targetDate}`, {}, {
    cacheTime: 6 * 60 * 60,
  });
}

export async function getEPICEnhanced(date?: string): Promise<EPICImage[]> {
  const targetDate = date || new Date().toISOString().split("T")[0].replace(/-/g, "/");
  return nasaClient.fetch<EPICImage[]>(`/EPIC/api/enhanced/date/${targetDate}`, {}, {
    cacheTime: 6 * 60 * 60,
  });
}

export async function getEPICAerosol(date?: string): Promise<EPICImage[]> {
  const targetDate = date || new Date().toISOString().split("T")[0].replace(/-/g, "/");
  return nasaClient.fetch<EPICImage[]>(`/EPIC/api/aerosol/date/${targetDate}`, {}, {
    cacheTime: 6 * 60 * 60,
  });
}

export function getEPICImageUrl(image: string, type: "natural" | "enhanced" | "aerosol" = "natural"): string {
  const date = image.split("_")[0].replace(/-/g, "/");
  return `https://epic.gsfc.nasa.gov/${type === "natural" ? "natural" : type === "enhanced" ? "enhanced" : "aerosol"}/png/${image}.png`;
}

export const mockEPICImages: EPICImage[] = [
  {
    identifier: "demo_001",
    caption: "Terra vista do espaço - Demo. Configure NASA_API_KEY para ver imagens reais.",
    image: "demo_2024_01_01",
    date: new Date().toISOString(),
    centroid_coordinates: { lat: 0, lon: 0 },
    dscovr_j2000_position: { x: 1000000, y: 500000, z: 200000 },
    lunar_j2000_position: { x: 300000, y: 100000, z: 50000 },
    sun_j2000_position: { x: 150000000, y: 50000, z: 10000 },
    attitude_quaternions: { q0: 1, q1: 0, q2: 0, q3: 0 },
    img_type: "NAT",
  },
  {
    identifier: "demo_002",
    caption: "Atlântico Sul - Demo Mode",
    image: "demo_2024_01_02",
    date: new Date(Date.now() - 86400000).toISOString(),
    centroid_coordinates: { lat: -20, lon: -40 },
    dscovr_j2000_position: { x: 1000000, y: 500000, z: 200000 },
    lunar_j2000_position: { x: 300000, y: 100000, z: 50000 },
    sun_j2000_position: { x: 150000000, y: 50000, z: 10000 },
    attitude_quaternions: { q0: 1, q1: 0, q2: 0, q3: 0 },
    img_type: "ENH",
  },
];