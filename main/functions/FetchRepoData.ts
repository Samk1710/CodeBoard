// lib/github.ts
import fetch from 'node-fetch';

interface RepoData {
  details: any;
  commits: any[];
  pullRequests: any[];
  issues: any[];
  contents: any[];
  contributors: any[];
  languages: any;
  releases: any[];
  branches: any[];
  tags: any[];
  workflows: any[];
}

export function parseGitHubUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com[/:]([^\/]+)\/([^\/#?]+)(?:\.git)?\/?/i
  ) || repoUrl.match(/^([^\/]+)\/([^\/#?]+)$/);

  if (!match || match.length < 3) {
    throw new Error('Invalid GitHub URL format');
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

async function fetchAllPages<T>(url: string, token?: string): Promise<T[]> {
  let results: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${url}?page=${page}&per_page=100`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'User-Agent': 'GitHub-Data-Fetcher',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const data: T[] = await response.json();
    results = results.concat(data);

    const linkHeader = response.headers.get('Link');
    hasMore = linkHeader?.includes('rel="next"') ?? false;
    page++;
  }

  return results;
}

export async function getRepoInfo(repoUrl: string, authToken?: string): Promise<RepoData> {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const [
    details,
    commits,
    pullRequests,
    issues,
    contents,
    contributors,
    languages,
    releases,
    branches,
    tags,
    workflows,
  ] = await Promise.all([
    fetch(baseUrl, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        'User-Agent': 'GitHub-Data-Fetcher',
      },
    }).then(res => res.json()),

    fetchAllPages<any>(`${baseUrl}/commits`, authToken),
    fetchAllPages<any>(`${baseUrl}/pulls?state=all`, authToken),
    fetchAllPages<any>(`${baseUrl}/issues?state=all`, authToken),

    fetch(`${baseUrl}/contents`, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        'User-Agent': 'GitHub-Data-Fetcher',
      },
    }).then(res => res.json()),

    fetchAllPages<any>(`${baseUrl}/contributors`, authToken),
    fetch(`${baseUrl}/languages`, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        'User-Agent': 'GitHub-Data-Fetcher',
      },
    }).then(res => res.json()),

    fetchAllPages<any>(`${baseUrl}/releases`, authToken),
    fetchAllPages<any>(`${baseUrl}/branches`, authToken),
    fetchAllPages<any>(`${baseUrl}/tags`, authToken),
    fetchAllPages<any>(`${baseUrl}/actions/workflows`, authToken),
  ]);

  return {
    details,
    commits,
    pullRequests,
    issues,
    contents,
    contributors,
    languages,
    releases,
    branches,
    tags,
    workflows,
  };
}
