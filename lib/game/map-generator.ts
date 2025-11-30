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

  // === NEW DOOR AND WALL (At specified coordinates) ===
  // Add a door at (3617, 3429) which is approximately tile (56, 53)
  const doorNew = createDoor(56, 53, "new-area")
  tiles[53][56] = {
    x: 56,
    y: 53,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorNew,
  }

  // Add a wall at the next tile down, which is (56, 54)
  tiles[54][56] = { x: 56, y: 54, type: "wall", walkable: false, interactable: false }

  // === ANOTHER DOOR AND WALLS (At coordinates 3422, 802) ===
  // Add a door at (3422, 802) which is approximately tile (53, 12)
  const doorAnother = createDoor(53, 12, "another-area")
  tiles[12][53] = {
    x: 53,
    y: 12,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorAnother,
  }

  // Add walls at the next 2 tiles to the right: (54, 12) and (55, 12)
  tiles[12][54] = { x: 54, y: 12, type: "wall", walkable: false, interactable: false }
  tiles[12][55] = { x: 55, y: 12, type: "wall", walkable: false, interactable: false }

  // === THIRD DOOR AND WALLS (At coordinates 1369, 797) ===
  // Add a door at (1369, 797) which is approximately tile (21, 12)
  const doorThird = createDoor(21, 12, "third-area")
  tiles[12][21] = {
    x: 21,
    y: 12,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorThird,
  }

  // Add walls at the next 2 tiles to the left: (20, 12) and (19, 12)
  tiles[12][20] = { x: 20, y: 12, type: "wall", walkable: false, interactable: false }
  tiles[12][19] = { x: 19, y: 12, type: "wall", walkable: false, interactable: false }

  // === FOURTH DOOR AND WALLS (At coordinates 1116, 1628) ===
  // Add a door at (1116, 1628) which is approximately tile (17, 25)
  const doorFourth = createDoor(17, 25, "fourth-area")
  tiles[25][17] = {
    x: 17,
    y: 25,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorFourth,
  }

  // Add walls at the next 16 tiles to the left: from (16, 25) down to (1, 25)
  for (let x = 16; x >= 1; x--) {
    tiles[25][x] = { x, y: 25, type: "wall", walkable: false, interactable: false }
  }

  // === FIFTH DOOR AND WALLS (At coordinates 4698, 1630) ===
  // Add a door at (4698, 1630) which is approximately tile (73, 25)
  const doorFifth = createDoor(73, 25, "fifth-area")
  tiles[25][73] = {
    x: 73,
    y: 25,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorFifth,
  }

  // Add walls at the next 16 tiles to the left: from (72, 25) down to (57, 25)
  for (let x = 72; x >= 57; x--) {
    tiles[25][x] = { x, y: 25, type: "wall", walkable: false, interactable: false }
  }

  // === SIXTH DOOR AND WALLS (At coordinates 1755, 2723) ===
  // Add a door at (1755, 2723) which is approximately tile (27, 42)
  const doorSixth = createDoor(27, 42, "sixth-area")
  tiles[42][27] = {
    x: 27,
    y: 42,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorSixth,
  }

  // Add walls at the next 8 tiles to the left: from (26, 42) down to (19, 42)
  for (let x = 26; x >= 19; x--) {
    tiles[42][x] = { x, y: 42, type: "wall", walkable: false, interactable: false }
  }

  // === SEVENTH DOOR AND WALLS (At coordinates 3552, 2712) ===
  // Add a door at (3552, 2712) which is approximately tile (55, 42)
  const doorSeventh = createDoor(55, 42, "seventh-area")
  tiles[42][55] = {
    x: 55,
    y: 42,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorSeventh,
  }

  // Add walls at the next 8 tiles to the left: from (54, 42) down to (47, 42)
  for (let x = 54; x >= 47; x--) {
    tiles[42][x] = { x, y: 42, type: "wall", walkable: false, interactable: false }
  }

  // === EIGHTH DOOR AND WALL (At coordinates 1185, 3426) ===
  // Add a door at (1185, 3426) which is approximately tile (18, 53)
  const doorEighth = createDoor(18, 53, "eighth-area")
  tiles[53][18] = {
    x: 18,
    y: 53,
    type: "door",
    walkable: false,
    interactable: true,
    interactionType: "door",
    data: doorEighth,
  }

  // Add a wall at the next tile down, which is (18, 54)
  tiles[54][18] = { x: 18, y: 54, type: "wall", walkable: false, interactable: false }

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
    // Initial spawn points only
    { position: { x: 3233, y: 2412 }, roomId: "main" }, // Main lobby area
    { position: { x: 4326, y: 2028 }, roomId: "main" }, // Right side area
    { position: { x: 3237, y: 1755 }, roomId: "main" }, // Center area
    { position: { x: 3233, y: 1058 }, roomId: "main" }, // Upper center area
    { position: { x: 2209, y: 1246 }, roomId: "main" }, // Left area
    { position: { x: 1572, y: 1826 }, roomId: "main" }, // Lower left area
    { position: { x: 348, y: 1890 }, roomId: "main" }, // Far left area
    { position: { x: 1433, y: 2339 }, roomId: "main" }, // Mid left area

    // Office spawns (accessible via office door)
    { position: { x: 2400, y: 800 }, roomId: "office" }, // Office area
    { position: { x: 3000, y: 800 }, roomId: "office" }, // Office area

    // Holding cell spawns (accessible via holding cell doors)
    { position: { x: 600, y: 1200 }, roomId: "holding-upper" }, // Upper holding cell
    { position: { x: 600, y: 1800 }, roomId: "holding-lower" }, // Lower holding cell

    // Evidence room spawns (accessible via evidence room doors)
    { position: { x: 4200, y: 1200 }, roomId: "evidence-upper" }, // Upper evidence room
    { position: { x: 4200, y: 1800 }, roomId: "evidence-lower" }, // Lower evidence room

    // Med bay spawn (accessible via med bay door)
    { position: { x: 3938, y: 734 }, roomId: "medbay" }, // Med bay

    // Records room spawn (accessible via records door)
    { position: { x: 600, y: 800 }, roomId: "records" }, // Records room

    // Armory spawn (accessible via armory door)
    { position: { x: 990, y: 2660 }, roomId: "armory" }, // Armory

    // SWAT room spawn (accessible via swat door)
    { position: { x: 3744, y: 3035 }, roomId: "swat" }, // SWAT room

    // Garage spawn (accessible via garage door)
    { position: { x: 2400, y: 2700 }, roomId: "garage" }, // Garage area

    // Spawns for the new areas from door additions
    { position: { x: 3617, y: 3500 }, roomId: "new-area" }, // Area behind door at (3617, 3429)
    { position: { x: 3422, y: 900 }, roomId: "another-area" }, // Area behind door at (3422, 802)
    { position: { x: 1369, y: 900 }, roomId: "third-area" }, // Area behind door at (1369, 797)
    { position: { x: 1100, y: 1600 }, roomId: "fourth-area" }, // Area behind door at (1116, 1628)
    { position: { x: 4700, y: 1600 }, roomId: "fifth-area" }, // Area behind door at (4698, 1630)
    { position: { x: 1755, y: 2800 }, roomId: "sixth-area" }, // Area behind door at (1755, 2723)
    { position: { x: 3552, y: 2800 }, roomId: "seventh-area" }, // Area behind door at (3552, 2712)
    { position: { x: 1185, y: 3500 }, roomId: "eighth-area" }, // Area behind door at (1185, 3426)
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
