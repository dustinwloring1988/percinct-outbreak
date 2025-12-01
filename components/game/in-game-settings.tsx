"use client"

import { useRef } from "react"
import type { GameSettings } from "@/lib/game/types"
import { useGamepadNavigation } from '@/hooks/use-gamepad-navigation'

interface InGameSettingsProps {
  settings: GameSettings
  onSettingsChange: (settings: GameSettings) => void
  onBack: () => void
}

export function InGameSettings({ settings, onSettingsChange, onBack }: InGameSettingsProps) {
  const backBtnRef = useRef<HTMLButtonElement>(null)
  const tooltipsBtnRef = useRef<HTMLButtonElement>(null)
  const fpsBtnRef = useRef<HTMLButtonElement>(null)
  const coordinatesBtnRef = useRef<HTMLButtonElement>(null)

  const {
    registerMenuItem,
    gamepadConnected,
    focusedKey
  } = useGamepadNavigation({
    onSelect: () => {
      // Handle selection based on the focused element
      switch(focusedKey) {
        case 'back':
          onBack();
          break;
        case 'tooltips':
          onSettingsChange({ ...settings, showTooltips: !settings.showTooltips });
          break;
        case 'fps':
          onSettingsChange({ ...settings, showFPSCounter: !settings.showFPSCounter });
          break;
        case 'coordinates':
          onSettingsChange({ ...settings, showMapCoordinates: !settings.showMapCoordinates });
          break;
        default:
          break;
      }
    },
    onBack: onBack  // Map the B button to back
  })

  // Helper function to get focused className
  const getFocusedClass = (key: string) =>
    focusedKey === key ? 'ring-4 ring-primary/50' : '';

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
              ref={tooltipsBtnRef}
              onClick={() => onSettingsChange({ ...settings, showTooltips: !settings.showTooltips })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${getFocusedClass('tooltips')} ${
                settings.showTooltips
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              } focus:outline-none`}
              onFocus={() => registerMenuItem(tooltipsBtnRef.current!, 'tooltips')}
            >
              {settings.showTooltips ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Show perk descriptions near vending machines</p>
          </div>

          {/* Show FPS Counter */}
          <div>
            <label className="block text-foreground font-bold mb-2">Show FPS Counter</label>
            <button
              ref={fpsBtnRef}
              onClick={() => onSettingsChange({ ...settings, showFPSCounter: !settings.showFPSCounter })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${getFocusedClass('fps')} ${
                settings.showFPSCounter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              } focus:outline-none`}
              onFocus={() => registerMenuItem(fpsBtnRef.current!, 'fps')}
            >
              {settings.showFPSCounter ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Display frames per second counter on screen</p>
          </div>

          {/* Show Map Coordinates */}
          <div>
            <label className="block text-foreground font-bold mb-2">Show Map Coordinates</label>
            <button
              ref={coordinatesBtnRef}
              onClick={() => onSettingsChange({ ...settings, showMapCoordinates: !settings.showMapCoordinates })}
              className={`w-full py-2 px-4 rounded font-bold transition-all ${getFocusedClass('coordinates')} ${
                settings.showMapCoordinates
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              } focus:outline-none`}
              onFocus={() => registerMenuItem(coordinatesBtnRef.current!, 'coordinates')}
            >
              {settings.showMapCoordinates ? "ON" : "OFF"}
            </button>
            <p className="text-muted-foreground text-sm mt-1">Display player position coordinates</p>
          </div>
        </div>

        <button
          ref={backBtnRef}
          onClick={onBack}
          className={`w-full mt-8 bg-secondary ${getFocusedClass('back')} text-secondary-foreground py-3 rounded font-bold transition-all focus:outline-none`}
          onFocus={() => registerMenuItem(backBtnRef.current!, 'back')}
        >
          BACK
        </button>

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