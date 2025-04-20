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

  // Fetch repository data with increased limits for better context
  const [commits, prs, issues, languages, contents, workflows] = await Promise.all([
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
    userOctokit.repos.listLanguages({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
    }),
    userOctokit.repos.getContent({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: '',
    }),
    userOctokit.actions.listRepoWorkflows({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
    }).catch(() => ({ data: { workflows: [] } })), // Gracefully handle if workflows not available
  ]);

  // Calculate file hotspots with improved scoring
  const fileChanges = new Map<string, { changes: number; additions: number; deletions: number }>();
  
  for (const commit of commits.data) {
    const commitFiles = await userOctokit.repos.getCommit({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      ref: commit.sha,
    });

    commitFiles.data.files?.forEach((file) => {
      const current = fileChanges.get(file.filename) || { changes: 0, additions: 0, deletions: 0 };
      fileChanges.set(file.filename, {
        changes: current.changes + 1,
        additions: current.additions + (file.additions || 0),
        deletions: current.deletions + (file.deletions || 0),
      });
    });
  }

  // Calculate complexity score based on changes and line modifications
  const hotspots = Array.from(fileChanges.entries())
    .map(([file, stats]) => ({
      file,
      score: stats.changes * Math.log(stats.additions + stats.deletions + 1),
      changes: stats.changes,
      additions: stats.additions,
      deletions: stats.deletions,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Calculate language percentages
  const totalBytes = Object.values(languages.data).reduce((a, b) => a + b, 0);
  const languageStats = Object.entries(languages.data).map(([lang, bytes]) => ({
    name: lang,
    percentage: ((bytes / totalBytes) * 100).toFixed(2),
    bytes,
  }));

  // Project structure analysis
  let projectStructure = '';
  if (Array.isArray(contents.data)) {
    const dirs = contents.data.filter(f => f.type === 'dir').map(d => d.name);
    const mainFiles = contents.data.filter(f => f.type === 'file').map(f => f.name);
    projectStructure = `
Main directories: ${dirs.join(', ')}
Key files: ${mainFiles.join(', ')}`;
  }

  // Generate summary using Groq with enhanced context
  const prompt = `As a ${role}, analyze this GitHub repository:

Repository: ${repoInfo.owner}/${repoInfo.repo}
Languages: ${languageStats.map(l => `${l.name} (${l.percentage}%)`).join(', ')}
Project Structure:${projectStructure}

Statistics:
- Commits: ${commits.data.length}
- Pull Requests: ${prs.data.length}
- Issues: ${issues.data.length}
- Workflows: ${workflows.data.workflows.length}

Common file changes (top 5):
${hotspots.slice(0, 5).map(h => `- ${h.file}: ${h.changes} changes`).join('\n')}

Provide a comprehensive analysis focusing on:
1. Architecture and code organization
2. Development patterns and practices
3. Areas that need attention
4. Tech stack insights
5. Code quality indicators
6. Testing and CI/CD setup
7. Performance considerations

Format the response as a clear, structured summary.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  });

  const summary = completion.choices[0].message.content || '';

  // Generate targeted recommendations based on language-specific best practices
  const recommendationsPrompt = `As a ${role}, provide specific recommendations for this repository:

Primary languages used: ${languageStats.slice(0, 3).map(l => l.name).join(', ')}
Project scale indicators:
- ${commits.data.length} commits
- ${prs.data.length} PRs
- ${issues.data.length} issues
- ${workflows.data.workflows.length} workflows

Focus areas:
1. Language-specific best practices
2. Architecture improvements
3. Testing strategy
4. Development workflow
5. Security considerations
6. Performance optimization
7. Documentation needs

Format exactly as follows, with each recommendation on a new line starting with '- ':
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
    languageStats,
    projectStats: {
      commits: commits.data.length,
      pullRequests: prs.data.length,
      issues: issues.data.length,
      workflows: workflows.data.workflows.length,
    },
  };
}