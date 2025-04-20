import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, developerType, repo } = await request.json();

    if (!message || !developerType || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Initialize Octokit with user's access token
    const octokit = new Octokit({ auth: session.accessToken });

    // Decode the repository path and split into owner and repo name
    const decodedRepo = decodeURIComponent(repo);
    const [owner, repoName] = decodedRepo.split('/');

    if (!owner || !repoName) {
      return NextResponse.json(
        { error: 'Invalid repository path' },
        { status: 400 }
      );
    }

    // Get repository structure
    const { data: repoContents } = await octokit.repos.getContent({
      owner,
      repo: repoName,
      path: '',
    });

    // Format repository structure for context
    const formatFileStructure = (contents: any[], path: string = ''): string => {
      if (!Array.isArray(contents)) {
        return path;
      }
      
      return contents
        .map((item) => {
          const currentPath = path ? `${path}/${item.name}` : item.name;
          if (item.type === 'dir') {
            return `${currentPath}/\n${formatFileStructure(item.contents || [], currentPath)}`;
          }
          return currentPath;
        })
        .join('\n');
    };

    const fileStructure = formatFileStructure(Array.isArray(repoContents) ? repoContents : [repoContents]);

    // Generate response using Groq
    const prompt = `As a ${developerType}, analyze this question about the codebase:
Repository: ${decodedRepo}
File Structure:
${fileStructure}

Question: ${message}

Provide a detailed response in markdown format with the following structure:

# Analysis

## Impact Assessment
- [Detailed analysis of the potential impact]

## Affected Files
- [List of files that might be affected]
- [Explanation of how each file might be impacted]

## Implementation Guidelines
- [Step-by-step implementation approach]
- [Best practices to follow]
- [Code examples if relevant]

## Considerations & Risks
- [Potential risks and challenges]
- [Mitigation strategies]
- [Additional recommendations]

Format the response using proper markdown syntax including:
- Headers (##, ###)
- Lists (- or *)
- Code blocks (\`\`\`)
- Bold text (**)
- Links if relevant

Make the response clear, well-structured, and easy to read.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a codebase analysis AI that provides detailed, well-structured responses in markdown format. Always use proper markdown syntax and maintain a clear hierarchy in your responses.'
        },
        { role: 'user', content: prompt }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 2000,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content,
      format: 'markdown'
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 