import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/api';

export const revalidate = 60;

export async function GET() {
  try {
    const matches = await getMatches();
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('[/api/matches] Failed to fetch matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 },
    );
  }
}
