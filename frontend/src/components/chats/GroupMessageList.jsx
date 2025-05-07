import React from "react";
import GroupMessage from "./GroupMessage";

const GroupMessageList = (props) => {
  const groupMessages = props.messages;
  const currentChatID = props.chatID;
  return (
    <div className="p-4">
      {groupMessages?.length > 0 ? (
        groupMessages.map((chat) => (
          <GroupMessage
            key={chat.chatID}
            chatID={chat.chatID}
            groupName={chat.chatTitle}
            time={chat.time}
            lastMessage={chat.lastMessage}
            isPinned={chat.isPinned}
            onClick={() => props.setChatID(chat.chatID)}
            isActive={currentChatID === chat.chatID}
          />
        ))
      ) : (
        <p>No groups available</p>
      )}
    </div>
  );
};

export default GroupMessageList;
