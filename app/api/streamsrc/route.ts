import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ORIGIN = 'https://spoort.yala--shoot.online';
const PLAYER_PATH = '/albaplayer/max2/';

const SPOOF_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Referer: 'https://defr.online/',
  Origin: 'https://defr.online',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

/**
 * Resolves the real playable source for a given server number.
 *
 * Each `?serv=N` page either:
 *  - embeds a direct HLS `.m3u8` stream (most HD servers), or
 *  - embeds a nested <iframe> pointing at another embed host.
 *
 * We fetch the page server-side (browsers can't, due to its X-Frame-Options),
 * extract whichever it is, and tell the client how to play it.
 */
export async function GET(req: NextRequest) {
  const serv = req.nextUrl.searchParams.get('serv') ?? '1';
  const target = `${ORIGIN}${PLAYER_PATH}?serv=${encodeURIComponent(serv)}`;

  let html: string;
  try {
    const res = await fetch(target, { headers: SPOOF_HEADERS, cache: 'no-store' });
    html = await res.text();
  } catch {
    return NextResponse.json({ kind: 'none' }, { status: 502 });
  }

  // 1) Direct HLS stream — preferred (plays natively, smooth, no iframe).
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i)?.[0];
  if (m3u8) {
    return NextResponse.json({ kind: 'hls', url: m3u8 });
  }

  // 2) Otherwise the page uses an obfuscated/nested player whose source can
  //    only be decoded by its own JS — embed the full player page instead
  //    (website-inside-a-website) and let it run.
  return NextResponse.json({ kind: 'embed' });
}
