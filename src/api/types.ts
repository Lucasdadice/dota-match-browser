export interface RecentMatch {
  match_id: number
  player_slot: number
  radiant_win: boolean
  hero_id: number
  start_time: number
  duration: number
  game_mode: number
  lobby_type: number
  kills: number
  deaths: number
  assists: number
  gold_per_min: number
  xp_per_min: number
  hero_damage: number
  tower_damage: number
  hero_healing: number
  last_hits: number
  lane: number
  lane_role: number
  is_roaming: boolean
  leaver_status: number
  party_size: number
  average_rank?: number
}

export interface PurchaseLogEntry {
  time: number
  key: string
  charges?: number
}

export interface KillLogEntry {
  time: number
  key: string
}

export interface BuybackLogEntry {
  time: number
  slot: number
}

export interface AbilityUseEntry {
  time: number
  key: string
  level: number
}

export interface LanePos {
  [x: string]: { [y: string]: number }
}

export interface TeamfightPlayer {
  deaths: number
  buybacks: number
  damage: number
  healing: number
  gold_delta: number
  xp_delta: number
  xp_start: number
  xp_end: number
  participate: boolean
  killed: Record<string, number>
  items: number[]
  ability_uses: Record<string, number>
}

export interface Teamfight {
  start: number
  end: number
  last_death: number
  deaths: number
  players: TeamfightPlayer[]
}

export interface Objective {
  time: number
  type: string
  unit?: string
  key?: string
  player_slot?: number
  team?: number
  slot?: number
  subtype?: string
}

export interface MatchPlayer {
  account_id?: number
  player_slot: number
  hero_id: number
  hero_variant?: number
  kills: number
  deaths: number
  assists: number
  last_hits: number
  denies: number
  gold_per_min: number
  xp_per_min: number
  level: number
  net_worth: number
  aghanims_scepter?: number
  aghanims_shard?: number
  moonshard?: number
  hero_damage: number
  tower_damage: number
  hero_healing: number
  gold: number
  gold_spent: number
  item_0: number
  item_1: number
  item_2: number
  item_3: number
  item_4: number
  item_5: number
  backpack_0: number
  backpack_1: number
  backpack_2: number
  item_neutral: number
  purchase_log?: PurchaseLogEntry[]
  kills_log?: KillLogEntry[]
  buyback_log?: BuybackLogEntry[]
  ability_uses?: AbilityUseEntry[]
  gold_t?: number[]
  xp_t?: number[]
  lh_t?: number[]
  dn_t?: number[]
  times?: number[]
  lane_pos?: LanePos
  personaname?: string
  name?: string
  isRadiant: boolean
  rank_tier?: number
}

export interface Match {
  match_id: number
  start_time: number
  duration: number
  game_mode: number
  lobby_type: number
  radiant_win: boolean
  radiant_score: number
  dire_score: number
  players: MatchPlayer[]
  radiant_gold_adv?: number[]
  radiant_xp_adv?: number[]
  teamfights?: Teamfight[]
  objectives?: Objective[]
  picks_bans?: Array<{
    is_pick: boolean
    hero_id: number
    team: number
    order: number
  }>
  league?: { leagueid: number; name: string; tier: string }
}

export interface Hero {
  id: number
  name: string
  localized_name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  img: string
  icon: string
  legs: number
  cm_enabled: boolean
  turbo_picks: number
  turbo_wins: number
}

export interface Item {
  id: number
  dname: string
  img?: string
  qual?: string
  cost?: number
  components?: string[] | null
  created?: boolean
}
