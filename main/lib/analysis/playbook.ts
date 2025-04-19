import { Octokit } from '@octokit/rest';
import Groq from 'groq-sdk';
import { RepoInfo } from '@/lib/github';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeConventions(
  repoInfo: RepoInfo,
  role: string,
  accessToken: string
) {
  const userOctokit = new Octokit({ auth: accessToken });

  // Fetch PRs and their reviews
  const prs = await userOctokit.pulls.list({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    state: 'all',
    per_page: 100,
  });

  // Extract review comments and PR descriptions
  const reviewData = await Promise.all(
    prs.data.map(async (pr) => {
      const reviews = await userOctokit.pulls.listReviews({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        pull_number: pr.number,
      });
      return {
        title: pr.title,
        body: pr.body,
        reviews: reviews.data.map((review) => review.body),
      };
    })
  );

  // Prepare data for AI analysis
  const reviewText = reviewData
    .map(
      (data) =>
        `PR: ${data.title}\nDescription: ${data.body}\nReviews: ${data.reviews.join(
          '\n'
        )}`
    )
    .join('\n\n');

  // Generate conventions using Groq
  const prompt = `As a ${role}, analyze these pull request reviews and identify team conventions and practices:

${reviewText}

Identify and categorize the following:
1. Code style and formatting conventions
2. Review and approval processes
3. Testing requirements
4. Documentation standards
5. Branch naming and management
6. Commit message conventions
7. Any other notable practices

For each convention, provide:
- A clear description
- Examples from the reviews
- The source (which PR/review it came from)

Format the response as a JSON array of objects with these fields:
{
  "category": string,
  "description": string,
  "examples": string[],
  "source": string
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
    response_format: { type: 'json_object' }
  });

  const response = completion.choices[0].message.content;
  const conventions = JSON.parse(response || '{"conventions": []}').conventions;

  return conventions;
}