export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;

    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
  error: 'Missing prompt',
  receivedBody: req.body,
  promptValue: prompt
});

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.error || 'Anthropic API error',
        raw: data
      });
    }

    const text = Array.isArray(data.content)
      ? data.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('')
      : '';

    return res.status(200).json({ text, raw: data });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}
