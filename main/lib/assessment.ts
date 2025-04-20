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
  };
  score?: number;
  feedback?: string;
  roadmap?: string[];
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

export async function generateAssessment(analysis: RepositoryAnalysis, developerType: string): Promise<Assessment> {
  const prompt = `
    You are a codebase assessment AI for new developers onboarding to a company. Analyze the following repository structure and generate a practical coding assessment that tests their understanding of the codebase.

    Repository Analysis:
    ${JSON.stringify(analysis, null, 2)}
 
    Generate a practical coding assessment that includes:
    1. A specific task that requires modifying the codebase (e.g., adding a feature, fixing imports, implementing a function)
    2. The exact file(s) that need to be modified
    3. The expected changes in those files
    4. Any additional context or requirements
    
    Format the response as a JSON object with the following structure:
    {
      "task": {
        "title": string,
        "description": string,
        "targetFiles": {
          "path": string,
          "currentContent": string,
          "expectedChanges": string
        }[],
        "requirements": string[],
        "hints": string[]
      }
    }
    
    IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.
  `;

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: "You are a codebase assessment AI that generates practical coding tasks for new developers. Always respond with a valid JSON object, without any markdown formatting or additional text."
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

export async function evaluateAssignment(
  task: any,
  solution: string,
  analysis: RepositoryAnalysis
): Promise<Assessment> {
  const prompt = `
    You are a codebase assessment AI. Evaluate the following solution for a coding task:

    Task: ${JSON.stringify(task, null, 2)}
    
    Submitted Solution:
    ${solution}
    
    Repository Context:
    ${JSON.stringify(analysis, null, 2)}
    
    Evaluate the solution based on:
    1. Correctness of implementation
    2. Code quality and best practices
    3. Integration with existing codebase
    4. Completeness of the solution
    
    Format the response as a JSON object with the following structure:
    {
      "score": number,
      "feedback": string,
      "roadmap": string[]
    }
    
    IMPORTANT: Return ONLY the JSON object, without any markdown formatting or additional text.
  `;

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-8b-8192",
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