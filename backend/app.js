import express from 'express'
import cors from 'cors';
import { getUsers, getUser, createUser, getUserByEmail } from './database.js'
import jwt from 'jsonwebtoken'

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

let refreshTokens = []

//Authentication code
app.post("/token", async(req, res) => {
  const refreshToken = req.body.token
  if(refreshToken == null) {
    return res.status(401)
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403)
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=> {
    if(err) {
      return res.status(403)
    }
    const accessToken = generateAccessToken({userEmail: user.userEmail})
    res.json({accessToken: accessToken})
  })

})

app.delete("/logout", async(req,res) => {
  refreshTokens.filter(token => token !== req.body.token)
  res.status(204)
})

app.post("/login", async (req, res) => {
  const userEmail = req.body.userEmail
  const user = await getUserByEmail(userEmail)
  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)

  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(' ')[1]

  if(token == null) {
    return res.status(401)
  }
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user) => {
    if (err) {
      return res.status(403)
    }
    req.user = user
    next()
  })
  
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
}

app.get("/users", authenticateToken, async (req, res) => {
  const users = await getUsers()
  res.send(users.filter(user => user.userEmail === req.user.userEmail))
})

app.get("/users/:id", authenticateToken, async (req, res) => {
  const id = req.params.id
  const user = await getUser(id)
  res.send(user)
})

app.post("/users", authenticateToken, async (req, res) => {
  const { userEmail, firstName, lastName, userType } = req.body
  const user = await createUser(userEmail, firstName, lastName, userType)
  res.status(201).send(user)
})


app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Server Error')
})

app.listen(8080, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});


