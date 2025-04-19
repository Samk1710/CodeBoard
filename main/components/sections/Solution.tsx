'use client'

import { motion } from "framer-motion"
import { SparklesIcon } from '@heroicons/react/24/outline'

export function Solution() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <SparklesIcon className="h-16 w-16 text-purple-400 mb-6" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            The GenAI Solution
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A powerful AI-driven tool that transforms repository data into an instant, comprehensive onboarding experience.
          </p>
        </div>

        <motion.div 
          className="grid md:grid-cols-2 gap-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/50 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-purple-400">How It Works</h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-purple-400 text-lg font-bold">1.</span>
                <p className="text-gray-300">Analyzes repository history, code changes, and team interactions</p>
              </motion.li>
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-purple-400 text-lg font-bold">2.</span>
                <p className="text-gray-300">Extracts hidden patterns and team conventions</p>
              </motion.li>
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-purple-400 text-lg font-bold">3.</span>
                <p className="text-gray-300">Provides personalized guidance and insights</p>
              </motion.li>
            </ul>
          </div>

          <div className="bg-gray-800/50 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-pink-400">Key Benefits</h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-pink-400 text-lg font-bold">→</span>
                <p className="text-gray-300">Reduces onboarding time by 50% or more</p>
              </motion.li>
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-pink-400 text-lg font-bold">→</span>
                <p className="text-gray-300">Improves developer confidence and productivity</p>
              </motion.li>
              <motion.li 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-pink-400 text-lg font-bold">→</span>
                <p className="text-gray-300">Facilitates better team collaboration</p>
              </motion.li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
} 