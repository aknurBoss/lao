// Cloudflare Pages Function: /api/tts?q=...&tl=th
// Proxies TTS audio as same-origin audio/mpeg so iOS Safari, Android Chrome, and Telegram WebView play it without CORS or Referer blocks.

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const tl = url.searchParams.get('tl') || 'th';

  if (!q.trim()) {
    return new Response('Missing q parameter', { status: 400 });
  }

  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
    tl
  )}&q=${encodeURIComponent(q.trim())}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
    });

    if (!response.ok) {
      return new Response('TTS upstream error', { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response('TTS fetch failed', { status: 500 });
  }
}
