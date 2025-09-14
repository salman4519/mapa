"use client"

import { useEffect, useState } from "react"

interface CocoonAnimationProps {
  state: "safe" | "alert"
  className?: string
}

export function CocoonAnimation({ state, className = "" }: CocoonAnimationProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; delay: number; x: number; y: number }>>([])

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (state === "safe") {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        delay: i * 0.3,
        x: Math.random() * 300 - 150,
        y: Math.random() * 100 - 50,
      }))
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [state])

  const safeColor = "rgb(34 197 94)" // green-500
  const alertColor = "rgb(239 68 68)" // red-500

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className={`
          transition-all duration-700 ease-out relative
          ${isLoaded ? "unfold" : "opacity-0 scale-50"}
          ${state === "safe" ? "heartbeat-gentle float text-green-500" : "heartbeat-emergency shake text-red-500"}
        `}
        style={{
          color: state === "safe" ? safeColor : alertColor,
        }}
      >
        {state === "safe" &&
          particles.map((particle) => (
            <div
              key={particle.id}
              className={`absolute rounded-full particle-float opacity-70 ${
                particle.id % 3 === 0
                  ? "w-3 h-3 bg-green-300"
                  : particle.id % 3 === 1
                    ? "w-2 h-2 bg-green-400"
                    : "w-1 h-1 bg-green-500"
              }`}
              style={{
                left: `${100 + particle.x}px`,
                top: `${140 + particle.y}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}

        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main heart shape with enhanced design */}
          <path
            d="M120 200 C95 175, 30 140, 30 90 C30 55, 60 30, 90 30 C105 30, 115 40, 120 55 C125 40, 135 30, 150 30 C180 30, 210 55, 210 90 C210 140, 145 175, 120 200 Z"
            fill="url(#heartGradient)"
            stroke="currentColor"
            strokeWidth="4"
            filter="url(#glow)"
            className="transition-all duration-500"
          />

          <ellipse
            cx="90"
            cy="80"
            rx="25"
            ry="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.7"
            strokeDasharray="6,3"
            className={`transition-all duration-300 ${state === "safe" ? "chamber-breathe" : "chamber-alert"}`}
          />

          <ellipse
            cx="150"
            cy="80"
            rx="25"
            ry="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.7"
            strokeDasharray="6,3"
            className={`transition-all duration-300 ${state === "safe" ? "chamber-breathe" : "chamber-alert"}`}
            style={{ animationDelay: "0.2s" }}
          />

          <ellipse
            cx="95"
            cy="130"
            rx="30"
            ry="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.6"
            strokeDasharray="8,4"
            className={`transition-all duration-300 ${state === "safe" ? "chamber-breathe" : "chamber-alert"}`}
            style={{ animationDelay: "0.1s" }}
          />

          <ellipse
            cx="145"
            cy="130"
            rx="30"
            ry="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.6"
            strokeDasharray="8,4"
            className={`transition-all duration-300 ${state === "safe" ? "chamber-breathe" : "chamber-alert"}`}
            style={{ animationDelay: "0.3s" }}
          />

          <circle
            cx="120"
            cy="120"
            r="20"
            fill="currentColor"
            fillOpacity="0.5"
            className={`transition-all duration-300 ${state === "safe" ? "core-pulse" : "core-emergency"}`}
          />

          {/* Heartbeat pulse center with enhanced animation */}
          <circle
            cx="120"
            cy="120"
            r="8"
            fill="currentColor"
            fillOpacity="0.9"
            className={state === "safe" ? "heartbeat-gentle" : "heartbeat-emergency"}
          />

          <path
            d="M 80 60 Q 120 50, 160 60"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeOpacity="0.8"
            strokeDasharray="5,3"
            className="blood-flow"
          />
          <path
            d="M 70 110 Q 120 100, 170 110"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeOpacity="0.8"
            strokeDasharray="5,3"
            className="blood-flow"
            style={{ animationDelay: "0.5s" }}
          />
          <path
            d="M 80 160 Q 120 150, 160 160"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeOpacity="0.8"
            strokeDasharray="5,3"
            className="blood-flow"
            style={{ animationDelay: "1s" }}
          />

          <circle cx="105" cy="95" r="3" fill="currentColor" fillOpacity="0.6" className="valve-pulse" />
          <circle
            cx="135"
            cy="95"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            className="valve-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <circle
            cx="105"
            cy="145"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            className="valve-pulse"
            style={{ animationDelay: "0.6s" }}
          />
          <circle
            cx="135"
            cy="145"
            r="3"
            fill="currentColor"
            fillOpacity="0.6"
            className="valve-pulse"
            style={{ animationDelay: "0.9s" }}
          />
        </svg>

        {state === "alert" && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 emergency-ripple opacity-80" />
            <div
              className="absolute inset-0 rounded-full border-3 border-red-400 emergency-ripple opacity-60"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-red-300 emergency-ripple opacity-40"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
      </div>

      <div
        className={`
          absolute inset-0 rounded-full blur-2xl transition-all duration-700
          ${state === "safe" ? "bg-green-500 opacity-40 glow-breathe" : "bg-red-500 opacity-60 glow-emergency"}
        `}
        style={{
          background: `radial-gradient(circle, ${state === "safe" ? safeColor : alertColor} 0%, transparent 60%)`,
        }}
      />

      {state === "safe" && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-3xl bg-green-400 opacity-20 glow-float"
            style={{
              background: `radial-gradient(circle, ${safeColor} 0%, transparent 80%)`,
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute inset-0 rounded-full blur-xl bg-green-300 opacity-10 glow-float"
            style={{
              background: `radial-gradient(circle, ${safeColor} 0%, transparent 90%)`,
              animationDelay: "2s",
            }}
          />
        </>
      )}
    </div>
  )
}
