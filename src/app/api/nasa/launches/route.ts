import { NextResponse } from "next/server";
import { getUpcomingLaunches, mockLaunches } from "@/lib/external/launch-library";

export async function GET() {
  try {
    const data = await getUpcomingLaunches(10);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Launches API error:", error);
    return NextResponse.json(mockLaunches);
  }
}
