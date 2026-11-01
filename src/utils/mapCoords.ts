import type { LanePos } from '../api/types'

export interface HeatPoint {
  x: number
  y: number
  count: number
}

export function lanePostToHeatPoints(lanePos: LanePos): HeatPoint[] {
  const points: HeatPoint[] = []
  for (const [xStr, yMap] of Object.entries(lanePos)) {
    for (const [yStr, count] of Object.entries(yMap)) {
      points.push({ x: parseInt(xStr), y: parseInt(yStr), count })
    }
  }
  return points
}

// OpenDota lane_pos game coords: playable area spans 64..191.
// Mapping: subtract 64 (offset to zero), scale by (mapSize/127), Y is flipped.
// Source: odota/web src/utility.tsx gameCoordToUV
const BASE_OFFSET = 64
const COORD_SPAN = 127

export function coordToSvg(
  coord: number,
  axis: 'x' | 'y',
  mapSize: number,
): number {
  const scale = mapSize / COORD_SPAN
  if (axis === 'y') {
    return (COORD_SPAN - (coord - BASE_OFFSET)) * scale
  }
  return (coord - BASE_OFFSET) * scale
}
