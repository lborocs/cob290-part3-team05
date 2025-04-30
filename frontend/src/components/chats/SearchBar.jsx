import React from "react";
import { FiChevronUp, FiChevronDown, FiX } from "react-icons/fi";

const SearchBar = ({
    messages,
    searchQuery,
    setSearchQuery,
    setFilteredIndexes,
    setSearchIndex,
    setShowSearchBar,
    searchIndex,
}) => {
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        const indexes = messages
            .map((msg, i) =>
                msg.messageText.toLowerCase().includes(query.toLowerCase()) ? i : -1
            )
            .filter((i) => i !== -1);

        setFilteredIndexes(indexes);
        setSearchIndex(0);
    };

    const iconButton =
        "p-1 rounded hover:bg-gray-200 transition text-[var(--color-overlay-dark)]";

    return (
        <div className="flex items-center bg-white px-4 py-2 gap-3 shadow-md z-10 border-b border-gray-200">
            <input
                type="text"
                className="flex-1 bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-overlay-dark)]"
                placeholder="Search within chat"
                value={searchQuery}
                onChange={handleSearchChange}
            />
            <button
                onClick={() => setSearchIndex((prev) => Math.max(prev - 1, 0))}
                className={iconButton}
                title="Previous"
            >
                <FiChevronUp size={18} />
            </button>
            <button
                onClick={() =>
                    setSearchIndex((prev) => Math.min(prev + 1, messages.length - 1))
                }
                className={iconButton}
                title="Next"
            >
                <FiChevronDown size={18} />
            </button>
            <button
                onClick={() => {
                    setShowSearchBar(false);
                    setSearchQuery("");
                    setFilteredIndexes([]);
                }}
                className={iconButton}
                title="Close"
            >
                <FiX size={18} />
            </button>
        </div>
    );
};

export default SearchBar;
