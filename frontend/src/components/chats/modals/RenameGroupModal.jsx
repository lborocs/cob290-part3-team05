import React, { useRef, useEffect } from "react";

const RenameGroupModal = ({
    currentName,
    newName,
    setNewName,
    onCancel,
    onSave,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onCancel();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onCancel]);

    return (
        <div
            ref={modalRef}
            className="absolute top-8 -left-32 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4"
        >
            <h3 className="text-sm text-gray-600 mb-2">Group name</h3>
            <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-overlay)]"
            />
            <div className="flex justify-end gap-2 mt-3">
                <button
                    className="px-2.5 py-1 rounded text-xs border hover:bg-gray-100"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="px-3 py-1 rounded text-xs text-white bg-[var(--color-overlay-dark)] hover:bg-[var(--color-overlay)]"
                    onClick={onSave}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default RenameGroupModal;

