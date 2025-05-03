import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Search = () => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-4xl shadow-lg p-4 mb-8">
      <div className="flex items-center space-x-3">
        <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 hover:text-teal-600" />
        <input
          type="text"
          placeholder="Type Something..."
          className="w-full bg-transparent outline-none text-gray-700 pl-4"
        />
      </div>
    </div>
  );
};

export default Search;
