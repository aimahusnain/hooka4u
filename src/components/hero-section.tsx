export default function HeroSection() {

  return (
    <section
      className="min-h-screen bg-black pt-20 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/847wefewtyg4.png")',
        backgroundPosition: "bottom right",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          {/* Left Content */}
          <div className="text-white animate-fade-in">
<p className="text-2xl text-[#7CCF00] italic mb-4 font-serif tracking-wider">
  Shisha Bar
</p>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Welcome to the Home of Shisha
            </h2>
            <p className="text-[#C6C6C6] mb-8 leading-relaxed text-lg font-work-sans">
              We are a Shisha Lounge, Bar and Mediterranean Restaurant based in Oxford. Don't miss out on this exotic
              fusion of cultures!
            </p>
            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
              <button className="border-2 border-[#7CCF00] text-[#7CCF00] px-12 py-3 rounded hover:bg-[#7CCF00] hover:text-black transition font-semibold font-work-sans">
                Explore now
              </button>
            </div>
            <div className="flex gap-16 pt-8">
              <div>
                <p className="text-4xl font-bold text-white">$10</p>
                <p className="text-gray-500 text-sm font-semibold">SHISHA IN AUGUST</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white">10+</p>
                <p className="text-gray-500 text-sm font-semibold">YEARS OF EXPERIENCE</p>
              </div>
            </div>
          </div>

          {/* Right Image - Placeholder */}
          <div className="hidden md:block relative h-full"></div>
        </div>
      </div>
    </section>
  )
}
