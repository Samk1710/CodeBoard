'use client'

import { motion } from 'framer-motion'
import { ClockIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

export function Problem() {
  return (
    <section className="py-20 px-4">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          The Challenge We're Solving
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            className="bg-gray-800/50 p-6 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <ClockIcon className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Extended Onboarding</h3>
            <p className="text-gray-400">
              New developers face weeks of learning curves when joining projects, slowing down their initial productivity.
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {/* <BrainIcon className="h-12 w-12 text-emerald-400 mb-4" /> */}
            <h3 className="text-xl font-semibold mb-3">Tribal Knowledge</h3>
            <p className="text-gray-400">
              Critical project insights and team conventions often remain undocumented and hard to discover.
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 p-6 rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <QuestionMarkCircleIcon className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Limited Context</h3>
            <p className="text-gray-400">
              Understanding project history and decision-making processes requires extensive time investment.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
} 