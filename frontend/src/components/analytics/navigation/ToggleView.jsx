import React from 'react';

const ToggleView = ({ activeView, setActiveView }) => {
  return (
    <div className="absolute top-2 right-4 m-5 flex space-x-2">
      <button
        className={`px-2 py-1 text-lg rounded ${activeView === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setActiveView('projects')}>
        Projects
      </button>
      <button
        className={`px-2 py-1 text-lg rounded ${activeView === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => setActiveView('users')}
      >
        Users
      </button>
    </div>
  );
};

export default ToggleView;