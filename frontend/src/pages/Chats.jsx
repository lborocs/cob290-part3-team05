import React, { useState, useEffect, useRef } from "react";

// Components
import LeftSidebar from "../components/chats/LeftSidebar";
import RightSidebar from "../components/chats/RightSidebar";
import ChatHeader from "../components/chats/chat-middle-components/ChatHeader";
import MessageList from "../components/chats/chat-middle-components/MessageList";
import SearchBar from "../components/chats/chat-middle-components/SearchBar";
import ConfirmModal from "../components/chats/modals/ConfirmModal";
import AddMemberModal from "../components/chats/modals/AddMemberModal";
import MessageInput from "../components/chats/chat-middle-components/MessageInput";

// React icons
import { FaUserAlt } from "react-icons/fa";

// WebSocket connection to backend
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

// Initial WebSocket connection
const socket = io("http://localhost:8080", {
  transports: ["websocket", "polling"],
  path: "/socket.io",
  withCredentials: true,
});

const Chats = () => {

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const currentUserID = decodedToken.id;
  const currentUserName = `${decodedToken.firstName} ${decodedToken.lastName}`;

  // UI state
  const [activeTab, setActiveTab] = useState("direct");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Chat UI related state
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [filteredIndexes, setFilteredIndexes] = useState([]);

  // Chat data state
  const [chats, setChats] = useState([]);
  const [noChats, setNoChats] = useState(false);
  const [chatTitle, setChatTitle] = useState("Loading...");
  const [chatType, setChatType] = useState(null);
  const [chatID, setChatID] = useState(null);
  const [creatorID, setCreatorID] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatMembers, setChatMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [membersArray, setMembersArray] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Message editing state
  const [editingMessageID, setEditingMessageID] = useState(null);
  const [editText, setEditText] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Group management state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [nonMembers, setNonMembers] = useState([]);
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);

  // Typing users state
  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);

  // Handle emoji picker
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-pink-400 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleChangeChat = async (chatID) => {
    // Clear unread badge
    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[chatID];
      return updated;
    });

    // Handle null or missing chat
    const selectedChat = chats.find((chat) => chat.chatID === chatID);
    if (!chatID || !selectedChat) {
      setChatID(null);
      setChatTitle("No chat selected");
      setChatType(null);
      setCreatorID(null);
      setMessages([]);
      setChatMembers([]);
      setSelectedUser(null);
      setNoChats(true);
      return;
    }

    // Mark as read
    await fetch(`/api/chats/${chatID}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: currentUserID }),
    });

    setNoChats(false);
    setChatID(chatID);
    socket.emit("joinChat", chatID);
    console.log("Joined room:", chatID);
    setChatTitle(selectedChat.chatTitle);
    setChatType(selectedChat.chatType);
    setCreatorID(selectedChat.creatorID);

    // Fetch members
    const res = await fetch(`/api/chats/${chatID}/members`);
    const data = await res.json();
    setChatMembers(data);
    if (selectedChat.chatType === "Private") {
      const other = data.find((user) => user.userID !== currentUserID);
      if (other) {
        setSelectedUser({
          fullName: `${other.firstName} ${other.lastName}`,
          email: other.userEmail,
          role: other.userType,
        });
      }
    } else {
      setSelectedUser(null);
    }
  };

  const handleRemoveMember = async (userID) => {
    try {
      socket.emit("joinChat", chatID);

      const res = await fetch(`/api/chats/${chatID}/leave/${userID}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove user');
      }

      const { systemMessage } = await res.json();
      setMessages((prev) => [...prev, systemMessage]);

      // Refresh members
      const updatedMembersRes = await fetch(`/api/chats/${chatID}/members`);
      const updatedMembers = await updatedMembersRes.json();
      setMembersArray(updatedMembers);
      const updatedChatsRes = await fetch(`/api/chats/${currentUserID}`);
      const updatedChats = await updatedChatsRes.json();
      setChats(updatedChats);

    } catch (error) {
      console.error("Error removing member:", error);
      alert(error.message);
    }
  };

  const handleRenameGroup = async (newTitle) => {
    try {
      const res = await fetch(`/api/chats/${chatID}/title`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle }),
      });

      if (!res.ok) throw new Error("Failed to update title");

      setChatTitle(newTitle);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.chatID === chatID
            ? { ...chat, chatTitle: newTitle }
            : chat
        )
      );
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const res = await fetch(`/api/chats/${chatID}/leave/${currentUserID}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorText = "Failed to leave group";

        try {
          const body = await res.json();
          errorText = body.error || errorText;

          if (errorText.includes("delete the chat")) {
            setIsLeaveModalOpen(false);
            setIsDeleteChatModalOpen(true);
            return;
          }
        } catch (jsonErr) {
          console.warn("Could not parse JSON error body", jsonErr);
        }

        throw new Error(errorText);
      }

      setChats((prevChats) => {
        const filteredChats = prevChats.filter((chat) => chat.chatID !== chatID);
        setChats(filteredChats);

        const filteredByTab = filteredChats.filter((chat) =>
          activeTab === "direct" ? chat.chatType === "Private" : chat.chatType === "Group"
        );

        if (filteredByTab.length > 0) {
          handleChangeChat(filteredByTab[0].chatID);
        } else {
          handleChangeChat(null);
        }

        return filteredChats;
      });
    } catch (err) {
      console.error("Failed to leave group:", err.message);
      alert(err.message);
    }
  };

  const fetchNonMembers = async () => {
    try {
      const res = await fetch(`/api/chats/${chatID}/non-members`);
      const data = await res.json();
      setNonMembers(data);
    } catch (err) {
      console.error("Failed to fetch non-members:", err);
    }
  };

  const handleAddMember = async (userIDToAdd) => {
    try {
      socket.emit("joinChat", chatID);

      const res = await fetch(`/api/chats/${chatID}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userIDToAdd }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add user");
      }

      const { systemMessage } = await res.json();
      setMessages((prev) => [...prev, systemMessage]); // 👈 Add it locally too

      // Refresh members
      const updatedMembersRes = await fetch(`/api/chats/${chatID}/members`);
      const updatedMembers = await updatedMembersRes.json();
      setMembersArray(updatedMembers);

      // Refresh chats (for last message preview, etc.)
      const updatedChatsRes = await fetch(`/api/chats/${currentUserID}`);
      const updatedChats = await updatedChatsRes.json();
      setChats(updatedChats);

      fetchNonMembers(); // Refresh list of people you can add

    } catch (err) {
      console.error("Error adding user:", err);
      alert(err.message);
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    const messageData = {
      senderUserID: currentUserID,
      chatID,
      messageText: newMessage.trim(),
    };

    try {
      const response = await fetch(`/api/chats/${chatID}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");

      const savedMessage = await response.json();
      socket.emit("sendMessage", savedMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageID) => {
    try {
      const res = await fetch(`/api/messages/${messageID}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageID === messageID ? { ...msg, isDeleted: true } : msg
          )
        );

        const updatedChats = await fetch(`/api/chats/${currentUserID}`).then((res) =>
          res.json()
        );
        setChats(updatedChats);
      } else {
        console.error("Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleDeleteChat = async () => {
    try {
      const res = await fetch(`/api/chats/${chatID}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete chat");

      setChats((prevChats) => {
        const filteredChats = prevChats.filter((chat) => chat.chatID !== chatID);
        setChats(filteredChats);

        // Determine next chat based on current tab
        const filteredByTab = filteredChats.filter((chat) =>
          activeTab === "direct" ? chat.chatType === "Private" : chat.chatType === "Group"
        );

        if (filteredByTab.length > 0) {
          handleChangeChat(filteredByTab[0].chatID);
        } else {
          handleChangeChat(null);
        }

        return filteredChats;
      });
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Something went wrong while deleting the chat.");
    }
  };

  const handleEditMessage = async () => {
    if (!editText.trim() || !editingMessageID) return;

    try {
      const response = await fetch(`/api/messages/${editingMessageID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newText: editText }),
      });

      if (!response.ok) throw new Error("Failed to edit message");

      const updatedMessage = await response.json();

      // Update messages in the middle section
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageID === editingMessageID
            ? { ...msg, messageText: editText, isEdited: true }
            : msg
        )
      );

      // Update the left sidebar
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.chatID === chatID
            ? {
              ...chat,
              lastMessageText: editText,
              lastMessageTimestamp: updatedMessage.timestamp || new Date().toISOString(),
              lastMessageSender: currentUserName,
            }
            : chat
        )
      );

      setEditingMessageID(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const textareaRef = useRef(null);

  useEffect(() => {
    if (editingMessageID && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [editingMessageID, editText]);

  // WebSocket connection
  useEffect(() => {
    // Connection status listeners
    const onConnect = () => {
      socket.emit("joinChat", chatID);
    };

    const onDisconnect = () => { };

    const onConnectError = (err) => {
      console.error("Connection error:", err.message);
      setTimeout(() => socket.connect(), 1000);
    };

    const onReceiveMessage = (message) => {
      const isSystemMessage = message.senderUserID === 0;
      const isCurrentChat = String(message.chatID) === String(chatID);
      const isOwnSystemMessage = String(message.triggeredBy) === String(currentUserID);

      if (isSystemMessage) {
        if (isCurrentChat) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        } else if (!isOwnSystemMessage) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.chatID]: (prev[message.chatID] || 0) + 1,
          }));
        }

        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) => {
            if (chat.chatID === message.chatID) {
              return {
                ...chat,
                lastMessageText: message.messageText,
                lastMessageSender: "",
                lastMessageTimestamp: message.timestamp,
              };
            }
            return chat;
          });

          const updatedChat = updatedChats.find((c) => c.chatID === message.chatID);
          const rest = updatedChats.filter((c) => c.chatID !== message.chatID);
          return [updatedChat, ...rest];
        });

        return;
      }

      if (!isCurrentChat) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.chatID]: (prev[message.chatID] || 0) + 1,
        }));
      } else {
        setMessages((prevMessages) => [...prevMessages, message]);
        scrollToBottom();
      }

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat.chatID === message.chatID) {
            return {
              ...chat,
              lastMessageText: message.messageText,
              lastMessageSender: message.senderName || "Unknown",
              lastMessageTimestamp: message.timestamp,
            };
          }
          return chat;
        });

        const updatedChat = updatedChats.find((c) => c.chatID === message.chatID);
        const rest = updatedChats.filter((c) => c.chatID !== message.chatID);
        return [updatedChat, ...rest];
      });
    };

    // Set up all listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("receiveMessage", onReceiveMessage);

    // Initialise connection
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("joinChat", chatID);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("receiveMessage", onReceiveMessage);
    };
  }, [chatID]); // Only re-run when chatID changes

  useEffect(() => {
    socket.on("messageDeleted", ({ messageID }) => {
      console.log("Received messageDeleted:", messageID);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.messageID === messageID ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    return () => {
      socket.off("messageDeleted");
    };
  }, []);

  useEffect(() => {
    const handleMemberUpdate = ({ chatID: updatedChatID }) => {
      if (String(updatedChatID) === String(chatID)) {
        fetch(`/api/chats/${updatedChatID}/members`)
          .then((res) => res.json())
          .then(setMembersArray)
          .catch((err) => console.error("Error updating membersArray", err));
      }
    };

    socket.on("memberUpdated", handleMemberUpdate);
    return () => socket.off("memberUpdated", handleMemberUpdate);
  }, [chatID]);

  useEffect(() => {
    socket.on("userTyping", ({ chatID: typingChatID, userID }) => {
      if (typingChatID !== chatID || userID === currentUserID) return;

      setTypingUsers((prev) => ({
        ...prev,
        [userID]: true,
      }));

      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userID];
          return updated;
        });
      }, 3000); // Clear after 3 seconds
    });

    return () => {
      socket.off("userTyping");
    };
  }, [chatID]);

  // Scroll to the relevant message during search
  useEffect(() => {
    if (filteredIndexes.length && messagesEndRef.current) {
      const targetIndex = filteredIndexes[searchIndex];
      const el = document.getElementById(`msg-${targetIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [searchIndex, filteredIndexes]);

  // Fetch chat details
  useEffect(() => {
    fetch(`/api/chats/${currentUserID}`)
      .then((res) => res.json())
      .then((data) => {
        setChats(data);

        const directChats = data.filter(chat => chat.chatType === "Private");

        if (directChats.length > 0) {
          const firstDirect = directChats[0];
          setChatID(firstDirect.chatID);
          setChatTitle(firstDirect.chatTitle);
          setChatType(firstDirect.chatType);
          setCreatorID(firstDirect.creatorID);
          setActiveTab("direct");
        } else {
          setNoChats(true);
        }
      })
      .catch((error) => console.error("Error fetching chats:", error));
  }, [currentUserID]);

  useEffect(() => {
    fetch(`/api/chats/${chatID}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error("Error fetching messages:", error));
  }, [chatID]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch(`/api/chats/${currentUserID}/unread-counts`);
        const data = await res.json();
        setUnreadCounts(data);
      } catch (err) {
        console.error("Failed to fetch unread message counts:", err);
      }
    };

    fetchUnreadCounts();

    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, [currentUserID]);

  useEffect(() => {
    if (chatID) {
      fetch(`/api/chats/${chatID}/members`)
        .then((res) => res.json())
        .then(setMembersArray)
        .catch((err) => console.error("Failed to load chat members", err));
    }
  }, [chatID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar */}
      <LeftSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        chats={chats}
        setChatID={setChatID}
        chatID={chatID}
        handleChangeChat={handleChangeChat}
        unreadCounts={unreadCounts}
      />

      {/* Middle Section */}
      {chatID ? (
        <div className="flex-1 flex flex-col relative bg-[var(--color-highlight)]">
          {/* Header */}
          <ChatHeader
            chatTitle={chatTitle}
            chatType={chatType}
            creatorID={creatorID}
            currentUserID={currentUserID}
            isRenameModalOpen={isRenameModalOpen}
            setIsRenameModalOpen={setIsRenameModalOpen}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            handleRenameGroup={handleRenameGroup}
            fetchNonMembers={fetchNonMembers}
            setIsAddMemberOpen={setIsAddMemberOpen}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onFind={() => {
              setShowSearchBar(true);
              setSearchQuery("");
              setSearchIndex(0);
              setFilteredIndexes([]);
            }}
            onDelete={() => setIsDeleteChatModalOpen(true)}
            onLeaveGroup={() => setIsLeaveModalOpen(true)}
          />

          {showSearchBar && (
            <SearchBar
              messages={messages}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setFilteredIndexes={setFilteredIndexes}
              setSearchIndex={setSearchIndex}
              setShowSearchBar={setShowSearchBar}
              searchIndex={searchIndex}
            />
          )}

          {/* Chat Messages */}
          <div
            className="flex-1 p-4 space-y-4 overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 160px)",
              paddingRight: "10%",
              paddingLeft: "10%",
            }}
          >
            <MessageList
              messages={messages}
              currentUserID={currentUserID}
              editingMessageID={editingMessageID}
              setEditingMessageID={setEditingMessageID}
              editText={editText}
              setEditText={setEditText}
              handleEditMessage={handleEditMessage}
              messageToDelete={messageToDelete}
              setMessageToDelete={setMessageToDelete}
              searchQuery={searchQuery}
              searchIndex={searchIndex}
              filteredIndexes={filteredIndexes}
              highlightText={highlightText}
            />

            {Object.keys(typingUsers).length > 0 && (
              <div className="text-center text-xs text-gray-500 mb-2 italic">
                {Object.values(typingUsers).join(", ")}{" "}
                {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Message Input */}
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            handleEmojiClick={handleEmojiClick}
            currentUserID={currentUserID}
            currentUserName={currentUserName}
            chatID={chatID}
            socket={socket}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-highlight)] text-center px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
              <FaUserAlt className="text-white text-2xl" />
            </div>
            <h2 className="text-white text-lg font-semibold">No chat selected</h2>
            <p className="text-white/80 text-sm max-w-sm">
              To start a conversation, select a chat from the sidebar or create a new one.
            </p>
          </div>
        </div>
      )}

      {/* Right sidebar */}
      {isSidebarOpen && chatID && (
        <RightSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedChat={{ chatID, chatType, chatTitle, members: membersArray, creatorID }}
          selectedUser={membersArray.find(u => u.userID !== currentUserID)}
          onRenameGroup={handleRenameGroup}
          members={membersArray}
          currentUserID={currentUserID}
          onRemoveMember={handleRemoveMember}
        />
      )}

      {isLeaveModalOpen && (
        <ConfirmModal
          message={`Are you sure you want to leave the "${chatTitle}" group?`}
          onCancel={() => setIsLeaveModalOpen(false)}
          onConfirm={async () => {
            await handleLeaveGroup();
            setIsLeaveModalOpen(false);
          }}
        />
      )}

      {messageToDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this message?"
          onCancel={() => setMessageToDelete(null)}
          onConfirm={async () => {
            await handleDeleteMessage(messageToDelete);
            setMessageToDelete(null);
          }}
        />
      )}

      {isAddMemberOpen && (
        <AddMemberModal
          users={nonMembers}
          onCancel={() => setIsAddMemberOpen(false)}
          onAdd={handleAddMember}
        />
      )}

      {isDeleteChatModalOpen && (
        <ConfirmModal
          message="Are you sure you want to delete this chat? This action cannot be undone."
          onCancel={() => setIsDeleteChatModalOpen(false)}
          onConfirm={async () => {
            await handleDeleteChat();
            setIsDeleteChatModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Chats;
