import { NextResponse } from "next/server";
import { getEPICImages, mockEPICImages } from "@/lib/nasa/epic";

export async function GET() {
  try {
    const data = await getEPICImages();
    return NextResponse.json(data);
  } catch (error) {
    console.error("EPIC API error:", error);
    return NextResponse.json(mockEPICImages);
  }
}
