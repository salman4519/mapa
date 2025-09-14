"use client"

import { useEffect, useState, useCallback } from "react"
import mqtt from 'mqtt';

interface MqttManagerProps {
  onStateChange: (state: "safe" | "alert") => void;
}

const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt'; // Reverted to wss
const ALERT_TOPIC = 'cucoon/alert';
// CONTROL_TOPIC is not needed in MqttManager as it no longer publishes

export function MqttManager({ onStateChange }: MqttManagerProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  useEffect(() => {
    setConnectionStatus("connecting");
    console.log("[MQTT Manager] Initializing new MQTT client...");
    const newClient = mqtt.connect(MQTT_BROKER_URL);

    newClient.on('connect', () => {
      console.log('[MQTT Manager] MQTT Client: Connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      newClient.subscribe(ALERT_TOPIC, (err) => {
        if (!err) {
          console.log('[MQTT Manager] Subscribed to topic:', ALERT_TOPIC);
        } else {
          console.error('[MQTT Manager] MQTT subscription error:', err);
        }
      });
    });

    newClient.on('message', (receivedTopic: string, message: Buffer) => {
      if (!message) {
        console.warn('[MQTT Manager] Received an empty or invalid MQTT message.');
        return;
      }
      const messageStr = message.toString();
      console.log('[MQTT Manager] Message received on topic '+ receivedTopic + ':', messageStr);
      if (receivedTopic === ALERT_TOPIC) {
        if (messageStr === 'ALERT') {
          onStateChange('alert');
        } else if (messageStr === 'STOP') {
          onStateChange('safe');
        }
      }
    });

    newClient.on('error', (err) => {
      console.error('[MQTT Manager] MQTT Error:', err);
      setConnectionStatus('disconnected');
      setIsConnected(false);
    });

    newClient.on('close', () => {
      console.log('[MQTT Manager] MQTT Client: Connection closed');
      setConnectionStatus('disconnected');
      setIsConnected(false);
    });

    return () => {
      console.log('[MQTT Manager] Cleaning up MQTT client...');
      if (newClient.connected) {
        newClient.end();
      } else {
        // If not connected, but still has pending connections, ensure it's closed
        newClient.end(true); // Force close pending connections
      }
    };
  }, [onStateChange]); // onPublish and publish removed from dependencies

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
  );
}