"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CocoonAnimation } from "@/components/cocoon-animation"
import { StatusDisplay } from "@/components/status-display"
import { MqttManager } from "@/components/mqtt-manager"
import { Button } from "@/components/ui/button"
import mqtt, { MqttClient } from "mqtt"

interface SirenAudio {
  oscillator: OscillatorNode
  lfo: OscillatorNode
  gainNode: GainNode
  audioContext: AudioContext
}

export default function CuCoonDashboard() {
  const [systemState, setSystemState] = useState<"safe" | "alert">("safe")
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null)
  
  const sirenAudioRef = useRef<SirenAudio | null>(null)
  const isOscillatorStartedRef = useRef(false)
  
  // Create siren audio components
  const createSiren = (): SirenAudio | null => {
    try {
      console.log("[Dashboard] Creating new siren audio components")
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const lfo = audioContext.createOscillator()
      const lfoGain = audioContext.createGain()

      // Connect audio nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      lfo.connect(lfoGain)
      lfoGain.connect(oscillator.frequency)

      // Configure oscillator
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)

      // Configure LFO for siren effect
      lfo.frequency.setValueAtTime(2, audioContext.currentTime)
      lfoGain.gain.setValueAtTime(200, audioContext.currentTime)

      // Set volume
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

      return { oscillator, lfo, gainNode, audioContext }
    } catch (error) {
      console.error("[Dashboard] Failed to create siren audio:", error)
      return null
    }
  }

  // Initialize MQTT client
  useEffect(() => {
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt")
    
    client.on("connect", () => {
      console.log("[Dashboard] MQTT Connected")
    })
    
    client.on("error", (err) => {
      console.error("[Dashboard] MQTT Error:", err)
    })
    
    client.on("close", () => {
      console.log("[Dashboard] MQTT Connection closed")
    })
    
    setMqttClient(client)
    
    return () => {
      client.end()
    }
  }, [])

  // Initialize siren audio components once on mount
  useEffect(() => {
    if (!sirenAudioRef.current) {
      sirenAudioRef.current = createSiren();
    }
  }, []);

  // Handle siren audio based on system state
  useEffect(() => {
    const siren = sirenAudioRef.current
    if (!siren) return;

    if (systemState === "alert" && !isOscillatorStartedRef.current) {
      try {
        // Always attempt to resume audio context before starting to bypass autoplay policy
        if (siren.audioContext.state === 'suspended') {
          siren.audioContext.resume().then(() => {
            console.log("[Dashboard] Audio context resumed.");
            siren.oscillator.start()
            siren.lfo.start()
            isOscillatorStartedRef.current = true
            console.log("[Dashboard] Siren started")
          }).catch(e => console.error("[Dashboard] Error resuming audio context:", e));
        } else { // If already running or not suspended, just start
          siren.oscillator.start()
          siren.lfo.start()
          isOscillatorStartedRef.current = true
          console.log("[Dashboard] Siren started")
        }
      } catch (error) {
        console.error("[Dashboard] Failed to start siren:", error)
      }
    } else if (systemState === "safe" && isOscillatorStartedRef.current) {
      try {
        siren.oscillator.stop()
        siren.lfo.stop()
        isOscillatorStartedRef.current = false
        
        // Clean up and recreate for next alert
        setTimeout(() => {
          siren.audioContext.close()
          sirenAudioRef.current = createSiren(); // Recreate directly
        }, 100)
        
        console.log("[Dashboard] Siren stopped")
      } catch (error) {
        console.error("[Dashboard] Error stopping siren:", error)
      }
    }
  }, [systemState, createSiren]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sirenAudioRef.current?.audioContext) {
        sirenAudioRef.current.audioContext.close();
      }
    }
  }, [])

  const stopSirenAudio = () => {
    const siren = sirenAudioRef.current
    if (!siren) return
 
    try {
      if (isOscillatorStartedRef.current) {
        siren.oscillator.stop()
        siren.lfo.stop()
        isOscillatorStartedRef.current = false // Reset the flag
      }
      siren.audioContext.close(); // Close the current audio context
      sirenAudioRef.current = createSiren(); // Recreate siren audio components
      console.log("[Dashboard] Siren audio reset")
    } catch (error) {
      console.error("[Dashboard] Error stopping siren audio:", error)
    }
  }

  const handleStopSiren = () => {
    console.log("[Dashboard] Stop Siren clicked")
    setSystemState("safe")
 
    if (mqttClient?.connected) {
      mqttClient.publish("cucoon/control", "STOP")
      console.log("[Dashboard] STOP sent via MQTT")
    }
    stopSirenAudio()
  }

  const handleMqttStateChange = (state: "safe" | "alert") => {
    setSystemState(state)
  }

  const handleTestAlert = async () => {
    // No need to call primeAudioContext here, it's handled globally on first click
    setSystemState("alert")
 
    if (mqttClient?.connected) {
      mqttClient.publish("cucoon/control", "TEST_ALERT")
      console.log("[Dashboard] TEST_ALERT sent via MQTT")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-center">
          <span className="text-accent">cu</span>
          <span className="text-foreground">coon</span>
        </h1>
        <div className="text-center text-sm text-muted-foreground font-mono mt-2">
          MAPA v1.0
        </div>
      </div>

      <div className="mb-8">
        <CocoonAnimation state={systemState} />
      </div>

      <div className="mb-12">
        <StatusDisplay state={systemState} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 ">
        
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

      <div className="text-center text-xs text-muted-foreground font-mono space-y-1">
        <div>
          Current State: <span className="text-foreground">{systemState.toUpperCase()}</span>
        </div>
        <div>
          MQTT: <span className="text-foreground">{mqttClient?.connected ? "CONNECTED" : "DISCONNECTED"}</span>
        </div>
        <div>System Ready • Monitoring Active</div>
      </div>

      <div className="mt-8">
        <MqttManager onStateChange={handleMqttStateChange} />
      </div>
    </div>
  )
}