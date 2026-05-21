import { nasaClient } from "./client";

export interface SolarEvent {
  id: string;
  type: string;
  title: string;
  beginTime: string;
  endTime?: string;
  sourceUrl?: string;
  linkedEvents?: Array<{ activityId: string }>;
}

export interface DONKIRoot {
  events: SolarEvent[];
}

export async function getSolarEvents(startDate: string, endDate: string): Promise<DONKIRoot> {
  return nasaClient.fetch<DONKIRoot>("/DONKI/notifications", {
    startDate,
    endDate,
    type: "all",
  }, {
    cacheTime: 30 * 60,
  });
}

export function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "FLR": "Solar Flare",
    "CME": "Coronal Mass Ejection",
    "GST": "Geomagnetic Storm",
    "SEP": "Solar Energetic Particle",
    "IPS": "Interplanetary Shock",
    "RBE": "Radio Burst",
    "report": "Relatório",
  };
  return labels[type] || type;
}

export function getEventTypeColor(type: string): "primary" | "secondary" | "accent" | "warning" | "danger" {
  const colors: Record<string, "primary" | "secondary" | "accent" | "warning" | "danger"> = {
    "FLR": "warning",
    "CME": "danger",
    "GST": "danger",
    "SEP": "accent",
    "IPS": "secondary",
    "RBE": "primary",
    "report": "primary",
  };
  return colors[type] || "primary";
}

export const mockSolarEvents: SolarEvent[] = [
  {
    id: "1",
    type: "FLR",
    title: "Solar Flare Demo - Configure NASA API Key",
    beginTime: new Date().toISOString(),
    sourceUrl: "https://www.swpc.noaa.gov/",
  },
  {
    id: "2",
    type: "CME",
    title: "Coronal Mass Ejection Demo",
    beginTime: new Date(Date.now() - 86400000).toISOString(),
  },
];