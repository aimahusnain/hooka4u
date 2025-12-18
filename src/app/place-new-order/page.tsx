"use client";

import { useState } from "react";
import { ShoppingCart } from 'lucide-react';
import NewOrder from "@/components/new-order";

export default function Home() {
  const [showHero, setShowHero] = useState(true);

  if (!showHero) {
    return <NewOrder />;
  }

  return (
  <main className="min-h-screen bg-gray-950">
      {/* Hero Section - Dark Theme */}
      <section className="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center">
        {/* Background Gradient - Dark Theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>
        
        {/* Decorative Lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-12 sm:mb-20 tracking-tight">
            <span className="block text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Welcome To
            </span>
            <span className="block bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 text-transparent bg-clip-text" style={{ fontFamily: "Georgia, serif" }}>
              VIP SERVICE 4U
            </span>
          </h1>
          
          <div className="flex justify-center">
            <button
              onClick={() => setShowHero(false)}
              className="group relative px-12 sm:px-20 py-4 sm:py-6 text-lg sm:text-xl md:text-2xl font-semibold text-black bg-gradient-to-r from-lime-400 to-lime-500 overflow-hidden transition-all duration-500 hover:scale-105"
              style={{ 
                fontFamily: "Georgia, serif", 
                letterSpacing: "0.05em", 
                boxShadow: "0 10px 40px rgba(132, 204, 22, 0.5)" 
              }}
            >
              <span className="relative z-10 uppercase">View Items</span>
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-lime-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
