import { NextResponse } from "next/server";
import { getAsteroids, mockAsteroids } from "@/lib/nasa/neows";

export async function GET() {
  try {
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startDate = today.toISOString().split("T")[0];
    const endDate = in7Days.toISOString().split("T")[0];

    const data = await getAsteroids(startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Asteroids API error:", error);
    // Return a mock NeoWResponse shape
    const today = new Date().toISOString().split("T")[0];
    return NextResponse.json({
      element_count: mockAsteroids.length,
      near_earth_objects: { [today]: mockAsteroids },
    });
  }
}
