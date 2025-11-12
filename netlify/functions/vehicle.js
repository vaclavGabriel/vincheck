/**
 * Netlify Serverless Function
 * Deploy to Netlify - this file will automatically be available at /.netlify/functions/vehicle
 */

const API_KEY = 'ewVQwz_AVddGPGkxlzQJvKVt29-ExG-v';
const API_BASE_URL = 'https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2';

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://vininfo.cz',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { vin, tp, orv } = event.queryStringParameters || {};

    // Validate that at least one parameter is provided
    if (!vin && !tp && !orv) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: vin, tp, or orv' }),
      };
    }

    // Build API URL
    let apiUrl = API_BASE_URL;
    if (vin) {
      apiUrl += `?vin=${encodeURIComponent(vin)}`;
    } else if (tp) {
      apiUrl += `?tp=${encodeURIComponent(tp)}`;
    } else if (orv) {
      apiUrl += `?orv=${encodeURIComponent(orv)}`;
    }

    // Make request to the API
    const response = await fetch(apiUrl, {
      headers: {
        'api_key': API_KEY,
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `API error: ${response.status} ${response.statusText}`,
        }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

