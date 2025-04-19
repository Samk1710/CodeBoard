'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CodeBracketIcon, StarIcon, ForkIcon } from '@heroicons/react/24/outline'

interface Repository {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
}

export default function RepositoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      fetchRepositories()
    }
  }, [status, router])

  const fetchRepositories = async () => {
    try {
      const response = await fetch('/api/repositories')
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const data = await response.json()
      setRepos(data)
    } catch (err) {
      setError('Failed to load repositories')
      console.error('Error fetching repositories:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Your GitHub Repositories
          </h1>
          <p className="text-gray-400 text-lg">
            Select a repository to analyze with AIgnite
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => router.push(`/analyze?repo=${encodeURIComponent(repo.html_url)}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CodeBracketIcon className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                </div>
                {repo.language && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                    {repo.language}
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 mt-2 line-clamp-2">
                {repo.description || 'No description available'}
              </p>
              
              <div className="flex items-center gap-4 mt-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ForkIcon className="h-4 w-4" />
                  <span>{repo.forks_count}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 