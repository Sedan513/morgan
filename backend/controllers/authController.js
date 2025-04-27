import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Register new user
export async function registerUser(req, res) {
  try {
    const { username, email, password, name, age, location, birthday } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      hashedPassword,
      name,
      age,
      location,
      birthday: new Date(birthday),
      stocks: []
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
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