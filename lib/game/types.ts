// Core game types - modular and extensible

export interface Vector2 {
  x: number
  y: number
}

export interface GameSettings {
  musicVolume: number
  sfxVolume: number
  difficulty: "easy" | "normal" | "hard"
  showTooltips: boolean
  showFPSCounter: boolean
  showMapCoordinates: boolean
}

export interface Entity {
  id: string
  position: Vector2
  velocity: Vector2
  width: number
  height: number
  rotation: number
  isActive: boolean
}

export interface Player extends Entity {
  health: number
  maxHealth: number
  armor: number
  maxArmor: number
  money: number
  speed: number
  weapons: Weapon[]
  currentWeaponIndex: number
  throwable: Throwable | null
  throwableCount: number
  state: PlayerState
  rollCooldown: number
  isRolling: boolean
  rollDirection: Vector2
  knifeAttacking: boolean
  knifeCooldown: number
}

export type PlayerState = "standing" | "crouching" | "prone" | "rolling"

export interface Weapon {
  id: string
  name: string
  type: WeaponType
  damage: number
  fireRate: number // shots per second
  reloadTime: number // ms
  magazineSize: number
  currentAmmo: number
  reserveAmmo: number
  maxReserveAmmo: number
  range: number
  spread: number // accuracy spread in radians
  bulletSpeed: number
  lastFireTime: number
  isReloading: boolean
  reloadStartTime: number
  price: number
  icon: string
}

export type WeaponType = "pistol" | "smg" | "shotgun" | "rifle" | "lmg"

export interface Throwable {
  id: string
  name: string
  type: ThrowableType
  damage: number
  radius: number
  count: number
  maxCount: number
  price: number
  icon: string
}

export type ThrowableType = "frag" | "stun" | "flashbang" | "molotov"

export interface Bullet extends Entity {
  damage: number
  ownerId: string
  speed: number
  maxDistance: number
  distanceTraveled: number
}

export interface Zombie extends Entity {
  health: number
  maxHealth: number
  damage: number
  speed: number
  attackCooldown: number
  lastAttackTime: number
  type: ZombieType
  targetPosition: Vector2 | null
}

export type ZombieType = "walker" | "runner" | "brute" | "crawler"

export interface PowerUp extends Entity {
  type: PowerUpType
  duration: number
  spawnTime: number
}

export type PowerUpType = "insta-kill" | "double-points" | "max-ammo" | "nuke" | "speed-boost"

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  type: "weapon" | "health" | "armor" | "ammo" | "throwable" | "perk"
  icon: string
  position?: Vector2
}

export interface VendingMachine {
  id: string
  name: string
  position: Vector2
  width: number
  height: number
  perk: Perk
  price: number
  purchased: boolean
}

export interface Perk {
  id: string
  name: string
  description: string
  effect: PerkEffect
}

export type PerkEffect = "speed-boost" | "quick-reload" | "double-tap" | "juggernaut" | "dead-shot"

export interface MapTile {
  x: number
  y: number
  type: TileType
  walkable: boolean
  interactable: boolean
  interactionType?: "door" | "weapon" | "shop" | "vending" | "mystery-box"
  data?: ShopItem | VendingMachine | Weapon | MysteryBox | Door
}

export type TileType =
  | "floor"
  | "wall"
  | "desk"
  | "locker"
  | "door"
  | "window"
  | "debris"
  | "blood"
  | "weapon-spawn"
  | "shop"
  | "vending"

export interface GameState {
  player: Player
  zombies: Zombie[]
  bullets: Bullet[]
  powerUps: PowerUp[]
  wave: number
  zombiesRemaining: number
  zombiesKilled: number
  score: number
  isPaused: boolean
  isGameOver: boolean
  waveStartTime: number
  betweenWaves: boolean
  activePerks: PerkEffect[]
  activePowerUps: { type: PowerUpType; endTime: number }[]
  camera: Vector2
}

export interface InputState {
  keys: Set<string>
  mousePosition: Vector2
  mouseDown: boolean
  rightMouseDown: boolean
}

export interface Explosion extends Entity {
  radius: number
  damage: number
  startTime: number
  duration: number
  type: "frag" | "stun" | "molotov"
}

export interface ThrownProjectile extends Entity {
  throwable: Throwable
  targetPosition: Vector2
  speed: number
}

export interface MysteryBox {
  id: string
  position: Vector2
  width: number
  height: number
  price: number
  isOpen: boolean
  openTime: number
  currentWeapon: Weapon | null
}

export interface Door {
  id: string
  tileX: number
  tileY: number
  position: Vector2
  isLocked: boolean
  price: number
  unlocksRoom?: string
}

export interface SpawnPoint {
  position: Vector2
  roomId: string // "main" is always accessible, others require doors to be unlocked
}
