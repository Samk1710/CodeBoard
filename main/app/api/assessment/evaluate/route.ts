import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { evaluateAssignment } from '@/lib/assessment';
import { analyzeCodebase } from '@/lib/analysis/insights';
import { parseGitHubUrl } from '@/lib/github';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task, solution, repo } = await req.json();
    if (!task || !solution || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Decode the repository URL
    const decodedRepo = decodeURIComponent(repo);

    // Parse repository information
    let repoInfo;
    try {
      // Try parsing as a full URL first
      repoInfo = parseGitHubUrl(decodedRepo);
    } catch (error) {
      // If that fails, try parsing as owner/repo format
      const [owner, repoName] = decodedRepo.split('/');
      if (!owner || !repoName) {
        return NextResponse.json(
          { error: 'Invalid repository format. Expected format: owner/repo or full GitHub URL' },
          { status: 400 }
        );
      }
      repoInfo = { owner, repo: repoName };
    }

    // Get repository analysis
    const analysis = await analyzeCodebase(
      repoInfo,
      'developer',
      process.env.GITHUB_TOKEN || ''
    );

    // Format solution for evaluation
    const formattedSolution = Object.entries(solution)
      .map(([path, content]) => `${path}:\n${content}`)
      .join('\n\n');

    // Evaluate the solution
    const assessment = await evaluateAssignment(task, formattedSolution, analysis);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error evaluating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate assessment' },
      { status: 500 }
    );
  }
} 