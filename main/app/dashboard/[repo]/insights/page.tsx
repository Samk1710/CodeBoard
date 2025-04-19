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

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          `/api/analysis/insights?repo=${params.repo}&role=${searchParams.get('role')}`
        );
        const data = await response.json();
        setAnalysisData(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.repo, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading analysis...</div>
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
          <SummaryCard summary={analysisData?.summary || ''} />
        </TabsContent>

        <TabsContent value="hotspots">
          <HotspotMap hotspots={analysisData?.hotspots || []} />
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {analysisData?.recommendations.map((rec, index) => (
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