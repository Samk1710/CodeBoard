'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CodeBracketIcon, StarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/outline';

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  private: boolean;
  updated_at: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchRepositories();
    }
  }, [status, router]);

  const fetchRepositories = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/repositories');
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepos(data);
      console.log(data);
    } catch (err) {
      setError('Failed to load repositories');
      console.error('Error fetching repositories:', err);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white">
              Your Repositories
            </h1>
            <p className="text-gray-400 mt-2">
              {repos.length} repositories found
            </p>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRepositories}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => router.push(`/test?repo=${encodeURIComponent(repo.html_url)}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CodeBracketIcon className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                  {repo.private && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                      Private
                    </span>
                  )}
                </div>
                {repo.language && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                    {repo.language}
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 mt-2 line-clamp-2">
                {repo.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between mt-4 text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                </div>
                <span className="text-sm">
                  Updated {formatDate(repo.updated_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 