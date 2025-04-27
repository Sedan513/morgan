import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register new user
export async function registerUser(req, res) {
  try {
    console.log('Registration request body:', req.body);
    const { email, password, name, age, location } = req.body;

    // Validate required fields
    if (!email || !password || !name || !age || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          name: !name ? 'Name is required' : null,
          age: !age ? 'Age is required' : null,
          location: !location ? 'Location is required' : null
        }
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      hashedPassword,
      name,
      age,
      location,
      stocks: []
    });

    console.log('Attempting to save new user:', { email, name, age, location });
    await newUser.save();
    console.log('User saved successfully');
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
}

// Login user
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
}