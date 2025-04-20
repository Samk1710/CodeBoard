import { NextResponse } from 'next/server';
import { analyzeCodebase } from '@/lib/assessment';
import { generateAssessment } from '@/lib/assessment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');
    const type = searchParams.get('type');

    if (!repo || !type) {
      return NextResponse.json(
        { error: 'Repository and developer type are required' },
        { status: 400 }
      );
    }

    // Analyze the repository structure
    const analysis = await analyzeCodebase(repo);

    // Generate assessment based on developer type and repository analysis
    const assessment = await generateAssessment(analysis, type);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
} 