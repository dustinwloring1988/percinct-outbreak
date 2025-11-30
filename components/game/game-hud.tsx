"use client"

interface GameHUDProps {
  health: number
  maxHealth: number
  armor: number
  money: number
  wave: number
  score: number
  ammo: number
  reserveAmmo: number
  weaponName: string
  throwableCount: number
  throwableName: string
  betweenWaves: boolean
  weapons: { name: string; ammo: number; maxAmmo: number }[]
  currentWeaponIndex: number
}

export function GameHUD({
  health,
  maxHealth,
  armor,
  money,
  wave,
  score,
  ammo,
  reserveAmmo,
  weaponName,
  throwableCount,
  throwableName,
  betweenWaves,
  weapons,
  currentWeaponIndex,
}: GameHUDProps) {
  const healthPercent = (health / maxHealth) * 100
  const armorPercent = (armor / 100) * 100

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-mono">
      {/* Top HUD - Wave and Score */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="bg-black/70 px-6 py-2 rounded border border-primary/50">
          <span className="text-primary font-bold text-lg">WAVE {wave}</span>
        </div>
        <div className="bg-black/50 px-4 py-1 rounded text-sm">
          <span className="text-muted-foreground">Score: </span>
          <span className="text-foreground font-bold">{score.toLocaleString()}</span>
        </div>
        {betweenWaves && wave > 0 && (
          <div className="bg-primary/20 border border-primary px-4 py-1 rounded animate-pulse">
            <span className="text-primary text-sm">PREPARE FOR NEXT WAVE</span>
          </div>
        )}
      </div>

      {/* Bottom Left - Health and Armor */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {/* Health */}
        <div className="bg-black/70 p-3 rounded border border-border/50 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-500 text-sm">❤</span>
            <span className="text-xs text-muted-foreground">HEALTH</span>
            <span className="text-foreground text-sm ml-auto">
              {Math.ceil(health)}/{maxHealth}
            </span>
          </div>
          <div className="h-3 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Armor */}
        <div className="bg-black/70 p-3 rounded border border-border/50 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 text-sm">🛡</span>
            <span className="text-xs text-muted-foreground">ARMOR</span>
            <span className="text-foreground text-sm ml-auto">{Math.ceil(armor)}/100</span>
          </div>
          <div className="h-3 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-200"
              style={{ width: `${armorPercent}%` }}
            />
          </div>
        </div>

        {/* Money */}
        <div className="bg-black/70 px-3 py-2 rounded border border-primary/30">
          <span className="text-primary font-bold text-xl">${money.toLocaleString()}</span>
        </div>
      </div>

      {/* Bottom Right - Weapons and Ammo */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        {/* Current Weapon */}
        <div className="bg-black/70 p-3 rounded border border-accent/50 min-w-[180px]">
          <div className="text-accent font-bold mb-1">{weaponName}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-foreground text-3xl font-bold">{ammo}</span>
            <span className="text-muted-foreground text-lg">/ {reserveAmmo}</span>
          </div>
        </div>

        {weapons.length > 1 && (
          <div className="flex gap-2">
            {weapons.map((weapon, index) => (
              <div
                key={index}
                className={`bg-black/70 px-3 py-2 rounded border ${
                  index === currentWeaponIndex ? "border-primary bg-primary/20" : "border-border/50"
                }`}
              >
                <div className="text-xs text-muted-foreground">[{index + 1}]</div>
                <div className="text-sm text-foreground">{weapon.name}</div>
                <div className="text-xs text-muted-foreground">
                  {weapon.ammo}/{weapon.maxAmmo}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Throwable */}
        <div className="bg-black/70 px-3 py-2 rounded border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">[G]</span>
            <span className="text-sm text-foreground">{throwableName}</span>
            <span className="text-accent font-bold">x{throwableCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
