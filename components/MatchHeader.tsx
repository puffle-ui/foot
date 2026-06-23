'use client';

import { Match } from '@/types/match';
import { LiveBadge } from '@/components/LiveBadge';
import { useI18n } from '@/lib/i18n';

export function MatchHeader({ match }: { match: Match }) {
  const { t } = useI18n();
  const { homeTeam, awayTeam, score, status, competition, stage } = match;

  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';

  const homeScore = score.fullTime.home;
  const awayScore = score.fullTime.away;
  const showScore = (isLive || isFinished) && homeScore !== null && awayScore !== null;

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-line bg-card">
      {/* Competition strip */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2 sm:px-6">
        <span className="truncate text-xs font-semibold uppercase tracking-widest text-fg-3">
          {competition.name}
          {stage ? ` · ${stage.replace(/_/g, ' ')}` : ''}
        </span>
        <div className="shrink-0">
          {isLive && <LiveBadge />}
          {isFinished && (
            <span className="inline-flex items-center rounded-full bg-emerald-600/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-500">
              {t.fullTime}
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-xs font-semibold uppercase tracking-widest text-fg-3">{status}</span>
          )}
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        {/* Home */}
        <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <img
            src={homeTeam.crest}
            alt={homeTeam.name}
            width={56}
            height={56}
            className="h-14 w-14 object-contain drop-shadow-xl"
          />
          <span className="font-bebas text-2xl tracking-wider text-fg sm:text-3xl">
            {homeTeam.name}
          </span>
        </div>

        {/* Score / VS */}
        <div className="px-6">
          {showScore ? (
            <span className="font-bebas text-5xl tracking-widest text-fg tabular-nums">
              {homeScore}
              <span className="mx-2 text-fg-3">–</span>
              {awayScore}
            </span>
          ) : (
            <span className="font-bebas text-3xl tracking-widest text-fg-3">{t.vs}</span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row-reverse sm:items-center sm:gap-4">
          <img
            src={awayTeam.crest}
            alt={awayTeam.name}
            width={56}
            height={56}
            className="h-14 w-14 object-contain drop-shadow-xl"
          />
          <span className="font-bebas text-2xl tracking-wider text-fg sm:text-3xl">
            {awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  );
}
