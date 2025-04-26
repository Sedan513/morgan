const express = require('express');
const AWS = require('aws-sdk');

const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create Secrets Manager client
const secretsManager = new AWS.SecretsManager();
// Load Google API Key once
async function loadGoogleApiKey() {
  const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();
  
  if ('SecretString' in data) {
    const secret = JSON.parse(data.SecretString);
    return secret.GOOGLE_GEMINI_API_KEY;
  } else {
    const buff = Buffer.from(data.SecretBinary, 'base64');
    const decodedBinarySecret = buff.toString('ascii');
    const secret = JSON.parse(decodedBinarySecret);
    return secret.GOOGLE_GEMINI_API_KEY;
  }
}

// 🔥 New COMBINED function: Send prompt & get AI response
async function generateGeminiContent(prompt) {
  const apiKey = await loadGoogleApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const response = await axios.post(url, body, { headers });

  // 🔥 Here: directly parse and return the text (not full raw object)
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Invalid response from Gemini API');
  }

  return text; // 🔥 Clean, just the AI text
}
/*
// Final Route: Generate AI content with one simple call
app.post('/generate-content', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }
*/
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});