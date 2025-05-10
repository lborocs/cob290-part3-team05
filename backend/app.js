import express, { response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import {
  getUsers,
  getUser,
  createUser,
  getUserByEmail,
  getProjects,
  getProjectData,
  
  isLeadingProject,
  getProjectsTeamLeader,
  getNumProjectUser,
  getNumCompletedTasks,
  getWorkLoadUser,
  getNumTasksUser,
  getDoughnutData,
  getNumTasksProj,
  getRecentActivityUser,
  getGanttChartData,
  getAllTasksByProject,
  getTotalTasksByProject,
  getUserTasksProject,
  getBurnDownData,
  getRecentActivityProject,
  
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
  getChatMembers,
  markChatAsRead,
  getUnreadMessageCounts,
  getUsersNotInPrivateWith,
  getUsersNotCurrent,
  insertAttachment,
  getAttachmentById,
  getAttachmentsForMessage
} from "./database.js";
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    return res
      .status(403)
      .json({ message: "Forbidden: Internal request required" });
  }

  next();
}

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

app.get("/users/:id/analytics", authenticateToken, async (req, res) => {
  // Check if admin or manager

  const id = req.params.id;
  const numProject = await getNumProjectUser(id);
  const numTasks = await getNumTasksUser(id);
  const numCompletedTasks = await getNumCompletedTasks(id);
  const workLoadUser = await getWorkLoadUser(id);
  const doughnutData = await getDoughnutData(id);
  const taskByProject = await getNumTasksProj(id);
  const recentActivityUser = await getRecentActivityUser(id);
  const ganttChartData = await getGanttChartData(id);

  const taskCompletionRate = (numCompletedTasks / numTasks) * 100;

  const workloadImpact = 100 / workLoadUser;

  // Calculate the Productivity Score (weighted average)
  const productivityScore =
    taskCompletionRate * 0.5 + workloadImpact * 0.3 + 100 * 0.2;

  const roundedProductivityScore = Number(productivityScore.toFixed(0));

  const responseData = {
    numProjects: numProject,
    numTasks: numTasks,
    numCompletedTasks: numCompletedTasks,
    workLoadUser: workLoadUser,
    productivityScore: roundedProductivityScore,
    doughnutData: doughnutData,
    taskByProject: taskByProject,
    recentActivityUser: recentActivityUser,
    ganttChartData: ganttChartData,
  };
  res.send(responseData);
});

app.post("/users", async (req, res) => {
  const { userEmail, firstName, lastName, userType } = req.body;
  const user = await createUser(userEmail, firstName, lastName, userType);
  res.status(201).send(user);
});

// Add project endpoints
app.get("/projects", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.userType;
    const userID = req.user.id;

    // If user is team leader just show projects they are leading or a employee on
    if (userRole === "TeamLeader") {
      const projects = await getProjectsTeamLeader(userID);
      return res.send(projects);
    }

    // If user is employee don't show projects
    if (userRole === "Employee") {
      return res.status(403).json({
        message: "Forbidden: Employees do not have access to project data",
      });
    }

    const projects = await getProjects();
    res.send(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

app.get("/project/:id", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.userType;
    const id = req.params.id;
    const userID = req.user.id;

    //Check permission of they can see the project data or not
    if (userRole !== "System" && userRole !== "Manager") {
      const hasAccess = await isLeadingProject(userID, id);
      if (!hasAccess) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this project",
        });
      }
    }

    const project = await getProjectData(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const responseData = {
      project: project,
      userRole: userRole,
      userID: userID,
    };

    res.send(responseData);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error while fetching project" });
  }
});

//Project Analytics
app.get("/project/:id/analytics", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.userType;
    const id = req.params.id;
    const userID = req.user.id;

    //Check permission of they can see the project data or not
    if (userRole !== "System" && userRole !== "Manager") {
      const hasAccess = await isLeadingProject(userID, id);
      if (!hasAccess) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have permission to access this project",
        });
      }
    }

    //Getting Project Data write function getProjectData
    const projectOverviewData = await getProjectData(id);
    if (!projectOverviewData) {
      return res.status(404).json({ message: "Project not found" });
    }

    //Sawan Here
    const doughnutData = await getAllTasksByProject(id);
    const totalTasks = await getTotalTasksByProject(id);
    const taskPerUser = await getUserTasksProject(id);
    const burndownData = await getBurnDownData(id);
    const recentActivityProject = await getRecentActivityProject(id);

    const responseData = {
      projectData: projectOverviewData,
      userRole: userRole,
      userID: userID,
      doughnutData: doughnutData,
      totalTasks: totalTasks,
      taskPerUser: taskPerUser,
      burndownData: burndownData,
      recentActivityProject: recentActivityProject,
    };

    res.send(responseData);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server error while fetching project" });
  }
});

// Project Analytics

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
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://34.147.242.96",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/socket.io/"
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join chat room
  socket.on("joinChat", (chatID) => {
    socket.join(chatID);
    console.log(`Socket ${socket.id} joined chat ${chatID}`);
  });

  // Receive and broadcast new message with attachment
  socket.on("sendMessage", async (messageData) => {
    const { senderUserID, chatID, messageText, attachment } = messageData;

    try {
      // Fetch sender details
      const sender = await getUser(senderUserID);
      const senderName = sender?.firstName && sender?.lastName
        ? `${sender.firstName} ${sender.lastName}`
        : "Unknown";

      // Create the message object with attachment info if present
      const message = {
        senderUserID,
        chatID,
        messageText,
        timestamp: new Date().toISOString(),
        senderName,
        attachment: attachment ? {
          attachmentID: attachment.attachmentID,
          fileName: attachment.fileName,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          downloadUrl: `/messages/${attachment.attachmentID}/attachment`, // URL to download attachment
        } : null,
      };

      // Broadcast the message to the specified chat room
      io.to(chatID).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error getting sender for socket message:", error);

      // Broadcast the message even if sender lookup fails
      io.to(chatID).emit("receiveMessage", {
        senderUserID,
        chatID,
        messageText,
        timestamp: new Date().toISOString(),
        senderName: "Unknown",
        attachment: null,
      });
    }
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

    // Get messages for the chat
    const messages = await getMessages(chatID);

    // Fetch attachments for each message (if any)
    const messagesWithAttachments = await Promise.all(
      messages.map(async (message) => {
        // Get the attachment for the message (if any)
        const attachments = await getAttachmentsForMessage(message.messageID);

        // Construct the message with attachment details
        return {
          ...message,
          attachment: attachments.length > 0 ? {
            attachmentID: attachments[0].attachmentID,
            fileName: attachments[0].fileName,
            fileType: attachments[0].fileType,
            fileSize: attachments[0].fileSize,
            downloadUrl: `/messages/${attachments[0].attachmentID}/attachment`,
          } : null, // Include attachment data or null if no attachment
        };
      })
    );

    // Return the messages with attachment data
    res.json(messagesWithAttachments);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/chats/:chatID/messages", upload.single("file"), async (req, res) => {
  try {
    const { chatID } = req.params;
    const { senderUserID, messageText } = req.body;
    const file = req.file;

    if (!senderUserID || (!messageText.trim() && !file)) {
      return res.status(400).json({ message: "Message text or file required." });
    }

    // Step 1: Insert the message without the file
    const newMessage = await sendMessage(chatID, senderUserID, messageText.trim() || "");

    if (!newMessage) {
      return res.status(500).json({ message: "Failed to send message" });
    }

    // Step 2: If a file was uploaded, insert the file as a separate record in the attachments table
    if (file) {
      await insertAttachment({
        messageID: newMessage.messageID,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        fileData: file.buffer, // Storing file data in memory (this could be changed to store on disk or cloud storage)
      });
    }

    // Step 3: Respond with message details and attachment (if available)
    const response = {
      messageID: newMessage.messageID,
      senderUserID: newMessage.senderUserID,
      chatID: newMessage.chatID,
      messageText: newMessage.messageText,
      timestamp: newMessage.timestamp,
    };

    // Include attachment information if present
    if (file) {
      response.attachment = {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      };
    }

    res.status(201).json(response);

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.delete("/messages/:messageID", async (req, res) => {
  const { messageID } = req.params;

  try {
    const chatID = await deleteMessage(messageID);
    if (!chatID) {
      return res.status(404).json({ message: "Message not found" });
    }
    io.to(chatID).emit("messageDeleted", { messageID });
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

app.get("/chats/:chatID/members", async (req, res) => {
  const { chatID } = req.params;
  try {
    const members = await getChatMembers(chatID);
    res.json(members);
  } catch (err) {
    console.error("Error fetching chat members:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/chats/:chatID/members", async (req, res) => {
  const { chatID } = req.params;
  const { userID } = req.body;

  try {
    const systemMessage = await addMemberToGroup(chatID, userID);

    // Broadcast to clients
    io.to(chatID).emit("receiveMessage", systemMessage);
    io.to(chatID).emit("memberUpdated", { chatID });

    // Send the system message back, just like the remove route
    res.status(200).json({ message: 'User added', systemMessage });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

app.post("/chats", async (req, res) => {
  const { chatName, chatType, creatorID, userIDList } = req.body;
  console.log(chatName)

  try {
    const chatNameToSend = chatType === "Private" ? null : chatName;
    console.log(chatNameToSend)

    const { chatID, alreadyExists, systemMessage } = await createChat(chatNameToSend, chatType, creatorID, userIDList);

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
    const systemMessage = await leaveGroup(chatID, userID, { kickedBy: true });
    io.to(chatID).emit("receiveMessage", systemMessage);
    io.to(chatID).emit("memberUpdated", { chatID });
    res.status(200).json({ message: 'User removed', systemMessage });
  } catch (err) {
    console.error("Leave group error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post('/chats/:chatID/read', async (req, res) => {
  const { userID } = req.body;
  const { chatID } = req.params;
  try {
    await markChatAsRead(userID, chatID);
    console.log("Chat read:", chatID)
    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating ChatReads:", err);
    res.status(500).json({ error: 'Failed to update ChatReads' });
  }
});

app.get('/chats/:userID/unread-counts', async (req, res) => {
  const { userID } = req.params;

  try {
    const rows = await getUnreadMessageCounts(userID);
    const counts = {};
    rows.forEach(row => {
      counts[row.chatID] = row.unreadCount;
    });
    res.json(counts);
  } catch (err) {
    console.error("Failed to fetch unread message counts:", err);
    res.status(500).json({ error: "Failed to fetch unread counts" });
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

// Download attachment by attachment ID
app.get('/messages/:attachmentID/attachment', authenticateToken, async (req, res) => {
  const { attachmentID } = req.params;

  try {
    const file = await getAttachmentById(attachmentID);

    if (!file) return res.status(404).send('Attachment not found');

    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Content-Type', file.fileType);
    res.send(file.fileData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

server.listen(8080, "127.0.0.1", () => {
  console.log("Server is running on port 8080");
});