import GalleryItem from "./gallery-item"

export default function Gallery() {
  const galleryItems = [
    {
      id: 1,
      title: "Entertainment",
      image: "/gallery1.png",
    },
    {
      id: 2,
      title: "Gourmet Food",
      image: "/gallery2.png",
    },
    {
      id: 3,
      title: "Hooka",
      image: "/gallery6.avif",
    },
    {
      id: 4,
      title: "Fresh Drinks",
      image: "/gallery3.png",
    },
    {
      id: 5,
      title: "Asian Cuisine",
      image: "/gallery4.png",
    },
    {
      id: 6,
      title: "Party Vibes",
      image: "/gallery5.png",
    },
  ]

  return (
    <section className="px-4 pb-10">
      <div className="text-center mb-16">
        <h3 className="text-lime-500 font-script text-xl mb-4">Gallery</h3>
        <h2 className="text-white text-4xl font-bold">Our Moments</h2>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <GalleryItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
