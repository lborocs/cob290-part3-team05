import React, { useState } from 'react';

const ToggleView = () => {
  const [activeTab, setActiveTab] = useState('projects');

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="absolute top-2 right-4 m-5 flex space-x-2">
      <button
        className={`px-2 py-1 text-lg rounded ${activeTab === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => switchTab('projects')}>
        Projects
      </button>
      <button
        className={`px-2 py-1 text-lg rounded ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => switchTab('users')}
      >
        Users
      </button>
    </div>
  );
};

export default ToggleView;