"use client"

import { motion } from "framer-motion"

export default function AboutSection() {
  return (
    <section className="py-20 px-8 bg-black">
      <div className="max-w-4xl mx-auto  grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="border-4 border-[#7CCF00] flex items-center justify-center rounded md:py-7 w-[340px] relative"
            whileHover={{ borderColor: "#00ff41" }}
          >
            <motion.img
              src="/1.png"
              alt="People enjoying shisha"
              className="  md:max-w-md rounded"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#7CCF00]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#7CCF00]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          viewport={{ once: true }}
        >
          <div className="space-y-2">
            <motion.p
              className="text-[#7CCF00] font-italic text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              About Us
            </motion.p>
            <h2 className="text-5xl font-bold text-white leading-tight">Truly Relaxing and Authentic Environment</h2>
          </div>

          <p className="text-gray-400 leading-relaxed">
            Don`t miss out on this exotic fusion of cultures! We serve dishes from all over the Mediterranean, including
            Turkey, Greece, Spain, and Italy. The chefs who created these wonders have decades of experience working in
            these lands. The kitchen is gorgeous in every way.
          </p>

          <motion.button
            className="border-2 border-[#7CCF00] text-[#7CCF00] px-8 py-3 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#7CCF00] -z-10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.3 }}
            />
                 <span className="relative z-10  transition">Book now</span>

          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
