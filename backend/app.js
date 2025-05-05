import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUsers, getUser, createUser, getUserByEmail } from "./database.js";
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});

app.listen(8080, "0.0.0.0", () => {
  console.log("Server is running on port 8080");
});