"use client"

interface StatusDisplayProps {
  state: "safe" | "alert"
  className?: string
}

export function StatusDisplay({ state, className = "" }: StatusDisplayProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div
        className={`
          text-2xl font-bold transition-all duration-300
          ${state === "safe" ? "text-green-500 breathe" : "text-red-500 flash emergency-pulse"}
        `}
      >
        {state === "safe" ? "Life Systems Thriving" : "LIFE SUPPORT CRITICAL!"}
      </div>

      <div
        className={`
          text-lg font-medium transition-all duration-300
          ${state === "safe" ? "text-green-700" : "text-red-400 flash"}
        `}
        style={{ animationDelay: "0.2s" }}
      >
        {state === "safe" ? "All biological functions optimal" : "Immediate intervention required"}
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <div
            className={`
              w-4 h-4 rounded-full transition-all duration-300
              ${state === "safe" ? "bg-green-500 heartbeat" : "bg-red-500 emergency-pulse"}
            `}
          />
          {state === "alert" && <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full ripple opacity-60" />}
        </div>

        <span
          className={`text-sm font-mono font-bold tracking-wider
          ${state === "safe" ? "text-green-600" : "text-red-600"}
        `}
        >
          {state === "safe" ? "LIFE SUSTAINED" : "LIFE THREATENED"}
        </span>

        <div className="flex gap-1 ml-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`w-1 h-4 rounded-full transition-all duration-300
                ${state === "safe" ? "bg-green-500 opacity-80" : i < 2 ? "bg-red-500 flash" : "bg-gray-300 opacity-30"}
              `}
              style={{
                animationDelay: `${i * 0.1}s`,
                height: state === "safe" ? `${12 + i * 2}px` : i < 2 ? "16px" : "8px",
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-mono space-y-1">
        <div className="flex justify-center gap-4">
          <span className={state === "safe" ? "text-green-700" : "text-red-600"}>
            ♥ {state === "safe" ? "72 BPM" : "145 BPM"}
          </span>
          <span className={state === "safe" ? "text-green-700" : "text-red-600"}>
            🫁 {state === "safe" ? "16 RPM" : "28 RPM"}
          </span>
          <span className={state === "safe" ? "text-green-700" : "text-red-600"}>
            🌡 {state === "safe" ? "98.6°F" : "103.2°F"}
          </span>
        </div>
      </div>
    </div>
  )
}
