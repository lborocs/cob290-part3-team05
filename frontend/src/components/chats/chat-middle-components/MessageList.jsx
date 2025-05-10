import React from "react";

// React icons
import { FaUserAlt } from "react-icons/fa";

// Components
import { EditMessage } from "./EditMessage";
import MessageOptions from "./MessageOptions";

const MessageList = ({
  messages,
  currentUserID,
  editingMessageID,
  setEditingMessageID,
  editText,
  setEditText,
  handleEditMessage,
  messageToDelete,
  setMessageToDelete,
  searchQuery,
  searchIndex,
  filteredIndexes,
  highlightText,
  handleDownload,
}) => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-2">
      {messages.map((msg, index) =>
        msg.senderUserID === 0 ? (
          <div
            key={`system-${index}`}
            className="w-full text-center text-xs text-gray-400 my-2"
          >
            {msg.messageText}
          </div>
        ) : (
          <div
            id={`msg-${index}`}
            key={msg.messageID || `${msg.senderUserID}-${index}`}
            className={`flex items-center ${
              msg.senderUserID === currentUserID
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {/* Avatar for Others */}
            {msg.senderUserID !== currentUserID && (
              <div className="w-10 h-10 flex items-center justify-center bg-[var(--color-overlay)] rounded-full mr-3 mt-5">
                <FaUserAlt className="text-white text-xl" />
              </div>
            )}

            {/* Edit Message or Message Bubble */}
            {editingMessageID === msg.messageID ? (
              <EditMessage
                editText={editText}
                setEditText={setEditText}
                setEditingMessageID={setEditingMessageID}
                handleEditMessage={handleEditMessage}
              />
            ) : (
              <div
                className={`flex flex-col max-w-[75%] ${
                  msg.senderUserID === currentUserID
                    ? "items-end"
                    : "items-start"
                }`}
              >
                {/* Name and Time */}
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1 flex-wrap">
                  <span>
                    {msg.senderUserID === currentUserID
                      ? "You"
                      : msg.senderName}
                  </span>
                  <span className="text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  {msg.isEdited && (
                    <span className="italic text-gray-400 text-[11px]">
                      Edited
                    </span>
                  )}
                </div>

                {/* Message with dot menu */}
                <div
                  className={`relative w-full flex ${
                    msg.senderUserID === currentUserID
                      ? "justify-end"
                      : "justify-start"
                  } group`}
                >
                  {!msg.isDeleted && (
                    <div
                      className={`
                        absolute top-1/2 transform -translate-y-1/2
                        opacity-0 group-hover:opacity-100 transition-opacity
                        ${
                          msg.senderUserID === currentUserID
                            ? "left-[-50px]"
                            : "right-[-50px]"
                        }
                      `}
                    >
                      <MessageOptions
                        isOwnMessage={msg.senderUserID === currentUserID}
                        onDelete={() => setMessageToDelete(msg.messageID)}
                        onEdit={() => {
                          setEditingMessageID(msg.messageID);
                          setEditText(msg.messageText);
                        }}
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-sm shadow-md max-w-[100%] break-words ${
                      msg.senderUserID === currentUserID
                        ? "bg-[var(--color-overlay-light)] text-white rounded-br-none"
                        : "bg-white text-black rounded-bl-none"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <span
                        className={`italic ${
                          msg.senderUserID === currentUserID
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        This message was deleted
                      </span>
                    ) : (
                      <div>
                        {highlightText(
                          msg.messageText,
                          searchQuery,
                          filteredIndexes[searchIndex] === index
                        )}
                        {msg.attachments?.length > 0 && (
                          <ul className="space-y-1">
                            {msg.attachments.map((file) => (
                              <li key={file.attachmentID}>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      file.attachmentID,
                                      file.fileName
                                    )
                                  }
                                  className="text-blue-500 underline text-xs flex items-center gap-1"
                                >
                                  📎 {file.fileName}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default MessageList;
