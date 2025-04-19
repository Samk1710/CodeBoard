'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ConventionList } from '@/components/playbook/ConventionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Convention {
  category: string;
  description: string;
  examples: string[];
  source: string;
}

export default function PlaybookPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConventions = async () => {
      try {
        const response = await fetch(
          `/api/analysis/playbook?repo=${params.repo}&role=${searchParams.get('role')}`
        );
        const data = await response.json();
        setConventions(data.conventions);
      } catch (error) {
        console.error('Error fetching conventions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConventions();
  }, [params.repo, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading team conventions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Team Playbook</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Development Conventions</CardTitle>
        </CardHeader>
        <CardContent>
          <ConventionList conventions={conventions} />
        </CardContent>
      </Card>
    </div>
  );
} 