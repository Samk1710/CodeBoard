import { Octokit } from '@octokit/rest';
import Groq from 'groq-sdk';
import { RepoInfo } from '@/lib/github';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

  // Generate summary using Groq
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

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  });

  const summary = completion.choices[0].message.content || '';

  // Generate role-specific recommendations
  const recommendationsPrompt = `As a ${role}, provide 3-5 specific recommendations for this repository based on:
1. Code organization
2. Best practices
3. Potential improvements
4. Common pitfalls to avoid

Format EXACTLY as follows, with each recommendation on a new line starting with '- ':
- First recommendation
- Second recommendation
- Third recommendation`;

  const recommendationsCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: recommendationsPrompt }],
    model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  });
  const recommendations = recommendationsCompletion.choices[0].message.content
    ?.split('\n')
    .filter((line) => line.trim().startsWith('-'))
    .map((line) => line.trim().substring(2).trim())
    .filter(Boolean) || ['No specific recommendations available'];


  const uniqueRecommendations = Array.from(new Set(recommendations));

  return {
    hotspots,
    summary,
    recommendations: uniqueRecommendations,
  };
}