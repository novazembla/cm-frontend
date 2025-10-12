import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { file } = req.query;

  if (typeof file !== 'string' || !file.includes('sitemap') || !file.endsWith('.xml')) {
    return res.status(400).send('Invalid sitemap file.');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sitemap/${file}`);
    const contentType = response.headers.get('content-type') ?? 'application/xml; charset=UTF-8';
    const body = await response.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Expires', 'Mon, 23 Jul 1997 05:00:00 GMT');
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
}
