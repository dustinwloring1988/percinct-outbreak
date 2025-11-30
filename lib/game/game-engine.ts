import type {
  GameState,
  Player,
  Zombie,
  Bullet,
  PowerUp,
  Vector2,
  GameMap,
  InputState,
  Explosion,
  ThrownProjectile,
  Door,
  ZombieType,
  SpawnPoint,
} from "./types"
import { WEAPONS, THROWABLES, ZOMBIE_STATS, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from "./constants"
import { generateId, vectorAdd, vectorNormalize, vectorScale, vectorDistance } from "./utils"
import { generateMap } from "./map-generator"
import { audioManager } from "./audio-manager"

// Constants that were previously undeclared
const SPAWN_INTERVAL_BASE = 2000
const SPAWN_INTERVAL_MIN = 300
const PLAYER_MAX_HEALTH = 100
const PLAYER_MAX_ARMOR = 100
const PLAYER_SPEED = 200
const PLAYER_ROLL_DURATION = 500
const PLAYER_ROLL_COOLDOWN = 1500
const PLAYER_ROLL_SPEED = 600
const PLAYER_CROUCH_SPEED = 100
const PLAYER_PRONE_SPEED = 50
const PLAYER_KNIFE_COOLDOWN = 500
const PLAYER_KNIFE_RANGE = 50
const PLAYER_KNIFE_DAMAGE = 25
const POWER_UP_DROP_CHANCE = 0.1
const POWER_UP_DURATION = 15000 // 15 seconds
const WAVE_BREAK_DURATION = 10000 // 10 seconds
const BASE_ZOMBIES_PER_WAVE = 10
const ZOMBIES_INCREASE_PER_WAVE = 5
const HEALTH_MULTIPLIER_PER_WAVE = 1.05
const MYSTERY_BOX_SPIN_TIME = 3000 // 3 seconds

export class GameEngine {
  state: GameState
  map: GameMap
  input: InputState
  viewportWidth = 0
  viewportHeight = 0
  explosions: Explosion[] = []
  thrownProjectiles: ThrownProjectile[] = []
  private lastSpawnTime = 0
  private spawnInterval = SPAWN_INTERVAL_BASE
  private accessibleSpawnPoints: SpawnPoint[] = []

  constructor() {
    this.map = generateMap()
    this.input = {
      keys: new Set(),
      mousePosition: { x: 0, y: 0 },
      mouseDown: false,
      rightMouseDown: false,
    }
    this.state = this.createInitialState()
    this.updateAccessibleSpawnPoints()
  }

  private createInitialState(): GameState {
    return {
      player: this.createPlayer(),
      zombies: [],
      bullets: [],
      powerUps: [],
      wave: 0,
      zombiesRemaining: 0,
      zombiesKilled: 0,
      score: 0,
      isPaused: false,
      isGameOver: false,
      waveStartTime: 0,
      betweenWaves: true,
      activePerks: [],
      activePowerUps: [],
      camera: { x: this.map.playerStart.x, y: this.map.playerStart.y },
    }
  }

  private createPlayer(): Player {
    console.log("[v0] Creating player at position:", this.map.playerStart)
    console.log("[v0] Map dimensions:", { width: MAP_WIDTH, height: MAP_HEIGHT })
    return {
      id: "player",
      position: { ...this.map.playerStart },
      velocity: { x: 0, y: 0 },
      width: 32,
      height: 32,
      rotation: 0,
      isActive: true,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      armor: 0,
      maxArmor: PLAYER_MAX_ARMOR,
      money: 500,
      speed: PLAYER_SPEED,
      weapons: [{ ...WEAPONS[0] }],
      currentWeaponIndex: 0,
      throwable: { ...THROWABLES[0], count: 2, maxCount: 10 }, // Assuming maxCount exists
      throwableCount: 2,
      state: "standing",
      rollCooldown: 0,
      isRolling: false,
      rollDirection: { x: 0, y: 0 },
      knifeAttacking: false,
      knifeCooldown: 0,
    }
  }

  setViewport(width: number, height: number) {
    this.viewportWidth = width
    this.viewportHeight = height
  }

  reset() {
    this.map = generateMap()
    this.state = this.createInitialState()
    this.explosions = []
    this.thrownProjectiles = []
    this.lastSpawnTime = 0
  }

  update(deltaTime: number) {
    if (this.state.isPaused || this.state.isGameOver) return

    const dt = deltaTime / 1000 // Convert to seconds

    this.updatePlayer(dt)
    this.updateBullets(dt)
    this.updateZombies(dt)
    this.updatePowerUps(dt)
    this.updateExplosions(dt)
    this.updateThrownProjectiles(dt)
    this.updateWaveLogic()
    this.updateActivePowerUps()
    this.updateCamera(dt)
    this.handleInteraction()
  }

  private updatePlayer(dt: number) {
    const { player } = this.state
    const { keys, mousePosition, mouseDown, rightMouseDown } = this.input

    // Update cooldowns
    if (player.rollCooldown > 0) player.rollCooldown -= dt * 1000
    if (player.knifeCooldown > 0) player.knifeCooldown -= dt * 1000

    // Handle rolling
    if (player.isRolling) {
      const rollProgress =
        (PLAYER_ROLL_DURATION - player.rollCooldown + PLAYER_ROLL_COOLDOWN - PLAYER_ROLL_DURATION) /
        PLAYER_ROLL_DURATION
      if (rollProgress >= 1) {
        player.isRolling = false
      } else {
        const rollVel = vectorScale(player.rollDirection, PLAYER_ROLL_SPEED * dt)
        const newPos = vectorAdd(player.position, rollVel)
        if (this.isValidPosition(newPos, player.width / 2)) {
          player.position = newPos
        }
        return
      }
    }

    // Calculate movement direction
    let moveX = 0
    let moveY = 0
    if (keys.has("KeyW") || keys.has("ArrowUp")) moveY -= 1
    if (keys.has("KeyS") || keys.has("ArrowDown")) moveY += 1
    if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX -= 1
    if (keys.has("KeyD") || keys.has("ArrowRight")) moveX += 1

    // Stance changes
    if (keys.has("KeyC")) {
      player.state = player.state === "crouching" ? "standing" : "crouching"
      keys.delete("KeyC")
    }
    if (keys.has("KeyZ")) {
      player.state = player.state === "prone" ? "standing" : "prone"
      keys.delete("KeyZ")
    }

    // Roll initiation
    if (keys.has("Space") && player.rollCooldown <= 0 && (moveX !== 0 || moveY !== 0)) {
      player.isRolling = true
      player.rollCooldown = PLAYER_ROLL_COOLDOWN
      player.rollDirection = vectorNormalize({ x: moveX, y: moveY })
      player.state = "standing"
      keys.delete("Space")
      return
    }

    // Calculate speed based on stance and perks
    let speed = PLAYER_SPEED
    if (player.state === "crouching") speed = PLAYER_CROUCH_SPEED
    if (player.state === "prone") speed = PLAYER_PRONE_SPEED
    if (this.state.activePerks.includes("speed-boost")) speed *= 1.3
    if (this.state.activePowerUps.some((p) => p.type === "speed-boost")) speed *= 1.5

    // Normalize and apply movement
    if (moveX !== 0 || moveY !== 0) {
      const dir = vectorNormalize({ x: moveX, y: moveY })
      const newPos = {
        x: player.position.x + dir.x * speed * dt,
        y: player.position.y + dir.y * speed * dt,
      }
      if (this.isValidPosition(newPos, player.width / 2)) {
        player.position = newPos
      } else {
        // Try sliding along walls
        const newPosX = { x: player.position.x + dir.x * speed * dt, y: player.position.y }
        const newPosY = { x: player.position.x, y: player.position.y + dir.y * speed * dt }
        if (this.isValidPosition(newPosX, player.width / 2)) {
          player.position = newPosX
        } else if (this.isValidPosition(newPosY, player.width / 2)) {
          player.position = newPosY
        }
      }
    }

    // Player rotation towards mouse
    const worldMouseX = mousePosition.x - this.viewportWidth / 2 + this.state.camera.x
    const worldMouseY = mousePosition.y - this.viewportHeight / 2 + this.state.camera.y
    player.rotation = Math.atan2(worldMouseY - player.position.y, worldMouseX - player.position.x)

    // Knife attack
    if (rightMouseDown && player.knifeCooldown <= 0) {
      player.knifeAttacking = true
      player.knifeCooldown = PLAYER_KNIFE_COOLDOWN
      this.performKnifeAttack()
      setTimeout(() => {
        player.knifeAttacking = false
      }, 100)
    }

    // Shooting
    if (mouseDown) {
      this.tryShoot()
    }

    // Update weapon reload
    const weapon = player.weapons[player.currentWeaponIndex]
    if (weapon?.isReloading) {
      const reloadTime = this.state.activePerks.includes("quick-reload") ? weapon.reloadTime * 0.7 : weapon.reloadTime
      if (Date.now() - weapon.reloadStartTime >= reloadTime) {
        const ammoNeeded = weapon.magazineSize - weapon.currentAmmo
        const ammoToAdd = Math.min(ammoNeeded, weapon.reserveAmmo)
        weapon.currentAmmo += ammoToAdd
        weapon.reserveAmmo -= ammoToAdd
        weapon.isReloading = false
      }
    }
  }

  private isValidPosition(pos: Vector2, radius: number): boolean {
    // Check map bounds
    if (pos.x - radius < 0 || pos.x + radius > MAP_WIDTH) return false
    if (pos.y - radius < 0 || pos.y + radius > MAP_HEIGHT) return false

    // Check tile collisions
    const checkPoints = [
      { x: pos.x - radius, y: pos.y - radius },
      { x: pos.x + radius, y: pos.y - radius },
      { x: pos.x - radius, y: pos.y + radius },
      { x: pos.x + radius, y: pos.y + radius },
      { x: pos.x, y: pos.y - radius },
      { x: pos.x, y: pos.y + radius },
      { x: pos.x - radius, y: pos.y },
      { x: pos.x + radius, y: pos.y },
    ]

    for (const point of checkPoints) {
      const tileX = Math.floor(point.x / TILE_SIZE)
      const tileY = Math.floor(point.y / TILE_SIZE)
      const tile = this.map.tiles[tileY]?.[tileX]
      if (!tile || !tile.walkable) {
        return false
      }
    }

    return true
  }

  private performKnifeAttack() {
    const { player } = this.state
    const attackDir = { x: Math.cos(player.rotation), y: Math.sin(player.rotation) }

    this.state.zombies.forEach((zombie) => {
      if (!zombie.isActive) return

      const toZombie = {
        x: zombie.position.x - player.position.x,
        y: zombie.position.y - player.position.y,
      }
      const dist = Math.sqrt(toZombie.x * toZombie.x + toZombie.y * toZombie.y)

      if (dist <= PLAYER_KNIFE_RANGE + zombie.width / 2) {
        const dot = (toZombie.x * attackDir.x + toZombie.y * attackDir.y) / dist
        if (dot > 0.5) {
          zombie.health -= PLAYER_KNIFE_DAMAGE
          if (zombie.health <= 0) {
            this.killZombie(zombie)
          }
        }
      }
    })
  }

  private tryShoot() {
    const { player } = this.state
    const weapon = player.weapons[player.currentWeaponIndex]
    if (!weapon || weapon.isReloading) return

    const now = Date.now()
    let fireRate = weapon.fireRate
    if (this.state.activePerks.includes("double-tap")) fireRate *= 1.5

    const fireInterval = 1000 / fireRate
    if (now - weapon.lastFireTime < fireInterval) return

    if (weapon.currentAmmo <= 0) {
      this.startReload()
      return
    }

    weapon.lastFireTime = now
    weapon.currentAmmo--

    audioManager.play(audioManager.getWeaponSound(weapon.type))

    // Create bullet(s)
    const spread = weapon.spread
    const bulletsToFire = weapon.type === "shotgun" ? 8 : 1

    for (let i = 0; i < bulletsToFire; i++) {
      const angle = player.rotation + (Math.random() - 0.5) * spread
      const bullet: Bullet = {
        id: generateId(),
        position: { ...player.position },
        velocity: {
          x: Math.cos(angle) * weapon.bulletSpeed,
          y: Math.sin(angle) * weapon.bulletSpeed,
        },
        width: 6,
        height: 6,
        rotation: angle,
        isActive: true,
        damage: weapon.damage,
        ownerId: player.id,
        speed: weapon.bulletSpeed,
        maxDistance: weapon.range,
        distanceTraveled: 0,
      }
      this.state.bullets.push(bullet)
    }
  }

  startReload() {
    const weapon = this.state.player.weapons[this.state.player.currentWeaponIndex]
    if (!weapon || weapon.isReloading) return
    if (weapon.currentAmmo === weapon.magazineSize) return
    if (weapon.reserveAmmo <= 0) return

    weapon.isReloading = true
    weapon.reloadStartTime = Date.now()
    audioManager.play("reload")
  }

  swapWeapon() {
    const { player } = this.state
    if (player.weapons.length > 1) {
      player.currentWeaponIndex = (player.currentWeaponIndex + 1) % player.weapons.length
    }
  }

  throwGrenade() {
    const { player } = this.state
    if (!player.throwable || player.throwable.count <= 0) return

    const worldMouseX = this.input.mousePosition.x - this.viewportWidth / 2 + this.state.camera.x
    const worldMouseY = this.input.mousePosition.y - this.viewportHeight / 2 + this.state.camera.y

    const projectile: ThrownProjectile = {
      id: generateId(),
      position: { ...player.position },
      velocity: { x: 0, y: 0 },
      width: 16,
      height: 16,
      rotation: 0,
      isActive: true,
      throwable: { ...player.throwable },
      targetPosition: { x: worldMouseX, y: worldMouseY },
      speed: 400,
    }

    this.thrownProjectiles.push(projectile)
    player.throwable.count--
    player.throwableCount = player.throwable.count
  }

  private updateBullets(dt: number) {
    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (!bullet.isActive) return false

      // Move bullet
      bullet.position.x += bullet.velocity.x * dt
      bullet.position.y += bullet.velocity.y * dt
      bullet.distanceTraveled += bullet.speed * dt

      // Check max distance
      if (bullet.distanceTraveled >= bullet.maxDistance) {
        return false
      }

      // Check wall collision
      const tileX = Math.floor(bullet.position.x / TILE_SIZE)
      const tileY = Math.floor(bullet.position.y / TILE_SIZE)
      const tile = this.map.tiles[tileY]?.[tileX]
      if (!tile || !tile.walkable) {
        return false
      }

      // Check zombie collision
      for (const zombie of this.state.zombies) {
        if (!zombie.isActive) continue

        const dist = vectorDistance(bullet.position, zombie.position)
        if (dist < zombie.width / 2 + bullet.width / 2) {
          let damage = bullet.damage
          if (this.state.activePowerUps.some((p) => p.type === "insta-kill")) {
            damage = 9999
          }

          zombie.health -= damage
          if (zombie.health <= 0) {
            this.killZombie(zombie)
          }
          audioManager.play("zombie-hit")
          return false
        }
      }

      return true
    })
  }

  private updateZombies(dt: number) {
    const { player } = this.state

    this.state.zombies.forEach((zombie) => {
      if (!zombie.isActive) return

      // Move towards player with obstacle avoidance
      const toPlayer = {
        x: player.position.x - zombie.position.x,
        y: player.position.y - zombie.position.y,
      }
      const dist = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y)

      if (dist > zombie.width / 2 + player.width / 2) {
        const dir = vectorNormalize(toPlayer)
        let newPos = {
          x: zombie.position.x + dir.x * zombie.speed * dt,
          y: zombie.position.y + dir.y * zombie.speed * dt,
        }

        // Check if new position is valid
        if (!this.isValidZombiePosition(newPos, zombie.width / 2)) {
          // Try to find alternative path around obstacles
          const angles = [
            Math.PI / 6,
            -Math.PI / 6,
            Math.PI / 4,
            -Math.PI / 4,
            Math.PI / 3,
            -Math.PI / 3,
            Math.PI / 2,
            -Math.PI / 2,
          ]
          let foundPath = false

          for (const angleOffset of angles) {
            const newDir = {
              x: Math.cos(Math.atan2(dir.y, dir.x) + angleOffset),
              y: Math.sin(Math.atan2(dir.y, dir.x) + angleOffset),
            }
            const altPos = {
              x: zombie.position.x + newDir.x * zombie.speed * dt,
              y: zombie.position.y + newDir.y * zombie.speed * dt,
            }
            if (this.isValidZombiePosition(altPos, zombie.width / 2)) {
              newPos = altPos
              foundPath = true
              break
            }
          }

          // If still stuck, try random direction
          if (!foundPath) {
            const randomAngle = Math.random() * Math.PI * 2
            const randomDir = {
              x: Math.cos(randomAngle),
              y: Math.sin(randomAngle),
            }
            const randomPos = {
              x: zombie.position.x + randomDir.x * zombie.speed * dt * 0.5,
              y: zombie.position.y + randomDir.y * zombie.speed * dt * 0.5,
            }
            if (this.isValidZombiePosition(randomPos, zombie.width / 2)) {
              newPos = randomPos
            }
          }
        }

        // Only move if valid position found
        if (this.isValidZombiePosition(newPos, zombie.width / 2)) {
          zombie.position = newPos
        }
      }

      // Attack player
      const attackDist = vectorDistance(zombie.position, player.position)
      if (attackDist < zombie.width / 2 + player.width / 2 + 10) {
        const now = Date.now()
        if (now - zombie.lastAttackTime >= zombie.attackCooldown) {
          zombie.lastAttackTime = now
          audioManager.play("zombie-attack")

          let damage = zombie.damage
          if (this.state.activePerks.includes("juggernaut")) {
            damage *= 0.7
          }

          // Armor absorbs damage first
          if (player.armor > 0) {
            const armorAbsorb = Math.min(player.armor, damage * 0.7)
            player.armor -= armorAbsorb
            damage -= armorAbsorb
          }

          player.health -= damage
          audioManager.play("player-hit")

          if (player.health <= 0) {
            this.state.isGameOver = true
          }
        }
      }
    })
  }

  private isValidZombiePosition(pos: Vector2, radius: number): boolean {
    // Check map bounds
    if (pos.x - radius < 0 || pos.x + radius > MAP_WIDTH) return false
    if (pos.y - radius < 0 || pos.y + radius > MAP_HEIGHT) return false

    // Check tile collisions
    const checkPoints = [
      { x: pos.x - radius, y: pos.y - radius },
      { x: pos.x + radius, y: pos.y - radius },
      { x: pos.x - radius, y: pos.y + radius },
      { x: pos.x + radius, y: pos.y + radius },
      { x: pos.x, y: pos.y - radius },
      { x: pos.x, y: pos.y + radius },
      { x: pos.x - radius, y: pos.y },
      { x: pos.x + radius, y: pos.y },
    ]

    for (const point of checkPoints) {
      const tileX = Math.floor(point.x / TILE_SIZE)
      const tileY = Math.floor(point.y / TILE_SIZE)
      const tile = this.map.tiles[tileY]?.[tileX]
      if (!tile) return false
      // Zombies can't walk through walls, desks, or lockers
      if (tile.type === "wall" || tile.type === "desk" || tile.type === "locker") {
        return false
      }
      if (tile.type === "door" && tile.data) {
        const door = tile.data as Door
        if (door.isLocked) return false
      }
    }

    return true
  }

  private killZombie(zombie: Zombie) {
    zombie.isActive = false
    this.state.zombiesKilled++

    // Score
    let points = 100
    if (zombie.type === "runner") points = 120
    if (zombie.type === "brute") points = 200
    if (zombie.type === "crawler") points = 80

    if (this.state.activePowerUps.some((p) => p.type === "double-points")) {
      points *= 2
    }

    this.state.score += points
    this.state.player.money += Math.floor(points / 10)

    // Power-up drop chance
    if (Math.random() < POWER_UP_DROP_CHANCE) {
      this.spawnPowerUp(zombie.position)
    }
  }

  private spawnPowerUp(position: Vector2) {
    const types: PowerUp["type"][] = ["insta-kill", "double-points", "max-ammo", "nuke", "speed-boost"]
    const type = types[Math.floor(Math.random() * types.length)]

    const powerUp: PowerUp = {
      id: generateId(),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      width: 32,
      height: 32,
      rotation: 0,
      isActive: true,
      type,
      duration: POWER_UP_DURATION,
      spawnTime: Date.now(),
    }

    this.state.powerUps.push(powerUp)
  }

  private updatePowerUps(dt: number) {
    const { player } = this.state
    const now = Date.now()

    this.state.powerUps = this.state.powerUps.filter((powerUp) => {
      // Check if expired (10 seconds on ground)
      if (now - powerUp.spawnTime > 10000) return false

      // Check player pickup
      const dist = vectorDistance(player.position, powerUp.position)
      if (dist < player.width / 2 + powerUp.width / 2) {
        this.activatePowerUp(powerUp)
        return false
      }

      return true
    })
  }

  private activatePowerUp(powerUp: PowerUp) {
    const { type, duration } = powerUp

    audioManager.play(type)

    if (type === "max-ammo") {
      this.state.player.weapons.forEach((weapon) => {
        weapon.reserveAmmo = weapon.maxReserveAmmo
      })
      if (this.state.player.throwable) {
        this.state.player.throwable.count = this.state.player.throwable.maxCount
        this.state.player.throwableCount = this.state.player.throwable.count
      }
    } else if (type === "nuke") {
      this.state.zombies.forEach((zombie) => {
        if (zombie.isActive) {
          this.killZombie(zombie)
        }
      })
    } else {
      this.state.activePowerUps.push({
        type,
        endTime: Date.now() + duration,
      })
    }
  }

  private updateExplosions(dt: number) {
    const now = Date.now()
    this.explosions = this.explosions.filter((exp) => {
      return now - exp.startTime < exp.duration
    })
  }

  private updateThrownProjectiles(dt: number) {
    this.thrownProjectiles = this.thrownProjectiles.filter((proj) => {
      const toTarget = {
        x: proj.targetPosition.x - proj.position.x,
        y: proj.targetPosition.y - proj.position.y,
      }
      const dist = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y)

      if (dist < 20) {
        // Explode
        this.createExplosion(proj)
        return false
      }

      const dir = vectorNormalize(toTarget)
      proj.position.x += dir.x * proj.speed * dt
      proj.position.y += dir.y * proj.speed * dt

      return true
    })
  }

  private createExplosion(proj: ThrownProjectile) {
    const explosion: Explosion = {
      id: generateId(),
      position: { ...proj.position },
      velocity: { x: 0, y: 0 },
      width: proj.throwable.radius * 2,
      height: proj.throwable.radius * 2,
      rotation: 0,
      isActive: true,
      radius: proj.throwable.radius,
      damage: proj.throwable.damage,
      startTime: Date.now(),
      duration: 500,
      type: proj.throwable.type,
    }

    this.explosions.push(explosion)
    audioManager.play("explosion")

    // Damage zombies in radius
    this.state.zombies.forEach((zombie) => {
      const dist = vectorDistance(zombie.position, explosion.position)
      if (dist < explosion.radius + zombie.width / 2) {
        const damageFalloff = 1 - dist / explosion.radius
        zombie.health -= explosion.damage * damageFalloff
        if (zombie.health <= 0) {
          this.killZombie(zombie)
        }
      }
    })
  }

  private updateWaveLogic() {
    const now = Date.now()

    if (this.state.betweenWaves) {
      if (now - this.state.waveStartTime >= WAVE_BREAK_DURATION || this.state.wave === 0) {
        this.startNextWave()
      }
      return
    }

    // Spawn zombies
    const zombiesAlive = this.state.zombies.filter((z) => z.isActive).length
    if (zombiesAlive < this.state.zombiesRemaining) {
      if (now - this.lastSpawnTime >= this.spawnInterval) {
        this.spawnZombie()
        this.lastSpawnTime = now
      }
    }

    // Check wave complete
    if (zombiesAlive === 0 && this.state.zombiesRemaining === 0) {
      this.state.betweenWaves = true
      this.state.waveStartTime = now
      audioManager.play("round-end")
    }
  }

  private startNextWave() {
    this.state.wave++
    this.state.betweenWaves = false
    this.state.zombiesRemaining = BASE_ZOMBIES_PER_WAVE + (this.state.wave - 1) * ZOMBIES_INCREASE_PER_WAVE
    this.spawnInterval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_BASE - this.state.wave * 100)
    this.state.waveStartTime = Date.now()
  }

  private getAccessibleRooms(): Set<string> {
    const accessible = new Set<string>(["main"]) // Main lobby is always accessible

    for (const door of this.map.doors) {
      if (!door.isLocked && door.unlocksRoom) {
        accessible.add(door.unlocksRoom)
      }
    }

    return accessible
  }

  private getAccessibleSpawnPoints(): SpawnPoint[] {
    const accessibleRooms = this.getAccessibleRooms()
    return this.map.spawnPoints.filter((sp) => accessibleRooms.has(sp.roomId))
  }

  private spawnZombie() {
    if (this.state.zombiesRemaining <= 0) return

    const accessibleSpawnPoints = this.getAccessibleSpawnPoints()
    if (accessibleSpawnPoints.length === 0) return

    const spawnPoint = accessibleSpawnPoints[Math.floor(Math.random() * accessibleSpawnPoints.length)]

    // Determine zombie type based on wave
    let type: ZombieType = "walker"
    const roll = Math.random()
    if (this.state.wave >= 5 && roll < 0.1) {
      type = "brute"
    } else if (this.state.wave >= 3 && roll < 0.3) {
      type = "runner"
    } else if (this.state.wave >= 2 && roll < 0.2) {
      type = "crawler"
    }

    const stats = ZOMBIE_STATS[type]
    const healthMultiplier = Math.pow(HEALTH_MULTIPLIER_PER_WAVE, this.state.wave - 1)

    const zombie: Zombie = {
      id: generateId(),
      position: { ...spawnPoint.position },
      velocity: { x: 0, y: 0 },
      width: stats.size,
      height: stats.size,
      rotation: 0,
      isActive: true,
      health: stats.health * healthMultiplier,
      maxHealth: stats.health * healthMultiplier,
      damage: stats.damage,
      speed: stats.speed,
      attackCooldown: 1000,
      lastAttackTime: 0,
      type,
      targetPosition: null,
    }

    this.state.zombies.push(zombie)
    this.state.zombiesRemaining--
  }

  private updateActivePowerUps() {
    const now = Date.now()
    this.state.activePowerUps = this.state.activePowerUps.filter((p) => p.endTime > now)
  }

  private updateAccessibleSpawnPoints() {
    const accessibleRooms = this.getAccessibleRooms();
    this.accessibleSpawnPoints = this.map.spawnPoints.filter((sp) =>
      accessibleRooms.has(sp.roomId)
    );
  }

  private getAccessibleRooms(): Set<string> {
    const accessible = new Set<string>(["main"]); // Main lobby is always accessible

    for (const door of this.map.doors) {
      if (!door.isLocked && door.unlocksRoom) {
        accessible.add(door.unlocksRoom);
      }
    }

    return accessible;
  }

  private spawnZombie() {
    if (this.state.zombiesRemaining <= 0) return

    if (this.accessibleSpawnPoints.length === 0) return

    const spawnPoint = this.accessibleSpawnPoints[Math.floor(Math.random() * this.accessibleSpawnPoints.length)]

    // Determine zombie type based on wave
    let type: ZombieType = "walker"
    const roll = Math.random()
    if (this.state.wave >= 5 && roll < 0.1) {
      type = "brute"
    } else if (this.state.wave >= 3 && roll < 0.3) {
      type = "runner"
    } else if (this.state.wave >= 2 && roll < 0.2) {
      type = "crawler"
    }

    const stats = ZOMBIE_STATS[type]
    const healthMultiplier = Math.pow(HEALTH_MULTIPLIER_PER_WAVE, this.state.wave - 1)

    const zombie: Zombie = {
      id: generateId(),
      position: { ...spawnPoint.position },
      velocity: { x: 0, y: 0 },
      width: stats.size,
      height: stats.size,
      rotation: 0,
      isActive: true,
      health: stats.health * healthMultiplier,
      maxHealth: stats.health * healthMultiplier,
      damage: stats.damage,
      speed: stats.speed,
      attackCooldown: 1000,
      lastAttackTime: 0,
      type,
      targetPosition: null,
    }

    this.state.zombies.push(zombie)
    this.state.zombiesRemaining--
  }

  private updateCamera(dt: number) {
    const { player, camera } = this.state
    const lerpFactor = 5 * dt

    camera.x += (player.position.x - camera.x) * lerpFactor
    camera.y += (player.position.y - camera.y) * lerpFactor

    // Clamp camera to map bounds
    const halfWidth = this.viewportWidth / 2
    const halfHeight = this.viewportHeight / 2

    camera.x = Math.max(halfWidth, Math.min(MAP_WIDTH - halfWidth, camera.x))
    camera.y = Math.max(halfHeight, Math.min(MAP_HEIGHT - halfHeight, camera.y))
  }

  purchasePerk(vm: (typeof this.map.vendingMachines)[0]) {
    const { player } = this.state

    if (vm.purchased) return
    if (this.state.activePerks.includes(vm.perk.effect)) return
    if (player.money < vm.price) return

    player.money -= vm.price
    vm.purchased = true
    this.state.activePerks.push(vm.perk.effect)
    audioManager.play("vending")
  }

  switchWeapon(index: number) {
    const { player } = this.state
    if (index >= 0 && index < player.weapons.length) {
      player.currentWeaponIndex = index
    }
  }

  givePlayerMoney(amount: number) {
    this.state.player.money += amount;
  }

  handleInteraction() {
    // Only process if E key is pressed
    if (!this.input.keys.has("KeyE")) return
  }

  buyItem(itemId: string) {
    const { player } = this.state

    // Check doors first
    const door = this.map.doors.find((d) => d.id === itemId)
    if (door && door.isLocked) {
      if (player.money < door.price) return
      player.money -= door.price
      door.isLocked = false
      audioManager.play("buy")
      audioManager.play("door")
      // Update tile to be walkable
      const tile = this.map.tiles[door.tileY]?.[door.tileX]
      if (tile) {
        tile.walkable = true
      }
      // Update accessible spawn points since a new area is now accessible
      this.updateAccessibleSpawnPoints();
      return
    }

    // Check shop areas
    for (const shop of this.map.shopAreas) {
      if (shop.item.id === itemId) {
        const dist = vectorDistance(player.position, shop.position)
        if (dist < 100) {
          this.purchaseShopItem(shop.item)
          return
        }
      }
    }

    // Check weapon spawns
    for (const spawn of this.map.weaponSpawns) {
      if (spawn.weapon.id === itemId) {
        const dist = vectorDistance(player.position, spawn.position)
        if (dist < 100) {
          this.purchaseWeapon(spawn.weapon)
          return
        }
      }
    }

    // Check vending machines
    for (const vm of this.map.vendingMachines) {
      if (vm.id === itemId) {
        const dist = vectorDistance(player.position, vm.position)
        if (dist < 100) {
          this.purchasePerk(vm)
          return
        }
      }
    }

    const { mysteryBox } = this.map
    if (itemId === mysteryBox.id) {
      const distToBox = vectorDistance(player.position, mysteryBox.position)
      if (distToBox < 100) {
        if (mysteryBox.isOpen && mysteryBox.currentWeapon) {
          const elapsed = Date.now() - mysteryBox.openTime
          if (elapsed >= MYSTERY_BOX_SPIN_TIME) {
            // Grab the weapon
            const weapon = mysteryBox.currentWeapon
            if (player.weapons.length < 2) {
              player.weapons.push({ ...weapon })
            } else {
              player.weapons[player.currentWeaponIndex] = { ...weapon }
            }
            mysteryBox.isOpen = false
            mysteryBox.currentWeapon = null
            return
          }
        }

        if (!mysteryBox.isOpen) {
          if (player.money < mysteryBox.price) return

          player.money -= mysteryBox.price
          mysteryBox.isOpen = true
          mysteryBox.openTime = Date.now()

          // Pick a random weapon (can be any weapon, including upgraded versions)
          const allWeapons = [...WEAPONS]
          mysteryBox.currentWeapon = { ...allWeapons[Math.floor(Math.random() * allWeapons.length)] }
        }
      }
    }
  }

  private purchaseShopItem(item: (typeof this.map.shopAreas)[0]["item"]) {
    const { player } = this.state

    if (player.money < item.price) return

    switch (item.type) {
      case "health":
        if (player.health >= player.maxHealth) return
        player.money -= item.price
        player.health = player.maxHealth
        audioManager.play("buy")
        break
      case "armor":
        if (player.armor >= player.maxArmor) return
        player.money -= item.price
        player.armor = player.maxArmor
        audioManager.play("buy")
        break
      case "ammo":
        player.money -= item.price
        player.weapons.forEach((weapon) => {
          weapon.reserveAmmo = weapon.maxReserveAmmo
        })
        audioManager.play("buy")
        break
    }
  }

  private purchaseWeapon(weapon: (typeof this.map.weaponSpawns)[0]["weapon"]) {
    const { player } = this.state

    // Check if player already has this weapon
    const existingWeapon = player.weapons.find((w) => w.id === weapon.id)
    if (existingWeapon) {
      // Buy ammo instead
      if (player.money < Math.floor(weapon.price / 2)) return
      if (existingWeapon.reserveAmmo >= existingWeapon.maxReserveAmmo) return
      player.money -= Math.floor(weapon.price / 2)
      existingWeapon.reserveAmmo = existingWeapon.maxReserveAmmo
      audioManager.play("buy")
      return
    }

    if (player.money < weapon.price) return

    player.money -= weapon.price
    audioManager.play("buy")

    if (player.weapons.length < 2) {
      player.weapons.push({ ...weapon })
    } else {
      player.weapons[player.currentWeaponIndex] = { ...weapon }
    }
  }

  purchasePerk(vm: (typeof this.map.vendingMachines)[0]) {
    const { player } = this.state

    if (vm.purchased) return
    if (this.state.activePerks.includes(vm.perk.effect)) return
    if (player.money < vm.price) return

    player.money -= vm.price
    vm.purchased = true
    this.state.activePerks.push(vm.perk.effect)
    audioManager.play("vending")
  }

  switchWeapon(index: number) {
    const { player } = this.state
    if (index >= 0 && index < player.weapons.length) {
      player.currentWeaponIndex = index
    }
  }

  givePlayerMoney(amount: number) {
    this.state.player.money += amount;
  }
}
