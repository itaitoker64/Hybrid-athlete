// Vercel serverless function — proxies Gemini using a single shared key.
// Set GEMINI_API_KEY in the Vercel project's Environment Variables.
// The browser calls /api/ai and never sees the key.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed — use POST' });
    return;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not set on the deployment' });
    return;
  }
  const model = (req.query && req.query.model) || 'gemini-2.5-flash';
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body }
    );
    const text = await upstream.text();
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: 'Upstream error: ' + String((e && e.message) || e) });
  }
}
