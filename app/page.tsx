"use client"

import { useState, useEffect, useRef } from "react"
import { CocoonAnimation } from "@/components/cocoon-animation"
import { StatusDisplay } from "@/components/status-display"
import { MqttManager } from "@/components/mqtt-manager"
import { Button } from "@/components/ui/button"

export default function CuCoonDashboard() {
  const [systemState, setSystemState] = useState<"safe" | "alert">("safe")
  const [sirenAudio, setSirenAudio] = useState<HTMLAudioElement | null>(null)
  const sirenRef = useRef<HTMLAudioElement | null>(null)

  // Initialize siren audio
  useEffect(() => {
    // Create a simple siren sound using Web Audio API
    const createSirenSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)

      // Create siren effect by modulating frequency
      const lfo = audioContext.createOscillator()
      const lfoGain = audioContext.createGain()
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)

      lfo.frequency.setValueAtTime(2, audioContext.currentTime) // 2Hz modulation
      lfoGain.gain.setValueAtTime(200, audioContext.currentTime) // Modulation depth

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

      return { oscillator, lfo, gainNode, audioContext }
    }

    if (typeof window !== "undefined") {
      const sirenData = createSirenSound()
      setSirenAudio(sirenData as any)
    }
  }, [])

  // Handle state changes and siren audio
  useEffect(() => {
    if (systemState === "alert" && sirenAudio) {
      // Start siren sound
      try {
        const { oscillator, lfo } = sirenAudio as any
        oscillator.start()
        lfo.start()
      } catch (error) {
        console.log("[v0] Audio context may need user interaction to start")
      }
    } else if (systemState === "safe" && sirenAudio) {
      // Stop siren sound
      try {
        const { oscillator, lfo, audioContext } = sirenAudio as any
        oscillator.stop()
        lfo.stop()
        audioContext.close()

        // Recreate for next alert
        const newSirenData = (() => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)

          const lfo = audioContext.createOscillator()
          const lfoGain = audioContext.createGain()
          lfo.connect(lfoGain)
          lfoGain.connect(oscillator.frequency)

          lfo.frequency.setValueAtTime(2, audioContext.currentTime)
          lfoGain.gain.setValueAtTime(200, audioContext.currentTime)

          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

          return { oscillator, lfo, gainNode, audioContext }
        })()

        setSirenAudio(newSirenData as any)
      } catch (error) {
        console.log("[v0] Error stopping audio:", error)
      }
    }
  }, [systemState, sirenAudio])

  const handleMqttStateChange = (state: "safe" | "alert") => {
    setSystemState(state)
  }

  const handleTestSafe = () => {
    setSystemState("safe")
  }

  const handleTestAlert = () => {
    setSystemState("alert")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-center">
          <span className="text-accent">Cu</span>
          <span className="text-foreground">Coon</span>
        </h1>
        <div className="text-center text-sm text-muted-foreground font-mono mt-2">MONITORING SYSTEM v1.0</div>
      </div>

      {/* Cocoon Animation */}
      <div className="mb-8">
        <CocoonAnimation state={systemState} />
      </div>

      {/* Status Display */}
      <div className="mb-12">
        <StatusDisplay state={systemState} />
      </div>

      {/* Test Controls */}
      <div className="flex gap-4 mb-8">
        <Button
          onClick={handleTestSafe}
          variant="outline"
          className="bg-green-500/10 border-green-500 text-green-700 hover:bg-green-500/20 hover:text-green-800"
        >
          Test Safe
        </Button>
        <Button
          onClick={handleTestAlert}
          variant="outline"
          className="bg-red-500/10 border-red-500 text-red-900 hover:bg-red-500/20 hover:text-red-950"
        >
          Test Alert
        </Button>
      </div>

      {/* System Info */}
      <div className="text-center text-xs text-muted-foreground font-mono space-y-1">
        <div>
          Current State: <span className="text-foreground">{systemState.toUpperCase()}</span>
        </div>
        <div>System Ready • Awaiting MQTT Configuration</div>
      </div>

      {/* MQTT Manager */}
      <MqttManager onStateChange={handleMqttStateChange} />
    </div>
  )
}
