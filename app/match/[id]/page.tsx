import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMatchById } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MatchHeader } from '@/components/MatchHeader';
import { AdSlot } from '@/components/AdSlot';

export const revalidate = 60;

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const match = await getMatchById(params.id);
    const title = `${match.homeTeam.name} vs ${match.awayTeam.name} — ONADA`;
    return {
      title,
      description: `Watch ${match.homeTeam.name} vs ${match.awayTeam.name} live on ONADA.`,
      openGraph: {
        title,
        images: [{ url: match.homeTeam.crest }],
      },
    };
  } catch {
    return { title: 'Match — ONADA' };
  }
}

export default async function MatchPage({ params }: PageProps) {
  let match;
  try {
    match = await getMatchById(params.id);
  } catch {
    notFound();
  }

  if (!match) notFound();

  return (
    <div className="py-4">
      {/* Score banner at the top */}
      <MatchHeader match={match} />

      {/* Video player */}
      <VideoPlayer homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />

      {/*
        LIVE CHAT PLACEHOLDER
        Embed a chat widget here, e.g.:
          <iframe src="https://your-chat.com/room/{match.id}" className="w-full h-96 rounded-xl" />
      */}
    </div>
  );
}
