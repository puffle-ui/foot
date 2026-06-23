'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { clsx } from 'clsx';
import { useI18n } from '@/lib/i18n';

type Source =
  | { kind: 'hls'; url: string }
  | { kind: 'iframe'; url: string };

const SERVERS: { label: string; serv: number; source: Source | null }[] = [
  { label: 'HD 1', serv: 1, source: { kind: 'iframe', url: 'https://player.syria-player.live/albaplayer/beinmax1/' } },
  { label: 'HD 2', serv: 2, source: { kind: 'iframe', url: 'https://hd.muesra.sbs/albaplayer/oooe/' } },
  { label: 'HD 3', serv: 3, source: { kind: 'iframe', url: 'https://www.yalla9live.tv/albaplayer/sport1/?serv=1' } },
  { label: 'HD 4', serv: 4, source: { kind: 'hls', url: 'https://s3.us-east-2.amazonaws.com/cdng101/hls/0/stream.m3u8' } },
  { label: 'HD 5', serv: 5, source: { kind: 'iframe', url: 'https://games.ok.ru/videoembed/15136044097233' } },
];

export function VideoPlayer() {
  const { t } = useI18n();
  const [activeServ, setActiveServ] = useState(1);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) {
        setControlsVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const active = SERVERS.find((s) => s.serv === activeServ) ?? SERVERS[0];
  const source = active.source;

  useEffect(() => {
    if (!source || source.kind !== 'hls') return;
    const video = videoRef.current;
    if (!video) return;

    setStatus('loading');
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ lowLatencyMode: true, enableWorker: true });
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('ready');
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setStatus('error');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      video.addEventListener('loadedmetadata', () => {
        setStatus('ready');
        video.play().catch(() => {});
      });
    } else {
      setStatus('error');
    }

    return () => {
      if (hls) hls.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeServ, source?.kind, source?.kind === 'hls' ? source.url : '']);

  return (
    <div className="w-full">
      {/* heading */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
        <h2 className="font-bebas text-2xl tracking-widest text-fg">{t.watchLiveHeading}</h2>
      </div>

      {/* Server switcher buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {SERVERS.map(({ label, serv }) => (
          <button
            key={serv}
            onClick={() => setActiveServ(serv)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150',
              activeServ === serv
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                : 'border border-line bg-fill text-fg-2 hover:bg-fill-2 hover:text-fg',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 16:9 player — isolated into its own compositor layer so scrolling the
          page doesn't force the video/iframe to repaint (prevents scroll lag). */}
      <div
        ref={containerRef}
        onMouseMove={showControls}
        onMouseEnter={showControls}
        onMouseLeave={() => { setControlsVisible(false); if (hideTimer.current) clearTimeout(hideTimer.current); }}
        className="relative h-0 w-full overflow-hidden rounded-xl border border-line bg-black"
        style={{
          paddingBottom: isFullscreen ? '0' : '56.25%',
          minHeight: isFullscreen ? undefined : '220px',
          height: isFullscreen ? '100%' : undefined,
          transform: 'translateZ(0)',
          willChange: 'transform',
          isolation: 'isolate',
          cursor: isFullscreen && !controlsVisible ? 'none' : 'default',
        }}
      >
        {!source ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
            <span className="text-3xl">📡</span>
            <p className="text-sm text-white/50">Stream coming soon</p>
          </div>
        ) : source.kind === 'hls' ? (
          <>
            {status !== 'ready' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black">
                {status === 'error' ? (
                  <>
                    <span className="text-3xl">⚠️</span>
                    <p className="px-4 text-center text-sm text-white/50">{t.streamUnavailable}</p>
                  </>
                ) : (
                  <>
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-red-600" />
                    <p className="text-xs text-white/40">{t.connecting}</p>
                  </>
                )}
              </div>
            )}
            <video
              key={`hls-${activeServ}`}
              ref={videoRef}
              className="absolute inset-0 h-full w-full"
              controls
              autoPlay
              playsInline
              muted
            />
          </>
        ) : (
          <iframe
            key={`iframe-${activeServ}`}
            src={source.url}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0, transform: 'translateZ(0)', willChange: 'transform' }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
            title={`Live stream — ${active.label}`}
          />
        )}

        {/* For HLS: our fullscreen button. For iframes: hint to use the stream's own button */}
        {source.kind === 'hls' ? (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/80"
            style={{ opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              </svg>
            )}
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-center text-xs text-fg-3">{t.playerHint}</p>
    </div>
  );
}
