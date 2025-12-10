import Image from "next/image"

interface Testimonial {
  id: number
  quote: string
  author: string
  image: string
}

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className=" rounded-lg p-8 border border-gray-800 hover:border-lime-500/50 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-7 h-7 rounded-full overflow-hidden">
          <Image src={testimonial.image || "/placeholder.svg"} alt={testimonial.author} fill className="object-cover" />
        </div>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-6">{testimonial.quote}</p>

      <div className="flex items-center justify-between">
        <p className="text-lime-500 font-semibold">{testimonial.author}</p>
        <span className="text-lime-500 text-2xl">'</span>
      </div>
    </div>
  )
}
