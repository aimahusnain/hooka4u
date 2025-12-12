"use client";

import Menu from "@/components/menu";

export default function HeroSection() {
  return (
    <>
      <section className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Sophisticated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

        {/* Subtle accent lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Main Heading */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-20 tracking-tight">
            <span
              className="block text-white mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Welcome To
            </span>
            <span
              className="block bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 text-transparent bg-clip-text"
              style={{
                fontFamily: "Georgia, serif",
                textShadow: "0 0 80px rgba(251, 191, 36, 0.3)",
              }}
            >
              VIP SERVICE 4U
            </span>
          </h1>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                // Add your order logic here
                window.location.href = "#order";
              }}
              className="group relative px-20 py-6 text-xl md:text-2xl font-semibold text-black bg-gradient-to-r from-lime-400 to-lime-500 overflow-hidden transition-all duration-500 hover:scale-105"
              style={{
                fontFamily: "Georgia, serif",
                letterSpacing: "0.05em",
                boxShadow: "0 10px 40px rgba(251, 191, 36, 0.4)",
              }}
            >
              <span className="relative z-10 uppercase">Start Your Order</span>
              <div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-lime-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>

          {/* Elegant divider */}
          <div className="mt-24 flex justify-center items-center gap-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-lime-500"></div>
            <div className="w-2 h-2 bg-lime-500 rotate-45"></div>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-lime-500"></div>
          </div>
        </div>
      </section>
      <Menu />
    </>
  );
}
