import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// The CDN gates the playlist + segments by Referer === the player's own host.
const STREAM_REFERER = 'https://spoort.yala--shoot.online/';
const STREAM_ORIGIN = 'https://spoort.yala--shoot.online';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
};

function isBlockedHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '::1' ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return new Response('Missing url', { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response('Invalid url', { status: 400 });
  }
  if (target.protocol !== 'https:' || isBlockedHost(target.hostname)) {
    return new Response('Host not allowed', { status: 403 });
  }

  const range = req.headers.get('range');

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent':
          req.headers.get('user-agent') ??
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Referer: STREAM_REFERER,
        Origin: STREAM_ORIGIN,
        ...(range ? { Range: range } : {}),
      },
      cache: 'no-store',
    });
  } catch {
    return new Response('Stream source unreachable', { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') ?? '';
  const isPlaylist =
    /\.m3u8(\?|$)/i.test(target.pathname) ||
    /mpegurl/i.test(contentType);

  const selfOrigin = req.nextUrl.origin;
  const proxify = (abs: string) =>
    `${selfOrigin}/api/hls?url=${encodeURIComponent(abs)}`;
  const resolve = (u: string) => new URL(u, target.toString()).toString();

  // Rewrite a playlist so every segment / sub-playlist / key is routed back
  // through this proxy (which carries the required Referer).
  if (isPlaylist) {
    const text = await upstream.text();
    const rewritten = text
      .split('\n')
      .map((line) => {
        const t = line.trim();
        if (t === '') return line;
        if (t.startsWith('#')) {
          // Rewrite URI="..." attributes (EXT-X-KEY / EXT-X-MEDIA / EXT-X-MAP).
          return line.replace(
            /URI="([^"]+)"/g,
            (_m, u) => `URI="${proxify(resolve(u))}"`,
          );
        }
        // A media or sub-playlist URL line.
        return proxify(resolve(t));
      })
      .join('\n');

    return new Response(rewritten, {
      status: upstream.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Binary segment / key — stream the bytes through with CORS added.
  const body = await upstream.arrayBuffer();
  const headers: Record<string, string> = {
    ...CORS_HEADERS,
    'Content-Type': contentType || 'video/mp2t',
    'Cache-Control': 'no-store',
  };
  const contentRange = upstream.headers.get('content-range');
  const acceptRanges = upstream.headers.get('accept-ranges');
  if (contentRange) headers['Content-Range'] = contentRange;
  if (acceptRanges) headers['Accept-Ranges'] = acceptRanges;

  return new Response(body, { status: upstream.status, headers });
}
