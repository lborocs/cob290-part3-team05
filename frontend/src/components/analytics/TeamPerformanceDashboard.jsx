import React, { useState } from "react";
import StackedAreaChart from "./StackedAreaChart";
import BurnDownChart from "./BurnDownChart";
import WorkloadBarChart from "./WorkloadBarChart";
import TaskStatusDonut from "./TaskStatusDonut";

const TeamPerformanceDashboard = () => {
  const [view, setView] = useState("area");

  const tabs = [
    { key: "area", label: "Task Completion" },
    { key: "burndown", label: "Sprint Burndown" },
    { key: "bar", label: "Team Workload" },
    { key: "donut", label: "Task Status" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow transition-all duration-200 ${
              view === tab.key
                ? "bg-[#963FB0] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conditional Chart Rendering */}
      {view === "area" && <StackedAreaChart />}
      {view === "burndown" && <BurnDownChart />}
      {view === "bar" && <WorkloadBarChart />}
      {view === "donut" && <TaskStatusDonut />}
    </div>
  );
};

export default TeamPerformanceDashboard;
