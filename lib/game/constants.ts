import type { Weapon, Throwable, ShopItem, VendingMachine, Perk, ZombieType } from "./types"

// Map dimensions
export const MAP_WIDTH = 4800
export const MAP_HEIGHT = 3600
export const TILE_SIZE = 64

// Player constants
export const PLAYER_SPEED = 200
export const PLAYER_CROUCH_SPEED = 100
export const PLAYER_PRONE_SPEED = 50
export const PLAYER_ROLL_SPEED = 400
export const PLAYER_ROLL_DURATION = 300
export const PLAYER_ROLL_COOLDOWN = 800
export const PLAYER_MAX_HEALTH = 100
export const PLAYER_MAX_ARMOR = 100
export const PLAYER_KNIFE_DAMAGE = 75
export const PLAYER_KNIFE_RANGE = 60
export const PLAYER_KNIFE_COOLDOWN = 400

// Zombie base stats by type
export const ZOMBIE_STATS: Record<ZombieType, { health: number; damage: number; speed: number; size: number }> = {
  walker: { health: 100, damage: 20, speed: 60, size: 32 },
  runner: { health: 75, damage: 15, speed: 120, size: 28 },
  brute: { health: 300, damage: 40, speed: 40, size: 48 },
  crawler: { health: 50, damage: 10, speed: 80, size: 24 },
}

// Wave scaling
export const BASE_ZOMBIES_PER_WAVE = 6
export const ZOMBIES_INCREASE_PER_WAVE = 3
export const HEALTH_MULTIPLIER_PER_WAVE = 1.1
export const SPAWN_INTERVAL_BASE = 2000
export const SPAWN_INTERVAL_MIN = 400
export const WAVE_BREAK_DURATION = 10000

// Power-up drop chance
export const POWER_UP_DROP_CHANCE = 0.05
export const POWER_UP_DURATION = 30000

// Starting weapons
export const STARTING_PISTOL: Weapon = {
  id: "m1911",
  name: "M1911",
  type: "pistol",
  damage: 35,
  fireRate: 4,
  reloadTime: 1500,
  magazineSize: 8,
  currentAmmo: 8,
  reserveAmmo: 96,
  maxReserveAmmo: 120,
  range: 400,
  spread: 0.05,
  bulletSpeed: 800,
  lastFireTime: 0,
  isReloading: false,
  reloadStartTime: 0,
  price: 0,
  icon: "🔫",
}

// All available weapons
export const WEAPONS: Weapon[] = [
  STARTING_PISTOL,
  {
    id: "mp5",
    name: "MP5",
    type: "smg",
    damage: 25,
    fireRate: 10,
    reloadTime: 2000,
    magazineSize: 30,
    currentAmmo: 30,
    reserveAmmo: 120,
    maxReserveAmmo: 180,
    range: 350,
    spread: 0.1,
    bulletSpeed: 700,
    lastFireTime: 0,
    isReloading: false,
    reloadStartTime: 0,
    price: 1000,
    icon: "🔫",
  },
  {
    id: "m870",
    name: "M870 Shotgun",
    type: "shotgun",
    damage: 120,
    fireRate: 1.2,
    reloadTime: 2500,
    magazineSize: 6,
    currentAmmo: 6,
    reserveAmmo: 24,
    maxReserveAmmo: 36,
    range: 200,
    spread: 0.3,
    bulletSpeed: 600,
    lastFireTime: 0,
    isReloading: false,
    reloadStartTime: 0,
    price: 1500,
    icon: "🔫",
  },
  {
    id: "m4a1",
    name: "M4A1",
    type: "rifle",
    damage: 40,
    fireRate: 8,
    reloadTime: 2200,
    magazineSize: 30,
    currentAmmo: 30,
    reserveAmmo: 120,
    maxReserveAmmo: 210,
    range: 500,
    spread: 0.06,
    bulletSpeed: 900,
    lastFireTime: 0,
    isReloading: false,
    reloadStartTime: 0,
    price: 2500,
    icon: "🔫",
  },
  {
    id: "rpd",
    name: "RPD",
    type: "lmg",
    damage: 45,
    fireRate: 12,
    reloadTime: 4000,
    magazineSize: 100,
    currentAmmo: 100,
    reserveAmmo: 300,
    maxReserveAmmo: 500,
    range: 450,
    spread: 0.12,
    bulletSpeed: 850,
    lastFireTime: 0,
    isReloading: false,
    reloadStartTime: 0,
    price: 4000,
    icon: "🔫",
  },
]

// Throwables
export const THROWABLES: Throwable[] = [
  {
    id: "frag",
    name: "Frag Grenade",
    type: "frag",
    damage: 150,
    radius: 120,
    count: 4,
    maxCount: 4,
    price: 250,
    icon: "💣",
  },
  {
    id: "stun",
    name: "Stun Grenade",
    type: "stun",
    damage: 10,
    radius: 150,
    count: 4,
    maxCount: 4,
    price: 200,
    icon: "💫",
  },
  {
    id: "flashbang",
    name: "Flashbang",
    type: "flashbang",
    damage: 0,
    radius: 180,
    count: 4,
    maxCount: 4,
    price: 150,
    icon: "💡",
  },
]

// Shop items
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "medpack",
    name: "Medpack",
    description: "Fully restores health",
    price: 750,
    type: "health",
    icon: "🏥",
  },
  {
    id: "ammo",
    name: "Ammo Crate",
    description: "Refills all ammunition",
    price: 250,
    type: "ammo",
    icon: "📦",
  },
  {
    id: "armor",
    name: "Tactical Vest",
    description: "Fully restores armor",
    price: 500,
    type: "armor",
    icon: "🦺",
  },
]

// Perks for vending machines
export const PERKS: Perk[] = [
  {
    id: "badge-boost",
    name: "Badge Boost",
    description: "Move faster",
    effect: "speed-boost",
  },
  {
    id: "quick-draw",
    name: "Quick Draw",
    description: "Reload weapons faster",
    effect: "quick-reload",
  },
  {
    id: "double-tap",
    name: "Double Tap",
    description: "Fire weapons faster",
    effect: "double-tap",
  },
  {
    id: "kevlar-cola",
    name: "Kevlar Cola",
    description: "Take less damage",
    effect: "juggernaut",
  },
  {
    id: "dead-eye",
    name: "Dead Eye",
    description: "Increased headshot damage",
    effect: "dead-shot",
  },
]

// Vending machine placements
export const VENDING_MACHINES: VendingMachine[] = [
  {
    id: "vm-1",
    name: "Badge Boost",
    position: { x: 400, y: 400 },
    width: 64,
    height: 96,
    perk: PERKS[0],
    price: 2000,
    purchased: false,
  },
  {
    id: "vm-2",
    name: "Quick Draw",
    position: { x: 2800, y: 400 },
    width: 64,
    height: 96,
    perk: PERKS[1],
    price: 2500,
    purchased: false,
  },
  {
    id: "vm-3",
    name: "Double Tap",
    position: { x: 400, y: 2000 },
    width: 64,
    height: 96,
    perk: PERKS[2],
    price: 2000,
    purchased: false,
  },
  {
    id: "vm-4",
    name: "Kevlar Cola",
    position: { x: 2800, y: 2000 },
    width: 64,
    height: 96,
    perk: PERKS[3],
    price: 3000,
    purchased: false,
  },
]

// Mystery box configuration
export const MYSTERY_BOX_PRICE = 950
export const MYSTERY_BOX_SPIN_TIME = 3000

// Door pricing constants
export const DOOR_BASE_PRICE = 750
export const DOOR_PRICE_INCREMENT = 250

// Colors
export const COLORS = {
  floor: "#2a2a35",
  wall: "#1a1a22",
  desk: "#4a4a55",
  blood: "#5a1515",
  player: "#4a9eff",
  zombie: "#4a8844",
  zombieRunner: "#88aa44",
  zombieBrute: "#664422",
  zombieCrawler: "#556644",
  bullet: "#ffff00",
  powerUp: {
    "insta-kill": "#ff4444",
    "double-points": "#ffff44",
    "max-ammo": "#44ff44",
    nuke: "#ffffff",
    "speed-boost": "#44ffff",
  },
}
