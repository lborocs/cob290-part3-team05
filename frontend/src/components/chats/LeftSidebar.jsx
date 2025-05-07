import React from "react";
import DirectMessageList from "./DirectMessageList";
import GroupMessageList from "./GroupMessageList";
import { useState } from "react";
import CreateChatModal from "./modals/CreateChatModal";

// React icons
import { FaPlus, FaSearch } from "react-icons/fa";

const LeftSidebar = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  chats,
  setChatID,
  chatID,
  createChat,
}) => {
  const directMessages = chats.filter((chat) => chat.chatType === "Private");
  const groupMessages = chats.filter((chat) => chat.chatType === "Group");
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);

  return (
    <div
      className="w-[250px] flex-shrink-0 flex flex-col text-white p-4"
      style={{ backgroundColor: "var(--color-overlay-light)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chat</h2>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
          style={{ backgroundColor: "var(--color-overlay-dark)" }}
          onClick={() => {
            setIsCreateChatOpen(true);
          }}
        >
          <FaPlus className="text-white w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
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
      <div className="mt-4 flex-1 overflow-y-auto space-y-3">
        {activeTab === "direct" ? (
          <DirectMessageList
            searchTerm={searchTerm}
            messages={directMessages}
            setChatID={setChatID}
            chatID={chatID}
          />
        ) : (
          <GroupMessageList
            searchTerm={searchTerm}
            messages={groupMessages}
            setChatID={setChatID}
            chatID={chatID}
          />
        )}
      </div>

      {isCreateChatOpen && (
        <CreateChatModal onCancel={() => setIsCreateChatOpen(false)} />
      )}
    </div>
  );
};

export default LeftSidebar;
