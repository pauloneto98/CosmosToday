import { nasaClient } from "./client";

export interface APOD {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
  thumbnail_url?: string;
}

export async function getAPOD(date?: string): Promise<APOD> {
  const params: Record<string, string> = {};
  if (date) params.date = date;

  return nasaClient.fetch<APOD>("/planetary/apod", params, {
    cacheTime: 24 * 60 * 60,
  });
}

export async function getAPODRange(startDate: string, endDate: string): Promise<APOD[]> {
  return nasaClient.fetch<APOD[]>("/planetary/apod", {
    start_date: startDate,
    end_date: endDate,
  }, {
    cacheTime: 24 * 60 * 60,
  });
}

export const mockAPOD: APOD = {
  date: new Date().toISOString().split("T")[0],
  explanation: "Esta é uma imagem de demonstração do CosmosDaily. Configure a variável NASA_API_KEY no arquivo .env.local para ver a foto astronômica real do dia.",
  hdurl: "https://apod.nasa.gov/apod/image/2309/pillars_lego_c2_1024.jpg",
  media_type: "image",
  service_version: "v1",
  title: "CosmosDaily - Configure sua NASA API Key",
  url: "https://apod.nasa.gov/apod/image/2309/pillars_lego_c2_1024.jpg",
  copyright: "NASA",
};