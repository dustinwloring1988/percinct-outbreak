"use client"

import { useState } from "react"
import { MainMenu } from "@/components/game/main-menu"
import { GameCanvas } from "@/components/game/game-canvas"
import { HelpScreen } from "@/components/game/help-screen"
import { SettingsScreen } from "@/components/game/settings-screen"
import type { GameSettings } from "@/lib/game/types"

export type GameScreen = "menu" | "game" | "help" | "settings"

export default function Home() {
  const [screen, setScreen] = useState<GameScreen>("menu")
  const [settings, setSettings] = useState<GameSettings>({
    musicVolume: 0.5,
    sfxVolume: 0.7,
    difficulty: "normal",
    showTooltips: true,
    showFPSCounter: false,
    showMapCoordinates: false,
  })

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {screen === "menu" && <MainMenu onNavigate={setScreen} />}
      {screen === "game" && <GameCanvas settings={settings} onExit={() => setScreen("menu")} onSettings={() => setScreen("settings")} />}
      {screen === "help" && <HelpScreen onBack={() => setScreen("menu")} />}
      {screen === "settings" && (
        <SettingsScreen settings={settings} onSettingsChange={setSettings} onBack={() => setScreen("menu")} />
      )}
    </main>
  )
}
