'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GithubIcon } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
}

interface RepoGridProps {
  repos: Repo[];
  onRepoSelect: (repo: Repo) => void;
}

export function RepoGrid({ repos, onRepoSelect }: RepoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <Card key={repo.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GithubIcon className="h-5 w-5" />
              {repo.name}
            </CardTitle>
            <CardDescription>
              {repo.private ? 'Private' : 'Public'} Repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              {repo.description || 'No description available'}
            </p>
            <Button
              className="w-full"
              onClick={() => onRepoSelect(repo)}
            >
              Analyze Repository
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 