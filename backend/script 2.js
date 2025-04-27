const express = require('express');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json()); // parse incoming JSON

const GEMINI_API_URL = 'https://api.gemini.com';

// Gemini API Request Helper
async function geminiRequest(endpoint, payload = {}) {
  const nonce = Date.now();
  const request = {
    request: endpoint,
    nonce: nonce.toString(),
    ...payload,
  };

  const base64Payload = Buffer.from(JSON.stringify(request)).toString('base64');
  const signature = crypto
    .createHmac('sha384', process.env.GEMINI_API_SECRET)
    .update(base64Payload)
    .digest('hex');

  const headers = {
    'X-GEMINI-APIKEY': process.env.GEMINI_API_KEY,
    'X-GEMINI-PAYLOAD': base64Payload,
    'X-GEMINI-SIGNATURE': signature,
    'Content-Type': 'text/plain',
  };

  try {
    const response = await axios.post(GEMINI_API_URL + endpoint, {}, { headers });
    return response.data;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

// Endpoint to place an order
app.post('/place-order', async (req, res) => {
  const orderData = req.body; // {symbol, amount, price, side, type}

  try {
    const response = await geminiRequest('/v1/order/new', {
      symbol: orderData.symbol,
      amount: orderData.amount,
      price: orderData.price,
      side: orderData.side,
      type: orderData.type,
      options: ['maker-or-cancel'], // optional
    });

    res.json(response);
  } catch (error) {
    res.status(500).send('Error placing order');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});