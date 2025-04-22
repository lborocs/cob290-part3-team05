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

// POST /users
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

// Chat SQL Queries

export async function insertMessage(chatID, senderUserID, messageText) {
  const result = await db.run(
    "INSERT INTO Messages (chatID, senderUserID, messageText) VALUES (?, ?, ?)",
    [chatID, senderUserID, messageText]
  );
  return result.lastID; // or result.insertId
}

export async function getMessageWithSenderInfo(messageID) {
  const message = await db.get(`
    SELECT 
      m.messageID, m.chatID, m.messageText, m.senderUserID, m.createdAt,
      u.firstName, u.lastName, u.userEmail
    FROM Messages m
    JOIN Users u ON m.senderUserID = u.userID
    WHERE m.messageID = ?
  `, [messageID]);

  return message;
}

export async function getUserChatIDs(userID) {
  const rows = await db.all(`
    SELECT chatID FROM ChatUsers WHERE userID = ?
  `, [userID]);
  return rows.map(row => row.chatID);
}