import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// React icons
import {
  FaPlus,
  FaPaperPlane,
  FaSearch,
  FaPencilAlt,
  FaEllipsisH,
} from "react-icons/fa";
import { TiUserAdd } from "react-icons/ti";
import {
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarLeftCollapseFilled,
} from "react-icons/tb";
import { GoPaperclip } from "react-icons/go";
import { MdOutlineEmojiEmotions } from "react-icons/md";

const Chats = () => {
  const [activeTab, setActiveTab] = useState("direct"); // Tracks active tab (Direct or Groups)
  const [searchTerm, setSearchTerm] = useState(""); // Search input state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Controls sidebar visibility
  const [isNotificationsOn, setIsNotificationsOn] = useState(false); // Notifications toggle state

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("chat message", input);
    setInput("");
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar */}
      <div
        className="w-[250px] flex-shrink-0 flex flex-col text-white p-4"
        style={{ backgroundColor: "var(--color-overlay-light)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chat</h2>
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
            style={{ backgroundColor: "var(--color-overlay-dark)" }}
          >
            <FaPlus className="text-white w-4 h-4" />
          </div>
        </div>

        {/* Tabs (Direct & Groups) */}
        <div className="flex w-full justify-center pb-1">
          {["direct", "groups"].map((tab) => (
            <button
              key={tab}
              className={`relative flex-1 text-sm text-center py-1 ${
                activeTab === tab
                  ? "font-bold text-white"
                  : "text-[var(--color-white)]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 w-full h-[4px] bg-[var(--color-highlight)]"></span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative flex items-center">
          <span className="absolute left-4 text-gray-400">
            <FaSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 px-10 text-sm text-gray-600 bg-white rounded-lg shadow-md outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
          />
        </div>

        {/* Chat List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3"></div>

        {/* User Info Section */}
        <div className="mt-4 flex items-center gap-3 p-3 border-t-[2px] border-white">
          <div className="w-10 h-10 bg-pink-500 rounded-full"></div>
          <div>
            <p className="font-bold text-white">Full Name</p>
            <p className="text-sm text-gray-300">Role</p>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex-1 flex flex-col relative bg-[var(--color-highlight)]">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3 ml-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <h2 className="text-lg font-bold">
              {activeTab === "direct" ? "Full Name" : "Group Title"}
            </h2>

            {activeTab !== "direct" && ( // Shows edit icons only in group chats
              <FaPencilAlt className="text-[var(--color-overlay-dark)] cursor-pointer" />
            )}
          </div>

          <div className="flex items-center gap-4 text-[var(--color-overlay-dark)] text-lg mr-4">
            {activeTab !== "direct" && ( // Only show add members icon when in Groups
              <TiUserAdd className="cursor-pointer" />
            )}
            <FaEllipsisH className="cursor-pointer" />

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? (
                <TbLayoutSidebarLeftCollapseFilled className="cursor-pointer text-2xl" />
              ) : (
                <TbLayoutSidebarRightCollapseFilled className="cursor-pointer text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>

        {/* Message Input */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] sm:w-[95%]">
          <div className="flex items-center w-full bg-white bg-opacity-90 backdrop-blur-md rounded-full px-4 py-1.5 shadow-lg">
            <form onSubmit={sendMessage}>
              <button className="text-[var(--color-overlay-dark)] text-xl flex-shrink-0">
                <GoPaperclip />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent px-3 text-gray-700 outline-none placeholder-gray-500 text-sm min-w-0"
              />
              <button className="text-[var(--color-overlay-dark)] text-2xl mr-1 flex-shrink-0">
                <MdOutlineEmojiEmotions />
              </button>
              <button
                className="ml-2 w-9 h-9 flex items-center justify-center text-white rounded-full shadow-md flex-shrink-0"
                style={{ backgroundColor: "var(--color-overlay-dark)" }}
                type="submit"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      {isSidebarOpen && (
        <div
          className="w-[250px] text-white flex flex-col items-center p-4"
          style={{ backgroundColor: "var(--color-overlay-dark)" }}
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center">
            <h2 className="text-lg font-bold">
              {activeTab === "direct" ? "Chat Details" : "Group Info"}
            </h2>
            <div
              className="text-3xl cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            >
              &times;
            </div>
          </div>

          {activeTab === "direct" ? (
            // Sidebar for Direct Messages
            <>
              <div className="relative w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mt-4"></div>

              <h2 className="text-lg font-bold mt-2">Full Name</h2>
              <p className="text-sm text-gray-300">Role</p>

              <div className="mt-3 text-left w-full">
                <h3 className="text-sm font-bold">Email:</h3>
                <p className="text-sm text-gray-300">
                  Fullname@make-it-all.co.uk
                </p>
              </div>

              {/* Notifications Toggle */}
              <div
                className="mt-4 flex items-center justify-between w-full bg-[var(--color-overlay-light)] p-2 rounded-lg"
                onClick={() => setIsNotificationsOn(!isNotificationsOn)}
              >
                <span className="text-sm font-bold">Notifications</span>

                <div
                  className={`w-10 h-5 flex items-center rounded-full transition-all duration-300 cursor-pointer 
                    ${isNotificationsOn ? "bg-purple-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md 
                        ${
                          isNotificationsOn ? "translate-x-5" : "translate-x-0"
                        }`}
                  ></div>
                </div>
              </div>

              {/* Media Section */}
              <div className="mt-6 w-full">
                <h3 className="font-bold text-lg">
                  Media <span className="text-sm text-gray-300">0 Images</span>
                </h3>
              </div>

              {/* Shared Files Section */}
              <div className="mt-6 w-full">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">Shared Files</h3>
                  <span className="text-sm text-gray-300 cursor-pointer">
                    View All
                  </span>
                </div>
              </div>
            </>
          ) : (
            // Sidebar for Group Chats
            <>
              {/* Header */}
              <div className="flex flex-col items-center mt-4">
                <div className="w-20 h-20 bg-pink-500 rounded-full"></div>
                <div className="mt-3 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Group Title</h2>
                  <FaPencilAlt className="cursor-pointer text-white text-sm" />
                </div>
                <p className="text-sm text-gray-300">0 Members</p>
              </div>

              {/* Members Section */}
              <div className="mt-10 w-full">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">Members</h3>
                  <span className="text-sm text-gray-300 cursor-pointer">
                    View All
                  </span>
                </div>
              </div>

              {/* Media Section */}
              <div className="mt-20 w-full">
                <h3 className="font-bold text-lg">
                  Media <span className="text-sm text-gray-300">0 Images</span>
                </h3>
              </div>

              {/* Shared Files Section */}
              <div className="mt-20 w-full">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg">Shared Files</h3>
                  <span className="text-sm text-gray-300 cursor-pointer">
                    View All
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chats;
