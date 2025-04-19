import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  download_url?: string
}

async function fetchContents(
  owner: string,
  repo: string,
  path: string,
  accessToken: string
): Promise<GitHubContent[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch contents for path: ${path}`)
  }

  const contents = await response.json()
  const result: GitHubContent[] = []

  for (const item of contents) {
    const content: GitHubContent = {
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      download_url: item.download_url,
    }

    result.push(content)

    // If it's a directory, recursively fetch its contents
    if (item.type === 'dir') {
      const subContents = await fetchContents(owner, repo, item.path, accessToken)
      result.push(...subContents)
    }
  }

  return result
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repoUrl = searchParams.get('repo')

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // Extract owner and repo name from the URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 })
    }

    const [, owner, repo] = match

    // Fetch all contents recursively
    const contents = await fetchContents(owner, repo, '', session.accessToken)
    
    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching repository structure:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository structure' },
      { status: 500 }
    )
  }
} 