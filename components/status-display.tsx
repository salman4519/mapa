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
    </div>
  )
}
