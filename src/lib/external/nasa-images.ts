const IMAGES_API_BASE = "https://images-api.nasa.gov";

export interface NASAImage {
  nasa_id: string;
  title: string;
  description: string;
  description_508: string | null;
  date_created: string;
  media_type: "image" | "video";
  center: string;
  keywords: string[];
  location: string | null;
  asset: {
    thumbnail: string;
    "1000": string;
    "4k": string;
    hd: string;
  };
}

export interface NASAImageSearchResponse {
  collection: {
    version: string;
    href: string;
    items: Array<{
      href: string;
      data: NASAImage[];
      links?: Array<{ href: string; rel: string; render: string }>;
    }>;
  };
}

export async function searchNASAImages(
  query: string,
  mediaType: "image" | "video" | "audio" = "image",
  page: number = 1
): Promise<NASAImageSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    media_type: mediaType,
    page: page.toString(),
  });

  const response = await fetch(`${IMAGES_API_BASE}/search?${params}`, {
    next: { revalidate: 6 * 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`NASA Images API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getNASAImage(nasaId: string): Promise<NASAImage> {
  const response = await fetch(`${IMAGES_API_BASE}/asset/${nasaId}`, {
    next: { revalidate: 6 * 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`NASA Images API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.collection.items[0].data[0];
}

export const categories = [
  { id: "mission", label: "Missões", query: "mission" },
  { id: "aeronautics", label: "Aeronáutica", query: "aircraft" },
  { id: "earth", label: "Terra", query: "earth" },
  { id: "universe", label: "Universo", query: "universe" },
  { id: "people", label: "Pessoas", query: "astronaut" },
];

export const mockImages: NASAImage[] = [
  {
    nasa_id: "demo-1",
    title: "Demo - Configure NASA_API_KEY para imagens reais",
    description: "Esta é uma imagem de demonstração. Configure NASA_IMAGE_API_KEY no .env.local para ver imagens reais da NASA.",
    description_508: null,
    date_created: new Date().toISOString(),
    media_type: "image",
    center: "JSC",
    keywords: ["demo", "cosmosdaily"],
    location: null,
    asset: {
      thumbnail: "https://images-assets.nasa.gov/image/iss067e000000/iss067e000000~thumb.jpg",
      "1000": "https://images-assets.nasa.gov/image/iss067e000000/iss067e000000~medium.jpg",
      "4k": "https://images-assets.nasa.gov/image/iss067e000000/iss067e000000~4k.jpg",
      hd: "https://images-assets.nasa.gov/image/iss067e000000/iss067e000000~hd.jpg",
    },
  },
  {
    nasa_id: "demo-2",
    title: "Terra do Espaço",
    description: "Imagem de demonstração da Terra vista do espaço.",
    description_508: null,
    date_created: new Date(Date.now() - 86400000).toISOString(),
    media_type: "image",
    center: "GSFC",
    keywords: ["earth", "demo"],
    location: null,
    asset: {
      thumbnail: "https://images-assets.nasa.gov/image/0400200/0400200~thumb.jpg",
      "1000": "https://images-assets.nasa.gov/image/0400200/0400200~medium.jpg",
      "4k": "https://images-assets.nasa.gov/image/0400200/0400200~4k.jpg",
      hd: "https://images-assets.nasa.gov/image/0400200/0400200~hd.jpg",
    },
  },
];