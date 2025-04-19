import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl, getRepoCommits } from '@/lib/github';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url || typeof url !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid "url" query parameter' },
      { status: 400 }
    );
  }

  try {
    const repoInfo = parseGitHubUrl(url);
    const commits = await getRepoCommits(repoInfo);
    return NextResponse.json(commits);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 