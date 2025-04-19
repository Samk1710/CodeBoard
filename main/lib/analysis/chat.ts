import { Octokit } from '@octokit/rest';
import Groq from 'groq-sdk';
import { RepoInfo } from '@/lib/github';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chatWithCodebase(
  repoInfo: RepoInfo,
  role: string,
  message: string,
  accessToken: string
) {
  const userOctokit = new Octokit({ auth: accessToken });

  // Fetch repository context
  const [commits, prs] = await Promise.all([
    userOctokit.repos.listCommits({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      per_page: 30,
    }),
    userOctokit.pulls.list({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      state: 'all',
      per_page: 30,
    }),
  ]);

  // Prepare context for the AI
  const context = `
Repository: ${repoInfo.owner}/${repoInfo.repo}

Recent Commits:
${commits.data.map(commit => `- ${commit.commit.message}`).join('\n')}

Recent Pull Requests:
${prs.data.map(pr => `- ${pr.title}`).join('\n')}
`;

  // Generate response using Groq
  const prompt = `You are a helpful AI assistant analyzing a GitHub repository. 
Role: ${role}
Repository Context:
${context}

User Question: ${message}

Provide a clear, accurate, and helpful response based on the repository context.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
  });

  return completion.choices[0].message.content || 'No response generated';
}
