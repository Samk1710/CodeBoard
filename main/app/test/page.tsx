'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tree, Folder, File } from '@/components/magicui/file-tree'
import { FileIcon, FolderIcon, FileCodeIcon, FileTextIcon, FileImageIcon, FileJsonIcon, FileCogIcon, BinaryIcon } from 'lucide-react'

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

function getFileIcon(name: string) {
  const extension = name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
    case 'rb':
    case 'php':
    case 'swift':
    case 'kt':
    case 'dart':
      return <FileCodeIcon className="w-4 h-4 text-blue-400" />;
    case 'json':
    case 'yaml':
    case 'yml':
      return <FileJsonIcon className="w-4 h-4 text-yellow-400" />;
    case 'md':
    case 'txt':
    case 'log':
      return <FileTextIcon className="w-4 h-4 text-gray-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImageIcon className="w-4 h-4 text-green-400" />;
    case 'env':
    case 'config':
    case 'conf':
      return <FileCogIcon className="w-4 h-4 text-purple-400" />;
    case 'exe':
    case 'dll':
    case 'so':
    case 'dylib':
      return <BinaryIcon className="w-4 h-4 text-red-400" />;
    default:
      return <FileIcon className="w-4 h-4 text-gray-400" />;
  }
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
      if (!current.children && !isLast) {
        current.children = []
      }
      const existingChild = current.children?.find((child: { name: string }) => child.name === part)

      if (existingChild) {
        current = existingChild
      } else {
        const newChild = {
          id: file.path,
          isSelectable: true,
          name: part,
          type: isLast ? file.type : 'dir',
          children: !isLast ? [] : undefined
        }
        if (current.children) {
          current.children.push(newChild)
        }
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
        <div className="flex items-center gap-2">
          <FolderIcon className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300">{element.name}</span>
        </div>
        {element.children.map(renderTreeElement)}
      </Folder>
    )
  } else {
    return (
      <File key={element.id} value={element.id}>
        <div className="flex items-center gap-2">
          {getFileIcon(element.name)}
          <span className="text-gray-300">{element.name}</span>
        </div>
      </File>
    )
  }
}

export default function TestPage() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!repoInfo) return;
    try {
      setAnalyzing(true);
      const repoPath = encodeURIComponent(`${repoInfo.owner.login}/${repoInfo.name}`);
      
      // Pre-fetch the analysis to ensure it's ready when we navigate
      await fetch(`/api/analysis/insights?repo=${repoPath}&role=developer`);
      
      router.push(`/dashboard/${repoPath}/insights?role=developer`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository');
      setAnalyzing(false);
    }
  }

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
      console.log(`fetching from: /api/repo/structure?repo=${encodeURIComponent(repoUrl)}`)
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
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Structure</h2>
          <div className="border border-gray-700 rounded-lg p-4">
            <Tree className="text-sm">
              {convertToTreeElements(fileStructure).map(renderTreeElement)}
            </Tree>
          </div>
        </div>
      </div>
    </div>
  )
}