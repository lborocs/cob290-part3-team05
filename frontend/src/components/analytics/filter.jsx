import React, { useState } from "react";
import { HomeIcon, ChevronDownIcon, TrashIcon } from '@heroicons/react/24/outline';

const MultiSelectDropdown = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);

    const toggleSelect = (option) => {
        setSelected((prev) =>
            prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
        );
    };

    const clearSelection = () => setSelected([]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredOptions(options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase())));
    };

    return (
        <div className="mb-6 ml-1">
            <div className="flex items-center justify-between text-lg text-[#963FB0] font-semibold">
                {label}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 hover:bg-gray-100 rounded-full transition"
                    >
                        <ChevronDownIcon
                            className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                    <button
                        onClick={clearSelection}
                        className="p-1 hover:bg-gray-100 rounded-full transition"
                    >
                        <TrashIcon className="w-5 h-5 stroke-gray-600 hover:stroke-[#963FB0]" />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-3 p-3 border border-gray-200 rounded-xl bg-white shadow-sm transition-all duration-300 max-w-xs">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#963FB0] transition"
                    />

                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredOptions.map((opt, i) => (
                            <label
                                key={i}
                                className="flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer hover:bg-[#f3e8fb] transition"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt)}
                                    onChange={() => toggleSelect(opt)}
                                    className="accent-[#963FB0]"
                                />
                                <span className="text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {selected.map((s, i) => (
                        <span key={i} className="bg-[#963FB0] text-white px-3 py-1 rounded-full text-sm transition">
                            {s}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const Filter = () => {
    return (
        <div className="w-full md:w-72 bg-gray-50 rounded-3xl ml-4 p-6 shadow-lg">
            <nav>
                <ul className="bg-white rounded-2xl shadow p-4 mb-6 space-y-3">
                    {["Main Dashboard", "Project Dashboard", "Team Dashboard"].map((label, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#963FB0] hover:border-r-4 border-transparent hover:border-[#963FB0] px-2 py-2 rounded-md transition-all duration-200 cursor-pointer"
                        >
                            <HomeIcon className="w-5 h-5 stroke-gray-600" />
                            {label}
                        </li>
                    ))}
                </ul>

                <MultiSelectDropdown
                    label="Year"
                    options={["2025", "2024", "2023", "2022", "2021", "2020"]}
                />
                <MultiSelectDropdown
                    label="Team Member"
                    options={["Vanessa", "Sawan", "Ella", "Stephen", "Jesse", "Kubby", "Maya", "John"]}
                />
                <MultiSelectDropdown
                    label="Project Name"
                    options={["Graduate-1", "Sleep---2", "Dance----3", "Never Study Again", "Redesign AI", "Client App Dev"]}
                />
            </nav>
        </div>
    );
};

export default Filter;
