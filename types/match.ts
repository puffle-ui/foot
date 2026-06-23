export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface Team {
  id: number;
  name: string;
  shortName?: string;
  crest: string;
}

export interface Score {
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface Competition {
  id: number;
  name: string;
  code?: string;
}

export interface Match {
  id: number;
  competition: Competition;
  utcDate: string;
  status: MatchStatus;
  stage?: string;
  group?: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface MatchGroup {
  label: string;
  date: string;
  matches: Match[];
}
