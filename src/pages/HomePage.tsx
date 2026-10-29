import { useState } from 'react'
import { MatchCard } from '../components/MatchList/MatchCard'
import { useMatches } from '../hooks/useMatches'
import { useHeroes } from '../hooks/useConstants'

const DEFAULT_ACCOUNT_ID = '64127936'

export function HomePage() {
  const [accountId, setAccountId] = useState(
    () => localStorage.getItem('dotaAccountId') ?? DEFAULT_ACCOUNT_ID,
  )
  const [input, setInput] = useState(accountId)

  const { data: matches, isLoading, error, refetch } = useMatches(accountId, 50)
  const { data: heroMap } = useHeroes()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    localStorage.setItem('dotaAccountId', trimmed)
    setAccountId(trimmed)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Dota 2 Match Browser</h1>
          <p className="text-gray-500 text-sm">Powered by OpenDota API</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="OpenDota Account ID"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            Load
          </button>
        </form>

        {isLoading && (
          <div className="text-gray-500 text-center py-16">
            <div className="animate-spin text-3xl mb-3">⟳</div>
            Loading matches…
          </div>
        )}

        {error && (
          <div className="text-red-400 text-center py-8 bg-red-950/20 rounded-lg border border-red-900/30">
            <div className="font-medium mb-1">Failed to load matches</div>
            <div className="text-sm text-red-500">{String(error)}</div>
            <button
              onClick={() => refetch()}
              className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        )}

        {matches && (
          <div>
            <div className="text-gray-500 text-sm mb-3">{matches.length} matches</div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              {matches.map((match) => (
                <MatchCard key={match.match_id} match={match} heroMap={heroMap} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
