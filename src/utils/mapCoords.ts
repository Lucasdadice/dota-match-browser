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

export function coordToSvg(
  coord: number,
  axis: 'x' | 'y',
  mapSize: number,
): number {
  const normalized = coord / 255
  if (axis === 'y') {
    return mapSize - normalized * mapSize
  }
  return normalized * mapSize
}
