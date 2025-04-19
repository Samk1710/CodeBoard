// pages/api/github.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepoInfo } from '@/lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" query parameter' });
  }

  try {
    const data = await getRepoInfo(url);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
