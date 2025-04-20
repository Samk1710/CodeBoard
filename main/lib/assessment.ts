import { analyzeCodebase as analyzeRepo } from './analysis/insights';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface RepositoryAnalysis {
  hotspots: {
    file: string;
    score: number;
    changes: number;
  }[];
  summary: string;
  recommendations: string[];
}

interface Assessment {
  task: {
    title: string;
    description: string;
    targetFiles: {
      path: string;
      currentContent: string;
      expectedChanges: string;
    }[];
    requirements: string[];
    hints: string[];
    languageSpecificTips?: {
      language: string;
      tips: string[];
    }[];
  };
  score?: number;
  feedback?: string;
  roadmap?: string[];
  languageSpecificFeedback?: {
    language: string;
    feedback: string[];
  }[];
}

export async function analyzeCodebase(repo: string): Promise<RepositoryAnalysis> {
  const decodedRepo = decodeURIComponent(repo);
  const [owner, repoName] = decodedRepo.split('/');
  
  if (!owner || !repoName) {
    throw new Error('Invalid repository format. Expected format: owner/repo');
  }

  const analysis = await analyzeRepo(
    { owner, repo: repoName },
    'developer',
    process.env.GITHUB_TOKEN || ''
  );
 
  return analysis;
}

export async function generateAssessment(
  analysis: RepositoryAnalysis & {
    languageStats: Array<{ name: string; percentage: string }>;
    projectStats: {
      commits: number;
      pullRequests: number;
      issues: number;
      workflows: number;
    };
  },
  developerType: string
): Promise<Assessment> {
  const prompt = `
    You are a codebase assessment AI for new ${developerType} developers onboarding to a company. 
    Analyze the following repository context and generate a practical coding assessment that tests their understanding of the codebase.

    Repository Analysis:
    ${JSON.stringify(analysis, null, 2)}

    Primary Languages Used:
    ${analysis.languageStats.map(lang => `- ${lang.name}: ${lang.percentage}%`).join('\n')}

    Project Activity:
    - Total Commits: ${analysis.projectStats.commits}
    - Pull Requests: ${analysis.projectStats.pullRequests}
    - Issues: ${analysis.projectStats.issues}
    - CI/CD Workflows: ${analysis.projectStats.workflows}

    Generate a practical coding assessment that:
    1. Focuses on the primary languages used in the project (${analysis.languageStats.slice(0, 3).map(l => l.name).join(', ')})
    2. Tests understanding of the project's architecture and patterns
    3. Involves modifying or extending existing functionality
    4. Requires following established code conventions
    5. Tests understanding of the testing practices (if present)
    6. Considers the project's complexity level
    
    Format the response as a JSON object with the following structure:
    {
      "task": {
        "title": string,
        "description": string,
        "targetFiles": [{
          "path": string,
          "currentContent": string,
          "expectedChanges": string
        }],
        "requirements": string[],
        "hints": string[],
        "languageSpecificTips": {
          "language": string,
          "tips": string[]
        }[]
      }
    }
    
    IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.`;

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "mixtral-8x7b-32768",
    messages: [
      {
        role: "system",
        content: `You are a codebase assessment AI that generates practical coding tasks for new ${developerType} developers. Always respond with a valid JSON object, without any markdown formatting or additional text.`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from the AI model');
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const assessment = JSON.parse(cleanContent) as Assessment;

    // Add language-specific validation requirements
    assessment.task.requirements = [
      ...assessment.task.requirements,
      ...analysis.languageStats.slice(0, 3).flatMap(lang => {
        switch (lang.name.toLowerCase()) {
          case 'typescript':
            return ['Maintain strict TypeScript type safety', 'Use TypeScript-specific features appropriately'];
          case 'javascript':
            return ['Follow modern JavaScript best practices', 'Use appropriate ES6+ features'];
          case 'python':
            return ['Follow PEP 8 style guidelines', 'Use Python type hints where appropriate'];
          default:
            return [];
        }
      })
    ];

    return assessment;
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid response format from AI model');
  }
}

export async function evaluateAssignment(
  task: Assessment['task'],
  solution: string,
  analysis: RepositoryAnalysis & {
    languageStats: Array<{ name: string; percentage: string }>;
    projectStats: {
      commits: number;
      pullRequests: number;
      issues: number;
      workflows: number;
    };
  }
): Promise<Assessment> {
  const prompt = `
    You are a codebase assessment AI. Evaluate the following solution for a coding task:

    Task: ${JSON.stringify(task, null, 2)}
    
    Submitted Solution:
    ${solution}
    
    Repository Context:
    ${JSON.stringify(analysis, null, 2)}

    Primary Languages:
    ${analysis.languageStats.map(lang => `- ${lang.name}: ${lang.percentage}%`).join('\n')}
    
    Evaluate the solution based on:
    1. Correctness of implementation
    2. Code quality and best practices
    3. Language-specific best practices for ${analysis.languageStats[0]?.name || 'the primary language'}
    4. Integration with existing codebase
    5. Adherence to project patterns
    6. Test coverage (if applicable)
    7. Performance considerations
    
    Format the response as a JSON object with the following structure:
    {
      "score": number,
      "feedback": string,
      "roadmap": string[],
      "languageSpecificFeedback": {
        "language": string,
        "feedback": string[]
      }[]
    }`;

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "mixtral-8x7b-32768",
    messages: [
      {
        role: "system",
        content: "You are a codebase assessment AI that evaluates developers' solutions to coding tasks and provides actionable feedback. Always respond with a valid JSON object, without any markdown formatting or additional text."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from the AI model');
  }

  try {
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const assessment = JSON.parse(cleanContent) as Assessment;
    return assessment;
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid response format from AI model');
  }
}