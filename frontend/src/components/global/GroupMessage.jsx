import React from "react";

const GroupMessage = ({ profilePicture, groupName, time, lastMessage, isPinned }) => {
  const truncatedMessage = lastMessage.length > 50 ? `${lastMessage.slice(0, 50)}...` : lastMessage;

  return (
    <div className="flex items-center bg-[var(--color-overlay)] text-[var(--color-white)] rounded-lg p-3 mb-2 hover:bg-[var(--color-overlay-light)] cursor-pointer">
      {/* Profile Picture */}
      <div className="w-10 h-10 rounded-full bg-[var(--color-overlay-dark)] flex-shrink-0 overflow-hidden">
        {profilePicture ? (
          <img src={profilePicture} alt={`${groupName}'s profile`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[var(--color-overlay-dark)]"></div>
        )}
      </div>

      {/* Message Content */}
      <div className="ml-3 flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">{groupName}</span>
          {isPinned && <span className="text-xs ml-2">📌</span>}
          <span className="text-xs text-[var(--color-highlight)]">{time}</span>
        </div>
        <p className="text-xs mt-1">{truncatedMessage}</p>
      </div>
    </div>
  );
};

export default GroupMessage;
