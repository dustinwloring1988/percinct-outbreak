import type { Vector2, Entity, MapTile } from "./types"
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from "./constants"

// Vector math utilities
export function vectorAdd(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function vectorSubtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function vectorMultiply(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar }
}

export const vectorScale = vectorMultiply

export function vectorNormalize(v: Vector2): Vector2 {
  const magnitude = vectorMagnitude(v)
  if (magnitude === 0) return { x: 0, y: 0 }
  return { x: v.x / magnitude, y: v.y / magnitude }
}

export function vectorMagnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function vectorDistance(a: Vector2, b: Vector2): number {
  return vectorMagnitude(vectorSubtract(b, a))
}

export function vectorAngle(v: Vector2): number {
  return Math.atan2(v.y, v.x)
}

export function angleToVector(angle: number): Vector2 {
  return { x: Math.cos(angle), y: Math.sin(angle) }
}

// Collision detection
export function checkCollision(a: Entity, b: Entity): boolean {
  return (
    a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y
  )
}

export function checkCircleCollision(pos1: Vector2, radius1: number, pos2: Vector2, radius2: number): boolean {
  return vectorDistance(pos1, pos2) < radius1 + radius2
}

export function checkPointInRect(
  point: Vector2,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

// Map utilities
export function getTileAt(x: number, y: number, map: MapTile[][]): MapTile | null {
  const tileX = Math.floor(x / TILE_SIZE)
  const tileY = Math.floor(y / TILE_SIZE)
  if (tileX < 0 || tileY < 0 || tileY >= map.length || tileX >= map[0].length) {
    return null
  }
  return map[tileY][tileX]
}

export function isWalkable(x: number, y: number, map: MapTile[][]): boolean {
  const tile = getTileAt(x, y, map)
  return tile?.walkable ?? false
}

// Clamp position to map bounds
export function clampToMap(position: Vector2, width: number, height: number): Vector2 {
  return {
    x: Math.max(width / 2, Math.min(MAP_WIDTH - width / 2, position.x)),
    y: Math.max(height / 2, Math.min(MAP_HEIGHT - height / 2, position.y)),
  }
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Random number utilities
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1))
}

export function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

// Lerp
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function lerpVector(a: Vector2, b: Vector2, t: number): Vector2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}
