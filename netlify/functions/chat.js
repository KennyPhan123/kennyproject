const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { action, api_key, model, messages, max_tokens, temperature } = JSON.parse(event.body);

  try {
    if (action === 'getCredits') {
      const response = await axios.get('https://api.unify.ai/v0/credits', {
        headers: {
          'Authorization': `Bearer ${api_key}`
        }
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ credits: response.data.credits })
      };
    } else if (action === 'chat') {
      const response = await axios.post('https://api.unify.ai/v0/chat/completions', {
        model,
        messages,
        max_tokens,
        temperature,
        stream: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`
        },
        responseType: 'stream'
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
        body: response.data
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }
  } catch (error) {
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};