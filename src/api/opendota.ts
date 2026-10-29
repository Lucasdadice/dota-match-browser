import type { Hero, Item, Match, RecentMatch } from './types'

const BASE = 'https://api.opendota.com/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`OpenDota ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  recentMatches: (accountId: string) =>
    get<RecentMatch[]>(`/players/${accountId}/recentMatches`),

  matches: (accountId: string, limit = 50) =>
    get<RecentMatch[]>(`/players/${accountId}/matches?limit=${limit}`),

  matchDetail: (matchId: number | string) =>
    get<Match>(`/matches/${matchId}`),

  heroes: () =>
    get<Record<string, Hero>>('/constants/heroes'),

  items: () =>
    get<Record<string, Item>>('/constants/items'),
}
