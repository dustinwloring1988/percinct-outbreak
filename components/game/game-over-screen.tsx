"use client"

import { useRef } from "react"
import { useGamepadNavigation } from '@/hooks/use-gamepad-navigation'

interface GameOverScreenProps {
  score: number
  wave: number
  onRestart: () => void
  onExit: () => void
}

export function GameOverScreen({ score, wave, onRestart, onExit }: GameOverScreenProps) {
  const restartButtonRef = useRef<HTMLButtonElement>(null)
  const exitButtonRef = useRef<HTMLButtonElement>(null)

  const {
    registerMenuItem,
    gamepadConnected,
    focusedKey
  } = useGamepadNavigation({
    onSelect: () => {
      // Trigger click on the focused button
      if (focusedKey === 'restart') restartButtonRef.current?.click()
      else if (focusedKey === 'exit') exitButtonRef.current?.click()
    },
    onBack: onExit  // Map the B button to exit
  })

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-destructive mb-4 animate-pulse">GAME OVER</h1>

        <div className="bg-card border border-border rounded-lg p-6 mb-8 max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-muted-foreground text-sm">Final Score</p>
              <p className="text-3xl font-bold text-primary">{score.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Wave Reached</p>
              <p className="text-3xl font-bold text-accent">{wave}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            ref={restartButtonRef}
            onClick={onRestart}
            className={`bg-primary ${focusedKey === 'restart' ? 'ring-4 ring-primary/50' : 'hover:bg-primary/90'} text-primary-foreground py-4 px-8 rounded font-bold text-xl transition-all hover:scale-105 focus:outline-none`}
            onFocus={() => registerMenuItem(restartButtonRef.current!, 'restart')}
          >
            TRY AGAIN
          </button>

          <button
            ref={exitButtonRef}
            onClick={onExit}
            className={`bg-secondary ${focusedKey === 'exit' ? 'ring-4 ring-primary/50' : 'hover:bg-secondary/80'} text-secondary-foreground py-3 px-8 rounded font-bold transition-all focus:outline-none`}
            onFocus={() => registerMenuItem(exitButtonRef.current!, 'exit')}
          >
            EXIT TO MENU
          </button>
        </div>

        {gamepadConnected && (
          <div className="mt-4 text-center">
            <p className="text-primary text-sm font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Controller Connected
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
