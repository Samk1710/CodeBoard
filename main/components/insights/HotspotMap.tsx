'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Hotspot {
  file: string;
  score: number;
  changes: number;
}

interface HotspotMapProps {
  hotspots: Hotspot[];
}

export function HotspotMap({ hotspots }: HotspotMapProps) {
  const maxScore = Math.max(...hotspots.map((h) => h.score));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Hotspots</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hotspots.map((hotspot) => (
            <div key={hotspot.file} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{hotspot.file}</span>
                <span className="text-sm text-gray-500">
                  {hotspot.changes} changes
                </span>
              </div>
              <Progress
                value={(hotspot.score / maxScore) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 