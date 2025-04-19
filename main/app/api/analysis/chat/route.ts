import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseGitHubUrl } from '@/lib/github';
import { chatWithCodebase } from '@/lib/analysis/chat';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repo, role, message } = await request.json();

  if (!repo || !role || !message) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const repoInfo = parseGitHubUrl(`https://github.com/${repo}`);
    const response = await chatWithCodebase(repoInfo, role, message, session.accessToken);
    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 