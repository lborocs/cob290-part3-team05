import React from 'react';
import Filter from '../components/analytics/filter';
import Search from '../components/analytics/search';
import TeamPerformanceDashboard from '../components/analytics/TeamPerformanceDashboard';

const App = () => {
  return (
    <div className="min-h-screen w-full bg-[#DDAEEB] p-4 -ml-15 flex flex-col">
      <div className="mb-8">
        <Search />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 pr-2">
          <Filter />
        </div>

        <div className="lg:w-3/4 w-full flex items-start justify-center">
          <div className="aspect-square w-full max-w-[600px] bg-white shadow-xl rounded-lg p-4 overflow-hidden">
            <TeamPerformanceDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
