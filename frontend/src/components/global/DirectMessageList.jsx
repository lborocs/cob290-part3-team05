import React from "react";
import DirectMessage from "./DirectMessage";

const DirectMessageList = (props) => {
  // Access only the directMessages from the mockData object
  const directMessages = props.messages;

  return (
    <div className="p-4">
      {directMessages?.length > 0 ? (
      directMessages.map((msg) => (
        <DirectMessage
          key={msg.id}
          profilePicture={msg.profilePicture}
          senderName={msg.senderName}
          time={msg.time}
          lastMessage={msg.lastMessage}
          isPinned={msg.isPinned}
        />
      ))
    ) : (
      <p>No direct messages</p>
    )}
    </div>
  );
};

export default DirectMessageList;
