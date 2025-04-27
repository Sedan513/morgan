import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { registerUser, loginUser } from './controllers/authController.js';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';
//import { fetch8KHtmlFromTicker } from './sec-functions/fetch8K.js';
//import { fetch10KHtmlFromTicker } from './sec-functions/fetch10K.js';
//import { fetch10QHtmlFromTicker } from './sec-functions/fetch10Q.js';
import { fetchFilingSection } from './sec-functions/fetch.js';
import User from './models/User.js';
import { getNews } from './sec-functions/getNews.js';

dotenv.config();
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

const app = express();
const port = 5001;  // Explicitly set to 5001

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/add-stock', authenticateToken, async (req, res) => {
  try {
    const { ticker, name, shares, date } = req.body;
    if (!ticker || !name || !shares || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the user by ID from the JWT
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Add the new stock to the user's stocks array
    user.stocks.push({
      symbol: ticker,
      quantity: shares,
      averagePrice: 0, // You can add a field for price if you want
      purchaseDate: date,
      companyName: name
    });

    await user.save();
    res.json({ message: 'Stock added successfully', stocks: user.stocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', uri);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Call the connectDB function
connectDB();

// Authentication routes
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully', user: req.user });
});

app.get('/api/full-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-hashedPassword');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const secretsManager = new AWS.SecretsManager();

// Load Google API Key from AWS Secrets Manager
async function loadGoogleApiKey() {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();
    
    if ('SecretString' in data) {
      const secret = JSON.parse(data.SecretString);
      return secret.gemini;
    } else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      const decodedBinarySecret = buff.toString('ascii');
      const secret = JSON.parse(decodedBinarySecret);
      return secret.gemini;
    }
  } catch (error) {
    console.error('Error loading API key from AWS:', error);
    throw error;
  }
}
// Load SEC API Key from AWS Secrets Manager
async function loadSecApiKey() {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();
    if ('SecretString' in data) {
      const secret = JSON.parse(data.SecretString);
      return secret.sec;
    } else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      const decodedBinarySecret = buff.toString('ascii');
      const secret = JSON.parse(decodedBinarySecret);
      return secret.sec;
    }
  } catch (error) {
    console.error('Error loading SEC API key from AWS:', error);
    throw error;
  }
}

async function loadFMPApiKey() {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ID }).promise();
    if ('SecretString' in data) {
      const secret = JSON.parse(data.SecretString);
      return secret.fmp;
    }
    else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      const decodedBinarySecret = buff.toString('ascii');
      const secret = JSON.parse(decodedBinarySecret);
      return secret.fmp;
    }
  } catch (error) {
    console.error('Error loading FMP API key from AWS:', error);
    throw error;
  }
}
export { loadFMPApiKey };

// Gemini API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

// Gemini API Request Helper
async function generateGeminiContent(prompt) {
  try {
    const apiKey = await loadGoogleApiKey();
    const url = `${GEMINI_API_URL}?key=${apiKey}`;

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
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('Invalid response from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

// Generate content endpoint (protected)
app.post('/api/generate-content', authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }

  try {
    const generatedText = await generateGeminiContent(prompt);
    res.json({ text: generatedText });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Error generating content from Gemini' });
  }
});

app.post('/api/sec-filings', authenticateToken, async (req, res) => {
  const { ticker, type } = req.body;
  if (!ticker || !type) {
    return res.status(400).json({ error: 'Ticker and type are required' });
  }
  try {
    let result;
    if (type === '8K') {
      result = await fetchFilingSection(ticker, '8-K');
    } else if (type === '10K') {
      result = await fetchFilingSection(ticker, '10-K');
    } else if (type === '10Q') {
      result = await fetchFilingSection(ticker, '10-Q');
    } else {
      return res.status(400).json({ error: 'Invalid filing type' });
    }
    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch SEC filing' });
  }
});

app.post('/api/news', authenticateToken, async (req, res) => {
  const { ticker } = req.body;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }
  try {
    const news = await getNews(ticker);
    res.json({ news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
});

const handleAddStockSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/add-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ticker: newStock.ticker,
        name: newStock.name,
        shares: newStock.shares,
        date: newStock.date
      })
    });
    const data = await response.json();
    if (response.ok) {
      // Optionally update local state with new stocks
      setStocks(data.stocks);
      setShowAddModal(false);
      setNewStock({ ticker: '', name: '', shares: '', date: '' });
    } else {
      alert(data.error || 'Failed to add stock');
    }
  } catch (err) {
    alert('Network error');
  }
};

export { loadSecApiKey };