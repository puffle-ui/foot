import { getMatches } from '@/lib/api';
import { MatchList } from '@/components/MatchList';
import type { Match } from '@/types/match';

export const revalidate = 60;

export default async function HomePage() {
  let matches: Match[] = [];

  try {
    matches = await getMatches();
  } catch (error) {
    console.error('[HomePage] Failed to fetch matches:', error);
  }

  return <MatchList initialMatches={matches} />;
}
