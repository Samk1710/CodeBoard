'use client';

import { useState } from 'react';
import { SummaryCard } from './SummaryCard';
import { HotspotMap } from './HotspotMap';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SparklesIcon, MapIcon } from '@heroicons/react/24/outline';

interface InsightsPanelProps {
  summary: string;
  hotspots: Array<{
    id: string;
    name: string;
    score: number;
    description: string;
  }>;
}

export function InsightsPanel({ summary, hotspots }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-indigo-500/5 border border-indigo-500/10">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="hotspots" className="flex items-center gap-2">
            <MapIcon className="w-4 h-4" />
            Hotspots
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <SummaryCard summary={summary} />
        </TabsContent>
        
        <TabsContent value="hotspots" className="mt-4">
          <div className="space-y-4">
            {hotspots.map((hotspot) => (
              <HotspotMap
                key={hotspot.id}
                name={hotspot.name}
                score={hotspot.score}
                description={hotspot.description}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 