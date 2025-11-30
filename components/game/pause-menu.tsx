"use client"

interface PauseMenuProps {
  onResume: () => void
  onRestart: () => void
  onExit: () => void
}

export function PauseMenu({ onResume, onRestart, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full mx-4">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">PAUSED</h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={onResume}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded font-bold text-lg transition-all hover:scale-105"
          >
            RESUME
          </button>

          <button
            onClick={onRestart}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 px-6 rounded font-bold transition-all"
          >
            RESTART
          </button>

          <button
            onClick={onExit}
            className="bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground py-3 px-6 rounded font-bold transition-all border border-destructive/50"
          >
            EXIT TO MENU
          </button>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">Press ESC to resume</p>
      </div>
    </div>
  )
}
