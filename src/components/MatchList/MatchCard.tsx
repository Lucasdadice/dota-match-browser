import { useNavigate } from 'react-router-dom'
import type { RecentMatch } from '../../api/types'
import type { Hero } from '../../api/types'
import { HeroIcon } from '../common/HeroIcon'
import { formatDate, formatDuration, isRadiant } from '../../utils/formatters'

interface Props {
  match: RecentMatch
  heroMap: Map<number, Hero> | undefined
}

const GAME_MODES: Record<number, string> = {
  0: 'Unknown',
  1: 'All Pick',
  2: 'Captain\'s Mode',
  3: 'Random Draft',
  4: 'Single Draft',
  5: 'All Random',
  12: 'Least Played',
  14: 'Random Draft',
  16: 'Captain\'s Draft',
  18: 'Turbo',
  22: 'All Pick',
  23: 'Turbo',
}

export function MatchCard({ match, heroMap }: Props) {
  const navigate = useNavigate()
  const radiant = isRadiant(match.player_slot)
  const won = radiant === match.radiant_win
  const hero = heroMap?.get(match.hero_id)

  return (
    <div
      onClick={() => navigate(`/match/${match.match_id}`)}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-gray-800 last:border-b-0"
    >
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${won ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <HeroIcon hero={hero} size={40} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${won ? 'text-emerald-400' : 'text-red-400'}`}>
            {won ? 'WIN' : 'LOSS'}
          </span>
          <span className="text-gray-400 text-xs">{hero?.localized_name ?? `Hero #${match.hero_id}`}</span>
          <span className="text-gray-600 text-xs">{GAME_MODES[match.game_mode] ?? 'Unknown'}</span>
        </div>
        <div className="text-gray-500 text-xs mt-0.5">
          {formatDate(match.start_time)} · {formatDuration(match.duration)}
        </div>
      </div>

      <div className="text-center min-w-[60px]">
        <div className="text-white font-mono text-sm">
          {match.kills}/{match.deaths}/{match.assists}
        </div>
        <div className="text-gray-500 text-xs">KDA</div>
      </div>

      <div className="text-center min-w-[50px] hidden sm:block">
        <div className="text-yellow-400 font-mono text-sm">{match.gold_per_min}</div>
        <div className="text-gray-500 text-xs">GPM</div>
      </div>

      <div className="text-center min-w-[50px] hidden md:block">
        <div className="text-cyan-400 font-mono text-sm">{match.xp_per_min}</div>
        <div className="text-gray-500 text-xs">XPM</div>
      </div>

      <div className="text-gray-600 text-xs hidden lg:block w-16 text-right font-mono">
        #{match.match_id.toString().slice(-6)}
      </div>
    </div>
  )
}
