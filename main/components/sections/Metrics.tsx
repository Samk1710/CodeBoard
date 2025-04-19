"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

const metrics = [
  {
    value: "50%",
    label: "Reduction in onboarding time",
    color: "from-blue-400 to-purple-400"
  },
  {
    value: "75%",
    label: "Improved developer confidence",
    color: "from-purple-400 to-pink-400"
  },
  {
    value: "100%",
    label: "Team convention coverage",
    color: "from-pink-400 to-red-400"
  }
]

export function Metrics() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Measurable Impact
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real results that transform your team's productivity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <motion.div
                className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${metric.color}`}
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
              >
                {metric.value}
              </motion.div>
              <p className="text-lg text-gray-300">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  )
} 