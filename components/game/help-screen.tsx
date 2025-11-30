"use client"

interface HelpScreenProps {
  onBack: () => void
}

export function HelpScreen({ onBack }: HelpScreenProps) {
  const controls = [
    { key: "W A S D", action: "Move" },
    { key: "Mouse", action: "Aim" },
    { key: "Left Click", action: "Shoot" },
    { key: "Right Click", action: "Knife Attack" },
    { key: "R", action: "Reload" },
    { key: "Space + Direction", action: "Combat Roll" },
    { key: "C", action: "Crouch" },
    { key: "Z", action: "Prone" },
    { key: "Q", action: "Swap Weapon" },
    { key: "1 / 2", action: "Select Weapon Slot" },
    { key: "G", action: "Throw Grenade" },
    { key: "E", action: "Interact / Buy" },
    { key: "Escape", action: "Pause" },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">HOW TO PLAY</h1>

        {/* Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Controls</h2>
          <div className="grid grid-cols-2 gap-3">
            {controls.map(({ key, action }) => (
              <div key={key} className="flex items-center gap-3">
                <kbd className="bg-muted px-2 py-1 rounded text-sm font-mono min-w-[80px] text-center">{key}</kbd>
                <span className="text-muted-foreground text-sm">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Power-ups legend */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Power-Ups</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Insta-Kill</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">Double Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Max Ammo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white" />
              <span className="text-sm text-muted-foreground">Nuke (Kill All)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500" />
              <span className="text-sm text-muted-foreground">Speed Boost</span>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded font-bold transition-all"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  )
}
