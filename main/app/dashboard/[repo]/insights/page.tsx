'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { HotspotMap } from '@/components/insights/HotspotMap';
import { SummaryCard } from '@/components/insights/SummaryCard';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SparklesIcon, CodeBracketIcon, LightBulbIcon, ChatBubbleLeftIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface AnalysisData {
  hotspots: Array<{
    file: string;
    score: number;
    changes: number;
  }>;
  summary: string;
  recommendations: string[];
}

export default function InsightsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const decodedRepo = decodeURIComponent(params.repo as string);
        
        const response = await fetch(
          `/api/analysis/insights?repo=${encodeURIComponent(decodedRepo)}&role=${searchParams.get('role')}`
        );
        
        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAnalysisData(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch analysis');
      } finally {
        setLoading(false);
      }
    };

    if (params.repo && searchParams.get('role')) {
      fetchAnalysis();
    }
  }, [params.repo, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        <Card className="backdrop-blur-lg bg-white/5 border-red-500/20">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        <Card className="backdrop-blur-lg bg-white/5 border-purple-500/20">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
            <div className="text-xl text-white">Analyzing repository...</div>
            <p className="mt-2 text-gray-400">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">No analysis data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="backdrop-blur-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SparklesIcon className="h-8 w-8 text-purple-400" />
                  <div>
                    <CardTitle className="text-3xl font-bold text-white">Repository Insights</CardTitle>
                    <p className="text-gray-400">Analysis for {decodeURIComponent(params.repo as string)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => router.push(`/dashboard/${params.repo}/playbook`)}
                    className="bg-indigo-500 hover:bg-indigo-600 flex items-center gap-2"
                  >
                    <DocumentCheckIcon className="h-5 w-5" />
                    Take Assessment
                  </Button>
                  <Button
                    onClick={() => router.push(`/dashboard/${params.repo}/chat`)}
                    className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    Ask AI Assistant
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CodeBracketIcon className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-2xl font-bold text-white">Repository Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <SummaryCard summary={analysisData.summary} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="backdrop-blur-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-6 w-6 text-indigo-400" />
                  <CardTitle className="text-2xl font-bold text-white">Code Hotspots</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <HotspotMap
                  name="Code Hotspots"
                  score={0.8}
                  description="Files with the most frequent changes and potential impact areas"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {analysisData.recommendations && analysisData.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="backdrop-blur-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <LightBulbIcon className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-2xl font-bold text-white">Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.recommendations.map((recommendation, index) => (
                    <Card key={index} className="bg-white/5 border-blue-500/20 hover:bg-white/10 transition-colors duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-400">💡</span>
                          </div>
                          <p className="text-gray-300">{recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}