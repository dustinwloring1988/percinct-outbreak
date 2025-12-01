import type { ZombieType, PowerUpType, Door } from "./types"
import type { GameEngine } from "./game-engine"
import { TILE_SIZE, COLORS, MYSTERY_BOX_SPIN_TIME } from "./constants"

export class GameRenderer {
  private ctx: CanvasRenderingContext2D
  private engine: GameEngine
  private animationFrame = 0
  showTooltips = true
  showFPSCounter = false
  showMapCoordinates = false
  private fps = 0
  private lastTime = 0
  private frameCount = 0
  zoom = 1.0 // Default zoom level

  constructor(ctx: CanvasRenderingContext2D, engine: GameEngine) {
    this.ctx = ctx
    this.engine = engine
  }

  getZoomAdjustedViewportWidth(): number {
    return this.engine.viewportWidth / this.zoom;
  }

  getZoomAdjustedViewportHeight(): number {
    return this.engine.viewportHeight / this.zoom;
  }

  render(deltaTime: number) {
    this.animationFrame++

    // Calculate FPS
    const now = performance.now()
    if (this.lastTime === 0) {
      this.lastTime = now
    }
    this.frameCount++

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
    }

    const { ctx, engine } = this
    const { state, map } = engine
    const { camera } = state

    // Clear canvas
    ctx.fillStyle = "#1a1a22"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Save context and apply camera transform with zoom
    ctx.save()
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
    ctx.scale(this.zoom, this.zoom)
    ctx.translate(-camera.x, -camera.y)

    // Render map tiles
    this.renderMap()

    // Render shop areas
    this.renderShopAreas()

    // Render weapon spawns
    this.renderWeaponSpawns()

    // Render vending machines
    this.renderVendingMachines()

    this.renderMysteryBox()

    // Render power-ups
    this.renderPowerUps()

    // Render bullets
    this.renderBullets()

    // Render explosions
    this.renderExplosions()

    // Render thrown projectiles
    this.renderThrownProjectiles()

    // Render zombies
    this.renderZombies()

    // Render player
    this.renderPlayer()

    // Restore context
    ctx.restore()

    // Render UI elements after restoring context to avoid camera transform
    this.renderUI()
  }

  private renderMap() {
    const { ctx, engine } = this
    const { map } = engine
    const { camera } = engine.state

    // Calculate visible tile range
    const startX = Math.max(0, Math.floor((camera.x - engine.viewportWidth / 2) / TILE_SIZE) - 1)
    const endX = Math.min(map.tiles[0].length, Math.ceil((camera.x + engine.viewportWidth / 2) / TILE_SIZE) + 1)
    const startY = Math.max(0, Math.floor((camera.y - engine.viewportHeight / 2) / TILE_SIZE) - 1)
    const endY = Math.min(map.tiles.length, Math.ceil((camera.y + engine.viewportHeight / 2) / TILE_SIZE) + 1)

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map.tiles[y]?.[x]
        if (!tile) continue

        const tileX = x * TILE_SIZE
        const tileY = y * TILE_SIZE

        switch (tile.type) {
          case "floor":
            ctx.fillStyle = COLORS.floor
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            // Add subtle grid
            ctx.strokeStyle = "#333340"
            ctx.lineWidth = 1
            ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            break
          case "wall":
            ctx.fillStyle = COLORS.wall
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            // Wall texture
            ctx.strokeStyle = "#252530"
            ctx.lineWidth = 2
            ctx.strokeRect(tileX + 2, tileY + 2, TILE_SIZE - 4, TILE_SIZE - 4)
            break
          case "desk":
            ctx.fillStyle = COLORS.floor
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            ctx.fillStyle = COLORS.desk
            ctx.fillRect(tileX + 4, tileY + 4, TILE_SIZE - 8, TILE_SIZE - 8)
            break
          case "door":
            this.renderDoor(tile, tileX, tileY)
            break
          case "debris":
            ctx.fillStyle = COLORS.floor
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            ctx.fillStyle = "#555555"
            ctx.beginPath()
            ctx.arc(tileX + 20, tileY + 25, 8, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(tileX + 40, tileY + 35, 6, 0, Math.PI * 2)
            ctx.fill()
            break
          case "blood":
            ctx.fillStyle = COLORS.floor
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            ctx.fillStyle = COLORS.blood
            ctx.beginPath()
            ctx.ellipse(tileX + 32, tileY + 32, 20, 15, 0.5, 0, Math.PI * 2)
            ctx.fill()
            break
          case "locker":
            ctx.fillStyle = COLORS.floor
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
            ctx.fillStyle = "#445566"
            ctx.fillRect(tileX + 8, tileY + 4, TILE_SIZE - 16, TILE_SIZE - 8)
            ctx.strokeStyle = "#334455"
            ctx.lineWidth = 2
            ctx.strokeRect(tileX + 8, tileY + 4, TILE_SIZE - 16, TILE_SIZE - 8)
            break
        }
      }
    }
  }

  private renderDoor(tile: (typeof this.engine.map.tiles)[0][0], tileX: number, tileY: number) {
    const { ctx, engine } = this
    const { player } = engine.state
    const door = tile.data as Door | undefined

    if (door && door.isLocked) {
      // Locked door - red tinted, with price
      const dist = Math.hypot(player.position.x - door.position.x, player.position.y - door.position.y)
      const isNearby = dist < 100

      ctx.fillStyle = isNearby ? "#553322" : "#442211"
      ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)

      // Lock icon / bars
      ctx.strokeStyle = isNearby ? "#ff6644" : "#884422"
      ctx.lineWidth = 3
      ctx.strokeRect(tileX + 4, tileY + 4, TILE_SIZE - 8, TILE_SIZE - 8)

      // Bars
      ctx.beginPath()
      ctx.moveTo(tileX + TILE_SIZE / 2, tileY + 8)
      ctx.lineTo(tileX + TILE_SIZE / 2, tileY + TILE_SIZE - 8)
      ctx.stroke()

      // Price label
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = player.money >= door.price ? "#55ff55" : "#ff5555"
      ctx.fillText(`$${door.price}`, tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2 - 8)

      if (isNearby) {
        ctx.font = "8px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("[E] Unlock", tileX + TILE_SIZE / 2, tileY + TILE_SIZE / 2 + 8)
      }
    } else {
      // Unlocked door - normal appearance
      ctx.fillStyle = "#554422"
      ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE)
      ctx.fillStyle = "#443311"
      ctx.fillRect(tileX + TILE_SIZE / 2 - 4, tileY + 4, 8, TILE_SIZE - 8)
    }
  }

  private renderShopAreas() {
    const { ctx, engine } = this
    const { player } = engine.state

    engine.map.shopAreas.forEach((shop) => {
      const { position, item, areaName } = shop
      const dist = Math.hypot(player.position.x - position.x, player.position.y - position.y)
      const isNearby = dist < 100

      // Draw area name above
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#888888"
      ctx.fillText(areaName, position.x, position.y - 45)

      // Draw shop box
      ctx.fillStyle = isNearby ? "#334455" : "#223344"
      ctx.fillRect(position.x - 32, position.y - 32, 64, 64)
      ctx.strokeStyle = isNearby ? "#55ff55" : "#446688"
      ctx.lineWidth = 2
      ctx.strokeRect(position.x - 32, position.y - 32, 64, 64)

      // Draw icon
      ctx.font = "24px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(item.icon, position.x, position.y - 8)

      // Draw item name
      ctx.font = "bold 9px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(item.name, position.x, position.y + 12)

      // Draw price
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = player.money >= item.price ? "#55ff55" : "#ff5555"
      ctx.fillText(`$${item.price}`, position.x, position.y + 26)

      // Show prompt when nearby
      if (isNearby) {
        ctx.font = "10px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("[E] Buy", position.x, position.y + 42)
      }
    })
  }

  private renderWeaponSpawns() {
    const { ctx, engine } = this
    const { player } = engine.state

    engine.map.weaponSpawns.forEach((spawn) => {
      const { position, weapon } = spawn
      const dist = Math.hypot(player.position.x - position.x, player.position.y - position.y)
      const isNearby = dist < 100

      // Draw weapon box
      ctx.fillStyle = isNearby ? "#443322" : "#332211"
      ctx.fillRect(position.x - 40, position.y - 24, 80, 48)
      ctx.strokeStyle = isNearby ? "#ffaa44" : "#886633"
      ctx.lineWidth = 2
      ctx.strokeRect(position.x - 40, position.y - 24, 80, 48)

      // Draw weapon name
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(weapon.name, position.x, position.y - 6)

      // Draw price
      ctx.font = "10px sans-serif"
      ctx.fillStyle = player.money >= weapon.price ? "#55ff55" : "#ff5555"
      ctx.fillText(`$${weapon.price}`, position.x, position.y + 10)

      if (isNearby) {
        ctx.font = "9px sans-serif"
        ctx.fillStyle = "#aaaaaa"
        ctx.fillText("[E] Buy", position.x, position.y + 24)
      }
    })
  }

  private renderVendingMachines() {
    const { ctx, engine } = this
    const { player, activePerks } = engine.state

    engine.map.vendingMachines.forEach((vm) => {
      const { position, perk, price, purchased } = vm
      const dist = Math.hypot(player.position.x - position.x, player.position.y - position.y)
      const isNearby = dist < 100
      const hasPerk = activePerks.includes(perk.effect)

      // Draw vending machine body
      const gradient = ctx.createLinearGradient(position.x - 32, position.y - 48, position.x + 32, position.y + 48)
      gradient.addColorStop(0, purchased ? "#333344" : "#224488")
      gradient.addColorStop(1, purchased ? "#222233" : "#112244")
      ctx.fillStyle = gradient
      ctx.fillRect(position.x - 32, position.y - 48, 64, 96)

      // Machine border
      ctx.strokeStyle = isNearby && !purchased ? "#55aaff" : "#446688"
      ctx.lineWidth = 3
      ctx.strokeRect(position.x - 32, position.y - 48, 64, 96)

      // Perk name
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = purchased ? "#666666" : "#55aaff"
      ctx.fillText(perk.name, position.x, position.y - 30)

      // Perk icon area
      ctx.fillStyle = purchased ? "#444455" : "#335577"
      ctx.fillRect(position.x - 20, position.y - 20, 40, 40)

      // Status text
      ctx.font = "9px sans-serif"
      if (purchased || hasPerk) {
        ctx.fillStyle = "#55ff55"
        ctx.fillText("OWNED", position.x, position.y + 35)
      } else {
        ctx.fillStyle = player.money >= price ? "#55ff55" : "#ff5555"
        ctx.fillText(`$${price}`, position.x, position.y + 35)
      }

      if (isNearby && !purchased && !hasPerk) {
        ctx.font = "9px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("[E] Buy", position.x, position.y + 50)

        if (this.showTooltips) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
          ctx.fillRect(position.x - 60, position.y + 58, 120, 24)
          ctx.strokeStyle = "#55aaff"
          ctx.lineWidth = 1
          ctx.strokeRect(position.x - 60, position.y + 58, 120, 24)
          ctx.font = "9px sans-serif"
          ctx.fillStyle = "#aaddff"
          ctx.fillText(perk.description, position.x, position.y + 73)
        }
      }
    })
  }

  private renderMysteryBox() {
    const { ctx, engine } = this
    const { player } = engine.state
    const { mysteryBox } = engine.map
    const { position, price, isOpen, openTime, currentWeapon } = mysteryBox
    const dist = Math.hypot(player.position.x - position.x, player.position.y - position.y)
    const isNearby = dist < 100

    const pulse = Math.sin(this.animationFrame * 0.05) * 0.1 + 0.9

    // Draw mystery box base
    ctx.fillStyle = isOpen ? "#4a3a20" : "#2a2a35"
    ctx.fillRect(position.x - 40, position.y - 24, 80, 48)

    // Gold border with glow
    ctx.shadowColor = "#ffcc00"
    ctx.shadowBlur = isNearby ? 15 * pulse : 8
    ctx.strokeStyle = "#ffcc00"
    ctx.lineWidth = 3
    ctx.strokeRect(position.x - 40, position.y - 24, 80, 48)
    ctx.shadowBlur = 0

    // Draw question marks or spinning weapon
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    if (isOpen && currentWeapon) {
      const elapsed = Date.now() - openTime
      if (elapsed < MYSTERY_BOX_SPIN_TIME) {
        // Spinning animation
        const spinProgress = elapsed / MYSTERY_BOX_SPIN_TIME
        const wobble = Math.sin(elapsed * 0.02) * (1 - spinProgress) * 10
        ctx.fillStyle = "#ffffff"
        ctx.fillText("???", position.x + wobble, position.y - 5)
      } else {
        // Show weapon
        ctx.fillStyle = "#55ff55"
        ctx.fillText(currentWeapon.name, position.x, position.y - 5)
        ctx.font = "9px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("[E] Take", position.x, position.y + 12)
      }
    } else {
      // Mystery box closed
      ctx.fillStyle = "#ffcc00"
      ctx.fillText("? ? ?", position.x, position.y - 5)

      ctx.font = "bold 10px sans-serif"
      ctx.fillStyle = "#888888"
      ctx.fillText("MYSTERY BOX", position.x, position.y - 38)

      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = player.money >= price ? "#55ff55" : "#ff5555"
      ctx.fillText(`$${price}`, position.x, position.y + 10)

      if (isNearby) {
        ctx.font = "9px sans-serif"
        ctx.fillStyle = "#ffffff"
        ctx.fillText("[E] Open", position.x, position.y + 26)
      }
    }
  }

  private renderPowerUps() {
    const { ctx, engine } = this
    const pulse = Math.sin(this.animationFrame * 0.1) * 0.2 + 0.8

    engine.state.powerUps.forEach((powerUp) => {
      const { position, type } = powerUp
      const color = COLORS.powerUp[type]
      const size = 16 * pulse

      // Glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 15

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(position.x, position.y, size, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0

      // Icon
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#000000"

      const icons: Record<PowerUpType, string> = {
        "insta-kill": "KILL",
        "double-points": "x2",
        "max-ammo": "AMMO",
        nuke: "NUKE",
        "speed-boost": "SPD",
      }
      ctx.fillText(icons[type], position.x, position.y)
    })
  }

  private renderBullets() {
    const { ctx, engine } = this

    ctx.fillStyle = COLORS.bullet
    ctx.shadowColor = COLORS.bullet
    ctx.shadowBlur = 8

    engine.state.bullets.forEach((bullet) => {
      ctx.beginPath()
      ctx.arc(bullet.position.x, bullet.position.y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.shadowBlur = 0
  }

  private renderExplosions() {
    const { ctx, engine } = this
    const now = Date.now()

    engine.explosions.forEach((exp) => {
      const elapsed = now - exp.startTime
      const progress = elapsed / exp.duration
      const alpha = 1 - progress
      const currentRadius = exp.radius * (0.5 + progress * 0.5)

      // Outer ring
      ctx.strokeStyle = `rgba(255, 100, 50, ${alpha})`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(exp.position.x, exp.position.y, currentRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Inner fill
      const gradient = ctx.createRadialGradient(
        exp.position.x,
        exp.position.y,
        0,
        exp.position.x,
        exp.position.y,
        currentRadius,
      )
      gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.8})`)
      gradient.addColorStop(0.5, `rgba(255, 100, 50, ${alpha * 0.5})`)
      gradient.addColorStop(1, `rgba(255, 50, 0, 0)`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(exp.position.x, exp.position.y, currentRadius, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  private renderThrownProjectiles() {
    const { ctx, engine } = this
    const spin = this.animationFrame * 0.2

    engine.thrownProjectiles.forEach((proj) => {
      ctx.save()
      ctx.translate(proj.position.x, proj.position.y)
      ctx.rotate(spin)

      ctx.fillStyle = "#446644"
      ctx.beginPath()
      ctx.arc(0, 0, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    })
  }

  private renderZombies() {
    const { ctx, engine } = this

    engine.state.zombies.forEach((zombie) => {
      if (!zombie.isActive) return

      const { position, width, height, type, health, maxHealth } = zombie

      // Get zombie color based on type
      const colorMap: Record<ZombieType, string> = {
        walker: COLORS.zombie,
        runner: COLORS.zombieRunner,
        brute: COLORS.zombieBrute,
        crawler: COLORS.zombieCrawler,
      }

      // Body
      ctx.fillStyle = colorMap[type]
      ctx.beginPath()
      ctx.arc(position.x, position.y, width / 2, 0, Math.PI * 2)
      ctx.fill()

      // Eyes (face player direction)
      const toPlayer = {
        x: engine.state.player.position.x - position.x,
        y: engine.state.player.position.y - position.y,
      }
      const angle = Math.atan2(toPlayer.y, toPlayer.x)
      const eyeOffset = width / 4

      ctx.fillStyle = "#ff3333"
      ctx.beginPath()
      ctx.arc(
        position.x + Math.cos(angle - 0.4) * eyeOffset,
        position.y + Math.sin(angle - 0.4) * eyeOffset,
        3,
        0,
        Math.PI * 2,
      )
      ctx.arc(
        position.x + Math.cos(angle + 0.4) * eyeOffset,
        position.y + Math.sin(angle + 0.4) * eyeOffset,
        3,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Health bar
      if (health < maxHealth) {
        const barWidth = width
        const barHeight = 4
        const healthPercent = health / maxHealth

        ctx.fillStyle = "#331111"
        ctx.fillRect(position.x - barWidth / 2, position.y - height / 2 - 10, barWidth, barHeight)
        ctx.fillStyle = "#ff3333"
        ctx.fillRect(position.x - barWidth / 2, position.y - height / 2 - 10, barWidth * healthPercent, barHeight)
      }
    })
  }

  private renderPlayer() {
    const { ctx, engine } = this
    const { player } = engine.state
    const { position, rotation, width, height, state, isRolling, knifeAttacking } = player

    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(rotation)

    // Roll effect
    if (isRolling) {
      ctx.globalAlpha = 0.7
    }

    // Crouch/prone size adjustment
    let scale = 1
    if (state === "crouching") scale = 0.8
    if (state === "prone") scale = 0.6
    ctx.scale(scale, scale)

    // Body
    ctx.fillStyle = COLORS.player
    ctx.beginPath()
    ctx.arc(0, 0, width / 2, 0, Math.PI * 2)
    ctx.fill()

    // Direction indicator / gun
    ctx.fillStyle = "#2a6aaa"
    ctx.fillRect(width / 4, -4, width / 2, 8)

    // Knife attack indicator
    if (knifeAttacking) {
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width, 0)
      ctx.stroke()
    }

    ctx.restore()

    // Reset alpha
    ctx.globalAlpha = 1
  }

  private renderUI() {
    const { ctx, engine } = this
    const { player } = engine.state

    // Display FPS counter if enabled
    if (this.showFPSCounter) {
      ctx.save()
      ctx.resetTransform() // Reset transformation to draw UI in screen space

      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = "#00ff00"
      ctx.textAlign = "left"
      ctx.fillText(`FPS: ${this.fps}`, 10, 20)

      ctx.restore()
    }

    // Display map coordinates if enabled
    if (this.showMapCoordinates) {
      ctx.save()
      ctx.resetTransform() // Reset transformation to draw UI in screen space

      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = "#00aaff"
      ctx.textAlign = "left"

      // Calculate world position relative to screen
      const worldX = Math.round(player.position.x)
      const worldY = Math.round(player.position.y)

      ctx.fillText(`Map: (${worldX}, ${worldY})`, 10, 40)

      ctx.restore()
    }
  }
}
