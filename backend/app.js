import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUsers, getUser, createUser, getUserByEmail, getUserChatIDs, getMessageWithSenderInfo, insertMessage } from "./database.js";
//import loginRoutes from "./routes/login.js";
import dotenv from "dotenv";

const app = express();

// Note ".env" is a local only file which is why there won't be one when we clone from repo
dotenv.config({ path: "./.env" });

// Define CORS options
// From your backend/app.js
const corsOptions = {
  origin: [
    "http://34.147.242.96",
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

//Function to authenticate call this when you need to authenticate token
function authenticateToken(req, res, next) {
  //Get the token from the header
  const authHeader = req.headers["authorization"];
  //Split the token (BEARER TOKEN)
  //Below just checks auth header exists first before splitting
  const token = authHeader && authHeader.split(" ")[1];

  //If token is null then return 401
  if (token == null) return res.sendStatus(401);

  //Verify the token
  //If we see a token we will verify if it true.
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

// Middleware to check for internal request header
function checkInternalRequest(req, res, next) {
  const internalRequest = req.get("X-Internal-Request");
  
  if (internalRequest !== "true") {
    return res.status(403).json({ message: "Forbidden: Internal request required" });
  }

  next();
}

// Apply internal request check for protected routes
app.use("/users", checkInternalRequest);

// Protected routes
app.get("/users", async (req, res) => {
  const users = await getUsers();
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await getUser(id);
  res.send(user);
});

app.post("/users", async (req, res) => {
  const { userEmail, firstName, lastName, userType } = req.body;
  const user = await createUser(userEmail, firstName, lastName, userType);
  res.status(201).send(user);
});


app.post("/login", async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email using the function within database.js
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Create JWT payload
    const payload = {
      id: user.userID,
      email: user.userEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
    };
    /*
    // Create and sign JWT
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    });

    // Return token to client
    res.json({
      message: "Login successful",
      accessToken,
      user: payload,
    });*/
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

// Websocket set up

import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://34.147.242.96"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Missing auth token"));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new Error("Invalid token"));
    socket.user = user;
    next();
  });
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.user.email);
  try {
    const chatIDs = await getUserChatIDs(socket.user.id);
    chatIDs.forEach(chatID => socket.join(`chat-${chatID}`));

    // Listen for incoming messages
    socket.on("send_message", async ({ chatID, messageText }) => {
      try {
        // Save to DB
        const messageID = await insertMessage(chatID, socket.user.id, messageText);

        // Get full message with sender info
        const fullMessage = await getMessageWithSenderInfo(messageID);

        // Emit to everyone in the chat room (except sender)
        socket.to(`chat-${chatID}`).emit("new_message", fullMessage);

        // Optional: echo to sender (if your frontend expects it)
        socket.emit("new_message", fullMessage);
      } catch (err) {
        console.error("Message handling error:", err);
        socket.emit("error_message", { error: "Message failed to send" });
      }
    });
  } catch (err) {
    console.error("Failed to find chats", err);
  }
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.user.email);
  });
});

server.listen(8080, "127.0.0.1", () => {
  console.log("Server (HTTP + WebSocket) running on port 8080");
});
