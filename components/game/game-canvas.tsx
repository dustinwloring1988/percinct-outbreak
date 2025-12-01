"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { GameEngine } from "@/lib/game/game-engine"
import { GameRenderer } from "@/lib/game/renderer"
import { GameHUD } from "./game-hud"
import { PauseMenu } from "./pause-menu"
import { GameOverScreen } from "./game-over-screen"
import { Minimap } from "./minimap"
import type { GameSettings } from "@/lib/game/types"
import { audioManager } from "@/lib/game/audio-manager"

interface GameCanvasProps {
  settings: GameSettings
  onExit: () => void
  onSettings: (newSettings: GameSettings) => void
}

export function GameCanvas({ settings, onExit, onSettings }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const rendererRef = useRef<GameRenderer | null>(null)
  const animationFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const [gameState, setGameState] = useState<{
    health: number
    maxHealth: number
    armor: number
    money: number
    wave: number
    score: number
    ammo: number
    reserveAmmo: number
    weaponName: string
    isPaused: boolean
    isGameOver: boolean
    betweenWaves: boolean
    throwableCount: number
    throwableName: string
    weapons: { name: string; ammo: number; maxAmmo: number }[]
    currentWeaponIndex: number
    nearbyItems: { id: string; name: string; price: number; type: string }[]
  }>({
    health: 100,
    maxHealth: 100,
    armor: 0,
    money: 500,
    wave: 0,
    score: 0,
    ammo: 8,
    reserveAmmo: 48,
    weaponName: "M1911",
    isPaused: false,
    isGameOver: false,
    betweenWaves: true,
    throwableCount: 2,
    throwableName: "Frag Grenade",
    weapons: [],
    currentWeaponIndex: 0,
    nearbyItems: [],
  })

  const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [isUsingMouse, setIsUsingMouse] = useState(false);

  const syncGameState = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return

    const { player, wave, score, isPaused, isGameOver, betweenWaves } = engine.state
    const currentWeapon = player.weapons[player.currentWeaponIndex]

    // Find nearby interactable items
    const nearbyItems: { id: string; name: string; price: number; type: string }[] = []

    engine.map.doors.forEach((door) => {
      if (!door.isLocked) return
      const dist = Math.hypot(player.position.x - door.position.x, player.position.y - door.position.y)
      if (dist < 100) {
        nearbyItems.push({
          id: door.id,
          name: "Door",
          price: door.price,
          type: "door",
        })
      }
    })

    engine.map.shopAreas.forEach((shop) => {
      const dist = Math.hypot(player.position.x - shop.position.x, player.position.y - shop.position.y)
      if (dist < 100) {
        nearbyItems.push({
          id: shop.item.id,
          name: shop.item.name,
          price: shop.item.price,
          type: shop.item.type,
        })
      }
    })

    engine.map.weaponSpawns.forEach((spawn) => {
      const dist = Math.hypot(player.position.x - spawn.position.x, player.position.y - spawn.position.y)
      if (dist < 100) {
        nearbyItems.push({
          id: spawn.weapon.id,
          name: spawn.weapon.name,
          price: spawn.weapon.price,
          type: "weapon",
        })
      }
    })

    engine.map.vendingMachines.forEach((vm) => {
      if (vm.purchased) return
      const dist = Math.hypot(player.position.x - vm.position.x, player.position.y - vm.position.y)
      if (dist < 100) {
        nearbyItems.push({
          id: vm.id,
          name: vm.perk.name,
          price: vm.price,
          type: "perk",
        })
      }
    })

    // Check mystery box
    const { mysteryBox } = engine.map
    const distToBox = Math.hypot(player.position.x - mysteryBox.position.x, player.position.y - mysteryBox.position.y)
    if (distToBox < 100) {
      nearbyItems.push({
        id: mysteryBox.id,
        name: "Mystery Box",
        price: mysteryBox.price,
        type: "mystery-box",
      })
    }

    setGameState({
      health: player.health,
      maxHealth: player.maxHealth,
      armor: player.armor,
      money: player.money,
      wave,
      score,
      ammo: currentWeapon?.currentAmmo ?? 0,
      reserveAmmo: currentWeapon?.reserveAmmo ?? 0,
      weaponName: currentWeapon?.name ?? "None",
      isPaused,
      isGameOver,
      betweenWaves,
      throwableCount: player.throwable?.count ?? 0,
      throwableName: player.throwable?.name ?? "None",
      weapons: player.weapons.map((w) => ({
        name: w.name,
        ammo: w.currentAmmo,
        maxAmmo: w.magazineSize,
      })),
      currentWeaponIndex: player.currentWeaponIndex,
      nearbyItems,
    })
  }, [])

  const gameLoop = useCallback(
    (currentTime: number) => {
      const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 16
      lastTimeRef.current = currentTime

      const engine = engineRef.current
      const renderer = rendererRef.current
      const canvas = canvasRef.current

      if (engine && renderer && canvas && engine.initialized) {
        engine.update(deltaTime)
        renderer.render(deltaTime)
        syncGameState()
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [syncGameState],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (engineRef.current) {
        engineRef.current.setViewport(canvas.width, canvas.height)
      }
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize engine
    const engine = new GameEngine()
    engineRef.current = engine

    // Initialize renderer immediately with the engine
    const renderer = new GameRenderer(ctx, engine)
    rendererRef.current = renderer

    // Initialize audio
    audioManager.init()
    audioManager.playBackground()

    // Wait for engine to be fully initialized before starting the game loop
    engine.waitForInitialization().then(() => {
      if (engineRef.current) {
        // Set viewport after initialization
        engineRef.current.setViewport(canvas.width, canvas.height)

        // Start game loop only after initialization is complete
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      }
    })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameRef.current)
      audioManager.stopBackground()
    }
  }, [gameLoop])

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.showTooltips = settings.showTooltips
      rendererRef.current.showFPSCounter = settings.showFPSCounter
      rendererRef.current.showMapCoordinates = settings.showMapCoordinates
    }
  }, [settings.showTooltips, settings.showFPSCounter, settings.showMapCoordinates])

  // Input handlers
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      engine.input.keys.add(e.code)

      // Pause - only keyboard (gamepad start button handled separately)
      if (e.code === "Escape") {
        engine.state.isPaused = !engine.state.isPaused
      }

      // Reload
      if (e.code === "KeyR") {
        engine.startReload()
      }

      // Switch weapons
      if (e.code === "KeyQ") {
        engine.swapWeapon()
      }
      if (e.code === "Digit1") {
        engine.switchWeapon(0)
      }
      if (e.code === "Digit2") {
        engine.switchWeapon(1)
      }

      // Throw grenade
      if (e.code === "KeyG") {
        engine.throwGrenade()
      }

      // Interact/Buy
      if (e.code === "KeyE") {
        const nearbyItems = gameState.nearbyItems
        if (nearbyItems.length > 0) {
          engine.buyItem(nearbyItems[0].id)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.input.keys.delete(e.code)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const currentPosition = { x: e.clientX, y: e.clientY };
      engine.input.mousePosition = currentPosition;

      // Check if mouse has moved significantly (threshold of 5 pixels)
      if (lastMousePosition) {
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - lastMousePosition.x, 2) +
          Math.pow(currentPosition.y - lastMousePosition.y, 2)
        );

        if (distance > 5 && !isUsingMouse) {
          setIsUsingMouse(true);
        }
      }

      setLastMousePosition(currentPosition);
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) engine.input.mouseDown = true
      if (e.button === 2) engine.input.rightMouseDown = true
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) engine.input.mouseDown = false
      if (e.button === 2) engine.input.rightMouseDown = false
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Handle gamepad input continuously
    const handleGamepadInput = () => {
      if (engine.input.gamepad) {
        // Check for any significant gamepad input to switch to controller mode
        const isUsingGamepad = (
          engine.input.gamepad.rightTrigger ||
          engine.input.gamepad.leftTrigger ||
          Math.abs(engine.input.gamepad.rightStickX) > 0.1 ||
          Math.abs(engine.input.gamepad.rightStickY) > 0.1 ||
          Math.abs(engine.input.gamepad.leftStickX) > 0.1 ||
          Math.abs(engine.input.gamepad.leftStickY) > 0.1 ||
          engine.input.gamepad.a || engine.input.gamepad.b ||
          engine.input.gamepad.x || engine.input.gamepad.y ||
          engine.input.gamepad.leftShoulder || engine.input.gamepad.rightShoulder ||
          engine.input.gamepad.up || engine.input.gamepad.down ||
          engine.input.gamepad.left || engine.input.gamepad.right ||
          engine.input.gamepad.start || engine.input.gamepad.select
        );

        if (isUsingGamepad && isUsingMouse) {
          setIsUsingMouse(false); // Switch to controller mode
        }

        // Pause with Start button
        if (engine.input.gamepad.start) {
          engine.state.isPaused = !engine.state.isPaused;
        }

        // Reload with X button
        if (engine.input.gamepad.x) {
          engine.startReload();
        }

        // Switch weapons with bumpers
        if (engine.input.gamepad.leftShoulder) {
          engine.swapWeapon();
        }
        if (engine.input.gamepad.rightShoulder) {
          engine.swapWeapon();
        }

        // Throw grenade with Y button
        if (engine.input.gamepad.y) {
          engine.throwGrenade();
        }

        // Interact/Buy with A button
        if (engine.input.gamepad.a && gameState.nearbyItems.length > 0) {
          engine.buyItem(gameState.nearbyItems[0].id);
        }
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);

    // Set up gamepad interval
    const gamepadInterval = setInterval(handleGamepadInput, 50); // Check gamepad state every 50ms

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(gamepadInterval);
    };
  }, [gameState.nearbyItems])

  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) {
      audioManager.pauseBackground()
    } else {
      audioManager.resumeBackground()
    }
  }, [gameState.isPaused, gameState.isGameOver])

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.state.isPaused = false
    }
  }

  const handleRestart = async () => {
    if (engineRef.current) {
      await engineRef.current.reset()
    }
  }

  const onSettingsChange = (newSettings: GameSettings) => {
    // Update settings state in parent
    onSettings(newSettings);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${(isUsingMouse || gameState.isPaused || gameState.isGameOver) ? 'cursor-crosshair' : 'cursor-none'}`}
      />

      <GameHUD
        health={gameState.health}
        maxHealth={gameState.maxHealth}
        armor={gameState.armor}
        money={gameState.money}
        wave={gameState.wave}
        score={gameState.score}
        ammo={gameState.ammo}
        reserveAmmo={gameState.reserveAmmo}
        weaponName={gameState.weaponName}
        throwableCount={gameState.throwableCount}
        throwableName={gameState.throwableName}
        betweenWaves={gameState.betweenWaves}
        weapons={gameState.weapons}
        currentWeaponIndex={gameState.currentWeaponIndex}
      />

      {engineRef.current && (
        <Minimap
          gameState={engineRef.current.state}
          mapDoors={engineRef.current.map.doors || []}
          mapTiles={engineRef.current.map.tiles || []}
          mapSize={{ width: 4800, height: 3600 }} // Based on constants.ts
        />
      )}

      {gameState.isPaused && !gameState.isGameOver && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onExit={onExit}
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      )}

      {gameState.isGameOver && (
        <GameOverScreen score={gameState.score} wave={gameState.wave} onRestart={handleRestart} onExit={onExit} />
      )}
    </div>
  )
}
