import React from "react";
import GroupMessage from "./GroupMessage";
import mockData from "../../../mockdb.json";

const GroupMessageList = () => {
  // Access only the groupMessages from the mockData object
  const groupMessages = mockData.groupMessages;

  return (
    <div className="p-4">
      {groupMessages.map((msg) => (
        <GroupMessage
          key={msg.id}
          profilePicture={msg.profilePicture}
          groupName={msg.groupName}
          time={msg.time}
          lastMessage={msg.lastMessage}
          isPinned={msg.isPinned}
        />
      ))}
    </div>
  );
};

export default GroupMessageList;
