import React, { useState } from "react";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";

const MultiSelectDropdown = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleSelect = (option) => {
        setSelected((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const clearSelection = () => setSelected([]);
    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="mb-6 ml-2 w-full max-w-xs">

            <div className="flex items-center justify-between text-lg font-semibold text-[#963FB0]">
                <span>{label}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="hover:scale-110 transition-transform duration-200"
                    >
                        <ChevronDownIcon
                            className={`w-5 h-5 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                    <button
                        onClick={clearSelection}
                        className="hover:scale-110 transition-transform duration-200"
                    >
                        <TrashIcon className="w-5 h-5 stroke-gray-600 hover:stroke-[#963FB0]" />
                    </button>
                </div>
            </div>

            <div
                className={`transition-all duration-300 origin-top transform ${
                    isOpen
                        ? "scale-100 opacity-100 mt-3"
                        : "scale-95 opacity-0 h-0 overflow-hidden"
                }`}
            >
                <div className="p-3 border border-gray-200 rounded-2xl bg-white shadow-lg">
                
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${label.toLowerCase()}...`}
                        className="w-full p-2 mb-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#963FB0] focus:border-transparent"
                    />

                    <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, i) => (
                                <label
                                    key={i}
                                    className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(opt)}
                                        onChange={() => toggleSelect(opt)}
                                        className="text-[#963FB0] focus:ring-[#963FB0] rounded"
                                    />
                                    <span className="text-sm text-gray-700">{opt}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic px-2">No results found.</p>
                        )}
                    </div>
                </div>
            </div>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {selected.map((s, i) => (
                        <span
                            key={i}
                            className="bg-[#963FB0] text-white px-3 py-1 rounded-full text-sm shadow-md transition hover:bg-[#7a2a91]"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
