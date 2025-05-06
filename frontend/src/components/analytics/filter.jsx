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
        <div className="mb-6 ml-5">
            <div className="flex items-center justify-between text-xl text-[#963FB0] font-semibold">
                {label}
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsOpen(!isOpen)}>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <button onClick={clearSelection}>
                        <TrashIcon className="w-5 h-5 stroke-gray-600 hover:stroke-[#963FB0]" />
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="mt-2 p-2 border rounded-xl bg-white shadow max-w-xs">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search..."
                        className="w-full p-2 border rounded-lg mb-2"
                    />

                    {filteredOptions.map((opt, i) => (
                        <label key={i} className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 rounded-md">
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggleSelect(opt)}
                                className="form-checkbox text-[#963FB0]"
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {selected.map((s, i) => (
                        <span key={i} className="bg-[#963FB0] text-white px-3 py-1 rounded-full text-sm">
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
        <div className="w-full md:w-72 bg-gray-50 rounded-4xl ml-4 p-6 shadow-lg">
            <nav>
                
                <ul className="bg-white rounded-4xl shadow p-4 mb-6 space-y-3">
                    {["Main Dashboard", "Project Dashboard", "Team Dashboard"].map((label, i) => (
                        <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700 hover:text-[#963FB0] hover:border-r-4 border-transparent hover:border-[#963FB0] px-2 py-1 transition-all duration-200"
                        >
                            <HomeIcon className="w-5 h-5 stroke-gray-600" />
                            {label}
                        </li>
                    ))}
                </ul>

                
                <MultiSelectDropdown label="Year" options={["2025", "2024", "2023", "2022", "2021", "2020"]} />
                <MultiSelectDropdown label="Team Member" options={["Vanessa", "Sawan", "Ella", "Stephen", "Jesse", "Kubby", "Maya", "John"]} />
                <MultiSelectDropdown label="Project Name" options={["Graduate-1", "Sleep---2", "Dance----3", "Never Study Again", "Redesign AI", "Client App Dev"]} />
            </nav>
        </div>
    );
};

export default Filter;
