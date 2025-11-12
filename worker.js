/**
 * Cloudflare Worker
 * Deploy using: wrangler deploy
 */

const API_KEY = 'ewVQwz_AVddGPGkxlzQJvKVt29-ExG-v';
const API_BASE_URL = 'https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2';

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://vininfo.cz',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': 'https://vininfo.cz',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const vin = url.searchParams.get('vin');
      const tp = url.searchParams.get('tp');
      const orv = url.searchParams.get('orv');

      // Validate that at least one parameter is provided
      if (!vin && !tp && !orv) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: vin, tp, or orv' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://vininfo.cz',
            },
          }
        );
      }

      // Build API URL
      let apiUrl = API_BASE_URL;
      const params = new URLSearchParams();
      if (vin) {
        params.append('vin', vin);
      } else if (tp) {
        params.append('tp', tp);
      } else if (orv) {
        params.append('orv', orv);
      }
      apiUrl += `?${params.toString()}`;

      // Make request to the API
      const response = await fetch(apiUrl, {
        headers: {
          'api_key': API_KEY,
        },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `API error: ${response.status} ${response.statusText}` }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://vininfo.cz',
            },
          }
        );
      }

      const data = await response.json();

      // Return the data with CORS headers
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://vininfo.cz',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://vininfo.cz',
          },
        }
      );
    }
  },
};

