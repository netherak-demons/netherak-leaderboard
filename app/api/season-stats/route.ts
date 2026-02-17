import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const LOG_PREFIX = '[API /api/season-stats]';

function logError(context: string, error: unknown, extra?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console.error('\n' + '═'.repeat(60));
  console.error(`❌ ${LOG_PREFIX} ${context}`);
  console.error('─'.repeat(60));
  console.error(`   Timestamp: ${timestamp}`);
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      console.error(`   ${key}:`, value);
    });
  }
  console.error('   Error:', error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error('   Stack:', error.stack);
  }
  console.error('═'.repeat(60) + '\n');
}

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
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.seasonId) {
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
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Write body to request (GET with body)
      req.write(bodyData);
      req.end();
    }).catch(async (error) => {
      // Fallback: try with fetch if https module fails
      if (process.env.NODE_ENV === 'development') {
        console.warn(`\n⚠️ ${LOG_PREFIX} HTTPS failed, trying fetch fallback:`, error instanceof Error ? error.message : error);
      }
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: bodyData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      return await response.text();
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
    } catch (e) {
      logError('Failed to parse upstream response', e, {
        responsePreview: responseText?.substring?.(0, 200),
      });
      return NextResponse.json(
        { error: 'Invalid upstream response' },
        { status: 502 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    logError('Unexpected error', error, {
      method: request.method,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
