import React from "react";

const ConfirmModal = ({ message, onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
                <p className="text-sm font-medium text-gray-800 mb-4">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1 text-sm rounded-md bg-[var(--color-overlay-dark)] text-white hover:bg-[var(--color-overlay)]"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;