"use client"

import { useRef, useEffect } from 'react'
import type { GameScreen } from "@/app/page"
import { useGamepadNavigation } from '@/hooks/use-gamepad-navigation'

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void
}

export function MainMenu({ onNavigate }: MainMenuProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const helpButtonRef = useRef<HTMLButtonElement>(null)
  const statsButtonRef = useRef<HTMLButtonElement>(null)

  const {
    registerMenuItem,
    gamepadConnected,
    focusedKey
  } = useGamepadNavigation({
    onSelect: () => {
      // Trigger click on the focused button
      if (focusedKey === 'start') startButtonRef.current?.click()
      else if (focusedKey === 'settings') settingsButtonRef.current?.click()
      else if (focusedKey === 'help') helpButtonRef.current?.click()
      else if (focusedKey === 'stats') statsButtonRef.current?.click()
    }
  })

  // Set first button as focused initially
  useEffect(() => {
    if (!focusedKey && startButtonRef.current) {
      startButtonRef.current.focus()
    }
  }, [focusedKey])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-2">
            <span className="text-foreground">PRECINCT</span>
            <br />
            <span className="text-primary">OUTBREAK</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-mono">Survive the Night. Hold the Line.</p>
        </div>

        {/* Zombie silhouette decoration */}
        <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Menu buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            ref={startButtonRef}
            onClick={() => onNavigate("game")}
            className={`group relative overflow-hidden bg-primary ${focusedKey === 'start' ? 'ring-4 ring-primary/50' : 'hover:bg-primary/90'} text-primary-foreground py-4 px-8 rounded font-bold text-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 focus:outline-none`}
            onFocus={() => registerMenuItem(startButtonRef.current!, 'start')}
          >
            <span className="relative z-10">START GAME</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>

          <button
            ref={settingsButtonRef}
            onClick={() => onNavigate("settings")}
            className={`group relative overflow-hidden bg-secondary ${focusedKey === 'settings' ? 'ring-4 ring-primary/50' : 'hover:bg-secondary/80'} text-secondary-foreground py-3 px-8 rounded font-bold text-lg transition-all duration-200 hover:scale-105 focus:outline-none`}
            onFocus={() => registerMenuItem(settingsButtonRef.current!, 'settings')}
          >
            SETTINGS
          </button>

          <button
            ref={helpButtonRef}
            onClick={() => onNavigate("help")}
            className={`group relative overflow-hidden bg-secondary ${focusedKey === 'help' ? 'ring-4 ring-primary/50' : 'hover:bg-secondary/80'} text-secondary-foreground py-3 px-8 rounded font-bold text-lg transition-all duration-200 hover:scale-105 focus:outline-none`}
            onFocus={() => registerMenuItem(helpButtonRef.current!, 'help')}
          >
            HOW TO PLAY
          </button>

          <button
            ref={statsButtonRef}
            onClick={() => onNavigate("stats")}
            className={`group relative overflow-hidden bg-secondary ${focusedKey === 'stats' ? 'ring-4 ring-primary/50' : 'hover:bg-secondary/80'} text-secondary-foreground py-3 px-8 rounded font-bold text-lg transition-all duration-200 hover:scale-105 focus:outline-none`}
            onFocus={() => registerMenuItem(statsButtonRef.current!, 'stats')}
          >
            STATS
          </button>
        </div>

        {/* Gamepad indicator */}
        {gamepadConnected && (
          <div className="mt-4 text-center">
            <p className="text-primary text-sm font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Controller Connected
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm font-mono">
            Built by: Dustin Loring |{" "}
            <a
              href="https://github.com/dustinwloring1988"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
    </div>
  )
}
