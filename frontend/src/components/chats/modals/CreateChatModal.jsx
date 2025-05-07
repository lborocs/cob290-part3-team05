import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaTimes, FaUsers, FaUserAlt } from "react-icons/fa";

const CreateChatModal = ({ onCancel, onCreateChat, currentUserID }) => {
  const [chatTitle, setChatTitle] = useState("");
  const [chatType, setChatType] = useState("Private");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Mock users till tied to demonstration
  const [availableUsers, setAvailableUsers] = useState([
    { userID: "user1", firstName: "Binuka", lastName: "Perera" },
    { userID: "user2", firstName: "Stephen", lastName: "Sir" },
    { userID: "user3", firstName: "Johns", lastName: "Arc" },
    { userID: "user4", firstName: "Spider", lastName: "Man" },
  ]);

  // Find current user in the list
  const currentUser = availableUsers.find(
    (user) => user.userID === currentUserID
  ) || { userID: currentUserID, firstName: "Current", lastName: "User" };

  // Create options for react-select
  const options = availableUsers
    .filter((user) => user.userID !== currentUserID) // Filter out current user (as already added)
    .map((user) => ({
      value: user.userID,
      label: `${user.firstName} ${user.lastName}`,
    }));

  const handleSelectChange = (newSelection) => {
    // For Private chats, ensure only one user can be selected
    if (chatType === "Private" && newSelection.length > 1) {
      // Keep only the most recently added user
      setSelectedUsers([newSelection[newSelection.length - 1]]);
    } else {
      setSelectedUsers(newSelection);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Create array of all selected user IDs, including creator
    const userIDs = [
      currentUserID,
      ...selectedUsers.map((option) => option.value),
    ];

    const newChat = {
      chatTitle,
      chatType,
      creatorID: currentUserID,
      userIDs,
    };

    onCreateChat(newChat);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[28rem] p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create New Chat
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Chat Title */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Chat Title
            </label>
            <input
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chat title"
              required
              disabled={chatType === "Private"}
            />
          </div>

          {/* Chat Type */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Chat Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="chatType"
                  value="Private"
                  checked={chatType === "Private"}
                  onChange={() => setChatType("Private")}
                  className="mr-2"
                />
                <FaUserAlt className="mr-2 text-gray-600" size={14} />
                <span className="text-gray-700">Private</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="chatType"
                  value="Group"
                  checked={chatType === "Group"}
                  onChange={() => setChatType("Group")}
                  className="mr-2"
                />
                <FaUsers className="mr-2 text-gray-600" size={14} />
                <span className="text-gray-700">Group</span>
              </label>
            </div>
          </div>

          {/* User Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Users
              {chatType === "Private" && (
                <span className="text-xs text-gray-500 ml-2">
                  (Select one user for private chat)
                </span>
              )}
            </label>

            {/* Current user indicator */}
            <div className="mb-2 flex items-center">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center">
                <span className="mr-1">You:</span>
                {`${currentUser.firstName} ${currentUser.lastName}`}
              </span>
            </div>

            <Select
              options={options}
              isMulti
              value={selectedUsers}
              onChange={handleSelectChange}
              placeholder="Select one or more users"
              className="mb-4 "
            />

            {chatType === "Private" && selectedUsers.length > 1 && (
              <p className="text-red-500 text-xs mt-1">
                Private chats can only have one recipient
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[var(--color-overlay-dark)] text-white px-4 py-1.5 text-sm rounded hover:bg-[var(--color-overlay)] disabled:opacity-50"
              disabled={
                !chatTitle ||
                (chatType === "Private"
                  ? selectedUsers.length !== 1
                  : selectedUsers.length < 1)
              }
            >
              Create Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;
