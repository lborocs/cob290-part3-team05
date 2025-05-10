import React from "react";
import { Tooltip } from "react-tooltip";

// React icons
import { FaUserAlt } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

// Components
import { EditMessage } from "./EditMessage";
import MessageOptions from "./MessageOptions";
import MediaComponent from "./MediaComponent";

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
                  className={`relative z-1 w-full flex ${
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
                    className={`p-3 z-1 rounded-2xl text-sm shadow-md max-w-[100%] break-words ${
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
                        {msg.attachment !== null && (
                          <>
                            {msg.attachment.fileType === "application/pdf" && (
                              <div className="flex flex-col items-center space-y-2">
                                <span className="text-sm text-gray-600">
                                  PDF Preview:
                                </span>
                                <embed
                                  src={`/api/messages/${msg.attachment.attachmentID}/attachment`}
                                  type="application/pdf"
                                  width="100%"
                                  height="300px"
                                  className="border rounded-lg"
                                />
                              </div>
                            )}
                            {console.log(msg.attachment.fileType)}
                            <MediaComponent msg={msg} />

                            <button
                              onClick={() =>
                                handleDownload(
                                  msg.attachment.attachmentID,
                                  msg.attachment.fileName
                                )
                              }
                              className="text-blue-500 underline text-xs flex items-center justify-center gap-1"
                              data-tooltip-content="Download content"
                              data-tooltip-id={`download-tooltip-${msg.attachment.attachmentID}`}
                              data-tooltip-place="bottom"
                            >
                              <IoMdDownload /> {msg.attachment.fileName}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {msg.attachment !== null && (
              <Tooltip
                id={`download-tooltip-${msg.attachment.attachmentID}`}
                className="z-1000"
              />
            )}
          </div>
        )
      )}
    </div>
  );
};

export default MessageList;
