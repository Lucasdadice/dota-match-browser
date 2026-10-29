import type { Match, MatchPlayer } from '../../api/types'
import type { Hero, Item } from '../../api/types'
import { HeroIcon } from '../common/HeroIcon'
import { ItemIcon } from '../common/ItemIcon'
import { formatGold, isRadiant } from '../../utils/formatters'

interface Props {
  match: Match
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
}

const ITEM_SLOTS = ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5'] as const

function itemIdToKey(id: number, itemMap: Map<string, Item> | undefined): string {
  if (!id) return '0'
  const item = itemMap?.get(String(id))
  return item?.img ? item.img.replace(/^.*\/(.+?)\.png$/, '$1') : String(id)
}

function PlayerRow({
  player,
  heroMap,
  itemMap,
  highlight,
}: {
  player: MatchPlayer
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
  highlight: boolean
}) {
  const hero = heroMap?.get(player.hero_id)

  return (
    <tr className={`border-b border-gray-800 ${highlight ? 'bg-indigo-950/30' : 'hover:bg-white/[0.02]'}`}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <HeroIcon hero={hero} size={28} />
          <div>
            <div className="text-white text-sm leading-tight">{hero?.localized_name ?? `Hero ${player.hero_id}`}</div>
            <div className="text-gray-500 text-xs">{player.personaname ?? player.name ?? ''}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-center font-mono text-sm">
        <span className="text-emerald-400">{player.kills}</span>
        <span className="text-gray-600">/</span>
        <span className="text-red-400">{player.deaths}</span>
        <span className="text-gray-600">/</span>
        <span className="text-gray-300">{player.assists}</span>
      </td>
      <td className="px-3 py-2 text-center text-yellow-400 font-mono text-sm">
        {formatGold(player.net_worth)}
      </td>
      <td className="px-3 py-2 text-center text-gray-400 text-sm hidden sm:table-cell">
        {player.last_hits}
      </td>
      <td className="px-3 py-2 text-center text-cyan-400 text-sm hidden md:table-cell">
        {player.gold_per_min}
      </td>
      <td className="px-3 py-2 hidden lg:table-cell">
        <div className="flex gap-0.5">
          {ITEM_SLOTS.map((slot) => {
            const itemId = player[slot]
            const key = itemIdToKey(itemId, itemMap)
            return <ItemIcon key={slot} itemKey={key} size={26} />
          })}
        </div>
      </td>
    </tr>
  )
}

function TeamTable({
  players,
  label,
  color,
  heroMap,
  itemMap,
  userSlot,
}: {
  players: MatchPlayer[]
  label: string
  color: string
  heroMap: Map<number, Hero> | undefined
  itemMap: Map<string, Item> | undefined
  userSlot: number | null
}) {
  return (
    <div>
      <div className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 ${color}`}>
        {label}
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-600 text-xs border-b border-gray-800">
            <th className="px-3 py-1 font-normal">Hero</th>
            <th className="px-3 py-1 font-normal text-center">K/D/A</th>
            <th className="px-3 py-1 font-normal text-center">Net Worth</th>
            <th className="px-3 py-1 font-normal text-center hidden sm:table-cell">LH</th>
            <th className="px-3 py-1 font-normal text-center hidden md:table-cell">GPM</th>
            <th className="px-3 py-1 font-normal hidden lg:table-cell">Items</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <PlayerRow
              key={p.player_slot}
              player={p}
              heroMap={heroMap}
              itemMap={itemMap}
              highlight={p.player_slot === userSlot}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Scoreboard({ match, heroMap, itemMap }: Props) {
  const radiant = match.players
    .filter((p) => isRadiant(p.player_slot))
    .sort((a, b) => b.net_worth - a.net_worth)
  const dire = match.players
    .filter((p) => !isRadiant(p.player_slot))
    .sort((a, b) => b.net_worth - a.net_worth)

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <TeamTable
        players={radiant}
        label={`Radiant ${match.radiant_win ? '✓ Victory' : '✗ Defeat'}`}
        color="text-emerald-400"
        heroMap={heroMap}
        itemMap={itemMap}
        userSlot={null}
      />
      <div className="border-t border-gray-700" />
      <TeamTable
        players={dire}
        label={`Dire ${!match.radiant_win ? '✓ Victory' : '✗ Defeat'}`}
        color="text-red-400"
        heroMap={heroMap}
        itemMap={itemMap}
        userSlot={null}
      />
    </div>
  )
}
