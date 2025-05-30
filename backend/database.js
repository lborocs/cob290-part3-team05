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
  const [rows] = await pool.query(
    "SELECT userID, userEmail, firstName, lastName, userType FROM Users WHERE userType = 'Employee'"
  );
  return rows;
}

// GET /user/:id
export async function getUser(id) {
  const [rows] = await pool.query(
    `
    SELECT userID, userEmail, firstName, lastName, userType
    FROM Users
    WHERE userID = ?
    `,
    [id]
  );
  console.log(rows[0]);
  return rows[0];
}

export async function getGanttChartData(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      p.projectID,
      p.projectTitle,
      p.startDate,
      p.dueDate
    FROM 
      UserTeams ut
    JOIN 
      Projects p ON ut.projectID = p.projectID
    WHERE 
      ut.userID = 1;
  `,
    [id]
  );
  return rows;
}

export async function getAllTasksByProject(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      COUNT(CASE WHEN status = 'to do' AND (dueDate >= CURDATE() OR dueDate IS NULL) THEN 1 END) AS toDo,
      COUNT(CASE WHEN status = 'in progress' AND (dueDate >= CURDATE() OR dueDate IS NULL) THEN 1 END) AS inProgress,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
      COUNT(CASE WHEN dueDate < CURDATE() AND status != 'completed' THEN 1 END) AS overdue
    FROM 
      Tasks
    WHERE 
      projectID = ?;
    `,
    [id]
  );

  // Return the first object directly instead of the array
  return {
    toDo: rows[0]?.toDo || 0,
    inProgress: rows[0]?.inProgress || 0,
    completed: rows[0]?.completed || 0,
    overdue: rows[0]?.overdue || 0,
  };
}

export async function getBurnDownData(id) {
  const [rows] = await pool.query(
    `
      SELECT 
      DATE(t.completionDate) AS date,
      COUNT(t.taskID) AS count,
      SUM(t.manHours) AS hours
  FROM 
      Tasks t
  WHERE 
      t.projectID = ? -- Replace with your project ID parameter
      AND t.status = 'Completed'
      AND t.completionDate IS NOT NULL
  GROUP BY 
      DATE(t.completionDate)
  ORDER BY 
      date ASC;
  `,
    [id]
  );

  return rows;
}

export async function getTotalTasksByProject(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      COUNT(*) AS totalTasks
    FROM 
      Tasks
    WHERE 
      projectID = ?;
  `,
    [id]
  );

  // Return the first object directly instead of the array
  return rows[0]?.totalTasks || 0;
}

export async function getRecentActivityProject(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      t.name AS taskName,
      t.status AS taskStatus,
      t.assigneeID,
      CONCAT(u.firstName, ' ', u.lastName) AS assigneeName,
      CASE
        WHEN t.status = 'Completed' THEN t.completionDate
        WHEN t.status IN ('To Do', 'In Progress') AND t.startDate <= CURDATE() THEN t.startDate
        ELSE NULL
      END AS activityDate,
      CASE
        WHEN t.status = 'Completed' THEN 'Task completed'
        WHEN t.status = 'In Progress' THEN 'Task in progress'
        WHEN t.status = 'To Do' AND t.startDate <= CURDATE() THEN 'Task started'
        ELSE NULL
      END AS activityType,
      ABS(DATEDIFF(CURDATE(), 
        CASE
          WHEN t.status = 'Completed' THEN t.completionDate
          WHEN t.status IN ('To Do', 'In Progress') AND t.startDate <= CURDATE() THEN t.startDate
          ELSE CURDATE()
        END
      )) AS daysAgo
    FROM 
      Tasks t
    LEFT JOIN
      Users u ON t.assigneeID = u.userID
    WHERE 
      t.projectID = ?
      AND (
        (t.status = 'Completed' AND t.completionDate IS NOT NULL)
        OR 
        (t.status IN ('To Do', 'In Progress') AND t.startDate <= CURDATE())
      )
    ORDER BY 
      daysAgo ASC, 
      FIELD(t.status, 'Completed', 'In Progress', 'To Do') ASC
    LIMIT 4;
  `,
    [id]
  );
  return rows;
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
    const [rows] = await pool.query(
      `
      SELECT 
        c.chatID,
        c.chatType,
        c.creatorID,
        CASE 
          WHEN c.chatType = 'Group' THEN c.chatName
          ELSE (
            SELECT CONCAT(u.firstName, ' ', u.lastName)
            FROM ChatUsers cu2
            JOIN Users u ON cu2.userID = u.userID
            WHERE cu2.chatID = c.chatID AND cu2.userID != ?
            LIMIT 1
          )
        END AS chatTitle,

        -- Subquery for last message details
        (
          SELECT m.messageText
          FROM MessagesTable m
          WHERE m.chatID = c.chatID AND m.isDeleted = 0
          ORDER BY m.timestamp DESC
          LIMIT 1
        ) AS lastMessageText,

       (
  SELECT
    CASE
      WHEN m.senderUserID = 0 THEN ''
      ELSE CONCAT(u.firstName, ' ', u.lastName)
    END
  FROM MessagesTable m
  LEFT JOIN Users u ON m.senderUserID = u.userID
  WHERE m.chatID = c.chatID AND m.isDeleted = 0
  ORDER BY m.timestamp DESC
  LIMIT 1
) AS lastMessageSender,

        (
          SELECT m.timestamp
          FROM MessagesTable m
          WHERE m.chatID = c.chatID AND m.isDeleted = 0
          ORDER BY m.timestamp DESC
          LIMIT 1
        ) AS lastMessageTimestamp

      FROM Chats c
      JOIN ChatUsers cu ON c.chatID = cu.chatID
      WHERE cu.userID = ?
      ORDER BY lastMessageTimestamp DESC
      `,
      [userID, userID]
    );

    for (const row of rows) {
      if (!row.lastMessageSender) {
        row.lastMessageSender = "";
      }
    }

    return rows;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
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
    SELECT 
      p.*, 
      CONCAT(u.firstName, ' ', u.lastName) AS projectLeaderName
    FROM 
      Projects p
    LEFT JOIN 
      Users u ON p.projectLeader = u.userID
    WHERE 
      p.projectLeader = ?
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
      Tasks
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
      Tasks
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
    SELECT 
      p.*,
      CONCAT(u.firstName, ' ', u.lastName) AS leaderName,
      u.userEmail AS leaderEmail
    FROM 
      Projects p
    LEFT JOIN 
      Users u ON p.projectLeader = u.userID
    WHERE 
      p.projectID = ?
  `,
    [id]
  );
  return rows[0];
}

export async function getNumTasksProj(id) {
  const [rows] = await pool.query(
    `
    SELECT 
    p.projectID,
    p.projectTitle,
    COUNT(CASE WHEN t.status = 'to do' THEN 1 END) AS toDo,
    COUNT(CASE WHEN t.status = 'in progress' THEN 1 END) AS inProgress,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN t.dueDate < NOW() AND t.status != 'completed' THEN 1 END) AS overdue
FROM 
    UserTeams ut
JOIN 
    Projects p ON ut.projectID = p.projectID
LEFT JOIN 
    Tasks t ON p.projectID = t.projectID
WHERE 
    ut.userID = 1
GROUP BY 
    p.projectID, p.projectTitle
ORDER BY 
    p.projectTitle;
  `,
    [id]
  );
  return rows;
}

export async function getUserTasksProject(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      u.userID,
      CONCAT(u.firstName, ' ', u.lastName) AS employeeName,
      u.userEmail,
      COUNT(t.taskID) AS totalAssigned,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed,
      COUNT(CASE WHEN t.status = 'to do' AND (t.dueDate >= CURDATE() OR t.dueDate IS NULL) THEN 1 END) AS toDo,
      COUNT(CASE WHEN t.status = 'in progress' AND (t.dueDate >= CURDATE() OR t.dueDate IS NULL) THEN 1 END) AS inProgress,
      COUNT(CASE WHEN t.dueDate < CURDATE() AND t.status != 'completed' THEN 1 END) AS overdue
    FROM 
      Users u
    JOIN 
      UserTeams ut ON u.userID = ut.userID
    LEFT JOIN 
      Tasks t ON t.assigneeId = u.userID AND t.projectID = ut.projectID
    WHERE 
      ut.projectID = ?
    GROUP BY 
      u.userID, u.firstName, u.lastName, u.userEmail
    ORDER BY 
      completed DESC, totalAssigned DESC
    `,
    [id]
  );

  return rows;
}

export async function getRecentActivityUser(id) {
  const [rows] = await pool.query(
    `
    SELECT 
    t.name AS taskName,
    p.projectTitle AS projectName,
    ABS(DATEDIFF(CURDATE(),
        CASE
            WHEN t.status = 'Completed' THEN t.completionDate
            WHEN t.status = 'To Do' AND t.startDate <= CURDATE() THEN t.startDate
        END
    )) AS daysAgo
FROM Tasks t
JOIN Projects p ON t.projectId = p.projectId
WHERE (
    (t.status = 'Completed')
    OR (t.status = 'To Do' AND t.startDate <= CURDATE())
)
AND t.assigneeId = ?
ORDER BY daysAgo ASC
LIMIT 4;
  `,
    [id]
  );
  return rows;
}

// Chat SQL Queries
// GET /messages/:chatID
export async function getMessages(chatID) {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        m.messageID,
        m.senderUserID,
        CONCAT(u.firstName, ' ', u.lastName) AS senderName,  
        m.chatID,
        m.messageText,
        m.timestamp, 
        m.isDeleted,
        m.isEdited,
        a.attachmentID,
        a.fileName,
        a.fileType,
        a.fileSize,
        a.uploadedAt
      FROM MessagesTable m
      JOIN Users u ON m.senderUserID = u.userID
      LEFT JOIN MessageAttachments a ON m.messageID = a.messageID
      WHERE m.chatID = ?
      ORDER BY m.timestamp ASC
      `,
      [chatID]
    );

    const messagesMap = new Map();

    for (const row of rows) {
      const {
        messageID,
        senderUserID,
        senderName,
        chatID,
        messageText,
        timestamp,
        isDeleted,
        isEdited,
        attachmentID,
        fileName,
        fileType,
        fileSize,
        uploadedAt,
      } = row;

      if (!messagesMap.has(messageID)) {
        messagesMap.set(messageID, {
          messageID,
          senderUserID,
          senderName,
          chatID,
          messageText,
          timestamp,
          isDeleted: Boolean(isDeleted),
          isEdited: Boolean(isEdited),
          attachment: null,
        });
      }

      // If the message has an attachment, set it as an object on the message
      if (attachmentID) {
        messagesMap.get(messageID).attachment = {
          attachmentID,
          fileName,
          fileType,
          fileSize,
          uploadedAt,
          downloadUrl: `/api/messages/${attachmentID}/attachment`, // Adjust download URL
        };
      }
    }

    return Array.from(messagesMap.values());
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return [];
  }
}

// POST /messages
export async function sendMessage(chatID, senderUserID, messageText) {
  try {
    const [result] = await pool.query(
      `
            INSERT INTO MessagesTable (senderUserID, chatID, messageText, timestamp, isDeleted, isEdited)
            VALUES (?, ?, ?, NOW(), 0, 0); 
        `,
      [senderUserID, chatID, messageText]
    );

    const [newMessage] = await pool.query(
      `
            SELECT messageID, senderUserID, chatID, messageText, timestamp, isDeleted, isEdited
            FROM MessagesTable WHERE messageID = ?;
        `,
      [result.insertId]
    );

    return newMessage[0];
  } catch (error) {
    console.error("Error sending message:", error.message);
    return null;
  }
}

// DELETE /messages/:messageID
export async function deleteMessage(messageID) {
  const [existing] = await pool.query(
    `
    SELECT chatID FROM MessagesTable WHERE messageID = ?;
  `,
    [messageID]
  );

  if (!existing.length) return null;

  const chatID = existing[0].chatID;

  await pool.query(
    `
    INSERT INTO DeletedMessagesArchive 
    (messageID, timestampOfDeletion)
    VALUES (?, NOW());
  `,
    [messageID]
  );

  await pool.query(
    `
    UPDATE MessagesTable
    SET isDeleted = TRUE
    WHERE messageID = ?;
  `,
    [messageID]
  );

  return chatID;
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
export async function leaveGroup(chatID, userID, options = {}) {
  // 1. Fetch chat details
  const [[chat]] = await pool.query(
    `
        SELECT creatorID FROM Chats WHERE chatID = ?
    `,
    [chatID]
  );

  if (!chat) throw new Error("Chat not found");

  const isCreator = Number(chat.creatorID) === Number(userID);

  // 2. If the user is the creator, reassign to someone else
  if (isCreator) {
    const [[newCreator]] = await pool.query(
      `
            SELECT userID FROM ChatUsers
            WHERE chatID = ? AND userID != ?
            ORDER BY userID ASC
            LIMIT 1
        `,
      [chatID, userID]
    );

    if (!newCreator) {
      throw new Error(
        "You're the last member. Please delete the chat instead."
      );
    }

    await pool.query(
      `
            UPDATE Chats SET creatorID = ? WHERE chatID = ?
        `,
      [newCreator.userID, chatID]
    );
  }

  // 3. Remove the user from the chat
  await pool.query(
    `
        DELETE FROM ChatUsers WHERE chatID = ? AND userID = ?
    `,
    [chatID, userID]
  );
  // 4. Add a system message
  const [[user]] = await pool.query(
    `
        SELECT CONCAT(firstName, ' ', lastName) AS fullName FROM Users WHERE userID = ?
    `,
    [userID]
  );

  const messageText = options.kickedBy
    ? `${user.fullName} was removed from the group.`
    : `${user.fullName} left the group.`;

  const [messageInsert] = await pool.query(
    `
    INSERT INTO MessagesTable (senderUserID, chatID, messageText, timestamp)
    VALUES (0, ?, ?, NOW())
  `,
    [chatID, messageText]
  );

  return {
    messageID: messageInsert.insertId,
    chatID,
    senderUserID: 0,
    messageText,
    timestamp: new Date(),
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

// GET /chats/:chatID/members
export async function getChatMembers(chatID) {
  const [rows] = await pool.query(
    `
    SELECT u.userID, u.firstName, u.lastName, u.userEmail, u.userType
    FROM ChatUsers cu
    JOIN Users u ON cu.userID = u.userID
    WHERE cu.chatID = ?
  `,
    [chatID]
  );
  return rows;
}

// POST /chats/:chatID/members
export async function addMemberToGroup(chatID, userID) {
  await pool.query(`INSERT INTO ChatUsers (chatID, userID) VALUES (?, ?)`, [
    chatID,
    userID,
  ]);

  const [[user]] = await pool.query(
    `SELECT firstName, lastName FROM Users WHERE userID = ?`,
    [userID]
  );
  const fullName = `${user.firstName} ${user.lastName}`;

  const systemMessage = `${fullName} joined the group.`;

  const [result] = await pool.query(
    `INSERT INTO MessagesTable (chatID, senderUserID, messageText, timestamp) VALUES (?, 0, ?, NOW())`,
    [chatID, systemMessage]
  );

  return {
    messageID: result.insertId,
    chatID: parseInt(chatID),
    senderUserID: 0,
    messageText: systemMessage,
    timestamp: new Date(),
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
    chatName = null; // Allow null for private chat name
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
    [chatName, chatType, creatorID] // Here, `chatName` can be `null` for private chat
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

// POST /chats/:chatID/read
export async function markChatAsRead(userID, chatID) {
  await pool.query(
    `
    INSERT INTO ChatReads (userID, chatID, lastReadAt)
    VALUES (?, ?, NOW())
    ON DUPLICATE KEY UPDATE lastReadAt = NOW()
  `,
    [userID, chatID]
  );
}

// GET /chats/:userID/unread-counts
export async function getUnreadMessageCounts(userID) {
  const [rows] = await pool.query(
    `
    SELECT
      c.chatID,
      COUNT(m.messageID) AS unreadCount
    FROM
      ChatUsers cu
    JOIN Chats c ON cu.chatID = c.chatID
    JOIN MessagesTable m ON m.chatID = c.chatID
    LEFT JOIN ChatReads cr ON cr.chatID = c.chatID AND cr.userID = cu.userID
    WHERE
      cu.userID = ?
      AND m.timestamp > IFNULL(cr.lastReadAt, 0)
      AND m.senderUserID != ?
      AND m.senderUserID != 0
    GROUP BY
      c.chatID
  `,
    [userID, userID]
  );

  return rows;
}

// GET /users/not-in-private-with/:userID
export async function getUsersNotInPrivateWith(userID) {
  const [userChats] = await pool.query(
    `SELECT c.chatID 
        FROM Chats c
        JOIN ChatUsers cu ON cu.chatID = c.chatID
        WHERE cu.userID = ? AND c.chatType = 'Private'
        `,
    [userID]
  );

  const chatIDs = userChats.map((chat) => chat.chatID);

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
export async function getUsersNotCurrent(userID) {
  const [users] = await pool.query(
    `SELECT userID, firstName, lastName
        FROM Users
        WHERE userID != ? AND userID != 0`,
    [userID]
  );
  return users;
}

// POST /attachment/:messageID
export async function insertAttachment({
  messageID,
  fileName,
  fileType,
  fileSize,
  fileData,
}) {
  const [result] = await pool.query(
    `INSERT INTO MessageAttachments (messageID, fileName, fileType, fileSize, fileData, uploadedAt)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [messageID, fileName, fileType, fileSize, fileData]
  );

  const attachmentID = result.insertId;

  return attachmentID;
}

// GET /messages/:attachmentID/attachment
export async function getAttachmentById(attachmentID) {
  const [rows] = await pool.query(
    `SELECT fileName, fileType, fileData FROM MessageAttachments WHERE attachmentID = ?`,
    [attachmentID]
  );
  return rows[0];
}

export async function getAttachmentsForMessage(messageID) {
  try {
    const [attachments] = await pool.query(
      `
      SELECT attachmentID, fileName, fileType, fileSize
      FROM MessageAttachments
      WHERE messageID = ?
    `,
      [messageID]
    );

    return attachments; // Returns an array of attachments (could be empty)
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return [];
  }
}

//Project Table SQL
export async function getProjects() {
  const [rows] = await pool.query(
    `
    SELECT 
      p.*,
      CONCAT(u.firstName, ' ', u.lastName) AS projectLeaderName
    FROM 
      Projects p
    LEFT JOIN 
      Users u ON p.projectLeader = u.userID
    `
  );
  return rows;
}
