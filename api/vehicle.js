/**
 * Vercel Serverless Function
 * Deploy to Vercel - this file will automatically be available at /api/vehicle
 */

const API_KEY = 'ewVQwz_AVddGPGkxlzQJvKVt29-ExG-v';
const API_BASE_URL = 'https://api.dataovozidlech.cz/api/vehicletechnicaldata/v2';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://vininfo.cz');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vin, tp, orv } = req.query;

    // Validate that at least one parameter is provided
    if (!vin && !tp && !orv) {
      return res.status(400).json({ error: 'Missing required parameter: vin, tp, or orv' });
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
      return res.status(response.status).json({
        error: `API error: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

