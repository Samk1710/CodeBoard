'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tree, Folder, File } from '@/components/magicui/file-tree'

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

function convertToTreeElements(files: FileStructure[]): any[] {
  const root: any = {
    id: 'root',
    isSelectable: true,
    name: 'root',
    children: []
  }

  files.forEach(file => {
    const pathParts = file.path.split('/')
    let current = root

    pathParts.forEach((part, index) => {
      const isLast = index === pathParts.length - 1
      const existingChild = current.children?.find((child: { name: string }) => child.name === part)

      if (existingChild) {
        current = existingChild
      } else {
        const newChild = {
          id: file.path,
          isSelectable: true,
          name: part,
          children: !isLast ? [] : undefined
        }
        current.children.push(newChild)
        current = newChild
      }
    })
  })

  return root.children
}

function renderTreeElement(element: any) {
  if (element.children) {
    return (
      <Folder key={element.id} element={element.name} value={element.id}>
        {element.children.map(renderTreeElement)}
      </Folder>
    )
  } else {
    return (
      <File key={element.id} value={element.id}>
        {element.name}
      </File>
    )
  }
}

export default function AnalyzePage() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {repoInfo && (
          <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <img
                    src={repoInfo.owner.avatar_url}
                    alt={repoInfo.owner.login}
                    className="w-20 h-20 rounded-full ring-4 ring-purple-500/30 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">{repoInfo.name}</h1>
                  <p className="text-gray-300">by {repoInfo.owner.login}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 text-lg">{repoInfo.description}</p>
              <div className="flex gap-6 text-gray-300">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-300">
                  <span className="text-yellow-400">⭐</span>
                  <span>{repoInfo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-300">
                  <span className="text-purple-400">🔀</span>
                  <span>{repoInfo.forks_count}</span>
                </div>
                {repoInfo.language && (
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-300">
                    <span className="text-blue-400">💻</span>
                    <span>{repoInfo.language}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 group-hover:text-purple-400 transition-colors duration-300">File Structure</h2>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              <Tree className="bg-white/5 rounded-lg p-4 border border-white/10">
                {convertToTreeElements(fileStructure).map(renderTreeElement)}
              </Tree>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}