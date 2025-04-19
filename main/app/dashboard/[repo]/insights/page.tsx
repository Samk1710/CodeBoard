'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { HotspotMap } from '@/components/insights/HotspotMap';
import { SummaryCard } from '@/components/insights/SummaryCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Decode the repo parameter since it was encoded in the URL
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
          <div className="text-xl">Analyzing repository...</div>
          <p className="mt-2 text-gray-500">This may take a few moments</p>
        </div>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Codebase Insights</h1>
      
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryCard summary={analysisData.summary} />
        </TabsContent>

        <TabsContent value="hotspots">
          <HotspotMap hotspots={analysisData.hotspots} />
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {analysisData.recommendations.map((rec, index) => (
              <div key={index} className="rounded-lg bg-white p-4 shadow">
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}