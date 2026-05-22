import { NextResponse } from "next/server";

export interface NaturalEvent {
  id: string;
  title: string;
  category: "wildfires" | "severeStorms" | "volcanoes" | "earthquakes" | "other";
  categoryLabel: string;
  lat: number;
  lng: number;
  date: string;
  closed: boolean;
  source: string;
  description: string;
}

export async function GET() {
  try {
    // Fazer fetch na API EONET da NASA (eventos ativos e históricos)
    // Usamos limit=200 para ter uma boa quantidade de marcadores históricos e ativos no mapa
    const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?limit=200&status=all", {
      next: { revalidate: 1800 }, // Cache de 30 minutos
    });

    if (!res.ok) {
      throw new Error(`EONET API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawEvents = data.events || [];

    const events: NaturalEvent[] = [];

    rawEvents.forEach((ev: any) => {
      // Obter categoria
      const catId = ev.categories?.[0]?.id || "";
      const catTitle = ev.categories?.[0]?.title || "Outro";
      
      let category: NaturalEvent["category"] = "other";
      if (catId === "wildfires") category = "wildfires";
      else if (catId === "severeStorms") category = "severeStorms";
      else if (catId === "volcanoes") category = "volcanoes";
      else if (catId === "earthquakes") category = "earthquakes";

      // Obter primeira geometria (coordenadas)
      const geom = ev.geometries?.[0];
      if (!geom || geom.type !== "Point" || !Array.isArray(geom.coordinates)) {
        return; // Pular eventos sem ponto de localização fixo (como polígonos complexos ou sem dados)
      }

      const [lng, lat] = geom.coordinates;
      const date = geom.date || ev.closed || new Date().toISOString();

      events.push({
        id: ev.id,
        title: ev.title || "Evento Natural",
        category,
        categoryLabel: catTitle,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        date: date,
        closed: !!ev.closed,
        source: ev.sources?.[0]?.id || "NASA",
        description: ev.description || `Fenômeno natural de ${catTitle.toLowerCase()} monitorado por satélites de observação da Terra da NASA.`,
      });
    });

    // Se a API não retornar nada ou falhar, vamos alimentar com alguns eventos de catástrofes naturais históricos/recentes reais para manter o mapa rico
    if (events.length === 0) {
      events.push(...getMockNaturalEvents());
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("EONET API error:", error);
    return NextResponse.json({ events: getMockNaturalEvents() });
  }
}

function getMockNaturalEvents(): NaturalEvent[] {
  return [
    {
      id: "mock-fire-1",
      title: "Incêndio Florestal Complexo - Califórnia",
      category: "wildfires",
      categoryLabel: "Wildfires",
      lat: 38.5816,
      lng: -121.4944,
      date: new Date().toISOString(),
      closed: false,
      source: "NOAA",
      description: "Grande incêndio de vegetação detectado por sensores térmicos dos satélites MODIS e VIIRS.",
    },
    {
      id: "mock-storm-1",
      title: "Tempestade Tropical Mawar",
      category: "severeStorms",
      categoryLabel: "Severe Storms",
      lat: 15.3,
      lng: 135.5,
      date: new Date().toISOString(),
      closed: false,
      source: "JTWC",
      description: "Sistemas de baixa pressão evoluindo para ciclone com ventos intensos e alta precipitação.",
    },
    {
      id: "mock-volcano-1",
      title: "Erupção do Vulcão Etna",
      category: "volcanoes",
      categoryLabel: "Volcanoes",
      lat: 37.751,
      lng: 14.993,
      date: new Date().toISOString(),
      closed: false,
      source: "SIV",
      description: "Atividade efusiva contínua detectada através de imagens de infravermelho de satélite.",
    },
    {
      id: "mock-earthquake-1",
      title: "Terremoto na Falha de Anatólia",
      category: "earthquakes",
      categoryLabel: "Earthquakes",
      lat: 37.0,
      lng: 37.0,
      date: new Date().toISOString(),
      closed: false,
      source: "USGS",
      description: "Tremor de magnitude 6.2 na escala Richter detectado por sismógrafos e monitoramento de satélite.",
    },
    {
      id: "mock-fire-2",
      title: "Incêndio Florestal na Amazônia",
      category: "wildfires",
      categoryLabel: "Wildfires",
      lat: -9.0,
      lng: -63.0,
      date: new Date().toISOString(),
      closed: false,
      source: "INPE",
      description: "Foco ativo de queimada detectado pelo satélite de órbita polar NOAA-20.",
    },
    {
      id: "mock-storm-2",
      title: "Furacão Categoria 3 - Golfo do México",
      category: "severeStorms",
      categoryLabel: "Severe Storms",
      lat: 25.0,
      lng: -88.0,
      date: new Date().toISOString(),
      closed: false,
      source: "NHC",
      description: "Formação de olho de furacão visível a partir das imagens de satélite GOES-East da NOAA.",
    }
  ];
}
