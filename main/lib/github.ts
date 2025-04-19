import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface RepoInfo {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): RepoInfo {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }
  return {
    owner: match[1],
    repo: match[2],
  };
}

export async function getRepoCommits(repoInfo: RepoInfo) {
  const { data } = await octokit.repos.listCommits({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    per_page: 100,
  });
  return data;
}

export async function getRepoPullRequests(repoInfo: RepoInfo) {
  const { data } = await octokit.pulls.list({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    state: 'all',
    per_page: 100,
  });
  return data;
}

export async function getRepoIssues(repoInfo: RepoInfo) {
  const { data } = await octokit.issues.listForRepo({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    state: 'all',
    per_page: 100,
  });
  return data;
}

export async function getRepoContributors(repoInfo: RepoInfo) {
  const { data } = await octokit.repos.listContributors({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
  });
  return data;
}

export async function getRepoCodeFrequency(repoInfo: RepoInfo) {
  const { data } = await octokit.repos.getCodeFrequencyStats({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
  });
  return data;
} 