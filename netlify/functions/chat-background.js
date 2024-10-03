const axios = require('axios');

exports.handler = async (event, context) => {
  console.log("Background function started");

  try {
    const { api_key, model, messages, max_tokens, temperature } = JSON.parse(event.body);

    const response = await axios.post('https://api.unify.ai/v0/chat/completions', {
      model,
      messages,
      max_tokens,
      temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`
      }
    });

    const result = response.data;
    console.log("Chat processing completed");

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Error in background function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred while processing the chat" })
    };
  }
};