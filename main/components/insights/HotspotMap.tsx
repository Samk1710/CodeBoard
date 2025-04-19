'use client';

interface HotspotMapProps {
  hotspots: Array<{
    file: string;
    score: number;
    changes: number;
  }>;
}

export function HotspotMap({ hotspots }: HotspotMapProps) {
  const maxScore = Math.max(...hotspots.map(h => h.score));
  
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Code Hotspots</h2>
      <div className="space-y-4">
        {hotspots.map((hotspot, index) => {
          const intensity = (hotspot.score / maxScore) * 100;
          return (
            <div key={index} className="flex items-center gap-4">
              <div className="min-w-[200px] truncate font-mono text-sm">
                {hotspot.file}
              </div>
              <div className="flex flex-1 items-center gap-2">
                <div className="h-4 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${intensity}%` }}
                  />
                </div>
                <div className="min-w-[100px] text-sm text-gray-600">
                  {hotspot.changes} changes
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}