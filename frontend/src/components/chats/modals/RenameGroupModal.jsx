import React, { useRef, useEffect } from "react";

const RenameGroupModal = ({
    currentName,
    newName,
    setNewName,
    onCancel,
    onSave,
    centered = false
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
            className={`z-50 ${centered
                ? "fixed inset-0 flex items-center justify-center bg-black/40"
                : "absolute top-8 -left-32"
                }`}
        >
            <div
                ref={modalRef}
                className="w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4"
            >
                <h3 className="text-sm text-gray-600 mb-2">Group name</h3>
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-overlay)]"
                />
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        className="px-3 py-1 rounded text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300"
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
        </div>
    );
};

export default RenameGroupModal;
