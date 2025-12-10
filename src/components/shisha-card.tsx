"use client"

import { useState } from "react"
import Image from "next/image"

interface ShishaFlavor {
  id: number
  name: string
  description: string
  image: string
}

export default function ShishaCard({ flavor }: { flavor: ShishaFlavor }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group cursor-pointer h-96 overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full border-2 border-lime-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(50,255,0,0.3)]">
        <Image
          src={flavor.image || "/placeholder.svg"}
          alt={flavor.name}
          fill
          className="object-cover w-full h-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div
          className={`absolute inset-0 bg-lime-500/90 backdrop-blur-sm transition-opacity duration-300 flex flex-col items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Overlay Content */}
          <div className="text-center px-6 text-black">
            <h3 className="text-2xl font-bold mb-3">{flavor.name}</h3>
            <p className="text-sm leading-relaxed font-medium">{flavor.description}</p>
          </div>
        </div>

        {/* Neon glow effect */}
        <div className="absolute inset-0 border-2 border-lime-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_20px_rgba(50,255,0,0.2)]" />
      </div>
    </div>
  )
}
