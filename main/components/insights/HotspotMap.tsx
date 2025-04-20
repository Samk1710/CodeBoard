'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface HotspotMapProps {
  name: string;
  score: number;
  description: string;
}

export function HotspotMap({ name, score, description }: HotspotMapProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500/10 text-green-400';
    if (score >= 0.6) return 'bg-blue-500/10 text-blue-400';
    if (score >= 0.4) return 'bg-yellow-500/10 text-yellow-400';
    return 'bg-red-500/10 text-red-400';
  };

  return (
    <div className="p-6 rounded-xl bg-gray-800/80 border border-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-indigo-200">{name}</h3>
          </div>
          <div className="prose prose-invert max-w-none text-gray-400">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-indigo-400 hover:text-indigo-300 underline">
                    {children}
                  </a>
                ),
              }}
            >
              {description}
            </ReactMarkdown>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${getScoreColor(score)} text-sm font-medium`}>
          {Math.round(score * 100)}%
        </div>
      </div>
    </div>
  );
}