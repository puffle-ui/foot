'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Match, MatchGroup } from '@/types/match';
import { MatchCard } from '@/components/MatchCard';
import { LiveBadge } from '@/components/LiveBadge';
import { useI18n, type Dict, type Lang } from '@/lib/i18n';

interface MatchListProps {
  initialMatches: Match[];
}

function getUTCDateStr(daysOffset = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function localeOf(lang: Lang) {
  return lang === 'ar' ? 'ar' : 'en';
}

function formatKickoff(utcDate: string, lang: Lang): string {
  return new Date(utcDate).toLocaleTimeString(localeOf(lang), {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDay(utcDate: string, lang: Lang): string {
  return new Date(utcDate).toLocaleDateString(localeOf(lang), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function groupMatchesByDate(matches: Match[], t: Dict): MatchGroup[] {
  const labelMap: Record<string, string> = {
    [getUTCDateStr(0)]: t.today,
    [getUTCDateStr(1)]: t.tomorrow,
    [getUTCDateStr(2)]: t.in2days,
    [getUTCDateStr(3)]: t.in3days,
  };

  const map = new Map<string, Match[]>();
  for (const match of matches) {
    const date = match.utcDate.split('T')[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(match);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ms]) => ({
      date,
      label: labelMap[date] ?? date,
      matches: ms,
    }));
}

/** Big cinematic featured match at the top — always dark for the broadcast look. */
function FeaturedHero({ match }: { match: Match }) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const { homeTeam, awayTeam, score, status, competition, utcDate, stage } = match;

  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';
  const showScore =
    (isLive || isFinished) && score.fullTime.home !== null && score.fullTime.away !== null;

  return (
    <div
      onClick={() => router.push(`/match/${match.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#2a2a2a] bg-gradient-to-br from-[#1c0d10] via-[#121212] to-[#0c0c0c]"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-red-900/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-5 sm:gap-7 sm:p-9 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {isLive ? (
              <LiveBadge />
            ) : (
              <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
                {isFinished ? t.fullTime : t.upNext}
              </span>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              {competition.name}
              {stage ? ` · ${stage.replace(/_/g, ' ')}` : ''}
            </span>
          </div>

          <h2 className="font-bebas text-4xl leading-none tracking-wide text-white sm:text-6xl">
            {homeTeam.shortName ?? homeTeam.name}
            <span className="mx-3 text-red-500">{t.vs}</span>
            {awayTeam.shortName ?? awayTeam.name}
          </h2>

          <div className="mt-3 flex items-center gap-4">
            {showScore ? (
              <span className="font-bebas text-3xl tracking-wider text-white tabular-nums">
                {score.fullTime.home} <span className="text-white/25">–</span> {score.fullTime.away}
              </span>
            ) : (
              <span className="text-sm font-medium text-white/50">
                {formatDay(utcDate, lang)} · {formatKickoff(utcDate, lang)}
              </span>
            )}
          </div>

          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-red-600/30 transition group-hover:bg-red-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            {isLive ? t.watchLive : t.viewMatch}
          </button>
        </div>

        <div className="flex items-center justify-center gap-5 sm:gap-9">
          <img
            src={homeTeam.crest}
            alt={homeTeam.name}
            className="h-20 w-20 object-contain drop-shadow-2xl sm:h-28 sm:w-28"
            loading="eager"
          />
          <span className="font-bebas text-xl text-white/25 sm:text-3xl">{t.vs}</span>
          <img
            src={awayTeam.crest}
            alt={awayTeam.name}
            className="h-20 w-20 object-contain drop-shadow-2xl sm:h-28 sm:w-28"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="min-h-[160px] rounded-2xl border border-line bg-card p-4">
      <div className="mb-3 h-3 w-24 animate-shimmer rounded bg-fill-2" />
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-16 w-16 animate-shimmer rounded-full bg-fill-2" />
          <div className="h-3 w-20 animate-shimmer rounded bg-fill-2" />
        </div>
        <div className="h-8 w-12 animate-shimmer rounded bg-fill-2" />
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-16 w-16 animate-shimmer rounded-full bg-fill-2" />
          <div className="h-3 w-20 animate-shimmer rounded bg-fill-2" />
        </div>
      </div>
    </div>
  );
}

export function MatchList({ initialMatches }: MatchListProps) {
  const { t } = useI18n();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loading, setLoading] = useState(initialMatches.length === 0);

  useEffect(() => {
    if (initialMatches.length === 0) {
      fetch('/api/matches')
        .then((r) => r.json())
        .then((data: { matches: Match[] }) => {
          if (data.matches) setMatches(data.matches);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data: { matches: Match[] } = await res.json();
          if (data.matches) setMatches(data.matches);
        }
      } catch {
        // stale data is acceptable
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [initialMatches.length]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="mb-6 h-44 w-full animate-shimmer rounded-2xl bg-fill-2" />
        <div className="mb-4 h-6 w-20 animate-shimmer rounded bg-fill-2" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="mb-4 text-7xl">⚽</span>
        <p className="font-bebas text-3xl tracking-wide text-fg">{t.noMatches}</p>
        <p className="mt-2 text-sm text-fg-3">{t.checkBack}</p>
      </div>
    );
  }

  const live = matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const upcoming = matches
    .filter((m) => m.status === 'TIMED' || m.status === 'SCHEDULED')
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const featured = live[0] ?? upcoming[0] ?? matches[0];

  // Exclude featured match from the live section to avoid duplication
  const liveRest = live.filter((m) => m.id !== featured.id);

  const groups = groupMatchesByDate(
    matches.filter((m) => m.status !== 'IN_PLAY' && m.status !== 'PAUSED'),
    t,
  );

  return (
    <div className="py-6 space-y-10">
      <FeaturedHero match={featured} />

      {/* Live now section — only shown when other matches are also live */}
      {liveRest.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
            <h2 className="font-bebas text-3xl tracking-widest text-fg">Live Now</h2>
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-fg-3 tabular-nums">
              {liveRest.length} {liveRest.length !== 1 ? t.matches : t.match}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveRest.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.date}>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1 rounded-full bg-red-600" />
            <h2 className="font-bebas text-3xl tracking-widest text-fg">{group.label}</h2>
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-fg-3 tabular-nums">
              {group.matches.length} {group.matches.length !== 1 ? t.matches : t.match}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.matches.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
