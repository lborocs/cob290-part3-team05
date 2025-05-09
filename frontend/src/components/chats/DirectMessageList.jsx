import React from "react";
import DirectMessage from "./DirectMessage";

const DirectMessageList = ({ messages, chatID, setChatID, unreadCounts = {} }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="-mx-2 px-0">
      {messages?.length > 0 ? (
        messages.map((chat) => (
          <DirectMessage
            key={chat.chatID}
            title={chat.chatTitle}
            senderName={chat.lastMessageSender}
            messagePreview={chat.lastMessageText}
            time={formatTime(chat.lastMessageTimestamp)}
            isPinned={chat.isPinned}
            onClick={() => setChatID(chat.chatID)}
            isActive={chatID === chat.chatID}
            unreadCount={unreadCounts[chat.chatID] || 0}
          />
        ))
      ) : (
        <div className="flex justify-center items-center h-32 text-white text-sm">
          No direct messages
        </div>
      )}
    </div>
  );
};

export default DirectMessageList;