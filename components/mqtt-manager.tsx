"use client"

import { useEffect, useState, useCallback } from "react"

interface MqttManagerProps {
  onStateChange: (state: "safe" | "alert") => void
}

export function MqttManager({ onStateChange }: MqttManagerProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  // MQTT connection setup (placeholder for now)
  useEffect(() => {
    // TODO: Implement actual MQTT connection when broker details are provided
    // const mqtt = require('mqtt')
    // const client = mqtt.connect('mqtt://broker-url:port')

    console.log("[v0] MQTT Manager initialized - ready for broker configuration")

    // Simulate connection for now
    setIsConnected(false) // Will be true when actual MQTT is configured
    setConnectionStatus("disconnected")

    return () => {
      if (client) {
        client.end()
      }
    }
  }, [])

  const connectMqtt = useCallback(
    (brokerUrl: string, port: number, topic: string) => {
      // This function will be called when broker details are provided
      console.log("[v0] Connecting to MQTT broker:", { brokerUrl, port, topic })

      setConnectionStatus("connecting")

      // TODO: Implement actual MQTT connection
      // const mqtt = require('mqtt')
      // const newClient = mqtt.connect(`mqtt://${brokerUrl}:${port}`)

      // newClient.on('connect', () => {
      //   console.log('[v0] MQTT Connected')
      //   setIsConnected(true)
      //   setConnectionStatus('connected')
      //   newClient.subscribe(topic)
      // })

      // newClient.on('message', (receivedTopic: string, message: Buffer) => {
      //   if (receivedTopic === topic) {
      //     const messageStr = message.toString()
      //     const state = messageStr.toLowerCase().includes('alert') ? 'alert' : 'safe'
      //     onStateChange(state)
      //   }
      // })

      // newClient.on('error', () => {
      //   setConnectionStatus('disconnected')
      //   setIsConnected(false)
      // })

      // setClient(newClient)
    },
    [onStateChange],
  )

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "connecting":
        return "text-yellow-600"
      case "disconnected":
      default:
        return "text-red-600"
    }
  }

  const getStatusIndicator = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500 shadow-green-500/50"
      case "connecting":
        return "bg-yellow-500 shadow-yellow-500/50 animate-pulse"
      case "disconnected":
      default:
        return "bg-red-500 shadow-red-500/50"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "CONNECTED"
      case "connecting":
        return "CONNECTING..."
      case "disconnected":
      default:
        return "DISCONNECTED"
    }
  }

  return (
    <div className="fixed bottom-6 left-6 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${getStatusIndicator()}`} />
          {connectionStatus === "connected" && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-300 text-xs uppercase tracking-wider">MQTT STATUS</span>
          <span className={`font-semibold transition-colors duration-300 ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
      </div>

      {connectionStatus === "disconnected" && (
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-gray-500 rounded-full" />
            <span>Awaiting broker configuration</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1 h-1 bg-gray-500 rounded-full" />
            <span>Ready for URL, port & topic setup</span>
          </div>
        </div>
      )}

      {connectionStatus === "connected" && (
        <div className="text-xs text-green-400 border-t border-gray-700 pt-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <span>Monitoring active</span>
          </div>
        </div>
      )}
    </div>
  )
}
