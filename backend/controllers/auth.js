const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const login = async (req, res) => {
  try {
    console.log('--- Login Attempt ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, matching password...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful, generating token for role:', user.role?.name);
    const token = jwt.sign({ id: user._id }, 'SYNDITECH_SECRET_2026', { expiresIn: '1h' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role?.name || 'Employee',
      },
    });
  } catch (error) {
    console.error('CRITICAL Auth Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, roleName } = req.body;

    if (!email || !password || !name || !roleName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate company email (removed strict check for flexibility)

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role._id,
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing token
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  login,
  register,
  logout,
};