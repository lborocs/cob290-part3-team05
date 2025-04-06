import React from "react";
import DirectMessage from "./DirectMessage";
import mockData from "../../../mockdb.json";

const DirectMessageList = () => {
  // Access only the directMessages from the mockData object
  const directMessages = mockData.directMessages;

  return (
    <div className="p-4">
      {directMessages.map((msg) => (
        <DirectMessage
          key={msg.id}
          profilePicture={msg.profilePicture}
          senderName={msg.senderName}
          time={msg.time}
          lastMessage={msg.lastMessage}
          isPinned={msg.isPinned}
        />
      ))}
    </div>
  );
};

export default DirectMessageList;
