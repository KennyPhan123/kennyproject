const https = require('https');

exports.handler = async function(event, context) {
  console.log('Function invoked');

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed');
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let api_key;
  try {
    const body = JSON.parse(event.body);
    api_key = body.api_key;
    console.log('API key received (first 4 chars):', api_key.substring(0, 4));
  } catch (error) {
    console.error('Error parsing request body:', error);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!api_key) {
    console.log('No API key provided');
    return { statusCode: 400, body: JSON.stringify({ error: 'API key is required' }) };
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.unify.ai',
      port: 443,
      path: '/v1/billing/credits',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${api_key}`
      }
    };

    console.log('Request options:', JSON.stringify(options));

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response headers:', JSON.stringify(res.headers));
        console.log('Response data:', data);

        resolve({
          statusCode: res.statusCode,
          body: JSON.stringify({
            status: res.statusCode,
            headers: res.headers,
            data: data
          })
        });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      resolve({
        statusCode: 500,
        body: JSON.stringify({
          error: 'An error occurred while fetching the balance',
          details: error.message
        })
      });
    });

    req.end();
  });
};