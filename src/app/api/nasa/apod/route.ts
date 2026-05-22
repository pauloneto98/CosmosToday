import { NextResponse } from "next/server";
import { getAPOD, mockAPOD } from "@/lib/nasa/apod";

export async function GET() {
  try {
    const data = await getAPOD();
    return NextResponse.json(data);
  } catch (error) {
    console.error("APOD API error:", error);
    return NextResponse.json(mockAPOD);
  }
}
