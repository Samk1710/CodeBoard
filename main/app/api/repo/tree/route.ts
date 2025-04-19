import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseGitHubUrl } from '@/lib/github';
import { Octokit } from '@octokit/rest';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repo = request.nextUrl.searchParams.get('repo');

  if (!repo) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const repoInfo = parseGitHubUrl(`https://github.com/${repo}`);
    const octokit = new Octokit({ auth: session.accessToken });

    const { data } = await octokit.repos.getContent({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: '',
    });

    const tree = Array.isArray(data) ? data : [];
    return NextResponse.json({ tree });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 