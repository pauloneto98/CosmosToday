import { NextResponse } from "next/server";
import { mockSolarEvents, type SolarEvent } from "@/lib/nasa/donki";

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const DONKI_BASE = "https://api.nasa.gov/DONKI";

async function fetchDONKI<T>(endpoint: string, startDate: string, endDate: string): Promise<T[]> {
  const url = `${DONKI_BASE}/${endpoint}?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`DONKI ${endpoint} error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function GET() {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const [flares, cmes, storms] = await Promise.allSettled([
      fetchDONKI<Record<string, unknown>>("FLR", startDate, endDate),
      fetchDONKI<Record<string, unknown>>("CME", startDate, endDate),
      fetchDONKI<Record<string, unknown>>("GST", startDate, endDate),
    ]);

    const events: SolarEvent[] = [];

    if (flares.status === "fulfilled") {
      for (const f of flares.value) {
        events.push({
          id: String(f.flrID || `flr-${events.length}`),
          type: "FLR",
          title: `Solar Flare ${f.classType || ""}`.trim(),
          beginTime: String(f.beginTime || new Date().toISOString()),
          endTime: f.endTime ? String(f.endTime) : undefined,
          sourceUrl: f.link ? String(f.link) : undefined,
        });
      }
    }

    if (cmes.status === "fulfilled") {
      for (const c of cmes.value) {
        events.push({
          id: String(c.activityID || `cme-${events.length}`),
          type: "CME",
          title: `Coronal Mass Ejection`,
          beginTime: String(c.startTime || new Date().toISOString()),
          sourceUrl: c.link ? String(c.link) : undefined,
        });
      }
    }

    if (storms.status === "fulfilled") {
      for (const g of storms.value) {
        events.push({
          id: String(g.gstID || `gst-${events.length}`),
          type: "GST",
          title: `Geomagnetic Storm Kp${g.allKpIndex && Array.isArray(g.allKpIndex) ? ` ${(g.allKpIndex as Record<string, unknown>[])[0]?.kpIndex || ""}` : ""}`.trim(),
          beginTime: String(g.startTime || new Date().toISOString()),
          sourceUrl: g.link ? String(g.link) : undefined,
        });
      }
    }

    // Sort by beginTime descending
    events.sort((a, b) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime());

    if (events.length === 0) {
      return NextResponse.json({ events: mockSolarEvents });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Solar API error:", error);
    return NextResponse.json({ events: mockSolarEvents });
  }
}
