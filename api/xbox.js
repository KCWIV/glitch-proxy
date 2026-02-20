export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { url, method, headers, body } = req.body;

    const allowed = [
      'login.live.com',
      'user.auth.xboxlive.com',
      'xsts.auth.xboxlive.com',
      'profile.xboxlive.com',
      'gameclipsmetadata.xboxlive.com',
    ];

    const parsed = new URL(url);
    if (!allowed.includes(parsed.hostname)) {
      return res.status(200).json({ status: 403, data: { error: 'Domain not allowed: ' + parsed.hostname } });
    }

    const fetchOpts = {
      method: method || 'GET',
      headers: headers || {},
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOpts);
    const text = await response.text();

    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return res.status(200).json({ status: response.status, data: data });
  } catch (err) {
    return res.status(200).json({ status: 500, data: { error: err.message } });
  }
}
