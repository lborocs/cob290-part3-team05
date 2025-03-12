import express from 'express'
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { getUsers, getUser, createUser } from './database.js'

const app = express()

// Define CORS options
const corsOptions = {
  origin: 'http://34.147.242.96', // Allow requests only from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers 
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json())

const apiServer = 'http://34.147.242.96:8080';

// Create a reverse proxy middleware
app.use('/api', createProxyMiddleware({
  target: apiServer,  // Where to forward the request
  changeOrigin: true,  // Changes the origin header to match the target
  pathRewrite: {
    '^/api': '', // Remove '/api' prefix when forwarding to the backend
  },
  onProxyReq: (proxyReq, req, res) => {
    // You can manipulate the request before it's sent to the target server here if needed
    console.log(`Proxying request to: ${apiServer}${req.url}`);
  },
}));

app.get("/users", async (req, res) => {
  const users = await getUsers()
  res.send(users)
})

app.get("/users/:id", async (req, res) => {
  const id = req.params.id
  const user = await getUser(id)
  res.send(user)
})

app.post("/users", async (req, res) => {
  const { userEmail, firstName, lastName, userType } = req.body
  const user = await createUser(userEmail, firstName, lastName, userType)
  res.status(201).send(user)
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server Error')
})

app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});


