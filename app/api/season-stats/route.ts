import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import crypto from 'crypto';

function logError(_context: string, _error: unknown, _extra?: Record<string, unknown>) {}
function logInfo(_context: string, _extra?: Record<string, unknown>) {}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests with a JSON body containing seasonId',
      example: {
        method: 'POST',
        body: {
          seasonId: '0',
          limit: 50,
          lastKey: null
        }
      }
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomBytes(4).toString('hex');
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    
    logInfo('Request received', {
      requestId,
      method: request.method,
      body: { seasonId: body.seasonId, limit: body.limit, hasLastKey: !!body.lastKey },
    });
    
    // Validate required fields
    if (!body.seasonId) {
      logError('Validation error', new Error('seasonId is required'), {
        requestId,
        body: body,
      });
      return NextResponse.json(
        { error: 'seasonId is required' },
        { status: 400 }
      );
    }
    
    // Prepare request body with only the fields we need
    const requestBody: any = {
      seasonId: body.seasonId,
    };
    
    if (body.limit) {
      requestBody.limit = body.limit;
    }
    
    if (body.lastKey) {
      requestBody.lastKey = body.lastKey;
    }

    // AWS API expects GET with body (non-standard)
    const apiUrl = 'https://yv97bn1mj3.execute-api.us-east-1.amazonaws.com/stage-1/stats/season';
    const apiKey = process.env.NETHERAK_API_KEY;
    
    if (!apiKey) {
      logError('Configuration error', new Error('NETHERAK_API_KEY not set'), {
        hint: 'Add NETHERAK_API_KEY to .env.local',
      });
      return NextResponse.json(
        { error: 'Server configuration error: API key not configured' },
        { status: 500 }
      );
    }
    
    // Validate and sanitize input
    const seasonId = String(requestBody.seasonId || '0').trim();
    const limit = Math.min(Math.max(parseInt(String(requestBody.limit || 50)), 1), 100);
    const lastKey = requestBody.lastKey ? String(requestBody.lastKey).trim() : null;
    
    // Validate seasonId format
    if (!/^[a-zA-Z0-9_-]+$/.test(seasonId)) {
      return NextResponse.json(
        { error: 'Invalid seasonId format' },
        { status: 400 }
      );
    }
    
    // Build sanitized body
    const bodyData = JSON.stringify({
      seasonId,
      limit,
      ...(lastKey && /^[a-zA-Z0-9_-]+$/.test(lastKey) ? { lastKey } : {})
    });
    
    // AWS API expects GET with body (non-standard HTTP)
    // Use Node.js https module to make GET request with body
    const url = new URL(apiUrl);
    const responseText = await new Promise<string>((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'Content-Length': Buffer.byteLength(bodyData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`);
            logError('Upstream API error (HTTPS)', error, {
              requestId,
              statusCode: res.statusCode,
              responseBody: data.substring(0, 500),
              apiUrl: apiUrl,
            });
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        logError('HTTPS request error', error, {
          requestId,
          apiUrl: apiUrl,
          hostname: url.hostname,
        });
        reject(error);
      });

      // Write body to request (GET with body)
      req.write(bodyData);
      req.end();
    });
    
    const awsRes = { statusCode: 200 }; // Success if we got here
    
    if (awsRes.statusCode < 200 || awsRes.statusCode >= 300) {
      logError('Upstream API error', new Error(`HTTP ${awsRes.statusCode}`), {
        statusCode: awsRes.statusCode,
        responseBody: responseText,
      });
      return NextResponse.json(
        { 
          error: `API Error: ${awsRes.statusCode}`,
          details: responseText || 'No error details available'
        },
        { status: awsRes.statusCode }
      );
    }
    
    // Parse and sanitize response (remove email if present)
    let data;
    try {
      data = JSON.parse(responseText);
      
      // Remove email from profile if present
      if (data.seasonStats && Array.isArray(data.seasonStats)) {
        data.seasonStats = data.seasonStats.map((player: any) => {
          if (player.profile && player.profile.email) {
            const { email, ...profileWithoutEmail } = player.profile;
            return {
              ...player,
              profile: profileWithoutEmail
            };
          }
          return player;
        });
      }
      
      const duration = Date.now() - startTime;
      logInfo('Request successful', {
        requestId,
        duration: `${duration}ms`,
        playersCount: data.seasonStats?.length || 0,
        seasonId: data.seasonId,
      });
    } catch (e) {
      logError('Failed to parse upstream response', e, {
        requestId,
        responsePreview: responseText?.substring?.(0, 500),
        responseLength: responseText?.length || 0,
        contentType: 'application/json',
      });
      return NextResponse.json(
        { error: 'Invalid upstream response format' },
        { status: 502 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorType = error instanceof Error ? error.constructor.name : typeof error;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logError('Request failed', error, {
      requestId,
      duration: `${duration}ms`,
      errorType,
      errorMessage,
      errorStack: errorStack?.split('\n').slice(0, 10).join('\n'), // First 10 lines of stack
      method: request.method,
      url: request.url,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        requestId, // Include request ID for debugging
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}
