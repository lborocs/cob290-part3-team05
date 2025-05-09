import React, { useState, useRef, useEffect } from "react";
import { FaSearch, FaBellSlash, FaTrashAlt, FaEllipsisH } from "react-icons/fa";
import { MdExitToApp } from "react-icons/md";
import { BsPinAngleFill } from "react-icons/bs";

const ChatActionsMenu = ({
    chatType,
    creatorID,
    currentUserID,
    onFind,
    onPin,
    onDelete,
    onLeaveGroup,
}) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (callback) => {
        callback?.();
        setOpen(false);
    };

    const baseItemStyle =
        "flex items-center gap-2 px-4 py-2 w-full text-left text-xs transition-colors rounded-md";
    const normalItem = `${baseItemStyle} hover:bg-[var(--color-highlight)] text-bg-[var(--color-overlay-dark)]`;
    const dangerItem = `${baseItemStyle} hover:bg-red-100 text-red-600`;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="text-[var(--color-overlay-dark)] text-lg hover:text-[var(--color-overlay)] transition"
            >
                <FaEllipsisH />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-50 py-2 animate-fade-in">
                    <button className={normalItem} onClick={() => handleAction(onFind)}>
                        <FaSearch size={14} />
                        <span>Find in chat</span>
                    </button>
                    <button className={normalItem} onClick={() => handleAction(onPin)}>
                        <BsPinAngleFill size={14} />
                        <span>Pin</span>
                    </button>

                    {chatType === "Group" && (
                        <button className={dangerItem} onClick={() => handleAction(onLeaveGroup)}>
                            <MdExitToApp size={15} />
                            <span>Leave Group</span>
                        </button>
                    )}

                    {creatorID === currentUserID && (
                        <button className={dangerItem} onClick={() => handleAction(onDelete)}>
                            <FaTrashAlt size={13} />
                            <span>Delete Chat</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatActionsMenu;
