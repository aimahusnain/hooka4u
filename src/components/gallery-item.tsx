"use client"

import { useState } from "react"
import Image from "next/image"

interface GalleryItemProps {
  id: number
  title: string
  image: string
}

export default function GalleryItem({ item }: { item: GalleryItemProps }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={item.image || "/placeholder.svg"}
        alt={item.title}
        fill
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
      />

      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex items-center justify-center ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        <h3 className="text-white text-2xl font-bold text-center px-4">{item.title}</h3>
      </div>
    </div>
  )
}
