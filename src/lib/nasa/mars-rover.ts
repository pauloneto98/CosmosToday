import { nasaClient } from "./client";

export type RoverName = "curiosity" | "perseverance" | "opportunity" | "spirit";

export interface MarsPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    status: string;
    launch_date: string;
    landing_date: string;
  };
}

export interface MarsRoverResponse {
  photos: MarsPhoto[];
}

export async function getMarsPhotos(
  rover: RoverName,
  sol?: number,
  earthDate?: string,
  camera?: string,
  page: number = 1
): Promise<MarsRoverResponse> {
  const params: Record<string, string> = { page: page.toString() };
  if (sol) params.sol = sol.toString();
  if (earthDate) params.earth_date = earthDate;
  if (camera) params.camera = camera;

  return nasaClient.fetch<MarsRoverResponse>(`/mars-photos/api/v1/rovers/${rover}/photos`, params, {
    cacheTime: 12 * 60 * 60,
  });
}

export async function getLatestMarsPhotos(rover: RoverName): Promise<MarsRoverResponse> {
  return nasaClient.fetch<MarsRoverResponse>(`/mars-photos/api/v1/rovers/${rover}/latest_photos`, {}, {
    cacheTime: 12 * 60 * 60,
  });
}

export const roverInfo = {
  curiosity: { name: "Curiosity", launched: "2011-11-26", status: "active", cameras: ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"] },
  perseverance: { name: "Perseverance", launched: "2020-07-30", status: "active", cameras: ["FHAZ", "RHAZ", "MCZ_RIGHT", "MCZ_LEFT", "NAVCAM", "SKYCAM", "SUPERCAM"] },
  opportunity: { name: "Opportunity", launched: "2003-07-07", status: "completed", cameras: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"] },
  spirit: { name: "Spirit", launched: "2003-06-10", status: "completed", cameras: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"] },
};

export const mockMarsPhotos: MarsPhoto[] = [
  {
    id: 1,
    sol: 1000,
    camera: { id: 1, name: "NAVCAM", full_name: "Navigation Camera" },
    img_src: "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/rdr/_navcam/MLP_4A_397_D_R00_0001_NNN1_thumb.jpg",
    earth_date: "2024-01-15",
    rover: { id: 1, name: "Curiosity", status: "active", launch_date: "2011-11-26", landing_date: "2012-08-06" },
  },
  {
    id: 2,
    sol: 999,
    camera: { id: 2, name: "MAST", full_name: "Mast Camera" },
    img_src: "https://mars.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/00999/rdr/mcam/MLM_4_443408292 EDT_R00_0390_0001_thumb.jpg",
    earth_date: "2024-01-14",
    rover: { id: 1, name: "Curiosity", status: "active", launch_date: "2011-11-26", landing_date: "2012-08-06" },
  },
];