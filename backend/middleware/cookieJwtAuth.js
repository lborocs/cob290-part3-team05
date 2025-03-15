const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.json()); // For parsing JSON bodies

// Dummy database (you'll use an actual database in production)
const users = [
  {
    id: 1,
    username: "john_doe",
    password: "$2a$10$KqGH2jcG.bKht0i6XQ/RnO/69n3uUpPL.P90s39OtW1x0N/QmrH9a" // hashed password for "password123"
  }
];

// JWT Secret Key (Use a more secure secret in production)
const JWT_SECRET = 'your_jwt_secret_key';
