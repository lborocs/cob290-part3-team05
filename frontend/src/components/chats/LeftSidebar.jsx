import React from "react";

// React icons
import { FaPlus, FaSearch } from "react-icons/fa";

const LeftSidebar = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, chats }) => {
    return (
        <div className="w-[250px] flex-shrink-0 flex flex-col text-white p-4"
            style={{ backgroundColor: "var(--color-overlay-light)" }}>

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Chat</h2>
                <div className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                    style={{ backgroundColor: "var(--color-overlay-dark)" }}>
                    <FaPlus className="text-white w-4 h-4" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex w-full justify-center pb-1">
                {["direct", "groups"].map((tab) => (
                    <button
                        key={tab}
                        className={`relative flex-1 text-sm text-center py-1 ${activeTab === tab ? "font-bold text-white" : "text-[var(--color-white)]"}`}
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
                {chats.length === 0 ? (
                    <p className="text-center text-gray-300">No chats available</p>
                ) : (
                    chats.map(chat => (
                        <div key={chat.chatID}
                            onClick={() => setChatID(chat.chatID)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white cursor-pointer hover:bg-gray-100 transition"
                        >
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl text-white">
                                {chat.chatTitle.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-bold truncate">{chat.chatTitle}</p>
                        </div>
                    ))
                )}
            </div>

            {/* User Info */}
            <div className="mt-4 flex items-center gap-3 p-3 border-t-[2px] border-white">
                <div className="w-10 h-10 bg-pink-500 rounded-full"></div>
                <div>
                    <p className="font-bold text-white">Full Name</p>
                    <p className="text-sm text-gray-300">Role</p>
                </div>
            </div>
        </div>
    );
};

export default LeftSidebar;