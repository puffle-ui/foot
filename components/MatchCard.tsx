'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Match } from '@/types/match';
import { LiveBadge } from '@/components/LiveBadge';
import { useI18n, type Lang } from '@/lib/i18n';

interface MatchCardProps {
  match: Match;
  index: number;
}

function formatKickoff(utcDate: string, lang: Lang): string {
  return new Date(utcDate).toLocaleTimeString(lang === 'ar' ? 'ar' : 'en', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TeamSide({ team }: { team: Match['homeTeam'] }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fill ring-1 ring-line transition-transform duration-200 group-hover:scale-105">
        <img
          src={team.crest}
          alt={team.name}
          width={44}
          height={44}
          className="h-11 w-11 object-contain drop-shadow"
          loading="lazy"
        />
      </div>
      <span className="w-full truncate text-center text-[13px] font-bold leading-tight text-fg">
        {team.shortName ?? team.name}
      </span>
    </div>
  );
}

export function MatchCard({ match, index }: MatchCardProps) {
  const router = useRouter();
  const { lang, t } = useI18n();
  const { homeTeam, awayTeam, score, status, utcDate, competition } = match;

  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';
  const isScheduled = status === 'SCHEDULED' || status === 'TIMED';

  const homeScore = score.fullTime.home;
  const awayScore = score.fullTime.away;
  const showScore = (isLive || isFinished) && homeScore !== null && awayScore !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/match/${match.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-card to-card-2 transition-all duration-200 hover:shadow-[0_10px_40px_-10px_rgba(230,57,70,0.3)]"
    >
      {/* Hover sheen line across the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {/* Live accent bar */}
      {isLive && <div className="absolute left-0 top-0 h-full w-[3px] bg-red-600" />}

      {/* Header — competition + status */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
        <span className="truncate text-[10px] font-semibold uppercase tracking-widest text-fg-3">
          {competition.name}
        </span>
        <div className="shrink-0">
          {isLive && <LiveBadge />}
          {isFinished && (
            <span className="inline-flex items-center rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
              {t.ft}
            </span>
          )}
          {!isLive && !isFinished && !isScheduled && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-3">
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Teams + score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-3 py-4">
        <TeamSide team={homeTeam} />

        <div className="flex min-w-[58px] flex-col items-center justify-center px-1">
          {showScore ? (
            <span className="font-bebas text-[40px] leading-none tracking-wider text-fg tabular-nums">
              {homeScore}
              <span className="mx-1 text-fg-3">–</span>
              {awayScore}
            </span>
          ) : isScheduled ? (
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-bebas text-base leading-none tracking-widest text-fg-3">{t.vs}</span>
              <span className="rounded-md bg-fill-2 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-fg-2">
                {formatKickoff(utcDate, lang)}
              </span>
            </div>
          ) : (
            <span className="font-bebas text-2xl tracking-widest text-fg-3">{t.vs}</span>
          )}
        </div>

        <TeamSide team={awayTeam} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="truncate text-[10px] uppercase tracking-wider text-fg-3">
          {new Date(utcDate).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short' })}
          {match.stage ? ` · ${match.stage.replace(/_/g, ' ')}` : ''}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {t.watch}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
}
