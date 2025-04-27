import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { registerUser, loginUser } from './controllers/authController.js';
import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Validate connection string format
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
        !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB connection string format. Must start with mongodb:// or mongodb+srv://');
    }

    console.log('Attempting to connect to MongoDB...');
    // Log connection string with credentials hidden
    const maskedUri = process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//****:****@');
    console.log('Connection string:', maskedUri);

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    // If using direct connection (not SRV), force IPv4
    if (process.env.MONGODB_URI.startsWith('mongodb://')) {
      options.family = 4;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error details:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error name:', error.name);
    
    if (error.code === 'EBADNAME') {
      console.error('Invalid connection string format. Please check your MONGODB_URI in .env file.');
      console.error('Expected format: mongodb://username:password@host:port/database');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. Check your internet connection and DNS settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Check your network connection and firewall settings.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if MongoDB Atlas is running and your IP is whitelisted.');
    }
    
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

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create Secrets Manager client
const secretsManager = new AWS.SecretsManager();

// Load Google API Key from AWS Secrets Manager
async function loadGoogleApiKey() {
  try {
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
  } catch (error) {
    console.error('Error loading API key from AWS:', error);
    throw error;
  }
}

// Gemini API Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

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