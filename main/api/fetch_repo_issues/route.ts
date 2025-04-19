import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl, getRepoIssues } from '@/lib/github';

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
    const issues = await getRepoIssues(repoInfo);
    return NextResponse.json(issues);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 