"use client"

import { useState, useEffect, useRef } from "react"
import { CocoonAnimation } from "@/components/cocoon-animation"
import { StatusDisplay } from "@/components/status-display"
import { MqttManager } from "@/components/mqtt-manager"
import { Button } from "@/components/ui/button"
import mqtt, { MqttClient } from "mqtt"

export default function CuCoonDashboard() {
  const [systemState, setSystemState] = useState<"safe" | "alert">("safe")
  const [sirenAudio, setSirenAudio] = useState<any>(null)
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null)

  // Initialize MQTT client for publishing
  useEffect(() => {
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt")
    client.on("connect", () => {
      console.log("[Dashboard] MQTT Client Connected")
    })
    client.on("error", (err) => {
      console.error("[Dashboard] MQTT Error:", err)
    })
    setMqttClient(client)

    return () => {
      if (client.connected) client.end()
    }
  }, [])

  // Initialize siren audio
  useEffect(() => {
    const createSirenSound = () => {
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
    }

    if (typeof window !== "undefined") {
      const sirenData = createSirenSound()
      setSirenAudio(sirenData)
    }
  }, [])

  // Handle siren start/stop based on system state
  useEffect(() => {
    if (systemState === "alert" && sirenAudio) {
      try {
        const { oscillator, lfo } = sirenAudio
        oscillator.start()
        lfo.start()
      } catch {
        console.log("[Dashboard] Audio context may need user interaction to start")
      }
    } else if (systemState === "safe" && sirenAudio) {
      stopSirenAudio()
    }
  }, [systemState, sirenAudio])

  const stopSirenAudio = () => {
    if (!sirenAudio) return
    try {
      const { oscillator, lfo, audioContext } = sirenAudio
      oscillator.stop()
      lfo.stop()
      audioContext.close()

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

      setSirenAudio(newSirenData)
      console.log("[Dashboard] Siren audio reset")
    } catch (error) {
      console.error("[Dashboard] Error stopping siren audio:", error)
    }
  }

  const handleStopSiren = () => {
    console.log("[Dashboard] Stop Siren clicked")
    setSystemState("safe")

    // Publish STOP via MQTT
    if (mqttClient && mqttClient.connected) {
      mqttClient.publish("cucoon/control", "STOP")
      console.log("[Dashboard] STOP sent via MQTT")
    }

    stopSirenAudio()
  }

  const handleMqttStateChange = (state: "safe" | "alert") => {
    setSystemState(state)
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

      {/* Stop Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {systemState === "alert" && (
          <Button
            onClick={handleStopSiren}
            variant="outline"
            className="bg-yellow-500/10 border-yellow-500 text-yellow-700 hover:bg-yellow-500/20 hover:text-yellow-800"
          >
            Stop Siren
          </Button>
        )}
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
