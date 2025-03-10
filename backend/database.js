import mysql from 'mysql2'
import dotenv from 'dotenv'

// Note ".env" is a local only file which is why there won't be one when we clone from repo
dotenv.config({ path: '../.env' });

// Fetching db info from enviroment vars ".env" - Will use github secrets to set up
const pool = mysql.createPool({
  host: process.env.DB_SERVERNAME || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'make_it_all'
}).promise()


// These are example queries

// GET /
export async function getUsers() {
    const [rows] =  await pool.query("SELECT * FROM users")
    return rows
}

// GET /:id
export async function getUser(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE userID = ?
    `, [id])
    console.log(rows[0])
    return rows[0]
}

// POST /
export async function createUser(userEmail, firstName, lastName, userType) {
    const baseId = firstName + lastName[0]
    let id = baseId
    let num = 1
    while (await getUser(id)) {
      id = baseId + num
      num++
    }
    const userID = id.toLowerCase()
    console.log(userID)
    const [result] = await pool.query(`
    INSERT INTO users (userID, userEmail, firstName, lastName, userType)
    VALUES (?, ?, ?, ?, ?)
    `, [userID, userEmail, firstName, lastName, userType])
    
    // Return new ID
    return getUser(userID) 

}