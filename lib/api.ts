import { Match, MatchesResponse } from '@/types/match';

const BASE_URL = 'https://api.football-data.org/v4';

function getApiHeaders(): HeadersInit {
  return {
    'X-Auth-Token': process.env.FOOTBALL_API_KEY ?? '',
  };
}

export function getUTCDate(daysOffset = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export async function getMatches(): Promise<Match[]> {
  const dateFrom = getUTCDate(0);
  const dateTo = getUTCDate(3);

  const url = new URL(`${BASE_URL}/matches`);
  url.searchParams.set('dateFrom', dateFrom);
  url.searchParams.set('dateTo', dateTo);

  const res = await fetch(url.toString(), {
    headers: getApiHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`football-data.org error: ${res.status} ${res.statusText}`);
  }

  const data: MatchesResponse = await res.json();
  return data.matches;
}

export async function getMatchById(id: string | number): Promise<Match> {
  const res = await fetch(`${BASE_URL}/matches/${id}`, {
    headers: getApiHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`football-data.org error: ${res.status} ${res.statusText}`);
  }

  // The /matches/{id} endpoint returns the match object at the top level,
  // not nested under a "match" key like some other endpoints.
  const data: Match = await res.json();
  return data;
}
