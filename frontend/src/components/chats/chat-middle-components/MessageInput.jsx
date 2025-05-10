import React from "react";

// React icons
import { GoPaperclip } from "react-icons/go";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";

// Emoji picker component
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  currentUserID,
  currentUserName,
  chatID,
  socket,
  setAttachment,
  attachment,
}) => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] sm:w-[95%]">
      {attachment && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <GoPaperclip className="text-gray-500" />
          <span className="truncate">{attachment.name}</span>
          <button
            onClick={() => setAttachment(null)}
            className="text-red-500 text-xs hover:underline ml-auto"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center w-full mt-2 bg-white bg-opacity-90 backdrop-blur-md rounded-full px-4 py-1.5 shadow-lg">
        <label className="text-[var(--color-overlay-dark)] text-xl flex-shrink-0 cursor-pointer">
          <GoPaperclip />
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              setAttachment(e.target.files[0]);
            }}
            disabled={attachment != null}
          />
        </label>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socket.emit("userTyping", {
              userID: currentUserID,
              userName: currentUserName,
              chatID,
            });
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 bg-transparent px-3 text-gray-700 outline-none placeholder-gray-500 text-sm min-w-0"
          placeholder="Type a message..."
        />

        <button
          className="text-[var(--color-overlay-dark)] text-2xl mr-1 flex-shrink-0 transition-all duration-300 ease-in-out hover:text-[var(--color-overlay)]"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <MdOutlineEmojiEmotions />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-12 right-0">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <button
          onClick={handleSendMessage}
          disabled={isSending}
          className="ml-2 w-9 h-9 flex items-center justify-center text-white rounded-full shadow-md flex-shrink-0 transition-all duration-300 ease-in-out
                        bg-[var(--color-overlay-dark)] hover:bg-[var(--color-overlay-light)]"
        >
          <FaPaperPlane className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
