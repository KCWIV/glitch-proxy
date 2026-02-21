export default async function handler(req, res) {
  // CORS - allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { url, method, headers, body } = req.body;

    if (!url) return res.status(200).json({ ok: false, error: 'Missing url parameter' });

    // Whitelist only Xbox-related domains
    const hostname = new URL(url).hostname;
    const allowed = [
      'login.live.com',
      'user.auth.xboxlive.com',
      'xsts.auth.xboxlive.com',
      'profile.xboxlive.com',
      'gameclipsmetadata.xboxlive.com',
      'peoplehub.xboxlive.com',
      'social.xboxlive.com',
      'titlehub.xboxlive.com',
    ];

    if (!allowed.includes(hostname)) {
      return res.status(200).json({ ok: false, error: 'Domain not allowed: ' + hostname });
    }

    // Build fetch options
    const opts = { method: method || 'GET', headers: headers || {} };

    // Attach body for non-GET requests
    if (body !== undefined && body !== null && opts.method !== 'GET') {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Make the request to Xbox
    const response = await fetch(url, opts);
    const text = await response.text();

    // Parse response
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return res.status(200).json({
      ok: response.ok,
      status: response.status,
      data: data,
    });
  } catch (err) {
    return res.status(200).json({ ok: false, status: 500, error: err.message });
  }
}
