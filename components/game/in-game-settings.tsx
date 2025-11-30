"use client"

import type { GameSettings } from "@/lib/game/types"

interface InGameSettingsProps {
  settings: GameSettings
  onSettingsChange: (settings: GameSettings) => void
  onBack: () => void
}

export function InGameSettings({ settings, onSettingsChange, onBack }: InGameSettingsProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">SETTINGS</h2>

        <div className="space-y-6">
          {/* Music Volume */}
          <div>
            <label className="block text-foreground font-bold mb-2">Music Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  musicVolume: Number.parseFloat(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="text-right text-muted-foreground text-sm">{Math.round(settings.musicVolume * 100)}%</div>
          </div>

          {/* SFX Volume */}
          <div>
            <label className="block text-foreground font-bold mb-2">SFX Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.sfxVolume}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  sfxVolume: Number.parseFloat(e.target.value),
                })
              }
              className="w-full accent-primary"
            />
            <div className="text-right text-muted-foreground text-sm">{Math.round(settings.sfxVolume * 100)}%</div>
          </div>

          {/* Show Tooltips */}
          <div>
            <label className="block text-foreground font-bold mb-2">Show Tooltips</label>
            <button
              onClick={() => onSettingsChange({ ...settings, showTooltips: !settings.showTooltips })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${
                settings.showTooltips
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {settings.showTooltips ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Show perk descriptions near vending machines</p>
          </div>

          {/* Show FPS Counter */}
          <div>
            <label className="block text-foreground font-bold mb-2">Show FPS Counter</label>
            <button
              onClick={() => onSettingsChange({ ...settings, showFPSCounter: !settings.showFPSCounter })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${
                settings.showFPSCounter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {settings.showFPSCounter ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Display frames per second counter on screen</p>
          </div>

          {/* Show Map Coordinates */}
          <div>
            <label className="block text-foreground font-bold mb-2">Show Map Coordinates</label>
            <button
              onClick={() => onSettingsChange({ ...settings, showMapCoordinates: !settings.showMapCoordinates })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${
                settings.showMapCoordinates
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {settings.showMapCoordinates ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Display player position coordinates</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full mt-8 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded font-bold transition-all"
        >
          BACK
        </button>
      </div>
    </div>
  )
}