import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import RenameGroupModal from "./modals/RenameGroupModal";
import ConfirmModal from "./modals/ConfirmModal";

const RightSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedChat,
  selectedUser,
  onRenameGroup,
  members = [],
  currentUserID,
  onRemoveMember,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState(
    selectedChat?.chatTitle || ""
  );
  const [userToRemove, setUserToRemove] = useState(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const openRenameModal = () => {
    setNewGroupName(selectedChat?.chatTitle || "");
    setIsRenameOpen(true);
  };

  const isCurrentUserAdmin = currentUserID === selectedChat?.creatorID;

  return (
    <div
      className="w-[300px] text-white flex flex-col items-center p-4"
      style={{ backgroundColor: "var(--color-overlay-dark)" }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {selectedChat?.chatType === "Private" ? "Chat Details" : "Group Info"}
        </h2>
        <div
          className="text-3xl cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        >
          &times;
        </div>
      </div>

      {selectedChat?.chatType === "Private" ? (
        <>
          {/* Direct Chat */}
          <div className="relative w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mt-4">
            {`${selectedUser?.firstName?.charAt(0) || ""}${
              selectedUser?.lastName?.charAt(0) || ""
            }`.toUpperCase() || "?"}
          </div>
          <h2 className="text-lg font-bold mt-2">
            {selectedUser
              ? `${selectedUser.firstName} ${selectedUser.lastName}`
              : "Unknown"}
          </h2>
          <p className="text-sm text-gray-300">
            {selectedUser?.userType || "Role not available"}
          </p>
          <p className="text-sm text-gray-300">
            {selectedUser?.userEmail || "Email not available"}
          </p>
        </>
      ) : (
        <>
          {/* Group Info */}
          <div className="flex flex-col items-center mt-4">
            <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {selectedChat?.chatTitle?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {selectedChat?.chatTitle || "Group"}
              </h2>
              <FaPencilAlt
                className="cursor-pointer text-white text-sm"
                onClick={openRenameModal}
              />
            </div>
            <p className="text-sm text-gray-300">{members.length} Members</p>
          </div>

          {/* Members List */}
          <div className="mt-10 w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Members</h3>
                <span className="w-6 h-6 bg-pink-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {members.length}
                </span>
              </div>
              {members.length > 3 && (
                <span
                  className="text-sm text-gray-300 cursor-pointer hover:underline"
                  onClick={() => setShowAllMembers((prev) => !prev)}
                >
                  {showAllMembers ? "Show Less" : "View All"}
                </span>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {(showAllMembers ? members : members.slice(0, 3)).map((user) => {
                const initials = `${user.firstName?.charAt(0) || ""}${
                  user.lastName?.charAt(0) || ""
                }`.toUpperCase();
                const canRemove =
                  isCurrentUserAdmin &&
                  user.userID !== currentUserID &&
                  user.userID !== selectedChat?.creatorID;

                return (
                  <div
                    key={user.userID}
                    className="relative group flex items-center justify-between bg-white/10 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {initials}
                      </div>
                      <span className="text-sm text-white">
                        {user.firstName} {user.lastName}{" "}
                        <span className="text-xs text-gray-300">
                          ({user.userType})
                        </span>
                      </span>
                    </div>

                    {canRemove && (
                      <button
                        onClick={() => setUserToRemove(user)}
                        className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition mr-2"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {isRenameOpen && (
        <RenameGroupModal
          currentName={selectedChat?.chatTitle}
          newName={newGroupName}
          setNewName={setNewGroupName}
          onCancel={() => setIsRenameOpen(false)}
          onSave={() => {
            onRenameGroup(newGroupName);
            setIsRenameOpen(false);
          }}
          centered={true}
        />
      )}

      {userToRemove && (
        <ConfirmModal
          message={`Are you sure you want to remove ${userToRemove.firstName} ${userToRemove.lastName} from the group?`}
          onCancel={() => setUserToRemove(null)}
          onConfirm={async () => {
            if (onRemoveMember) {
              await onRemoveMember(userToRemove.userID);
            }
            setUserToRemove(null);
          }}
        />
      )}
    </div>
  );
};

export default RightSidebar;
