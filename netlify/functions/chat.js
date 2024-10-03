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

      // Instead of returning the stream directly, we'll process it and return chunks
      return new Promise((resolve, reject) => {
        let responseBody = '';
        response.data.on('data', (chunk) => {
          responseBody += chunk.toString();
        });
        response.data.on('end', () => {
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'text/plain',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            },
            body: responseBody
          });
        });
        response.data.on('error', (err) => {
          reject({
            statusCode: 500,
            body: JSON.stringify({ error: 'Stream processing error' })
          });
        });
      });
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};