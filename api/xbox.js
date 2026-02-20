export default async function handler(req, res) {
  // CORS headers — allow your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const { url, method, headers, body } = req.body;

    // Only allow Xbox-related domains
    const allowed = [
      'login.live.com',
      'user.auth.xboxlive.com',
      'xsts.auth.xboxlive.com',
      'profile.xboxlive.com',
      'gameclipsmetadata.xboxlive.com',
    ];

    const parsed = new URL(url);
    if (!allowed.includes(parsed.hostname)) {
      return res.status(403).json({ error: 'Domain not allowed: ' + parsed.hostname });
    }

    // Forward the request
    const response = await fetch(url, {
      method: method || 'POST',
      headers: headers || { 'Content-Type': 'application/json' },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    });

    const text = await response.text();

    // Try to parse as JSON, otherwise return raw
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return res.status(response.status).json({
      status: response.status,
      data: data,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
