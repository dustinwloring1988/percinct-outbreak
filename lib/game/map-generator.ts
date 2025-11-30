import type { MapTile, ShopItem, Vector2, MysteryBox, Door, SpawnPoint } from "./types"
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  WEAPONS,
  SHOP_ITEMS,
  VENDING_MACHINES,
  MYSTERY_BOX_PRICE,
  DOOR_BASE_PRICE,
  DOOR_PRICE_INCREMENT,
} from "./constants"

const TILES_X = Math.floor(MAP_WIDTH / TILE_SIZE)
const TILES_Y = Math.floor(MAP_HEIGHT / TILE_SIZE)

export interface GeneratedMap {
  tiles: MapTile[][]
  spawnPoints: SpawnPoint[]
  weaponSpawns: { position: Vector2; weapon: (typeof WEAPONS)[number] }[]
  shopAreas: { position: Vector2; item: ShopItem; areaName: string }[]
  vendingMachines: typeof VENDING_MACHINES
  mysteryBox: MysteryBox
  playerStart: Vector2
  doors: Door[]
}

export function generatePoliceStationMap(): GeneratedMap {
  const tiles: MapTile[][] = []
  const doors: Door[] = []
  let doorIndex = 0

  const createDoor = (x: number, y: number, unlocksRoom?: string) => {
    const price = DOOR_BASE_PRICE + doorIndex * DOOR_PRICE_INCREMENT
    const door: Door = {
      id: `door-${doorIndex}`,
      tileX: x,
      tileY: y,
      position: { x: x * TILE_SIZE + TILE_SIZE / 2, y: y * TILE_SIZE + TILE_SIZE / 2 },
      isLocked: true,
      price,
      unlocksRoom,
    }
    doors.push(door)
    doorIndex++
    return door
  }

  // Initialize with floor tiles
  for (let y = 0; y < TILES_Y; y++) {
    tiles[y] = []
    for (let x = 0; x < TILES_X; x++) {
      tiles[y][x] = {
        x,
        y,
        type: "floor",
        walkable: true,
        interactable: false,
      }
    }
  }

  // Add outer walls
  for (let x = 0; x < TILES_X; x++) {
    tiles[0][x] = { x, y: 0, type: "wall", walkable: false, interactable: false }
    tiles[TILES_Y - 1][x] = { x, y: TILES_Y - 1, type: "wall", walkable: false, interactable: false }
  }
  for (let y = 0; y < TILES_Y; y++) {
    tiles[y][0] = { x: 0, y, type: "wall", walkable: false, interactable: false }
    tiles[y][TILES_X - 1] = { x: TILES_X - 1, y, type: "wall", walkable: false, interactable: false }
  }

  // === MAIN LOBBY (Center area - always accessible) ===
  // Reception desk in center
  for (let x = 32; x <= 42; x++) {
    tiles[25][x] = { x, y: 25, type: "desk", walkable: false, interactable: false }
  }

  // === HOLDING CELLS (Far left) ===
  // Vertical wall separating holding cells
  for (let y = 8; y <= 25; y++) {
    tiles[y][18] = { x: 18, y, type: "wall", walkable: false, interactable: false }
  }
  // Horizontal wall for upper holding cell
  for (let x = 1; x <= 18; x++) {
    tiles[15][x] = { x, y: 15, type: "wall", walkable: false, interactable: false }
  }

  const doorHoldingUpper = createDoor(9, 15, "holding-upper")
  tiles[15][9] = {
    x: 9,
    y: 15,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorHoldingUpper,
  }

  const doorHoldingMain = createDoor(18, 20, "holding-lower")
  tiles[20][18] = {
    x: 18,
    y: 20,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorHoldingMain,
  }

  // === EVIDENCE ROOM (Far right) ===
  for (let y = 8; y <= 25; y++) {
    tiles[y][56] = { x: 56, y, type: "wall", walkable: false, interactable: false }
  }
  for (let x = 56; x < TILES_X - 1; x++) {
    tiles[15][x] = { x, y: 15, type: "wall", walkable: false, interactable: false }
  }

  const doorEvidenceUpper = createDoor(65, 15, "evidence-upper")
  tiles[15][65] = {
    x: 65,
    y: 15,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorEvidenceUpper,
  }

  const doorEvidenceMain = createDoor(56, 20, "evidence-lower")
  tiles[20][56] = {
    x: 56,
    y: 20,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorEvidenceMain,
  }

  // === OFFICE AREA (Top center) ===
  for (let x = 22; x <= 52; x++) {
    tiles[12][x] = { x, y: 12, type: "wall", walkable: false, interactable: false }
  }

  const doorOffice = createDoor(37, 12, "office")
  tiles[12][37] = {
    x: 37,
    y: 12,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorOffice,
  }

  // Office desks
  for (let x = 25; x <= 49; x += 5) {
    tiles[5][x] = { x, y: 5, type: "desk", walkable: false, interactable: false }
    tiles[8][x] = { x, y: 8, type: "desk", walkable: false, interactable: false }
  }

  // === ARMORY (Bottom left) ===
  for (let y = 38; y <= 52; y++) {
    tiles[y][18] = { x: 18, y, type: "wall", walkable: false, interactable: false }
  }
  for (let x = 1; x <= 18; x++) {
    tiles[38][x] = { x, y: 38, type: "wall", walkable: false, interactable: false }
  }

  const doorArmory = createDoor(9, 38, "armory")
  tiles[38][9] = {
    x: 9,
    y: 38,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorArmory,
  }

  // === SWAT ROOM (Bottom right) ===
  for (let y = 38; y <= 52; y++) {
    tiles[y][56] = { x: 56, y, type: "wall", walkable: false, interactable: false }
  }
  for (let x = 56; x < TILES_X - 1; x++) {
    tiles[38][x] = { x, y: 38, type: "wall", walkable: false, interactable: false }
  }

  const doorSwat = createDoor(65, 38, "swat")
  tiles[38][65] = {
    x: 65,
    y: 38,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorSwat,
  }

  // === MED BAY (Top right corner) ===
  for (let y = 1; y <= 10; y++) {
    tiles[y][56] = { x: 56, y, type: "wall", walkable: false, interactable: false }
  }

  const doorMedBay = createDoor(56, 8, "medbay")
  tiles[8][56] = {
    x: 56,
    y: 8,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorMedBay,
  }

  // === RECORDS ROOM (Top left corner) ===
  for (let y = 1; y <= 10; y++) {
    tiles[y][18] = { x: 18, y, type: "wall", walkable: false, interactable: false }
  }

  const doorRecords = createDoor(18, 8, "records")
  tiles[8][18] = {
    x: 18,
    y: 8,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorRecords,
  }

  // === GARAGE (Bottom center) ===
  for (let x = 28; x <= 46; x++) {
    tiles[42][x] = { x, y: 42, type: "wall", walkable: false, interactable: false }
  }

  const doorGarage = createDoor(37, 42, "garage")
  tiles[42][37] = {
    x: 37,
    y: 42,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorGarage,
  }

  // Lockers in various areas
  for (let y = 2; y <= 5; y++) {
    tiles[y][TILES_X - 3] = { x: TILES_X - 3, y, type: "locker", walkable: false, interactable: false }
    tiles[y][2] = { x: 2, y, type: "locker", walkable: false, interactable: false }
  }

  // Add debris and blood for atmosphere
  const debrisPositions = [
    { x: 25, y: 30 },
    { x: 45, y: 32 },
    { x: 37, y: 35 },
    { x: 22, y: 28 },
    { x: 50, y: 28 },
    { x: 30, y: 45 },
    { x: 44, y: 45 },
    { x: 12, y: 22 },
    { x: 62, y: 22 },
  ]
  debrisPositions.forEach((pos) => {
    if (tiles[pos.y]?.[pos.x]?.walkable) {
      tiles[pos.y][pos.x] = { ...tiles[pos.y][pos.x], type: "debris" }
    }
  })

  const bloodPositions = [
    { x: 30, y: 35 },
    { x: 42, y: 30 },
    { x: 48, y: 38 },
    { x: 10, y: 12 },
    { x: 60, y: 45 },
    { x: 35, y: 20 },
    { x: 8, y: 48 },
    { x: 66, y: 12 },
  ]
  bloodPositions.forEach((pos) => {
    if (tiles[pos.y]?.[pos.x]?.walkable) {
      tiles[pos.y][pos.x] = { ...tiles[pos.y][pos.x], type: "blood" }
    }
  })

  const spawnPoints: SpawnPoint[] = [
    // Main lobby spawn points (always accessible)
    { position: { x: TILE_SIZE * 37, y: TILE_SIZE * 54 }, roomId: "main" },
    { position: { x: TILE_SIZE * 25, y: TILE_SIZE * 30 }, roomId: "main" },
    { position: { x: TILE_SIZE * 50, y: TILE_SIZE * 30 }, roomId: "main" },

    // Office spawns
    { position: { x: TILE_SIZE * 30, y: TILE_SIZE * 3 }, roomId: "office" },
    { position: { x: TILE_SIZE * 44, y: TILE_SIZE * 3 }, roomId: "office" },

    // Holding cell spawns
    { position: { x: TILE_SIZE * 5, y: TILE_SIZE * 10 }, roomId: "holding-upper" },
    { position: { x: TILE_SIZE * 10, y: TILE_SIZE * 22 }, roomId: "holding-lower" },

    // Evidence room spawns
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 10 }, roomId: "evidence-upper" },
    { position: { x: TILE_SIZE * 65, y: TILE_SIZE * 22 }, roomId: "evidence-lower" },

    // Armory spawn
    { position: { x: TILE_SIZE * 8, y: TILE_SIZE * 48 }, roomId: "armory" },

    // SWAT room spawn
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 48 }, roomId: "swat" },

    // Med bay spawn
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 5 }, roomId: "medbay" },

    // Records room spawn
    { position: { x: TILE_SIZE * 8, y: TILE_SIZE * 5 }, roomId: "records" },

    // Garage spawn
    { position: { x: TILE_SIZE * 37, y: TILE_SIZE * 50 }, roomId: "garage" },
  ]

  // Weapon spawns
  const weaponSpawns = [
    { position: { x: TILE_SIZE * 30, y: TILE_SIZE * 13 }, weapon: { ...WEAPONS[1] } }, // MP5 in office entrance
    { position: { x: TILE_SIZE * 6, y: TILE_SIZE * 45 }, weapon: { ...WEAPONS[2] } }, // Shotgun in armory
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 18 }, weapon: { ...WEAPONS[3] } }, // M4A1 in evidence
    { position: { x: TILE_SIZE * 44, y: TILE_SIZE * 13 }, weapon: { ...WEAPONS[4] } }, // RPD in office entrance
  ]

  const shopAreas = [
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 5 }, item: SHOP_ITEMS[0], areaName: "MED BAY" },
    { position: { x: TILE_SIZE * 8, y: TILE_SIZE * 45 }, item: SHOP_ITEMS[1], areaName: "ARMORY" },
    { position: { x: TILE_SIZE * 68, y: TILE_SIZE * 45 }, item: SHOP_ITEMS[2], areaName: "SWAT SUPPLIES" },
  ]

  const updatedVendingMachines = VENDING_MACHINES.map((vm, i) => {
    const positions = [
      { x: TILE_SIZE * 6, y: TILE_SIZE * 6 }, // Records room
      { x: TILE_SIZE * 68, y: TILE_SIZE * 6 }, // Med bay
      { x: TILE_SIZE * 6, y: TILE_SIZE * 50 }, // Armory
      { x: TILE_SIZE * 68, y: TILE_SIZE * 50 }, // SWAT room
    ]
    return { ...vm, position: positions[i] || vm.position }
  })

  const mysteryBox: MysteryBox = {
    id: "mystery-box",
    position: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    width: 80,
    height: 48,
    price: MYSTERY_BOX_PRICE,
    isOpen: false,
    openTime: 0,
    currentWeapon: null,
  }

  const playerStart: Vector2 = { x: TILE_SIZE * 37, y: TILE_SIZE * 30 }

  return {
    tiles,
    spawnPoints,
    weaponSpawns,
    shopAreas,
    vendingMachines: updatedVendingMachines,
    mysteryBox,
    playerStart,
    doors,
  }
}

export const generateMap = generatePoliceStationMap
