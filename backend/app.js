import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  getUsers,
  getUser,
  createUser,
  getUserByEmail,
  getProjects,
  getProjectData,
  getChats,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  leaveGroup,
  updateGroupTitle,
  getNonMembers,
  addMemberToGroup,
  deleteChat,
  createChat,
  getUsersNotInPrivateWith,
  getUsersNotCurrent
} from './database.js';
import http from 'http';
import { Server } from 'socket.io';

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
app.get("/users", authenticateToken, async (req, res) => {
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

// Add project endpoints
app.get("/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await getProjects();
    res.send(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const project = await getProjectData(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.send(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error while fetching project" });
  }
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

    // Create and sign JWT
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2h",
    });

    // Return token to client
    res.json({
      message: "Login successful",
      accessToken,
      user: payload,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

const server = http.createServer(app);

// Socket.IO initialization
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"]
  },
  path: "/socket.io"
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join chat room
  socket.on("joinChat", (chatID) => {
    socket.join(chatID);
    console.log(`Socket ${socket.id} joined chat ${chatID}`);
  });

  // Receive and broadcast new message
  socket.on("sendMessage", (messageData) => {
    io.to(messageData.chatID).emit("receiveMessage", messageData);
  });

  // Handle typing indicator
  socket.on("userTyping", ({ userID, userName, chatID }) => {
    // Broadcast to others in the same chat room that someone is typing
    socket.to(chatID).emit("userTyping", { userID, userName, chatID });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.get("/chats/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const chats = await getChats(userID);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/chats/:chatID/messages", async (req, res) => {
  try {
    const chatID = req.params.chatID;
    const messages = await getMessages(chatID);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/chats/:chatID/messages", async (req, res) => {
  try {
    const { chatID } = req.params;
    const { senderUserID, messageText } = req.body;

    if (!senderUserID || !messageText.trim()) {
      return res.status(400).json({ message: "senderUserID and messageText are required." });
    }

    const newMessage = await sendMessage(chatID, senderUserID, messageText);

    if (!newMessage) {
      return res.status(500).json({ message: "Failed to send message" });
    }

    res.status(201).json({
      messageID: newMessage.messageID,
      senderUserID: newMessage.senderUserID,
      chatID: newMessage.chatID,
      messageText: newMessage.messageText,
      timestamp: newMessage.timestamp,
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.delete("/messages/:messageID", async (req, res) => {
  const { messageID } = req.params;

  try {
    const deleted = await deleteMessage(messageID);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/messages/:messageID", async (req, res) => {
  const { messageID } = req.params;
  const { newText } = req.body;

  if (!newText?.trim()) {
    return res.status(400).json({ message: "New text is required." });
  }

  const success = await editMessage(messageID, newText);
  if (success) {
    res.status(200).json({ message: "Message updated." });
  } else {
    res.status(404).json({ message: "Message not found." });
  }
});

app.put("/chats/:chatID/title", async (req, res) => {
  const { chatID } = req.params;
  const { newTitle } = req.body;

  try {
    await updateGroupTitle(chatID, newTitle);
    res.status(200).json({ message: "Chat title updated" });
  } catch (err) {
    console.error("Error updating chat title:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/chats/:chatID/non-members", async (req, res) => {
  const { chatID } = req.params;
  try {
    const users = await getNonMembers(chatID);
    res.json(users);
  } catch (err) {
    console.error("Error fetching non-members:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/chats/:chatID/members", async (req, res) => {
  const { chatID } = req.params;
  const { userID } = req.body;

  try {
    const systemMessage = await addMemberToGroup(chatID, userID);

    console.log("Emitting system message:", systemMessage);
    io.emit("receiveMessage", systemMessage);

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

app.post("/chats", async (req, res) => {
  const { chatName, chatType, creatorID, userIDList } = req.body;
  console.log(req.body)

  try {
    const { chatID, alreadyExists, systemMessage } = await createChat(chatName, chatType, creatorID, userIDList);

    if (systemMessage) {
      console.log("Emitting system message:", systemMessage);
      io.emit("receiveMessage", systemMessage);
    }

    res.status(200).json({ success: true, chatID, alreadyExists });
  } catch (err) {
    console.error("Error creating chat", err);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

app.get("/users/not-in-private-with/:userID", async (req, res) => {
  const { userID } = req.params

  try {
    const users = await getUsersNotInPrivateWith(userID)
    res.json(users)
  } catch(err) {
    console.error("Error fetching users", err)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

app.get("/users/not-current/:userID", async (req, res) => {
  const { userID } = req.params

  try {
    const users = await getUsersNotCurrent(userID)
    res.json(users)
  } catch(err) {
    console.error("Error fetching users", err)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

app.delete('/chats/:chatID/leave/:userID', async (req, res) => {
  const { chatID, userID } = req.params;

  try {
    const systemMessage = await leaveGroup(chatID, userID);
    io.to(chatID).emit("receiveMessage", systemMessage);
    res.status(200).json({ message: 'Left group', systemMessage });
  } catch (err) {
    console.error("Leave group error:", err.message);

    res.status(400).json({ error: err.message });
  }
});

app.delete('/chats/:chatID', async (req, res) => {
  const { chatID } = req.params;

  try {
    const result = await deleteChat(chatID);
    res.status(200).json(result);
  } catch (err) {
    console.error("Delete chat error:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

server.listen(8080, "127.0.0.1", () => {
  console.log("Server is running on port 8080");
});