'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatBubbleLeftIcon, CodeBracketIcon, ServerIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Orb from '@/components/magicui/Orb/Orb';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DeveloperType {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const developerTypes: DeveloperType[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'Working with UI/UX, React, Vue, or other frontend frameworks',
    icon: CodeBracketIcon,
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    description: 'Working with server-side logic, APIs, and databases',
    icon: ServerIcon,
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Working with infrastructure, deployment, and CI/CD',
    icon: WrenchIcon,
  },
];

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          developerType: 'developer',
          repo: params.repo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Orb hue={200} hoverIntensity={0.3} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Select Your Developer Role</CardTitle>
              <p className="text-gray-400">Choose your role to get personalized assistance</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {developerTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center gap-2 bg-white/5 border-purple-500/20 hover:bg-white/10"
                    onClick={() => setSelectedType(type.id)}
                  >
                    <type.icon className="h-8 w-8 text-purple-400" />
                    <span className="text-lg font-semibold text-white">{type.name}</span>
                    <span className="text-sm text-gray-400 text-center">{type.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Orb hue={200} hoverIntensity={0.3} />
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">AI Assistant</CardTitle>
            <p className="text-gray-400">Ask me anything about the codebase</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-[60vh] overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white ml-auto max-w-[80%]'
                        : 'bg-gray-700 text-gray-200 max-w-[80%]'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: CodeProps) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                          p: ({ children }) => <p className="mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-6 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-6 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          a: ({ href, children }) => (
                            <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="bg-gray-700 text-gray-200 p-4 rounded-lg max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the codebase..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 