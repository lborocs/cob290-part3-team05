import React from "react";
import { RiPushpinFill } from "react-icons/ri";

const DirectMessage = ({
  senderName,
  time,
  lastMessage,
  isPinned,
  onClick,
  isActive,
}) => {
  return (
    <button
      className={`flex items-center min-w-full ${
        isActive
          ? "bg-[var(--color-overlay)]"
          : "bg-[var(--color-overlay-light)]"
      } text-[var(--color-white)] rounded-lg p-3 mb-2 hover:bg-[var(--color-highlight)] hover:text-[var(--color-overlay)] cursor-pointer`}
      onClick={onClick}
    >
      {/* Profile Picture */}
      <div className="w-10 h-10 rounded-full bg-[var(--color-overlay-dark)] flex-shrink-0 overflow-hidden">
        <div className="flex justify-center items-center w-full h-full text-white bg-[var(--color-overlay-dark)]">
          {senderName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Message Content */}
      <div className="ml-3 flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">{senderName}</span>
          {isPinned && <RiPushpinFill />}
          <span className="text-xs text-[var(--color-highlight)]">{time}</span>
        </div>
        {/*<p className="text-xs mt-1">{truncatedMessage}</p>*/}
      </div>
    </button>
  );
};

export default DirectMessage;
