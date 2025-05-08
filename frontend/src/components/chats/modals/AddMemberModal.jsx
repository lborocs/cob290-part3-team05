import React, { useState } from "react";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";

const AddMemberModal = ({ users, onCancel, onAdd }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    const options = users.map(user => ({
        value: user.userID,
        label: `${user.firstName} ${user.lastName}`
    }));

    const handleSubmit = () => {
        selectedOptions.forEach(option => onAdd(option.value));
        setSelectedOptions([]);
        onCancel();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[28rem] p-6 relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Add Members</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>

                {/* Select Dropdown */}
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select users:</label>
                <Select
                    options={options}
                    isMulti
                    value={selectedOptions}
                    onChange={setSelectedOptions}
                    placeholder="Select one or more users"
                    className="mb-6"
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOptions.length === 0}
                        className="bg-[var(--color-overlay-dark)] text-white px-4 py-1.5 text-sm rounded hover:bg-[var(--color-overlay)] disabled:opacity-50"
                    >
                        Add Members
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;