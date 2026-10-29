import type { Match, MatchPlayer } from '../../api/types'
import type { Hero, Item } from '../../api/types'
import { HeroIcon } from '../common/HeroIcon'
import { ItemIcon } from '../common/ItemIcon'
import { formatTime, isRadiant } from '../../utils/formatters'

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
}

const CONSUMABLES = new Set([
  'tpscroll', 'clarity', 'flask', 'enchanted_mango', 'faerie_fire',
  'ward_observer', 'ward_sentry', 'smoke_of_deceit', 'dust',
])

export function ItemTimeline({ match, heroMap, itemMap }: Props) {
  const duration = match.duration

  const players = [...match.players].sort((a, b) => {
    const aRad = isRadiant(a.player_slot) ? 0 : 1
    const bRad = isRadiant(b.player_slot) ? 0 : 1
    return aRad - bRad || a.player_slot - b.player_slot
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {players.map((player) => (
          <PlayerRow
            key={player.player_slot}
            player={player}
            duration={duration}
            heroMap={heroMap}
            itemMap={itemMap}
          />
        ))}
        <TimeAxis duration={duration} />
      </div>
    </div>
  )
}

function PlayerRow({
  player,
  duration,
  heroMap,
  itemMap,
}: {
  player: MatchPlayer
  duration: number
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
}) {
  const hero = heroMap?.get(player.hero_id)
  const rad = isRadiant(player.player_slot)
  const purchases = (player.purchase_log ?? []).filter(
    (p) => !CONSUMABLES.has(p.key) && p.time >= 0,
  )

  return (
    <div className="flex items-center gap-2 mb-1 group">
      <div className="flex-shrink-0 w-8">
        <HeroIcon hero={hero} size={28} />
      </div>
      <div
        className={`relative flex-1 h-8 rounded ${rad ? 'bg-emerald-950/30' : 'bg-red-950/30'}`}
      >
        {purchases.map((p, i) => {
          const left = Math.min((p.time / duration) * 100, 100)
          const item = itemMap?.get(p.key)
          return (
            <div
              key={`${p.time}-${p.key}-${i}`}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group/item"
              style={{ left: `${left}%` }}
              title={`${item?.dname ?? p.key} @ ${formatTime(p.time)}`}
            >
              <ItemIcon itemKey={p.key} imgPath={item?.img} size={22} title={`${item?.dname ?? p.key} @ ${formatTime(p.time)}`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/item:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20 border border-gray-700">
                <div className="font-medium">{item?.dname ?? p.key}</div>
                <div className="text-gray-400">{formatTime(p.time)}</div>
                {item?.cost && <div className="text-yellow-400">{item.cost}g</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TimeAxis({ duration }: { duration: number }) {
  const minutes = Math.ceil(duration / 60)
  const ticks = Array.from({ length: minutes + 1 }, (_, i) => i).filter(
    (m) => m % 5 === 0,
  )

  return (
    <div className="relative flex-1 h-5 ml-10 mt-1">
      {ticks.map((m) => {
        const left = Math.min((m * 60 / duration) * 100, 100)
        return (
          <div
            key={m}
            className="absolute text-gray-600 text-xs -translate-x-1/2"
            style={{ left: `${left}%` }}
          >
            {m}m
          </div>
        )
      })}
    </div>
  )
}
