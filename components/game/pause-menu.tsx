"use client"

import { useState, useRef, useEffect } from "react"
import { InGameSettings } from "./in-game-settings"
import type { GameSettings } from "@/lib/game/types"
import { useGamepadNavigation } from '@/hooks/use-gamepad-navigation'

interface PauseMenuProps {
  onResume: () => void
  onRestart: () => void
  onExit: () => void
  settings: GameSettings
  onSettingsChange: (settings: GameSettings) => void
}

export function PauseMenu({ onResume, onRestart, onExit, settings, onSettingsChange }: PauseMenuProps) {
  const [showSettings, setShowSettings] = useState(false)
  const resumeButtonRef = useRef<HTMLButtonElement>(null)
  const restartButtonRef = useRef<HTMLButtonElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const exitButtonRef = useRef<HTMLButtonElement>(null)

  const {
    registerMenuItem,
    gamepadConnected,
    focusedKey
  } = useGamepadNavigation({
    onSelect: () => {
      // Trigger click on the focused button
      if (focusedKey === 'resume') resumeButtonRef.current?.click()
      else if (focusedKey === 'restart') restartButtonRef.current?.click()
      else if (focusedKey === 'settings') settingsButtonRef.current?.click()
      else if (focusedKey === 'exit') exitButtonRef.current?.click()
    },
    onBack: onExit  // Map the B button to exit
  })

  if (showSettings) {
    return (
      <InGameSettings
        settings={settings}
        onSettingsChange={onSettingsChange}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full mx-4">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">PAUSED</h2>

        <div className="flex flex-col gap-4">
          <button
            ref={resumeButtonRef}
            onClick={onResume}
            className={`bg-primary ${focusedKey === 'resume' ? 'ring-4 ring-primary/50' : 'hover:bg-primary/90'} text-primary-foreground py-3 px-6 rounded font-bold text-lg transition-all hover:scale-105 focus:outline-none`}
            onFocus={() => registerMenuItem(resumeButtonRef.current!, 'resume')}
          >
            RESUME
          </button>

          <button
            ref={restartButtonRef}
            onClick={onRestart}
            className={`bg-secondary ${focusedKey === 'restart' ? 'ring-4 ring-primary/50' : 'hover:bg-secondary/80'} text-secondary-foreground py-3 px-6 rounded font-bold transition-all focus:outline-none`}
            onFocus={() => registerMenuItem(restartButtonRef.current!, 'restart')}
          >
            RESTART
          </button>

          <button
            ref={settingsButtonRef}
            onClick={() => setShowSettings(true)}
            className={`bg-accent ${focusedKey === 'settings' ? 'ring-4 ring-primary/50' : 'hover:bg-accent/80'} text-accent-foreground py-3 px-6 rounded font-bold transition-all border border-border focus:outline-none`}
            onFocus={() => registerMenuItem(settingsButtonRef.current!, 'settings')}
          >
            SETTINGS
          </button>

          <button
            ref={exitButtonRef}
            onClick={onExit}
            className={`bg-destructive/20 ${focusedKey === 'exit' ? 'ring-4 ring-primary/50' : 'hover:bg-destructive/30'} text-destructive-foreground py-3 px-6 rounded font-bold transition-all border border-destructive/50 focus:outline-none`}
            onFocus={() => registerMenuItem(exitButtonRef.current!, 'exit')}
          >
            EXIT TO MENU
          </button>
        </div>

        <div className="flex justify-between text-center text-muted-foreground text-sm mt-6">
          <p>Press ESC to resume</p>
          {gamepadConnected && (
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Controller
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
