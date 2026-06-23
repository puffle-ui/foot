'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Match } from '@/types/match';
import { useI18n } from '@/lib/i18n';

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5z" fill="white" stroke="none" />
      <path d="M12 2.5v5M21 9l-4.5 1.5M18.5 19l-3.5-3M5.5 19l3.5-3M3 9l4.5 1.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Header() {
  const [isDark, setIsDark] = useState(true);
  const [hasLive, setHasLive] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const isMatchPage = pathname?.startsWith('/match/') ?? false;
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }

    async function checkLive() {
      try {
        const res = await fetch('/api/matches');
        if (!res.ok) return;
        const data: { matches: Match[] } = await res.json();
        setHasLive(
          data.matches?.some((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED') ?? false,
        );
      } catch {}
    }

    checkLive();
    const interval = setInterval(checkLive, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Hide the bar on scroll-down, reveal on scroll-up (phones only — CSS keeps
  // it pinned on large screens). Throttled with rAF for smoothness.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY && y > 80) setHidden(true);
        else if (y < lastY) setHidden(false);
        lastY = y;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <header
      dir="ltr"
      className={`sticky top-0 z-50 w-full border-b border-line bg-bg/95 transition-transform duration-300 will-change-transform sm:bg-bg/75 sm:backdrop-blur-xl lg:!translate-y-0 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* thin red accent line at the very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4">
        {/* Left: back button (match pages only) + logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isMatchPage && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-fill px-3 py-1.5 text-xs font-semibold text-fg-2 transition hover:bg-fill-2 hover:text-fg"
            >
              <BackIcon />
              <span className="hidden sm:inline">{t.allMatches}</span>
            </Link>
          )}

          {isMatchPage && <span className="hidden h-6 w-px bg-line sm:block" />}

          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-600/30 transition-transform duration-200 group-hover:scale-105">
              <BallIcon />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-bebas text-2xl leading-none tracking-[0.14em] text-fg">ONADA</span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-red-500">
                {t.tagline}
              </span>
            </span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {hasLive && (
            <span className="hidden items-center gap-1.5 rounded-full border border-red-500/40 bg-red-600/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400 sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {t.liveNow}
            </span>
          )}

          {/* Language toggle */}
          <div className="flex items-center rounded-full border border-line bg-fill p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLang('en')}
              className={`rounded-full px-2 py-1 transition ${lang === 'en' ? 'bg-red-600 text-white' : 'text-fg-3 hover:text-fg'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`rounded-full px-2 py-1 transition ${lang === 'ar' ? 'bg-red-600 text-white' : 'text-fg-3 hover:text-fg'}`}
            >
              ع
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-fill text-fg-2 transition hover:bg-fill-2 hover:text-fg"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
