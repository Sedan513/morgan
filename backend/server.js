const express = require('express');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // To parse JSON bodies

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1', // or your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create Secrets Manager client
const secretsManager = new AWS.SecretsManager();

// Endpoint to just get the secrets (you already have this)
app.get('/get-secret', async (req, res) => {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();

    if ('SecretString' in data) {
      const secret = JSON.parse(data.SecretString);
      res.json(secret);
    } else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      const decodedBinarySecret = buff.toString('ascii');
      res.json(JSON.parse(decodedBinarySecret));
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving secret');
  }
});

// Helper function to load Gemini API keys from AWS Secrets Manager
async function loadGeminiKeys() {
  const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();
  
  if ('SecretString' in data) {
    const secret = JSON.parse(data.SecretString);
    return {
      apiKey: secret.GEMINI_API_KEY,
      apiSecret: secret.GEMINI_API_SECRET,
    };
  } else {
    const buff = Buffer.from(data.SecretBinary, 'base64');
    const decodedBinarySecret = buff.toString('ascii');
    const secret = JSON.parse(decodedBinarySecret);
    return {
      apiKey: secret.GEMINI_API_KEY,
      apiSecret: secret.GEMINI_API_SECRET,
    };
  }
}

// Helper function to make a signed Gemini API request
async function geminiRequest(endpoint, payload = {}) {
  const { apiKey, apiSecret } = await loadGeminiKeys(); // Load keys securely

  const GEMINI_API_URL = 'https://api.gemini.com';
  const url = GEMINI_API_URL + endpoint;
  const nonce = Date.now();

  const request = {
    request: endpoint,
    nonce: nonce.toString(),
    ...payload,
  };

  const base64Payload = Buffer.from(JSON.stringify(request)).toString('base64');
  const signature = crypto.createHmac('sha384', apiSecret).update(base64Payload).digest('hex');

  const headers = {
    'X-GEMINI-APIKEY': apiKey,
    'X-GEMINI-PAYLOAD': base64Payload,
    'X-GEMINI-SIGNATURE': signature,
    'Content-Type': 'text/plain',
  };

  try {
    const response = await axios.post(url, {}, { headers });
    return response.data;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

// New endpoint: Place an order
app.post('/place-order', async (req, res) => {
  const { symbol, amount, price, side, type } = req.body;

  try {
    const response = await geminiRequest('/v1/order/new', {
      symbol,
      amount,
      price,
      side,
      type,
      options: ['maker-or-cancel'], // Optional Gemini options
    });

    res.json(response);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Error placing order');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});