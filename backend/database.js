import mysql from 'mysql2'
import dotenv from 'dotenv'

// Note ".env" is a local only file which is why there won't be one when we clone from repo
dotenv.config()

// Fetching db info from enviroment vars ".env" - Will use github secrets to set up
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise()


// These are example queries

// GET /
export async function getExmaples() {
    const [rows] =  await pool.query("SELECT * FROM table")
    return rows
}

// GET /:id
export async function getExample(id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM table
    WHERE id = ?
    `, [id])
    return rows[0]
}

// POST /
export async function createExample(title, contents) {
    const [result] = await pool.query(`
    INSERT INTO table (title, contents)
    VALUES (?, ?)
    `, [title, contents])
    const id = result.insertId
    // Return new ID
    return getExample(id) 
  }