import React from "react";
import { RiPushpinFill } from "react-icons/ri";

const GroupMessage = ({
  groupName,
  senderName,
  messagePreview,
  time,
  isPinned,
  onClick,
  isActive,
  unreadCount = 0,
}) => {
  return (
    <button
      className={`flex items-center w-[92%] mx-auto ${isActive
        ? "bg-[var(--color-overlay)]"
        : "bg-[var(--color-overlay-light)]"
        } text-[var(--color-white)] rounded-2xl p-3 mb-2 
      hover:bg-[var(--color-highlight)] hover:text-[var(--color-overlay)] cursor-pointer`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[var(--color-overlay-dark)] flex items-center justify-center text-white font-bold text-sm">
        {groupName.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="ml-3 flex-grow min-w-0">
        <div className="flex justify-between items-center w-full">
          <span className="font-semibold text-sm truncate">{groupName}</span>
          <div className="flex items-center gap-1">
            {isPinned && <RiPushpinFill className="text-xs opacity-80" />}
            <span className="text-xs text-[var(--color-highlight)] whitespace-nowrap">
              {time}
            </span>
          </div>
        </div>
        <div className="text-xs text-[var(--color-white)] opacity-80 truncate w-full text-left">
          {senderName && <span>{senderName}:</span>} {messagePreview}
        </div>
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="ml-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full h-fit self-start">
          {unreadCount}
        </div>
      )}
    </button>
  );
};

export default GroupMessage;
