import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import RestaurantSection from "@/components/restaurant-section"
import Footer from "@/components/footer"
import ShishaCard from "@/components/shisha-card"
import Testimonials from "@/components/testimonials"
import LargeTestimonial from "@/components/large-testimonial"
import Gallery from "@/components/gallery"
import Menu from "@/components/menu"
import { SidebarProvider } from "@/components/ui/sidebar"
import Image from "next/image"
        
export default function Home() {
    const shishaFlavors = [
    {
      id: 1,
      name: "Apple Mint",
      description: "Crisp green apple with refreshing mint leaves",
      image: "/green-apple-cut-in-half-on-black-shisha-bowl-with-.jpg",
    },
    {
      id: 2,
      name: "Orange Zest",
      description: "Bright citrus burst with aromatic orange",
      image: "/fresh-orange-slice-on-black-shisha-bowl-with-mint-.jpg",
    },
    {
      id: 3,
      name: "Kiwi Chill",
      description: "Tropical kiwi with cooling menthol effect",
      image: "/kiwi-fruit-slice-on-black-shisha-bowl-with-mint-le.jpg",
    },
    {
      id: 4,
      name: "Citrus Mix",
      description: "Blend of orange and various citrus fruits",
      image: "/mixed-citrus-fruits-oranges-and-other-citrus-on-bl.jpg",
    },
  ]
  return (
    <main  className="min-h-screen bg-black ">
      <HeroSection />
          <LargeTestimonial />
   <div className="flex justify-between">
      <Image src="/coal1.png" width={400} height={400} alt="Testimonial Background"  className="w-60  hidden md:block h-auto object-cover" />

         <AboutSection />
<div></div>
   </div>

      <div className="flex  justify-between">
<div></div>
        <RestaurantSection />
        <Image src="/coal.png" width={400} height={400}  alt="Testimonial Background"  className="w-60  hidden md:block h-auto object-cover" />
   </div>



        <Gallery />


        <Image src="/leaf.png" width={400} height={400}  alt="Testimonial Background"  className="w-60  right-0 absolute  hidden md:block h-auto object-cover" />
  <section className="py-16">
        <div className="text-center mb-16">
          <h3 className="text-lime-500 font-script text-xl mb-4">Our Flavors</h3>
          <h2 className="text-white text-4xl font-bold">Premium Shisha Blends</h2>

        </div>
        <div className="px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {shishaFlavors.map((flavor) => (
              <ShishaCard key={flavor.id} flavor={flavor} />
            ))}
          </div>
        </div>
      </section>
<SidebarProvider>
        <Menu />

</SidebarProvider>
    
          <div className="flex py-10 gap-7  justify-between">
        <Image src="/leaf.png" width={400} height={400}  alt="Testimonial Background"  className="w-30  hidden md:block h-auto object-cover" />
             <Testimonials />

        <Image src="/leaf.png" width={400} height={400}  alt="Testimonial Background"  className="w-30 rotate-180  hidden md:block h-auto object-cover" />
   </div>
       
      <Footer />
  
                                         
    </main>
   
  )
}
