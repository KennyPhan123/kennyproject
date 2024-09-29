const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { api_key } = JSON.parse(event.body);

  if (!api_key) {
    return { statusCode: 400, body: JSON.stringify({ error: 'API key is required' }) };
  }

  try {
    const response = await axios.get('https://api.unify.ai/v0/get_credits', {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${api_key}`
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while fetching the balance' })
    };
  }
};