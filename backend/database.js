import mysql from "mysql2";
import dotenv from "dotenv";

// Note ".env" is a local only file which is why there won't be one when we clone from repo
dotenv.config({ path: "./.env" });

// Fetching db info from enviroment vars ".env" - Will use github secrets to set up
const pool = mysql
  .createPool({
    host: process.env.DB_SERVERNAME || "localhost",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "make_it_all",
  })
  .promise();

// USER QUERIES

// GET /users
export async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM Users");
  return rows;
}

// GET /user/:id
export async function getUser(id) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM Users
    WHERE userID = ?
    `,
    [id]
  );
  console.log(rows[0]);
  return rows[0];
}

/*export async function createUser(userEmail, firstName, lastName, userType) {
    const [result] = await pool.query(`
    INSERT INTO Users (userEmail, firstName, lastName, userType)
    VALUES (?, ?, ?, ?)
    `, [userEmail, firstName, lastName, userType])
  
    // Return the newly created user with the auto-incremented ID
    const newUser = await getUser(result.insertId);
    return newUser;
}*/

// Get user by email
export async function getUserByEmail(email) {
  const [rows] = await pool.query(
    `
      SELECT * 
      FROM Users
      WHERE userEmail = ?
    `,
    [email]
  );
  return rows[0];
}

// Create user with password hash
export async function createUser(
  userEmail,
  firstName,
  lastName,
  userType,
  passwordHash
) {
  const [result] = await pool.query(
    `
      INSERT INTO Users (userEmail, firstName, lastName, userType, passwordHash)
      VALUES (?, ?, ?, ?, ?)
    `,
    [userEmail, firstName, lastName, userType, passwordHash]
  );

  // Return the newly created user with the auto-incremented ID
  const newUser = await getUser(result.insertId);
  return newUser;
}

// Project functions
export async function getProjects() {
  const [rows] = await pool.query("SELECT * FROM Projects");
  return rows;
}

export async function isLeadingProject(userID, projectID) {
  const [rows] = await pool.query(
    `
    SELECT * FROM Projects
    Where projectID = ? AND projectLeader = ?
  `,
    [projectID, userID]
  );
  return rows.length > 0;
}

export async function getProjectsTeamLeader(userID) {
  const [rows] = await pool.query(
    `
    SELECT * From Projects
    WHERE projectLeader = ?
  `,
    [userID]
  );
  return rows;
}

export async function getNumProjectUser(userID) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) as numProjects
    FROM UserTeams
    WHERE userID = ?
  `,
    [userID]
  );
  return rows[0].numProjects;
}

export async function getNumTasksUser(userID) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) as numTasks
    FROM Tasks
    WHERE assigneeId = ?
  `,
    [userID]
  );
  return rows[0].numTasks;
}

export async function getNumCompletedTasks(userID) {
  const [rows] = await pool.query(
    `
    SELECT COUNT(*) as numCompletedTasks
    FROM Tasks
    WHERE assigneeID = ? AND status = 'Completed'
  `,
    [userID]
  );
  return rows[0].numCompletedTasks;
}

export async function getWorkLoadUser(userID) {
  const [rows] = await pool.query(
    `
    SELECT 
      ROUND(
        (SUM(manHours) / SUM(DATEDIFF(dueDate, startDate) + 1)) 
        / 8 * 100, 
        1
      ) AS workloadPercentage
    FROM 
      tasks
    WHERE 
      assigneeId = ?
      AND startDate IS NOT NULL 
      AND dueDate IS NOT NULL
      AND manHours IS NOT NULL;
    `,
    [userID] // Use the userID parameter here
  );
  return rows[0]?.workloadPercentage || 0; // Return 0 if no data is found
}

export async function getDoughnutData(userID) {
  const [rows] = await pool.query(
    `
    SELECT 
      COUNT(CASE WHEN status = 'to do' THEN 1 END) AS toDo,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
      COUNT(CASE WHEN status = 'in progress' THEN 1 END) AS inProgress,
      COUNT(CASE WHEN dueDate < NOW() AND status != 'completed' THEN 1 END) AS overdue
    FROM 
      tasks
    WHERE 
      assigneeId = ?;
    `,
    [userID] // Use the userID parameter here
  );
  return {
    toDo: rows[0]?.toDo || 0,
    completed: rows[0]?.completed || 0,
    inProgress: rows[0]?.inProgress || 0,
    overdue: rows[0]?.overdue || 0,
  };
}

export async function getProjectData(id) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM Projects
    WHERE projectID = ?
  `,
    [id]
  );
  return rows[0];
}

// Chat SQL Queries

export async function insertMessage(chatID, senderUserID, messageText) {
  const result = await db.run(
    "INSERT INTO Messages (chatID, senderUserID, messageText) VALUES (?, ?, ?)",
    [chatID, senderUserID, messageText]
  );
  return result.lastID; // or result.insertId
}

export async function getMessageWithSenderInfo(messageID) {
  const message = await db.get(
    `
    SELECT 
      m.messageID, m.chatID, m.messageText, m.senderUserID, m.createdAt,
      u.firstName, u.lastName, u.userEmail
    FROM Messages m
    JOIN Users u ON m.senderUserID = u.userID
    WHERE m.messageID = ?
  `,
    [messageID]
  );

  return message;
}

export async function getUserChatIDs(userID) {
  const rows = await db.all(
    `
    SELECT chatID FROM ChatUsers WHERE userID = ?
  `,
    [userID]
  );
  return rows.map((row) => row.chatID);
}
