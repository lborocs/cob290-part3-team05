app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // Find user by username
    const user = users.find(u => u.username === username);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Compare password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }  // Token expires in 1 hour
    );
  
    // Send response with the token
    res.json({
      message: 'Login successful',
      token: token
    });
  });
  