export const runtime = 'nodejs';

export async function GET() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'Missing ANTHROPIC_API_KEY' },
        { status: 500 }
      );
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      return Response.json(
        {
          error: data?.error?.message || data?.error || 'Anthropic API error',
          raw: data
        },
        { status: anthropicResponse.status }
      );
    }

    const text = Array.isArray(data.content)
      ? data.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('')
      : '';

    return Response.json({ text, raw: data }, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: error?.message || 'Server error'
      },
      { status: 500 }
    );
  }
}
