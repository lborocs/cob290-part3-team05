import React from "react";
import DirectMessage from "./DirectMessage";

const DirectMessageList = (props) => {
  const directMessages = props.messages;
  const currentChatID = props.chatID;

  return (
    <div className="p-4">
      {directMessages?.length > 0 ? (
        directMessages.map((chat) => (
          <DirectMessage
            key={chat.chatID}
            senderName={chat.chatTitle}
            time={chat.time}
            lastMessage={chat.lastMessage}
            isPinned={chat.isPinned}
            onClick={() => props.setChatID(chat.chatID)}
            isActive={currentChatID === chat.chatID}
          />
        ))
      ) : (
        <p>No direct messages</p>
      )}
    </div>
  );
};

export default DirectMessageList;
