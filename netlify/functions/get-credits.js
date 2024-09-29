const axios = require('axios');

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

  try {
    console.log('Sending request to Unify API');
    const response = await axios.get('https://api.unify.ai/v1/get_credits', {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${api_key}`
      }
    });
    console.log('Response received:', response.data);

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error fetching credits:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'An error occurred while fetching the balance',
        details: error.response ? error.response.data : error.message
      })
    };
  }
};