// Audio Manager - Handles all game sounds
type SoundType =
  | "pistol"
  | "shotgun"
  | "rifle"
  | "door"
  | "background"
  | "round-end"
  | "explosion"
  | "zombie-attack"
  | "buy"
  | "explode"
  | "player-hit"
  | "zombie-hit"
  | "reload"
  | "vending"
  | "max-ammo"
  | "double-points"
  | "insta-kill"
  | "nuke"
  | "speed-boost"

interface AudioConfig {
  src: string
  volume: number
  loop?: boolean
}

const AUDIO_CONFIG: Record<SoundType, AudioConfig> = {
  pistol: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/generic-pistol-GdWk5q9zkHR4QqiZrfXxj1lMXFSqUN.mp3", volume: 0.3 },
  shotgun: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/generic-shotgun-Vp4zPe9vxifn26zmj9XMe6fIp98FOi.mp3", volume: 0.3 },
  rifle: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/generic-rifle-Yv5DRxK6Vrg32UxlyZ7DopdlrGCmio.mp3", volume: 0.3 },
  door: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/door-3vrs8lcbVW5ABeNdh3groeZ7kfwhGt.mp3", volume: 0.3 },
  background: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/background-pYPb8GYfUhT0h6RbN2nQMAQL9FDdDU.mp3", volume: 0.2, loop: true },
  "round-end": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/round-end-zUte1RjawtJnutfYwa4HKT9yHQh6VO.mp3", volume: 0.5 },
  explosion: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/generic-stun-explode-jkkGt9I4ZpY3nlYKUYBJnoW3RrsyEM.mp3", volume: 0.4 },
  "zombie-attack": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-zombie-attacking-sBlVLowReyCXhu73uqjuBpPzOhLK6K.mp3", volume: 0.3 },
  buy: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-buy-A4NoHIAWdXXYwpKXNzTP47J9WV4WGI.mp3", volume: 0.4 },
  explode: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-explode-DxCyPtTXJYAIozEo1NjkN3LkSzBqh7.mp3", volume: 0.5 },
  "player-hit": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-player-hit-nUslfujfpNghp3opPuWPmtSsqeLBXD.mp3", volume: 0.4 },
  "zombie-hit": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-zombie-hit-aMHlaAEUujfa0C9dA6ffM6tKTgL9bu.mp3", volume: 0.25 },
  reload: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-reload-yTkqhn2cZff31LjT1VFb18W8FldPml.mp3", volume: 0.35 },
  vending: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genric-vending-hMehgDmb6IVyS3GieJDiSdVSqjkip4.mp3", volume: 0.4 },
  "max-ammo": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/max-ammo-ibSD5cUl0o8G0OPyngAxrXHkf6dJbx.mp3", volume: 0.5 },
  "double-points": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/double-points-UpI7HWzJDT6bpnINn73Jd594WfODMx.mp3", volume: 0.5 },
  "insta-kill": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/insta-kill-dR59OA8DPhf8bM9A7TsziUNjgdUf03.mp3", volume: 0.5 },
  nuke: { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuke-yWzujQDQRmPgXxG75ADvIIXI7sCMlg.mp3", volume: 0.5 },
  "speed-boost": { src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/speed-boost-L9otPRrOelMHIJrqK6gg4qN5EJMcv6.mp3", volume: 0.5 },
}

class AudioManager {
  private sounds: Map<SoundType, HTMLAudioElement[]> = new Map()
  private backgroundMusic: HTMLAudioElement | null = null
  private initialized = false
  private poolSize = 5 // Pool size for concurrent sounds

  init() {
    if (this.initialized || typeof window === "undefined") return

    // Pre-load all sounds with pooling for overlapping sounds
    Object.entries(AUDIO_CONFIG).forEach(([key, config]) => {
      const soundType = key as SoundType

      if (soundType === "background") {
        // Background music is a single instance
        const audio = new Audio(config.src)
        audio.volume = config.volume
        audio.loop = config.loop ?? false
        this.backgroundMusic = audio
      } else {
        // Create a pool of audio elements for sound effects
        const pool: HTMLAudioElement[] = []
        for (let i = 0; i < this.poolSize; i++) {
          const audio = new Audio(config.src)
          audio.volume = config.volume
          pool.push(audio)
        }
        this.sounds.set(soundType, pool)
      }
    })

    this.initialized = true
  }

  play(type: SoundType) {
    if (!this.initialized) this.init()

    if (type === "background") {
      this.playBackground()
      return
    }

    const pool = this.sounds.get(type)
    if (!pool) return

    // Find an audio element that's not currently playing
    const available = pool.find((audio) => audio.paused || audio.ended)
    if (available) {
      available.currentTime = 0
      available.play().catch(() => {})
    } else {
      // If all are playing, restart the first one
      pool[0].currentTime = 0
      pool[0].play().catch(() => {})
    }
  }

  playBackground() {
    if (!this.initialized) this.init()
    if (this.backgroundMusic && this.backgroundMusic.paused) {
      this.backgroundMusic.play().catch(() => {})
    }
  }

  stopBackground() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
    }
  }

  pauseBackground() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
    }
  }

  resumeBackground() {
    if (this.backgroundMusic && this.backgroundMusic.paused) {
      this.backgroundMusic.play().catch(() => {})
    }
  }

  setVolume(type: SoundType, volume: number) {
    if (type === "background" && this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume))
    } else {
      const pool = this.sounds.get(type)
      if (pool) {
        pool.forEach((audio) => {
          audio.volume = Math.max(0, Math.min(1, volume))
        })
      }
    }
  }

  // Map weapon type to sound
  getWeaponSound(weaponType: string): SoundType {
    switch (weaponType) {
      case "pistol":
        return "pistol"
      case "shotgun":
        return "shotgun"
      case "smg":
      case "rifle":
      case "lmg":
        return "rifle"
      default:
        return "pistol"
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager()
