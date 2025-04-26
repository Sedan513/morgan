const express = require('express');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1', // or your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create Secrets Manager client
const secretsManager = new AWS.SecretsManager();

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});