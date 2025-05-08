import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FaTimes, FaUsers, FaUserAlt } from "react-icons/fa";

const CreateChatModal = ({ onCancel, onCreateChat, currentUserID }) => {
  const [chatName, setChatName] = useState("");
  const [chatType, setChatType] = useState("Private");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [availablePrivUsers, setAvailablePrivUsers] = useState([]);
  const [availableAllUsers, setAvailableAllUsers] = useState([]);

  useEffect(() => {
    const fetchPrivUsers = async () => {
      try {
        const res = await fetch(
          `/api/users/not-in-private-with/${currentUserID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Request": "true",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch users");

        const userData = await res.json();
        console.log(userData);
        setAvailablePrivUsers(userData);
        setAvailableUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchPrivUsers();
  }, [currentUserID]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`/api/users/not-current/${currentUserID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Request": "true",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const userData = await res.json();
        console.log(userData);
        setAvailableAllUsers(userData);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchAllUsers();
  }, [currentUserID]);

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
    if (chatType === "Private") {
      if (!newSelection || newSelection.length === 0) {
        setSelectedUsers([]);
        setChatName("");
      } else {
        const selectedUser = newSelection[newSelection.length - 1];
        setSelectedUsers([selectedUser]);
        setChatName(selectedUser.label);
      }
    } else {
      setSelectedUsers(newSelection);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Create array of all selected user IDs, including creator
    const userIDList = [
      currentUserID,
      ...selectedUsers.map((option) => option.value),
    ];

    const newChat = {
      chatName,
      chatType,
      creatorID: currentUserID,
      userIDList,
    };

    await onCreateChat(newChat);
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
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
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
                  onChange={() => {
                    setChatType("Private");
                    setAvailableUsers(availablePrivUsers);
                    setSelectedUsers([]);
                    setChatName("");
                  }}
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
                  onChange={() => {
                    setChatType("Group");
                    setAvailableUsers(availableAllUsers);
                    setSelectedUsers([]);
                  }}
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
              className="mb-4 text-black"
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
              className="bg-[var(--color-overlay-dark)] text-white px-4 py-1.5 text-sm rounded hover:bg-[var(--color-overlay)] disabled:opacity-50 disabled:hover:bg-[var(--color-overlay-dark)]"
              disabled={
                (chatType === "Group" && !chatName) ||
                (chatType === "Private" && selectedUsers.length !== 1)
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
