import React from "react";
import GroupMessage from "./GroupMessage";

const GroupMessageList = (props) => {
  const groupMessages = props.messages;

  return (
    <div className="p-4">
      {groupmessages?.length > 0 ? (
      groupMessages.map((msg) => (
        <GroupMessage
          key={msg.id}
          profilePicture={msg.profilePicture}
          groupName={msg.groupName}
          time={msg.time}
          lastMessage={msg.lastMessage}
          isPinned={msg.isPinned}
        />
      ))
    ) : (
      <p>No groups available</p>
      )}
    </div>
  );
};

export default GroupMessageList;
