import React, { useRef, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

export const EditMessage = ({
  editText,
  setEditText,
  setEditingMessageID,
  handleEditMessage,
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editText]);

  return (
    <div className="w-full max-w-2xl rounded-xl bg-white px-2 py-2 shadow-md relative space-y-1">
      <textarea
        ref={textareaRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full min-w-0 text-sm px-2 py-1 bg-transparent text-black focus:outline-none resize-none leading-relaxed"
        placeholder="Edit your message..."
      />

      <div className="absolute bottom-2 right-3 flex items-center gap-2 text-sm">
        <button
          onClick={handleEditMessage}
          className="text-[var(--color-overlay)] hover:text-[var(--color-overlay-light)]"
          title="Save"
        >
          <FaCheck />
        </button>
        <button
          onClick={() => {
            setEditingMessageID(null);
            setEditText("");
          }}
          className="text-[var(--color-overlay)] hover:text-[var(--color-overlay-light)]"
          title="Cancel"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
