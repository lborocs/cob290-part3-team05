// src/components/EmployeeAnalytics.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const monthYear = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString("default", { year: "numeric", month: "short" });
};

const EmployeeAnalytics = ({ tasks, projects, employeeId }) => {
  //  filters employee data
  const empTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === employeeId),
    [tasks, employeeId]
  );
  const empProjects = useMemo(
    () => projects.filter((p) => p.projectLeader === employeeId),
    [projects, employeeId]
  );

  //  1. Task Status Breakdown 
  const statusCounts = useMemo(() => {
    const cnt = {};
    empTasks.forEach((t) => {
      cnt[t.status] = (cnt[t.status] || 0) + 1;
    });
    return {
      labels: Object.keys(cnt),
      datasets: [
        {
          data: Object.values(cnt),
          backgroundColor: [
            // going to add the default purple when we merge code
            "#60A5FA",
            "#34D399",
            "#FBBF24",
            "#F87171",
            "#A78BFA",
          ].slice(0, Object.keys(cnt).length),
        },
      ],
    };
  }, [empTasks]);

  //  2. Completed vs Overdue Over Time 
  const trendData = useMemo(() => {
    const comp = {},
      over = {};
    const today = new Date();

    empTasks.forEach((t) => {
      if (t.completionDate) {
        const m = monthYear(t.completionDate);
        comp[m] = (comp[m] || 0) + 1;
      }
      if (new Date(t.dueDate) < today && t.status !== "Completed") {
        const m = monthYear(t.dueDate);
        over[m] = (over[m] || 0) + 1;
      }
    });

    // builds labels
    const labels = Array.from(new Set([...Object.keys(comp), ...Object.keys(over)]))
      .sort((a, b) => new Date(a) - new Date(b));

    return {
      labels,
      datasets: [
        {
          label: "Completed",
          data: labels.map((m) => comp[m] || 0),
          fill: false,
          tension: 0.3,
        },
        {
          label: "Overdue",
          data: labels.map((m) => over[m] || 0),
          fill: false,
          tension: 0.3,
        },
      ],
    };
  }, [empTasks]);


  // 3. Workload by Assignees
  const workloadData = useMemo(() => {
    // group ALL tasks by assignee 
    const byAssignee = {};
    tasks.forEach((t) => {
      const name = t.assigneeName || `#${t.assigneeId}`;
      byAssignee[name] = byAssignee[name] || {};
      byAssignee[name][t.status] = (byAssignee[name][t.status] || 0) + 1;
    });
    const assignees = Object.keys(byAssignee);
    const statuses = Array.from(
      new Set(tasks.map((t) => t.status))
    );

    return {
      labels: assignees,
      datasets: statuses.map((st, i) => ({
        label: st,
        data: assignees.map((a) => byAssignee[a][st] || 0),
      })),
    };
  }, [tasks]);

  //  4. Project Progress vs Timeline 
  const projectData = useMemo(() => {
    const titles = [];
    const percents = [];
    const dueDates = [];

    empProjects.forEach((p) => {
      const projTasks = tasks.filter((t) => t.projectId === p.projectId);
      const total = projTasks.length;
      const done = projTasks.filter((t) => t.status === "Completed").length;
      titles.push(p.projectTitle);
      percents.push(total > 0 ? Math.round((done / total) * 100) : 0);
      dueDates.push(p.dueDate);
    });

    return { titles, percents, dueDates };
  }, [empProjects, tasks]);

  return (
    <div className="p-6 font-sans">
      {/* Top controls */}
      <div className="flex gap-4 mb-6">
        <div className="w-[395px] h-[94px] bg-gray-100 border border-gray-300 flex items-center justify-center">
          {/* Back Button or any content */}
          ← Back
        </div>
        <div className="w-[334px] h-[44px] bg-gray-100 border border-gray-300 flex items-center justify-center">
          {/* Any label or content */}
          Employee: #{employeeId}
        </div>
      </div>

      {/* Horizontal bar */}
      <div className="w-[962px] h-[38px] bg-gray-200 border border-gray-300 mb-6 flex items-center px-4">
        📊 Employee Analytics
      </div>

      {/* Main grid of charts */}
      <div className="flex flex-col gap-6">
        {/* Row 1 */}
        <div className="flex gap-6">
          {/* 1: Pie */}
          <div className="w-[327px] h-[222px] bg-white border border-gray-300 p-2">
            <Pie
              data={statusCounts}
              options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
            />
          </div>
          {/* 2: Line */}
          <div className="w-[804px] h-[294px] bg-white border border-gray-300 p-2">
            <Line
              data={trendData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display: true, text: "Month" } },
                  y: { title: { display: true, text: "Count" }, beginAtZero: true },
                },
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex gap-6">
          {/* 3: Stacked Bar */}
          <div className="w-[327px] h-[222px] bg-white border border-gray-300 p-2">
            <Bar
              data={workloadData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true },
                },
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
          {/* 4: Project Progress */}
          <div className="w-[804px] h-[294px] bg-white border border-gray-300 p-2">
            <Bar
              data={{
                labels: projectData.titles,
                datasets: [
                  {
                    label: "% Complete",
                    data: projectData.percents,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, max: 100, title: { display: true, text: "%" } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const pct = ctx.parsed.y;
                        const due = projectData.dueDates[ctx.dataIndex];
                        return `Completed: ${pct}%\nDue: ${due}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnalytics;
