import { Octokit } from '@octokit/rest';
import OpenAI from 'openai';
import { RepoInfo } from '@/lib/github';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const octokit = new Octokit();

export async function analyzeCodebase(
  repoInfo: RepoInfo,
  role: string,
  accessToken: string
) {
  // Initialize Octokit with user's access token
  const userOctokit = new Octokit({ auth: accessToken });

  // Fetch repository data
  const [commits, prs, issues] = await Promise.all([
    userOctokit.repos.listCommits({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      per_page: 100,
    }),
    userOctokit.pulls.list({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      state: 'all',
      per_page: 100,
    }),
    userOctokit.issues.listForRepo({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      state: 'all',
      per_page: 100,
    }),
  ]);

  // Calculate file hotspots
  const fileChanges = new Map<string, number>();
  commits.data.forEach((commit) => {
    commit.files?.forEach((file) => {
      const count = fileChanges.get(file.filename) || 0;
      fileChanges.set(file.filename, count + 1);
    });
  });

  const hotspots = Array.from(fileChanges.entries())
    .map(([file, changes]) => ({
      file,
      score: changes,
      changes,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Generate summary using OpenAI
  const prompt = `As a ${role}, analyze this GitHub repository:
Repository: ${repoInfo.owner}/${repoInfo.repo}
Recent Commits: ${commits.data.length}
Pull Requests: ${prs.data.length}
Issues: ${issues.data.length}

Provide a comprehensive summary focusing on:
1. Key components and architecture
2. Development patterns and practices
3. Areas that need attention
4. Recommendations for improvement

Format the response as a clear, structured summary.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });

  const summary = completion.choices[0].message.content || '';

  // Generate role-specific recommendations
  const recommendationsPrompt = `As a ${role}, provide specific recommendations for this repository based on:
1. Code organization
2. Best practices
3. Potential improvements
4. Common pitfalls to avoid

Format as a bulleted list.`;

  const recommendationsCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: recommendationsPrompt }],
    model: 'gpt-4',
  });

  const recommendations = recommendationsCompletion.choices[0].message.content
    ?.split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.trim().substring(1).trim()) || [];

  return {
    hotspots,
    summary,
    recommendations,
  };
} 