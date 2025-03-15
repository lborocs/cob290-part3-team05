import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Create a router to export
const router = express.Router();

// Import your database functions - adjust the path as needed
import { getUserByEmail } from '../database.js';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ error: "Email is Required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is Required" });
    }
    
    // Get user from database by email
    const user = await getUserByEmail(email);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }
    
    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    
    // Create token payload - don't include sensitive info
    const tokenPayload = {
      id: user.userID,
      email: user.userEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType
    };
    
    // Sign the JWT token
    const token = jwt.sign(
      tokenPayload,
      process.env.MY_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return the token along with basic user info
    res.status(200).json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// Register/Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, password2 } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({ error: "Email is Required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is Required" });
    }
    if (!password2) {
      return res.status(400).json({ error: "Confirm Password" });
    }
    if (password !== password2) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }
    
    // Validate email format
    const emailRegex = /^[\w\.-]+@make-it-all\.co\.uk$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    
    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already taken!" });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create new user (you'll need to update database.js to add this function)
    // const newUser = await createUser(email, passwordHash);
    
    res.status(201).json({
      success: true,
      message: "Account created successfully. Awaiting admin approval."
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;