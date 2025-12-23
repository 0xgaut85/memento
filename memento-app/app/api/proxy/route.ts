import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API Route for x402 requests
 * 
 * This bypasses CORS issues by forwarding requests from the browser
 * to the x402 server via server-to-server communication.
 * 
 * As per x402-solana README: https://github.com/PayAINetwork/x402-solana
 */

const X402_SERVER_URL = process.env.NEXT_PUBLIC_X402_SERVER_URL || 'https://x402.memento.money';

export async function POST(req: NextRequest) {
  try {
    const { url, method, headers, body } = await req.json();

    // Validate inputs
    if (!url || !method) {
      return NextResponse.json({ error: 'url and method required' }, { status: 400 });
    }

    // Prepare headers (preserve x402 payment headers)
    const requestHeaders: Record<string, string> = {
      'Content-Type': headers?.['Content-Type'] || 'application/json',
      'User-Agent': 'x402-solana-proxy/1.0',
    };

    // Copy all headers from the request, preserving x402 headers
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          requestHeaders[key] = value;
        }
      }
    }

    // Remove problematic headers
    delete requestHeaders['host'];
    delete requestHeaders['content-length'];

    // Resolve full URL if relative
    const fullUrl = url.startsWith('http') ? url : `${X402_SERVER_URL}${url}`;

    console.log('[Proxy] Forwarding request:', { url: fullUrl, method, hasPaymentHeader: !!headers?.['PAYMENT-SIGNATURE'] });

    // Make request to target endpoint
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: requestHeaders,
    };

    if (method.toUpperCase() !== 'GET' && body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(fullUrl, fetchOptions);

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

    console.log('[Proxy] Response:', { status: response.status, hasData: !!responseData });

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

