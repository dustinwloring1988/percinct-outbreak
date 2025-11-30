"use client"

interface GameOverScreenProps {
  score: number
  wave: number
  onRestart: () => void
  onExit: () => void
}

export function GameOverScreen({ score, wave, onRestart, onExit }: GameOverScreenProps) {
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
            onClick={onRestart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded font-bold text-xl transition-all hover:scale-105"
          >
            TRY AGAIN
          </button>

          <button
            onClick={onExit}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 px-8 rounded font-bold transition-all"
          >
            EXIT TO MENU
          </button>
        </div>
      </div>
    </div>
  )
}
