"use client"

import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    title: "Codebase Hotspot Analysis",
    description: "Interactive heatmap highlighting critical files and folders based on commit frequency and PR mentions.",
    icon: ChartBarIcon,
    color: "text-blue-400"
  },
  {
    title: "Hidden Rule Detector",
    description: "AI-powered 'Team Playbook' that extracts and documents unwritten conventions from PR reviews and commits.",
    icon: BookOpenIcon,
    color: "text-emerald-400"
  },
  {
    title: "Historical Q&A Chat",
    description: "ChatGPT-style interface that provides direct, actionable answers based on past discussions and decisions.",
    icon: ChatBubbleBottomCenterTextIcon,
    color: "text-purple-400"
  },
  {
    title: "Code Review Trainer",
    description: "Gamified learning experience with AI-generated critiques to help new developers master team standards.",
    icon: AcademicCapIcon,
    color: "text-pink-400"
  }
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to transform the onboarding experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gray-800/50 p-8 rounded-lg hover:bg-gray-800/70 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <feature.icon className={`h-12 w-12 ${feature.color} mb-6`} />
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 