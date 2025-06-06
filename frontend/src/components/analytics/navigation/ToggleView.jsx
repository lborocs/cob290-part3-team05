import React from 'react';

const ToggleView = ({ activeView, setActiveView }) => {
  return (
    <div className="absolute right-4 m-2 flex space-x-2 bg-[var(--color-highlight)] p-2 rounded-lg shadow-md">
      <button
        className={`px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
          activeView === 'projects' 
            ? 'bg-gradient-to-r from-[var(--color-overlay-light)] to-[var(--color-overlay)] text-white shadow-md transform scale-105' 
            : 'bg-white bg-opacity-70 text-gray-700 hover:bg-opacity-90'
        }`}
        onClick={() => setActiveView('projects')}>
        Projects
      </button>
      <button
        className={`px-4 py-2 text-lg rounded-md transition-all duration-200 font-medium ${
          activeView === 'users' 
            ? 'bg-gradient-to-r from-[var(--color-overlay-light)] to-[var(--color-overlay)] text-white shadow-md transform scale-105' 
            : 'bg-white bg-opacity-70 text-gray-700 hover:bg-opacity-90'
        }`}
        onClick={() => setActiveView('users')}
      >
        Users
      </button>
    </div>
  );
};

export default ToggleView;