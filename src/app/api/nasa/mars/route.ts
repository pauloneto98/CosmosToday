import { NextRequest, NextResponse } from "next/server";
import { mockMarsPhotos, type RoverName, type MarsRoverResponse } from "@/lib/nasa/mars-rover";

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const MARS_BASE = "https://api.nasa.gov/mars-photos/api/v1/rovers";

async function fetchMarsPhotos(rover: RoverName, sol: number): Promise<MarsRoverResponse> {
  const url = `${MARS_BASE}/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Mars API error: ${res.status}`);
  const data = await res.json();
  return data as MarsRoverResponse;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rover = (searchParams.get("rover") || "curiosity") as RoverName;
  const solParam = searchParams.get("sol");
  const sol = solParam ? parseInt(solParam, 10) : 1000;

  try {
    // Try requested sol first
    const data = await fetchMarsPhotos(rover, sol);
    if (data.photos && data.photos.length > 0) {
      return NextResponse.json(data);
    }

    // If no photos for that sol, fallback to sol=1000 for curiosity
    if (sol !== 1000 || rover !== "curiosity") {
      console.warn(`No photos for ${rover} sol ${sol}, falling back to curiosity sol=1000`);
      const fallbackData = await fetchMarsPhotos("curiosity", 1000);
      if (fallbackData.photos && fallbackData.photos.length > 0) {
        return NextResponse.json(fallbackData);
      }
    }

    // All APIs returned empty, use mock
    return NextResponse.json({ photos: mockMarsPhotos });
  } catch (error) {
    console.error("Mars Rover API error:", error);
    // Try fallback sol=1000 for curiosity
    try {
      const fallbackData = await fetchMarsPhotos("curiosity", 1000);
      if (fallbackData.photos && fallbackData.photos.length > 0) {
        return NextResponse.json(fallbackData);
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ photos: mockMarsPhotos });
  }
}
