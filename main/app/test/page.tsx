'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface RepoInfo {
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  private: boolean
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

interface FileStructure {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  download_url?: string
}

export default function TestPage() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }

    const repoUrl = searchParams.get('repo')
    if (!repoUrl) {
      setError('No repository selected')
      setLoading(false)
      return
    }

    fetchRepoInfo(repoUrl)
  }, [status, searchParams, router])

  const fetchRepoInfo = async (repoUrl: string) => {
    try {
      setLoading(true)
      
      // Extract owner and repo name from the URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) {
        throw new Error('Invalid repository URL')
      }

      const [, owner, repo] = match

      // Fetch repository info
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )

      if (!repoResponse.ok) {
        throw new Error('Failed to fetch repository info')
      }

      const repoData = await repoResponse.json()
      setRepoInfo(repoData)

      // Fetch file structure
      const structureResponse = await fetch(`/api/repo/structure?repo=${encodeURIComponent(repoUrl)}`)
      if (!structureResponse.ok) {
        throw new Error('Failed to fetch file structure')
      }

      const structureData = await structureResponse.json()
      setFileStructure(structureData)

      // Log the data
      console.log('Repository Info:', repoData)
      console.log('File Structure:', structureData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {repoInfo && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={repoInfo.owner.avatar_url}
                alt={repoInfo.owner.login}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{repoInfo.name}</h1>
                <p className="text-gray-400">by {repoInfo.owner.login}</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">{repoInfo.description}</p>
            <div className="flex gap-4 text-gray-400">
              <div className="flex items-center gap-1">
                <span>⭐ {repoInfo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔀 {repoInfo.forks_count}</span>
              </div>
              {repoInfo.language && (
                <div className="flex items-center gap-1">
                  <span>💻 {repoInfo.language}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Structure</h2>
          <div className="space-y-2">
            {fileStructure.map((file) => (
              <div
                key={file.path}
                className="flex items-center gap-2 text-gray-300 hover:bg-gray-700 p-2 rounded"
              >
                {file.type === 'dir' ? '📁' : '📄'}
                <span>{file.name}</span>
                {file.type === 'file' && (
                  <span className="text-gray-500 text-sm">
                    ({Math.round((file.size || 0) / 1024)} KB)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 