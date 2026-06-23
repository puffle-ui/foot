import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ORIGIN = 'https://spoort.yala--shoot.online';
const PLAYER_PATH = '/albaplayer/max2/';

/**
 * Proxies the full AlbaPlayer page for a given server number — a real
 * "website inside a website".
 *
 * The upstream blocks framing via X-Frame-Options / CSP frame-ancestors
 * (browser-enforced). A server fetch isn't subject to that, so we retrieve the
 * page and re-serve it from our own origin WITHOUT those headers, letting the
 * player's own JS run (including the obfuscated/nested stream decoders).
 */
export async function GET(req: NextRequest) {
  const serv = req.nextUrl.searchParams.get('serv') ?? '1';
  const target = `${ORIGIN}${PLAYER_PATH}?serv=${encodeURIComponent(serv)}`;
  const selfOrigin = req.nextUrl.origin;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: {
        'User-Agent':
          req.headers.get('user-agent') ??
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        // Present an allowed referer/origin in case content is gated.
        Referer: 'https://defr.online/',
        Origin: 'https://defr.online',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });
  } catch {
    return new Response('Stream source unreachable', { status: 502 });
  }

  let html = await upstream.text();

  // Resolve any relative assets against the real upstream origin.
  const baseTag = `<base href="${ORIGIN}${PLAYER_PATH}">`;
  html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);

  // Keep the player's internal server-switch links routed through this proxy
  // so clicking one inside the iframe stays same-origin (not re-blocked).
  const internalPrefix = `${ORIGIN}${PLAYER_PATH}?serv=`;
  html = html.split(internalPrefix).join(`${selfOrigin}/api/stream?serv=`);

  // Route any direct HLS playlist URL embedded in the page through our HLS
  // proxy, which carries the Referer the CDN requires and adds CORS headers —
  // otherwise the in-page player's segment requests get 403 / CORS-blocked.
  // Absolute self-origin URLs are used so the injected <base> can't rewrite them.
  html = html.replace(
    /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/gi,
    (m3u8) => `${selfOrigin}/api/hls?url=${encodeURIComponent(m3u8)}`,
  );

  return new Response(html, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // X-Frame-Options / CSP frame-ancestors deliberately omitted.
      'Cache-Control': 'no-store',
    },
  });
}
