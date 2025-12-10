"use client"

import { motion } from "framer-motion"
import Link from "next/link"
export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <footer className="bg-black border-t border-gray-800 py-16 px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16 py-12 border-b border-gray-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="space-y-2 mb-6">
            <motion.p
              className="text-[#7CCF00] font-italic text-lg"
              animate={{ letterSpacing: ["0px", "2px", "0px"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              Reserve
            </motion.p>
            <h3 className="text-4xl font-bold text-white">Reserve A Table</h3>
          </div>
          <p className="text-gray-400 mb-6">Your exquisite dining experience is just a reservation away.</p>
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
            <span className="relative z-10  transition">            <span className="relative z-10  transition">Book now</span>
</span>
          </motion.button>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-12 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="space-y-3 group" variants={itemVariants}>
            <h4 className="text-xl font-bold text-white group-hover:text-[#7CCF00] transition">VIPService4u</h4>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">
              Get your business to the new heights.
            </p>
          </motion.div>

          <motion.div className="space-y-3 group" variants={itemVariants}>
            <h4 className="text-xl font-bold text-white group-hover:text-[#7CCF00] transition">sales@vipservice4u.com</h4>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">MON-FRI 9AM-6PM</p>
          </motion.div>

          <motion.div className="space-y-3 group" variants={itemVariants}>
            <h4 className="text-xl font-bold text-white group-hover:text-[#7CCF00] transition">(234) 567.890.11</h4>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">WhatsApp or Call</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="border-t border-gray-800 pt-8 flex justify-between items-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.p whileHover={{ color: "#00ff41" }} transition={{ duration: 0.2 }}>
            Copyright © 2025 VipService4u. All rights reserved.
          </motion.p>
          <motion.p whileHover={{ color: "#00ff41" }} transition={{ duration: 0.2 }}>
            Made by <Link href="https://devkins.dev" target="_blank" className="underline">Devkins</Link>
          </motion.p>
        </motion.div>
      </div>
    </footer>
  )
}
