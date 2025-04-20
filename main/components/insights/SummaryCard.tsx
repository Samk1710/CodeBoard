'use client';

import { Card, CardContent } from '@/components/ui/card';
import { SparklesIcon, LightBulbIcon, ChartBarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from 'react-markdown';

interface SummaryCardProps {
  summary: string;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  // Split the summary into sections based on double line breaks
  const sections = summary.split('\n\n').filter(section => section.trim());
  
  // Get appropriate icon for each section
  const getSectionIcon = (title: string) => {
    if (title.toLowerCase().includes('overview')) return SparklesIcon;
    if (title.toLowerCase().includes('analysis')) return ChartBarIcon;
    if (title.toLowerCase().includes('recommendation')) return LightBulbIcon;
    return DocumentTextIcon;
  };

  return (
    <div className="grid gap-4">
      {sections.map((section, index) => {
        const lines = section.split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim();
        const content = lines.slice(1).join('\n');
        const Icon = getSectionIcon(title);

        return (
          <Card key={index} className="bg-gray-800/80 border-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-indigo-200">{title}</h3>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                    li: ({ children }) => <li className="mb-2">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-700/50 p-4 rounded-lg overflow-x-auto mb-4">
                        {children}
                      </pre>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-indigo-400 hover:text-indigo-300 underline">
                        {children}
                      </a>
                    ),
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-base font-bold mb-2">{children}</h4>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-indigo-500/50 pl-4 italic my-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}