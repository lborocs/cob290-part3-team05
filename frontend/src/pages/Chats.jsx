import React, { useState, useEffect, useRef } from "react";

// Components
import LeftSidebar from "../components/chats/LeftSidebar";
import RightSidebar from "../components/chats/RightSidebar";
import MessageOptions from "../components/chats/MessageOptions";
import ChatActionsMenu from "../components/chats/ChatActionsMenu";
import SearchBar from "../components/chats/SearchBar";
import RenameGroupModal from "../components/chats/modals/RenameGroupModal";
import ConfirmModal from "../components/chats/modals/ConfirmModal";
import AddMemberModal from "../components/chats/modals/AddMemberModal";
import MessageInput from "../components/chats/MessageInput";

// React icons
import { FaPencilAlt, FaUserAlt, FaCheck, FaTimes } from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import {
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";

// WebSocket connection to backend
import { io } from "socket.io-client";
import { EditMessage } from "../components/chats/chat-middle-components/EditMessage";
import { jwtDecode } from "jwt-decode";

// Initial WebSocket connection
const socket = io("http://localhost:8080", {
  transports: ["websocket", "polling"],
  path: "/socket.io",
  withCredentials: true,
});

const Chats = () => {
  // Config

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const currentUserID = decodedToken.id;
  const currentUserName = decodedToken.firstName;

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
    if (chatID === null) {
      setNoChats(true);
    } else {
      setNoChats(false);
      const selectedChat = chats.find((chat) => chat.chatID === chatID);
      console.log(selectedChat);
      setChatID(chatID);
      console.log(selectedChat.chatTitle);
      setChatTitle(selectedChat.chatTitle);
      setChatType(selectedChat.chatType);
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

      setChats((prev) => prev.filter((chat) => chat.chatID !== chatID));
      setChatID(null);
      setChatTitle("Select a chat");
      setMessages([]);
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
      const res = await fetch(`/api/chats/${chatID}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userIDToAdd }),
      });

      if (!res.ok) throw new Error("Failed to add user to group");
      socket.emit("joinChat", chatID);
      fetchNonMembers();
    } catch (err) {
      console.error("Failed to add user:", err);
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
            msg.messageID === messageID ? { ...msg, is_deleted: true } : msg
          )
        );
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

      // Update UI after successful deletion
      setChats((prev) => prev.filter((chat) => chat.chatID !== chatID));
      setChatID(null);
      setChatTitle("Select a chat");
      setMessages([]);
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

      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageID === editingMessageID
            ? { ...msg, messageText: editText, is_edited: true }
            : msg
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

    const onDisconnect = () => {};

    const onConnectError = (err) => {
      console.error("Connection error:", err.message);
      setTimeout(() => socket.connect(), 1000);
    };

    const onReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
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

        // If user has chats, auto-select the first one
        if (data.length > 0) {
          setChatID(data[0].chatID);
          setChatTitle(data[0].chatTitle);
          setChatType(data[0].chatType);
          setCreatorID(data[0].creatorID);
        } else {
          // No chats available
          setChatTitle("No chats yet");
          setChatType(null);
          setChatID(null);
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
    scrollToBottom();
  }, [messages]);

  // Create a chat
  const createChat = async (chatData) => {
    console.log(chatData);
    try {
      const res = await fetch(`/api/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatData),
      });

      if (!res.ok) throw new Error("Error whilst creating chat");
    } catch (err) {
      console.error("Failed to create chat:", err);
    }

    fetch(`/api/chats/${currentUserID}`)
      .then((res) => res.json())
      .then((data) => {
        setChats(data);

        // If user has chats, auto-select the first one
        if (data.length > 0) {
          setChatID(data[0].chatID);
          setChatTitle(data[0].chatTitle);
          setChatType(data[0].chatType);
          setCreatorID(data[0].creatorID);
        } else {
          // No chats available
          setChatTitle("No chats yet");
          setChatType(null);
          setChatID(null);
        }
      })
      .catch((error) => console.error("Error fetching chats:", error));
  };

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
        createChat={createChat}
        handleChangeChat={handleChangeChat}
        currentUserID={currentUserID}
      />

      {/* Middle Section */}
      <div className="flex-1 flex flex-col relative bg-[var(--color-highlight)]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-white shadow-md">
          <div className="flex items-center gap-3 ml-4">
            {/* Chat Profile Icon (First Letter of Title) */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white">
              {chatTitle ? chatTitle.charAt(0).toUpperCase() : "?"}
            </div>

            {/* Dynamic Chat Title */}
            <h2 className="text-xl font-bold truncate max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
              {chatTitle}
            </h2>

            {/* Edit Icon for Group Chats */}
            {chatType === "Group" && (
              <div className="relative">
                <FaPencilAlt
                  onClick={() => {
                    setNewGroupName(chatTitle);
                    setIsRenameModalOpen(true);
                  }}
                  className="cursor-pointer text-[var(--color-overlay-dark)] hover:text-[var(--color-overlay)] transition"
                />
                {isRenameModalOpen && (
                  <RenameGroupModal
                    currentName={chatTitle}
                    newName={newGroupName}
                    setNewName={setNewGroupName}
                    onCancel={() => setIsRenameModalOpen(false)}
                    onSave={() => {
                      handleRenameGroup(newGroupName);
                      setIsRenameModalOpen(false);
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-[var(--color-overlay-dark)] text-lg mr-4">
            {/* Show Add Member Icon Only for Group Chats */}
            {chatType === "Group" && creatorID === currentUserID && (
              <TiUserAdd
                className="cursor-pointer transition-colors duration-200 hover:text-[var(--color-overlay)]"
                onClick={() => {
                  fetchNonMembers();
                  setIsAddMemberOpen(true);
                }}
              />
            )}

            <ChatActionsMenu
              chatType={chatType}
              creatorID={creatorID}
              currentUserID={currentUserID}
              onFind={() => {
                setShowSearchBar(true);
                setSearchQuery("");
                setSearchIndex(0);
                setFilteredIndexes([]);
              }}
              onPin={() => console.log("Pin clicked")}
              onMute={() => console.log("Mute clicked")}
              onDelete={() => setIsDeleteChatModalOpen(true)}
              onLeaveGroup={() => setIsLeaveModalOpen(true)}
            />

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? (
                <TbLayoutSidebarLeftCollapseFilled className="cursor-pointer text-2xl transition-colors duration-200 hover:text-[var(--color-overlay)]" />
              ) : (
                <TbLayoutSidebarRightCollapseFilled className="cursor-pointer text-2xl transition-colors duration-200 hover:text-[var(--color-overlay)]" />
              )}
            </button>
          </div>
        </div>

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
          <div className="flex flex-col w-full max-w-3xl mx-auto space-y-2">
            {messages.map((msg, index) => {
              return msg.senderUserID === 0 ? (
                <div
                  key={`system-${index}`}
                  className="w-full text-center text-xs text-gray-400 my-2"
                >
                  {msg.messageText}
                </div>
              ) : (
                <div
                  id={`msg-${index}`}
                  key={msg.messageID || `${msg.senderUserID}-${index}`}
                  className={`flex items-center ${
                    msg.senderUserID === currentUserID
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* Avatar for Others (Left) */}
                  {msg.senderUserID !== currentUserID && (
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-overlay)] rounded-full mr-3 mt-5">
                      <FaUserAlt className="text-white text-xl" />
                    </div>
                  )}

                  {/* Edit message box */}
                  {editingMessageID === msg.messageID ? (
                    <EditMessage
                      editText={editText}
                      setEditText={setEditText}
                      setEditingMessageID={setEditingMessageID}
                      handleEditMessage={handleEditMessage}
                    />
                  ) : (
                    <div
                      className={`flex flex-col max-w-[75%] ${
                        msg.senderUserID === currentUserID
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {/* Name and Timestamp */}
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1 flex-wrap">
                        <span>
                          {msg.senderUserID === currentUserID
                            ? "You"
                            : msg.senderName}
                        </span>
                        <span className="text-gray-400">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        {msg.isEdited && (
                          <span className="italic text-gray-400 text-[11px]">
                            Edited
                          </span>
                        )}
                      </div>

                      <div
                        className={`relative w-full flex ${
                          msg.senderUserID === currentUserID
                            ? "justify-end"
                            : "justify-start"
                        } group`}
                      >
                        {/* Dot Menu */}
                        {!msg.isDeleted && (
                          <div
                            className={`
              absolute top-1/2 transform -translate-y-1/2
              opacity-0 group-hover:opacity-100 transition-opacity
              ${
                msg.senderUserID === currentUserID
                  ? "left-[-50px]"
                  : "right-[-50px]"
              }
            `}
                          >
                            <MessageOptions
                              isOwnMessage={msg.senderUserID === currentUserID}
                              onDelete={() => setMessageToDelete(msg.messageID)}
                              onEdit={() => {
                                setEditingMessageID(msg.messageID);
                                setEditText(msg.messageText);
                              }}
                            />
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`
            p-3 rounded-2xl text-sm shadow-md max-w-[100%] break-words
            ${
              msg.senderUserID === currentUserID
                ? "bg-[var(--color-overlay-light)] text-white rounded-br-none"
                : "bg-white text-black rounded-bl-none"
            }
          `}
                        >
                          {msg.isDeleted ? (
                            <span
                              className={`italic ${
                                msg.senderUserID === currentUserID
                                  ? "text-white/60"
                                  : "text-gray-400"
                              }`}
                            >
                              This message was deleted
                            </span>
                          ) : (
                            <div>
                              {highlightText(
                                msg.messageText,
                                searchQuery,
                                filteredIndexes[searchIndex] === index
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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

      {/* Right sidebar */}
      {isSidebarOpen && (
        <RightSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          isNotificationsOn={isNotificationsOn}
          setIsNotificationsOn={setIsNotificationsOn}
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
