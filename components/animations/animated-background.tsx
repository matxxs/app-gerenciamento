"use client"

import { useEffect, useState } from "react"

const colors = [
  "from-cyan-400 to-cyan-600", // Electric Cyan Blue
  "from-fuchsia-400 to-fuchsia-600", // Vibrant Magenta
  "from-emerald-400 to-emerald-600", // Digital Emerald Green
  "from-orange-400 to-orange-600", // Intense Amber Orange
  "from-purple-400 to-purple-600", // Ultraviolet Purple
]

export function AnimatedBackground() {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % colors.length)
    }, 12000) // Change color every 12 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="absolute inset-0">
        <div
          className={`absolute w-96 h-[200vh] bg-gradient-to-r ${colors[currentColorIndex]} opacity-30 blur-3xl transform -rotate-45 animate-pulse`}
          style={{
            animation: "lightBeam 12s linear infinite",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Additional ambient glow */}
      <div className="absolute inset-0">
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial ${colors[currentColorIndex]} opacity-10 rounded-full blur-3xl animate-pulse`}
          style={{
            animation: "ambientGlow 8s ease-in-out infinite alternate",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes lightBeam {
          0% {
            transform: translateX(-100vw) translateY(-50vh) rotate(-45deg) scaleY(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(100vw) translateY(50vh) rotate(-45deg) scaleY(1.2);
            opacity: 0;
          }
        }
        
        @keyframes ambientGlow {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.2) translate(20px, -20px);
            opacity: 0.15;
          }
          100% {
            transform: scale(0.8) translate(-20px, 20px);
            opacity: 0.05;
          }
        }
      `}</style>
    </div>
  )
}
