import { useQuery } from '@tanstack/react-query'

const PARSER_URL = import.meta.env.VITE_PARSER_URL as string | undefined

export interface Positions {
  matchId: number
  duration: number
  tickRate: number
  players: Array<{
    playerId: number
    heroName: string
    positions: Array<[number, number, number]> // [second, x, y]
  }>
}

export interface PositionsError {
  code: 'disabled' | 'replay_unavailable' | 'parse_failed' | 'network'
  message: string
}

async function fetchPositions(matchId: string): Promise<Positions> {
  if (!PARSER_URL) {
    const err = new Error('Parser URL not configured') as Error & { code: PositionsError['code'] }
    err.code = 'disabled'
    throw err
  }

  const res = await fetch(`${PARSER_URL}/positions/${matchId}`)
  if (res.status === 410) {
    const err = new Error('Replay no longer available on Valve servers') as Error & { code: PositionsError['code'] }
    err.code = 'replay_unavailable'
    throw err
  }
  if (!res.ok) {
    const body = await res.text()
    const err = new Error(body || `Parser ${res.status}`) as Error & { code: PositionsError['code'] }
    err.code = 'parse_failed'
    throw err
  }
  return res.json()
}

export function useMatchPositions(matchId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['positions', matchId],
    queryFn: () => fetchPositions(matchId!),
    enabled: !!matchId && enabled && !!PARSER_URL,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    retry: false,
  })
}

export function isParserConfigured() {
  return !!PARSER_URL
}
