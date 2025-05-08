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

// CHAT QUERIES

// GET /chats/:userID
export async function getChats(userID) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.chatID,
                c.chatType,  
                c.creatorID,
                CASE 
                    WHEN c.chatType = 'Group' THEN c.chatName
                    ELSE (
                        SELECT CONCAT(u.firstName, ' ', u.lastName)
                        FROM ChatUsers cu
                        JOIN Users u ON cu.userID = u.userID
                        WHERE cu.chatID = c.chatID AND cu.userID != ?
                        LIMIT 1
                    )
                END AS chatTitle
            FROM Chats c
            LEFT JOIN ChatUsers cu ON c.chatID = cu.chatID
            WHERE cu.userID = ?;
        `, [userID, userID]);

        return rows;
    } catch (error) {
        console.error("Error fetching chats:", error);
        return [];
    }
}

// GET /messages/:chatID
export async function getMessages(chatID) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                m.messageID,
                m.senderUserID,
                CONCAT(u.firstName, ' ', u.lastName) AS senderName,  
                m.chatID,
                m.messageText,
                m.timestamp, 
                m.isDeleted,
                m.isEdited
            FROM MessagesTable m
            JOIN Users u ON m.senderUserID = u.userID
            WHERE m.chatID = ?
            ORDER BY m.timestamp ASC;  
        `, [chatID]);

        return rows.map((msg) => ({
            ...msg,
            isEdited: Boolean(msg.isEdited),
            isDeleted: Boolean(msg.isDeleted),
        }));
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        return [];
    }
}

// POST /messages
export async function sendMessage(chatID, senderUserID, messageText) {
    try {
        const [result] = await pool.query(`
            INSERT INTO MessagesTable (senderUserID, chatID, messageText, timestamp, isDeleted, isEdited)
            VALUES (?, ?, ?, NOW(), 0, 0); 
        `, [senderUserID, chatID, messageText]);

        const [newMessage] = await pool.query(`
            SELECT messageID, senderUserID, chatID, messageText, timestamp, isDeleted, isEdited
            FROM MessagesTable WHERE messageID = ?;
        `, [result.insertId]);

        return newMessage[0];
    } catch (error) {
        console.error("Error sending message:", error.message);
        return null;
    }
}

// DELETE /messages/:messageID
export async function deleteMessage(messageID) {
    const [existing] = await pool.query(`
        SELECT * FROM MessagesTable WHERE messageID = ?;
    `, [messageID]);

    if (!existing.length) return false;

    await pool.query(`
        INSERT INTO DeletedMessagesArchive 
        (messageID, timestampOfDeletion)
        VALUES (?, NOW());
    `, [messageID]);

    await pool.query(`
        UPDATE MessagesTable
        SET isDeleted = TRUE
        WHERE messageID = ?;
    `, [messageID]);

    return true;
}

// PUT /messages/:messageID
export async function editMessage(messageID, newText) {
    try {
        const [existing] = await pool.query(
            `SELECT messageText FROM MessagesTable WHERE messageID = ?`,
            [messageID]
        );

        if (!existing.length) return false;

        const oldText = existing[0].messageText;

        await pool.query(
            `INSERT INTO EditedMessagesArchive (messageID, messageBeforeEdit, timeStampOfEdit)
             VALUES (?, ?, NOW())`,
            [messageID, oldText]
        );

        await pool.query(
            `UPDATE MessagesTable
             SET messageText = ?, isEdited = TRUE
             WHERE messageID = ?`,
            [newText, messageID]
        );

        return true;
    } catch (error) {
        console.error("Error editing message:", error.message);
        return false;
    }
}

// DELETE /chats/:chatID/leave/:userID
export async function leaveGroup(chatID, userID) {
    // 1. Fetch chat details
    const [[chat]] = await pool.query(`
        SELECT creatorID FROM Chats WHERE chatID = ?
    `, [chatID]);

    if (!chat) throw new Error("Chat not found");

    const isCreator = Number(chat.creatorID) === Number(userID);

    // 2. If the user is the creator, reassign to someone else
    if (isCreator) {
        const [[newCreator]] = await pool.query(`
            SELECT userID FROM ChatUsers
            WHERE chatID = ? AND userID != ?
            ORDER BY userID ASC
            LIMIT 1
        `, [chatID, userID]);

        if (!newCreator) {
            throw new Error("You're the last member. Please delete the chat instead.");
        }

        await pool.query(`
            UPDATE Chats SET creatorID = ? WHERE chatID = ?
        `, [newCreator.userID, chatID]);
    }

    // 3. Remove the user from the chat
    await pool.query(`
        DELETE FROM ChatUsers WHERE chatID = ? AND userID = ?
    `, [chatID, userID]);

    // 4. Add a system message
    const [[user]] = await pool.query(`
        SELECT CONCAT(firstName, ' ', lastName) AS fullName FROM Users WHERE userID = ?
    `, [userID]);

    const leaveText = `${user.fullName} left the group.`;

    const [messageInsert] = await pool.query(`
        INSERT INTO MessagesTable (senderUserID, chatID, messageText, timestamp)
        VALUES (0, ?, ?, NOW())
    `, [chatID, leaveText]);

    return {
        messageID: messageInsert.insertId,
        chatID,
        senderUserID: 0,
        messageText: leaveText,
        timestamp: new Date()
    };
}

// DELETE /chats/:chatID
export async function deleteChat(chatID) {
    await pool.query(`DELETE FROM MessagesTable WHERE chatID = ?`, [chatID]);
    await pool.query(`DELETE FROM ChatUsers WHERE chatID = ?`, [chatID]);
    await pool.query(`DELETE FROM Chats WHERE chatID = ?`, [chatID]);
    return { chatID, deleted: true };
}

// GET /chats/:chatID/non-members 
export async function getNonMembers(chatID) {
    const [rows] = await pool.query(
        `
        SELECT userID, firstName, lastName 
        FROM Users 
        WHERE userID NOT IN (
            SELECT userID FROM ChatUsers WHERE chatID = ?
        )
        AND userID != 0
        `,
        [chatID]
    );
    return rows;
}

// POST /chats/:chatID/members
export async function addMemberToGroup(chatID, userID) {
    await pool.query(
        `INSERT INTO ChatUsers (chatID, userID) VALUES (?, ?)`,
        [chatID, userID]
    );

    const [[user]] = await pool.query(
        `SELECT firstName, lastName FROM Users WHERE userID = ?`,
        [userID]
    );
    const fullName = `${user.firstName} ${user.lastName}`;

    const systemMessage = `${fullName} joined the group`;

    const [result] = await pool.query(
        `INSERT INTO MessagesTable (chatID, senderUserID, messageText, timestamp) VALUES (?, 0, ?, NOW())`,
        [chatID, systemMessage]
    );

    return {
        messageID: result.insertId,
        chatID: parseInt(chatID),
        senderUserID: 0,
        messageText: systemMessage,
        timestamp: new Date()
    };
}

// PUT /chats/:chatID/title 
export async function updateGroupTitle(chatID, newTitle) {
    const [result] = await pool.query(
        `UPDATE Chats SET chatName = ? WHERE chatID = ? AND chatType = 'Group'`,
        [newTitle, chatID]
    );
    return result;
}

// POST /chats
export async function createChat(chatName, chatType, creatorID, userIDList) {
    // If the chat is private, we can allow chatName to be null or use a default value
    if (chatType === "Private" && !chatName) {
        chatName = null;  // Allow null for private chat name
    }

    // For private chat, check if a chat already exists between the two users
    if (chatType === "Private") {
        const [userA, userB] = userIDList;
        const [existing] = await pool.query(
            `SELECT cu1.chatID FROM ChatUsers cu1
             JOIN ChatUsers cu2 ON cu1.chatID = cu2.chatID
             JOIN Chats c ON c.chatID = cu1.chatID
             WHERE cu1.userID = ? AND cu2.userID = ? AND c.chatType = 'Private'
             GROUP BY cu1.chatID
             HAVING COUNT(DISTINCT cu1.userID) = 2`,
            [userA, userB]
        );

        if (existing.length > 0) {
            return { chatID: existing[0].chatID, alreadyExists: true };
        }
    }

    // Insert a new chat (allow chatName to be null for private chat)
    const [chat] = await pool.query(
        `INSERT INTO Chats (chatName, chatType, creatorID) VALUES (?, ?, ?)`,
        [chatName, chatType, creatorID]  // Here, `chatName` can be `null` for private chat
    );

    const chatID = chat.insertId;

    // Get the creator's name
    const [creatorName] = await pool.query(
        `SELECT firstName, lastName FROM Users WHERE userID = ?`,
        [creatorID]
    );
    const creator = creatorName[0];
    const fullName = `${creator.firstName} ${creator.lastName}`;
    const systemMessage = `${fullName} created a chat`;

    // Insert the system message
    const [result] = await pool.query(
        `INSERT INTO MessagesTable (chatID, senderUserID, messageText, timestamp) VALUES (?, 0, ?, NOW())`,
        [chatID, systemMessage]
    );

    // Add users to the chat
    for (const userID of userIDList) {
        await pool.query(
            `INSERT INTO ChatUsers (chatID, userID, pinnedChat) VALUES (?, ?, 0)`,
            [chatID, userID]
        );
    }

    return { chatID, alreadyExists: false, systemMessage };
}

// GET /users/not-in-private-with/:userID
export async function getUsersNotInPrivateWith(userID){
    const [userChats]= await pool.query(
        `SELECT c.chatID 
        FROM Chats c
        JOIN ChatUsers cu ON cu.chatID = c.chatID
        WHERE cu.userID = ? AND c.chatType = 'Private'
        `,
        [userID]
    )

    const chatIDs = userChats.map(chat => chat.chatID);

    if (chatIDs.length === 0) {
        const [users] = await pool.query(
          `SELECT userID, firstName, lastName FROM Users WHERE userID != ? AND userID != 0`,
          [userID]
        );
        return users;
    }

    const [users] = await pool.query(
    `SELECT u.userID, u.firstName, u.lastName
     FROM Users u
     WHERE u.userID != ?
        AND u.userID NOT IN (
            SELECT cu.userID
            FROM ChatUsers cu
            WHERE cu.chatID IN (?)
        )
        AND u.userID != 0;
         `,
    [userID, chatIDs]
    );

    return users;
}

// GET /users/not-current/:userID
export async function getUsersNotCurrent(userID){
    const [users] = await pool.query(
        `SELECT userID, firstName, lastName
        FROM Users
        WHERE userID != ? AND userID != 0`,
        [userID]
    )
    return users
}


// Project functions
export async function getProjects() {
    const [rows] = await pool.query("SELECT * FROM Projects");
    return rows;
}

export async function getProjectData(id) {
    const [rows] = await pool.query(
        `s
    SELECT *
    FROM Projects
    WHERE projectID = ?
  `,
        [id]
    );
    return rows[0];
}