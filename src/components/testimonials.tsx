import TestimonialCard from "./testimonial-card"

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote:
        "Great service and tasty shisha! Mauris venenatis est ut ante egestas, at maximus dolor dictum. Donec auctor mauris sit amet euismod tristique.",
      author: "Zoe Jim",
      image: "/12.jpg",
    },
    {
      id: 2,
      quote:
        "Great service and tasty shisha! Mauris venenatis est ut ante egestas, at maximus dolor dictum. Donec auctor mauris sit amet euismod tristique.",
      author: "Mark Rogers",
      image: "/22.jpg",
    },
    {
      id: 3,
      quote:
        "Great service and tasty shisha! Mauris venenatis est ut ante egestas, at maximus dolor dictum. Donec auctor mauris sit amet euismod tristique.",
      author: "James Swan",
      image: "/32.jpg",
    },
  ]

  return (
    <section className="px-4 py-4">
      <div className="text-center mb-16">
        <h3 className="text-lime-500 font-script text-xl mb-4">Testimonials</h3>
        <h2 className="text-white text-4xl font-bold">What People Think About Us</h2>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </section>
  )
}
