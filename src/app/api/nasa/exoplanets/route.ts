import { NextResponse } from "next/server";
import { getExoplanets, mockExoplanets } from "@/lib/nasa/exoplanets";

export async function GET() {
  try {
    const data = await getExoplanets(100);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exoplanets API error:", error);
    // Return as an ExoplanetResponse shape with mock data mapped
    return NextResponse.json({
      fields: [
        "pl_name", "pl_rade", "pl_masse", "pl_orbper", "pl_orbsmax",
        "pl_eqt", "st_sptype", "st_teff", "st_rad", "st_mass",
        "sys_fn", "disc_year", "pl_disc", "pl_facility",
      ],
      data: mockExoplanets.map((p) => [
        p.pl_name, p.pl_rade, p.pl_masse, p.pl_orbper, p.pl_orbsmax,
        p.pl_eqt, p.st_sptype, p.st_teff, p.st_rad, p.st_mass,
        p.sys_fn, p.disc_year, p.pl_disc, p.pl_facility,
      ]),
    });
  }
}
