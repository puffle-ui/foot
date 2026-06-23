'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { clsx } from 'clsx';
import { useI18n } from '@/lib/i18n';

type Source =
  | { kind: 'hls'; url: string }
  | { kind: 'iframe'; url: string };

const SERVERS: { label: string; serv: number; source: Source }[] = [
  { label: 'HD 1', serv: 2, source: { kind: 'iframe', url: 'https://www.yalla9live.tv/albaplayer/sport1/?serv=1' } },
  { label: 'HD 2', serv: 3, source: { kind: 'hls', url: 'https://s3.us-east-2.amazonaws.com/cdng101/hls/0/stream.m3u8' } },
  { label: 'HD 3', serv: 4, source: { kind: 'iframe', url: 'https://games.ok.ru/videoembed/15136044097233' } },
];

export function VideoPlayer() {
  const { t } = useI18n();
  const [activeServ, setActiveServ] = useState(2);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = SERVERS.find((s) => s.serv === activeServ) ?? SERVERS[0];
  const source = active.source;

  useEffect(() => {
    if (source.kind !== 'hls') return;
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
  }, [activeServ, source.kind, source.kind === 'hls' ? source.url : '']);

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
        className="relative h-0 w-full overflow-hidden rounded-xl border border-line bg-black"
        style={{
          paddingBottom: '56.25%',
          contain: 'content',
          transform: 'translateZ(0)',
          willChange: 'transform',
          isolation: 'isolate',
        }}
      >
        {source.kind === 'hls' ? (
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
      </div>

      <p className="mt-2 text-center text-xs text-fg-3">{t.playerHint}</p>
    </div>
  );
}
