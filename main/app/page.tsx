import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Problem } from '@/components/sections/Problem'
import { Solution } from '@/components/sections/Solution'
import { Metrics } from '@/components/sections/Metrics'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Metrics />
    </main>
  )
}
