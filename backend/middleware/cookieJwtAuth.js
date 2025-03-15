import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const cookieJwtAuth = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const verified = jwt.verify(token, process.env.MY_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};