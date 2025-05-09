import React, { useState, useRef, useEffect } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineReport } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

const MessageOptions = ({ isOwnMessage, onDelete, onEdit }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative z-10000" ref={menuRef}>
            <button
                className="bg-white text-black rounded-full px-2.5 py-[2px] shadow hover:bg-gray-100 transition"
                onClick={() => setOpen((prev) => !prev)}
            >
                <BsThreeDots size={16} />
            </button>

            {open && (
                <div
                    className="absolute bottom-full mb-2 w-24 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs left-1/2 transform -translate-x-1/2 z-50"
                >
                    {isOwnMessage ? (
                        <>
                            <button
                                className="w-full px-3 py-1 text-left flex items-center gap-2 rounded-md text-[var(--color-overlay-dark)] hover:bg-[var(--color-highlight)] transition"
                                onClick={() => {
                                    onEdit?.();
                                    setOpen(false);
                                }}
                            >
                                <FaPencilAlt size={11} />
                                <span>Edit</span>
                            </button>

                            <button
                                onClick={() => {
                                    onDelete?.();
                                    setOpen(false);
                                }}
                                className="w-full px-3 py-1 text-left flex items-center gap-2 rounded-md text-[var(--color-overlay-dark)] hover:bg-[var(--color-highlight)] transition"
                            >
                                <RiDeleteBinLine size={12} />
                                <span>Delete</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="w-full px-3 py-1 text-left flex items-center gap-2 rounded-md text-[var(--color-overlay-dark)] hover:bg-[var(--color-highlight)] transition"
                        >
                            <MdOutlineReport size={13} />
                            <span>Report</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageOptions;

