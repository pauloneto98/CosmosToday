const LAUNCH_LIB_BASE = "https://ll.thespacedevs.com/2.3.0";
const SPACEX_API_BASE = "https://api.spacexdata.com/v4";

export interface Launch {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
    description: string;
  };
  window_start: string;
  window_end: string;
  mission: {
    id: number;
    name: string;
    description: string;
    type: string;
  } | null;
  rocket: {
    id: number;
    name: string;
    configuration: {
      name: string;
    };
  } | null;
  pad: {
    id: number;
    name: string;
    location: {
      name: string;
      country_code: string;
    };
  } | null;
  image: string | null;
  webcast_live: boolean;
}

export async function getUpcomingLaunches(limit: number = 10): Promise<Launch[]> {
  // Try The Space Devs first with User-Agent header
  try {
    const response = await fetch(`${LAUNCH_LIB_BASE}/launch/upcoming/?limit=${limit}`, {
      headers: {
        "User-Agent": "CosmosDaily/1.0",
        "Accept": "application/json",
      },
      next: { revalidate: 15 * 60 },
    });

    if (response.status === 429) {
      throw new Error("Rate limited by The Space Devs API");
    }

    if (!response.ok) {
      throw new Error(`Launch Library API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (err) {
    console.warn("The Space Devs API failed, falling back to SpaceX API:", err);
    return getSpaceXUpcomingLaunches(limit);
  }
}

async function getSpaceXUpcomingLaunches(limit: number): Promise<Launch[]> {
  const response = await fetch(`${SPACEX_API_BASE}/launches/upcoming`, {
    headers: {
      "User-Agent": "CosmosDaily/1.0",
    },
    next: { revalidate: 15 * 60 },
  });

  if (!response.ok) {
    throw new Error(`SpaceX API error: ${response.status} ${response.statusText}`);
  }

  const launches: Record<string, unknown>[] = await response.json();

  return launches.slice(0, limit).map((launch) => {
    const links = launch.links as Record<string, unknown> | undefined;
    const patch = links?.patch as Record<string, string> | undefined;

    return {
      id: String(launch.id || ""),
      name: String(launch.name || "Unknown Launch"),
      status: {
        id: 1,
        name: launch.upcoming ? "Go for Launch" : "TBD",
        abbrev: launch.upcoming ? "GO" : "TBD",
        description: "",
      },
      window_start: String(launch.date_utc || new Date().toISOString()),
      window_end: String(launch.date_utc || new Date().toISOString()),
      mission: {
        id: 0,
        name: String(launch.details || launch.name || "Unknown"),
        description: String(launch.details || ""),
        type: "Unknown",
      },
      rocket: {
        id: 0,
        name: "Falcon 9",
        configuration: { name: "Falcon 9" },
      },
      pad: {
        id: 0,
        name: String(launch.launchpad || ""),
        location: { name: "Cape Canaveral", country_code: "US" },
      },
      image: patch?.small || null,
      webcast_live: links?.webcast ? true : false,
    } as Launch;
  });
}

export async function getLaunchById(id: string): Promise<Launch> {
  const response = await fetch(`${LAUNCH_LIB_BASE}/launch/${id}/`, {
    headers: {
      "User-Agent": "CosmosDaily/1.0",
      "Accept": "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Launch Library API error: ${response.statusText}`);
  }

  return response.json();
}

export function getStatusColor(abbrev: string): "primary" | "secondary" | "accent" | "warning" | "danger" {
  const colors: Record<string, "primary" | "secondary" | "accent" | "warning" | "danger"> = {
    "GO": "primary",
    "TBC": "warning",
    "TBD": "warning",
    "SUCCESS": "primary",
    "FAILURE": "danger",
    "HOLD": "warning",
    "IN FLIGHT": "primary",
  };
  return colors[abbrev] || "warning";
}

export function formatCountdown(dateStr: string): { days: number; hours: number; minutes: number } {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

export const mockLaunches: Launch[] = [
  {
    id: "demo-1",
    name: "Demo Launch - Configure API para dados reais",
    status: { id: 1, name: "Go for Launch", abbrev: "GO", description: "Ready to launch" },
    window_start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    window_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    mission: { id: 1, name: "Demo Mission", description: "Configure NASA_API_KEY no .env.local", type: "Deep Space" },
    rocket: { id: 1, name: "Demo Rocket", configuration: { name: "Falcon 9" } },
    pad: { id: 1, name: "Demo Pad", location: { name: "Cabo Canaveral, EUA", country_code: "US" } },
    image: null,
    webcast_live: false,
  },
  {
    id: "demo-2",
    name: "Demo Launch 2",
    status: { id: 2, name: "To Be Determined", abbrev: "TBD", description: "Date to be determined" },
    window_start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    window_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    mission: { id: 2, name: "Demo Mission 2", description: "Demo", type: "Communications" },
    rocket: { id: 2, name: "Demo Rocket 2", configuration: { name: "Atlas V" } },
    pad: { id: 2, name: "Demo Pad 2", location: { name: "Vandenberg, EUA", country_code: "US" } },
    image: null,
    webcast_live: false,
  },
];