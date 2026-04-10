// ============================================================
// GMNS Risk Intelligence — Cloudflare Worker (Anthropic API)
// ============================================================
// DEPLOYMENT (one-time setup):
// 1. Go to dash.cloudflare.com → Workers & Pages → Create Worker
// 2. Replace editor content entirely with this file
// 3. Settings → Variables → Environment Variables → Add:
//    Variable name:  ANTHROPIC_API_KEY
//    Value:          sk-ant-... (from console.anthropic.com → API Keys)
// 4. Change ALLOWED_ORIGIN to your actual GitHub Pages URL
// 5. Click Deploy → copy the Worker URL shown
// 6. Paste Worker URL into WORKER_URL constant in index.html
// ============================================================

const ALLOWED_ORIGIN = 'https://YOUR_GITHUB_USERNAME.github.io';
const ANTHROPIC_URL  = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VER  = '2023-06-01';

export default {
  async fetch(request, env) {

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age':       '86400',
        }
      });
    }

    // Block other origins
    const origin = request.headers.get('Origin') || '';
    if (!origin.startsWith(ALLOWED_ORIGIN.replace('/index.html', ''))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        }
      });
    }

    try {
      const body = await request.json();
      if (!body.max_tokens || body.max_tokens > 4000) body.max_tokens = 4000;

      const response = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         env.ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VER,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        }
      });
    }
  }
};
