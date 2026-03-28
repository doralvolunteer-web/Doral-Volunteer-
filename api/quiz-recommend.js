export default async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

const { prompt } = req.body;

if (!prompt || typeof prompt !== ‘string’) {
return res.status(400).json({ error: ‘Missing prompt’ });
}

const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’
},
body: JSON.stringify({
model: ‘claude-sonnet-4-5-20250929’,
max_tokens: 1000,
messages: [{ role: ‘user’, content: prompt }]
})
});

const data = await response.json();
const text = data.content.map(b => b.type === ‘text’ ? b.text : ‘’).join(’’);

return res.status(200).json({ text });
}
