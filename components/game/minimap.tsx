"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/game/types"
import { COLORS } from "@/lib/game/constants"

interface MinimapProps {
  gameState: GameState
  mapDoors: { unlocksRoom?: string; isLocked: boolean }[]
  mapTiles: { x: number; y: number; type: string; walkable: boolean; interactable: boolean; data?: any }[][]
  mapSize: { width: number; height: number }
  minimapSize?: { width: number; height: number }
}

export function Minimap({ gameState, mapDoors, mapTiles, mapSize, minimapSize = { width: 200, height: 150 } }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Effect to draw the static map (only when mapTiles change)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate scale factors
    const currentWidth = isMaximized ? 800 : minimapSize.width
    const currentHeight = isMaximized ? 600 : minimapSize.height

    // Calculate tile size in minimap pixels
    const scaleX = currentWidth / mapSize.width
    const scaleY = currentHeight / mapSize.height
    const scale = Math.min(scaleX, scaleY) // Use the smaller scale to fit everything
    const tilePixelSizeX = 64 * scaleX // TILE_SIZE = 64 from constants
    const tilePixelSizeY = 64 * scaleY

    // Draw map tiles if available
    if (mapTiles && mapTiles.length > 0 && mapTiles[0].length > 0) {
      // Pre-calculate the number of tiles that can be visible at once
      const TILES_X = mapTiles[0].length;
      const TILES_Y = mapTiles.length;

      // Clear canvas - use dynamic size based on maximized state
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      // Draw all tiles (for minimap, we want to show the full map)
      for (let y = 0; y < TILES_Y; y++) {
        for (let x = 0; x < TILES_X; x++) {
          const tile = mapTiles[y][x]
          if (!tile) continue

          const tileX = x * tilePixelSizeX
          const tileY = y * tilePixelSizeY

          // Set tile color based on tile type, matching main map renderer
          switch (tile.type) {
            case "wall":
              ctx.fillStyle = COLORS.wall
              break
            case "desk":
              ctx.fillStyle = COLORS.desk
              break
            case "debris":
              ctx.fillStyle = "#555555" // Use gray for debris
              break
            case "blood":
              ctx.fillStyle = COLORS.blood
              break
            case "locker":
              ctx.fillStyle = "#445566" // Use a similar color to main map
              break
            case "door":
              // Check if the door is unlocked
              const doorData = tile.data
              const isUnlocked = gameState.activePerks.some(perk =>
                doorData?.unlocksRoom && (perk.includes(doorData.unlocksRoom.replace('-', '')) ||
                perk.toLowerCase().includes(doorData.unlocksRoom.toLowerCase()))
              ) || mapDoors.some(d =>
                d.unlocksRoom === doorData?.unlocksRoom && !d.isLocked
              )

              ctx.fillStyle = isUnlocked ? "#554422" : "#442211" // Different colors for locked/unlocked doors
              break
            default: // floor and other default types
              ctx.fillStyle = COLORS.floor
              break
          }

          ctx.fillRect(tileX, tileY, tilePixelSizeX, tilePixelSizeY)

          // Only draw borders if the minimap is large enough to see them
          if (tilePixelSizeX > 2 && tilePixelSizeY > 2) {
            ctx.strokeStyle = "#333340" // Similar to main map grid
            ctx.lineWidth = 0.5
            ctx.strokeRect(tileX, tileY, tilePixelSizeX, tilePixelSizeY)
          }
        }

        // Define room positions and their names for the minimap
        const roomPositions = [
          { name: "ARMORY", x: 990, y: 2660 }, // Armory room
          { name: "MEDBAY", x: 3938, y: 734 }, // Med bay room
          { name: "SWAT STORAGE", x: 3744, y: 3035 }, // SWAT room
          { name: "HOLDING", x: 600, y: 1500 }, // Combined holding cells
          { name: "POWER ROOM", x: 2400, y: 2700 }, // Garage area (as a suitable location for power room)
          { name: "FILE STORAGE", x: 600, y: 800 }, // Records room
          { name: "CAFÉ", x: 3233, y: 1058 }, // Upper center area (as a suitable location for café)
          { name: "COMMON AREA", x: 3233, y: 2412 }, // Main lobby area
        ]

        // Draw room names on minimap
        ctx.font = `${Math.max(8, Math.min(14, currentWidth / 40))}px Arial`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        roomPositions.forEach(room => {
          const roomX = (room.x / mapSize.width) * currentWidth
          const roomY = (room.y / mapSize.height) * currentHeight
          ctx.fillText(room.name, roomX, roomY)
        })
      }
    }
  }, [mapTiles, mapSize, minimapSize, isMaximized, gameState.activePerks, mapDoors]) // Only re-render static map when these change

  // Effect to draw dynamic elements (player, zombies) - runs more frequently
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Calculate scale factors
    const currentWidth = isMaximized ? 800 : minimapSize.width
    const currentHeight = isMaximized ? 600 : minimapSize.height
    const scaleX = currentWidth / mapSize.width
    const scaleY = currentHeight / mapSize.height
    const scale = Math.min(scaleX, scaleY) // Use the smaller scale to fit everything

    // Calculate tile size in minimap pixels
    const tilePixelSizeX = 64 * scaleX // TILE_SIZE = 64 from constants
    const tilePixelSizeY = 64 * scaleY

    // Only redraw the dynamic elements by temporarily clearing their positions
    // First, we only draw on the areas where dynamic elements are located
    const drawDynamicElements = () => {
      // Clear just the area where player and zombies were
      // This is a simplified approach - we'll redraw everything for player and zombies only

      // Calculate current width and height again for consistency
      const currentWidth = isMaximized ? 800 : minimapSize.width
      const currentHeight = isMaximized ? 600 : minimapSize.height

      // Calculate scale again for positioning
      const scaleX = currentWidth / mapSize.width
      const scaleY = currentHeight / mapSize.height
      const scale = Math.min(scaleX, scaleY)

      // Draw player
      const playerX = gameState.player.position.x * scale
      const playerY = gameState.player.position.y * scale

      ctx.fillStyle = COLORS.player // Use the same player color as main map
      ctx.beginPath()
      ctx.arc(playerX, playerY, 3, 0, Math.PI * 2)
      ctx.fill()

      // Draw zombies
      gameState.zombies.forEach((zombie) => {
        if (!zombie.isActive) return

        const zombieX = zombie.position.x * scale
        const zombieY = zombie.position.y * scale

        // Get zombie color based on type, matching main map
        const colorMap: Record<string, string> = {
          walker: COLORS.zombie,
          runner: COLORS.zombieRunner,
          brute: COLORS.zombieBrute,
          crawler: COLORS.zombieCrawler,
        }

        ctx.fillStyle = colorMap[zombie.type] || COLORS.zombie
        ctx.beginPath()
        ctx.arc(zombieX, zombieY, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    };

    // This will run every time gameState changes (player pos, zombies, etc.)
    drawDynamicElements();
  }, [gameState, mapSize, minimapSize, isMaximized])

  return (
    <div className={`absolute top-4 right-4 bg-black/50 p-2 rounded ${isMaximized ? 'z-50' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-white">MINIMAP</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-xs text-gray-300 hover:text-white"
          >
            {isMaximized ? "MINIMIZE" : "MAXIMIZE"}
          </button>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-xs text-gray-300 hover:text-white ml-1"
          >
            {isVisible ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>
      {isVisible && (
        <div className={`${isMaximized ? 'fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4' : ''}`}>
          <div className={isMaximized ? 'bg-gray-900 p-4 rounded border border-gray-500' : ''}>
            <canvas
              ref={canvasRef}
              width={isMaximized ? 800 : minimapSize.width}
              height={isMaximized ? 600 : minimapSize.height}
              className={`border border-gray-500 bg-gray-900 ${isMaximized ? 'max-w-full max-h-[80vh]' : ''}`}
            />
            {!isMaximized && (
              <div className="flex flex-wrap gap-1 mt-1 text-[8px]">
                <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 mr-1"></div>Player</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-red-500 mr-1"></div>Zombies</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-green-500 mr-1"></div>Unlocked</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-red-500 mr-1"></div>Locked</div>
              </div>
            )}
          </div>
          {isMaximized && (
            <button
              onClick={() => setIsMaximized(false)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>
      )}
      {!isMaximized && isVisible && (
        <div className="flex flex-wrap gap-1 mt-1 text-[8px]">
          <div className="flex items-center"><div className="w-2 h-2 bg-yellow-400 mr-1"></div>Player</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-red-500 mr-1"></div>Zombies</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-green-500 mr-1"></div>Unlocked</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-red-500 mr-1"></div>Locked</div>
        </div>
      )}
    </div>
  )
}