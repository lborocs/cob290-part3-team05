import express from 'express'
import cors from 'cors';
import { getUsers, getUser, createUser } from './database.js'
import loginRoutes from './routes/login.js'
import { cookieJwtAuth } from './middleware/cookieJwtAuth.js'

const app = express()

// Define CORS options
const corsOptions = {
  origin: ['http://34.147.242.96', 'http://localhost:3000', 'http://localhost:5173'], // Add local development URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers 
  credentials: true // This is important for cookies/authxw
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json())

// Apply login routes
app.use('/login', loginRoutes);

// Protected routes
app.get("/users", cookieJwtAuth, async (req, res) => {
  const users = await getUsers()
  res.send(users)
})

app.get("/users/:id", cookieJwtAuth, async (req, res) => {
  const id = req.params.id
  const user = await getUser(id)
  res.send(user)
})

app.post("/users", cookieJwtAuth, async (req, res) => {
  const { userEmail, firstName, lastName, userType } = req.body
  const user = await createUser(userEmail, firstName, lastName, userType)
  res.status(201).send(user)
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server Error')
})

app.listen(8080, '0.0.0.0', () => {
  console.log('Server is running on port 8080');
});