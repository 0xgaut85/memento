import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API Route for x402 requests
 * EXACTLY as per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

export async function POST(req: NextRequest) {
  try {
    const { url, method, headers, body } = await req.json();

    if (!url || !method) {
      return NextResponse.json({ error: 'url and method required' }, { status: 400 });
    }

    // Prepare headers - preserve x402 payment headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': headers?.['Content-Type'] || 'application/json',
      'User-Agent': 'x402-solana-proxy/1.0',
      ...(headers || {}),
    };

    // Remove problematic headers
    delete requestHeaders['host'];
    delete requestHeaders['content-length'];

    // Make request to target endpoint
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (method.toUpperCase() !== 'GET' && body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // Parse response
    const contentType = response.headers.get('content-type') || '';
    let responseData: unknown;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Prepare response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'content-length'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // IMPORTANT: Return 200 with real status in body
    // This allows proper x402 402 Payment Required handling
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      contentType,
    }, { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Proxy] Error:', message);
    return NextResponse.json({
      error: 'Proxy request failed',
      details: message
    }, { status: 500 });
  }
}
