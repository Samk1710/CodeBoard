'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Code Board
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Transform repository knowledge into instant developer insights
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={() => window.location.href = '/dashboard'}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1
        }}
      >
        <ArrowDownIcon className="h-8 w-8 text-gray-400" />
      </motion.div>
    </section>
  )
} 