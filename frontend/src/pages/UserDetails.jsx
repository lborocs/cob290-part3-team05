import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import ProjectGanttChart from "../components/analytics/chart/ProjectGanttChart";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserDetails = () => {
  const _user = localStorage.getItem("user");
  const USER = _user ? JSON.parse(_user) : null;
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample metrics data - replace with actual API data
  const [metrics, setMetrics] = useState({
    projectsAssigned: 0,
    tasksAssigned: 0,
    tasksCompleted: 0,
    avgTaskCompletionTime: 0,
    currentWorkload: 0,
    productivityScore: 0,
    doughnutData: {
      toDo: 1,
      completed: 1,
      inProgress: 1,
      overdue: 0,
    },
    tasksByProject: [],
    recentActivityUser: [],
    ganttChartData: [],
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);

        // Get JWT token from localStorage
        const token = localStorage.getItem("token");

        // Create headers with authorization
        const headers = {
          Authorization: `Bearer ${token}`,
          "X-Internal-Request": "true",
          "Content-Type": "application/json",
        };

        console.log("Request headers:", headers);

        const response = await fetch(`/api/users/${userId}`, {
          method: "GET",
          headers: headers,
        });

        const analyticsResponse = await fetch(
          `/api/users/${userId}/analytics`,
          {
            method: "GET",
            headers: headers,
          }
        );

        if (!response.ok || !analyticsResponse.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        const analyticsData = await analyticsResponse.json();

        setUser(data);

        // Calculate metrics from the user data
        if (data) {
          // Sample metrics calculations - replace with actual data
          setMetrics({
            projectsAssigned: analyticsData.numProjects || 0,
            tasksAssigned: analyticsData.numTasks || 0,
            tasksCompleted: analyticsData.numCompletedTasks,
            avgTaskCompletionTime: Math.floor(Math.random() * 5) + 1, // days
            currentWorkload: analyticsData.workLoadUser || 0, // percentage
            productivityScore: analyticsData.productivityScore, // out of 100
            doughnutData: analyticsData.doughnutData,
            tasksByProject: analyticsData.taskByProject || [],
            recentActivityUser: analyticsData.recentActivityUser || [],
            ganttChartData: analyticsData.ganttChartData || [],
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Determine user role color
  const getRoleColor = (userType) => {
    switch (userType) {
      case "admin":
        return "bg-[var(--color-status-blue-light)] text-[var(--color-status-blue)]";
      case "manager":
        return "bg-[var(--color-status-green-light)] text-[var(--color-status-green)]";
      case "developer":
        return "bg-[var(--color-status-amber-light)] text-[var(--color-status-amber)]";
      default:
        return "bg-[var(--color-status-gray-light)] text-[var(--color-subtitle)]";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString || dateString === "NULL") return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Transform the API data into the desired format
  const projects = metrics.ganttChartData.map((project) => ({
    name: project.projectTitle,
    startDate: project.startDate.split("T")[0], // Extract date part
    endDate: project.dueDate.split("T")[0], // Extract date part
  }));

  console.log(projects);

  // Doughnut Chart with improved colors
  const tasksData = {
    labels: ["To Do", "In Progress", "Completed", "Overdue"],
    datasets: [
      {
        data: [
          metrics.doughnutData.toDo,
          metrics.doughnutData.inProgress,
          metrics.doughnutData.completed,
          metrics.doughnutData.overdue,
        ],
        backgroundColor: ["#8e8e91", "#eab385", "#adda9d", "#f5a3a3"], // Colors for each status
        borderColor: ["#1E6B37", "#D48F07", "#136A8C", "#B02A37"], // Darker shades for 3D effect
        borderWidth: 1, // Slightly thicker border for better visibility
      },
    ],
  };

  // Chart data for workload distribution
  const workloadData = {
    labels: ["Current Workload", "Available Capacity"],
    datasets: [
      {
        data: [metrics.currentWorkload, 100 - metrics.currentWorkload],
        backgroundColor: ["#5A2777", "#E8C2F4"],
        borderColor: ["#5A2777", "#E8C2F4"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const taskPerProjectData = {
    labels: metrics.tasksByProject.map((project) => project.projectTitle), // Project titles as labels
    datasets: [
      {
        label: "To Do",
        data: metrics.tasksByProject.map((project) => project.toDo), // To Do tasks
        backgroundColor: "#8e8e91", // Grey
        borderRadius: 25, // Rounded corners
        barThickness: 40, // Adjust bar width
      },
      {
        label: "In Progress",
        data: metrics.tasksByProject.map((project) => project.inProgress), // In Progress tasks
        backgroundColor: "#eab385", // Amber
        borderRadius: 25, // Rounded corners
        barThickness: 40, // Adjust bar width
      },
      {
        label: "Completed",
        data: metrics.tasksByProject.map((project) => project.completed), // Completed tasks
        backgroundColor: "#adda9d", // Green
        borderRadius: 25, // Rounded corners
        barThickness: 40, // Adjust bar width
      },
      {
        label: "Overdue",
        data: metrics.tasksByProject.map((project) => project.overdue), // Overdue tasks
        backgroundColor: "#f5a3a3", // Red
        borderRadius: 25, // Rounded corners
        barThickness: 40, // Adjust bar width
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "Poppins, sans-serif", // Modern font
          },
          color: "#1C2341", // Dark text color
        },
      },
      title: {
        display: true,
        text: "Tasks Per Project by Status",
        font: {
          size: 18,
          weight: "bold",
          family: "Poppins, sans-serif",
        },
        color: "#1C2341",
      },
    },
    scales: {
      x: {
        stacked: true, // Stack bars horizontally
        grid: {
          display: false, // Hide grid lines for a cleaner look
        },
        ticks: {
          font: {
            size: 12,
            family: "Poppins, sans-serif",
          },
          color: "#2E3944",
        },
      },
      y: {
        stacked: true, // Stack bars vertically
        beginAtZero: true,
        grid: {
          color: "#D9D9D9", // Light grid lines
        },
        ticks: {
          font: {
            size: 12,
            family: "Poppins, sans-serif",
          },
          color: "#2E3944",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#5A2777] text-xl">Loading user dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Error: {error}</p>
          <p>Unable to load user details.</p>
          <Link
            to="/analytics"
            className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block"
          >
            Return to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[#E8C2F4]/20 border border-[#D9D9D9] p-4 rounded-md">
          <p className="text-[#5A2777]">User not found</p>
          <Link
            to="/analytics"
            className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block"
          >
            Return to Users
          </Link>
        </div>
      </div>
    );
  }

  const roleColor = getRoleColor(user.userType);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      {USER?.userType !== "Employee" && (
        <div className="mb-4">
          <Link
            to="/analytics"
            className="text-[#5A2777] hover:text-[#8A4BA7] flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Users
          </Link>
        </div>
      )}

      {/* User Header */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] mb-6">
        <div className="p-6 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              {/* User avatar - replace with actual user image if available */}
              <div className="w-16 h-16 rounded-full bg-[#5A2777] flex items-center justify-center mr-4">
                <span className="text-white text-xl font-bold">
                  {`${user.firstName?.charAt(0) || ""}${
                    user.lastName?.charAt(0) || ""
                  }`}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1C2341]">
                  {`${user.firstName} ${user.lastName}`}
                  <span className="text-sm text-[#2E3944] ml-2">
                    ID: {user.userId}
                  </span>
                </h1>
                <p className="text-[#2E3944] mt-1">{user.userEmail}</p>
              </div>
            </div>
            <span
              className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${roleColor}`}
            >
              {user.userType?.charAt(0).toUpperCase() +
                user.userType?.slice(1) || "User"}
            </span>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">
              Projects
            </div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.projectsAssigned}
            </div>
            <div className="text-[#2E3944] text-sm mt-1">ongoing projects</div>
          </div>

          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">
              Tasks
            </div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.tasksCompleted}/{metrics.tasksAssigned}
            </div>
            <div className="text-[#2E3944] text-sm mt-1">
              {Math.round(
                (metrics.tasksCompleted / metrics.tasksAssigned) * 100
              )}
              % completion rate
            </div>
          </div>

          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">
              Workload
            </div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.currentWorkload}%
            </div>
            <div className="text-[#2E3944] text-sm mt-1">current capacity</div>
          </div>

          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">
              Performance
            </div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.productivityScore}/100
            </div>
            <div className="text-[#2E3944] text-sm mt-1">
              productivity score
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Productivity Chart */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] lg:col-span-2">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">
              Tasks Per Project
            </h2>
          </div>
          <div className="p-4 h-64">
            <Bar options={barOptions} data={taskPerProjectData} />
          </div>
        </div>

        {/* Task Status */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">
              Task Status
            </h2>
          </div>
          <div className="p-4 h-64 flex items-center justify-center">
            <Doughnut data={tasksData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
        <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <h2 className="text-lg font-semibold text-[#1C2341]">
            Project Timeline
          </h2>
        </div>
        <ProjectGanttChart projects={projects} />
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
        <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <h2 className="text-lg font-semibold text-[#1C2341]">
            Recent Activity
          </h2>
        </div>
        <div className="p-4 divide-y divide-[#D9D9D9]">
          {metrics.recentActivityUser &&
          metrics.recentActivityUser.length > 0 ? (
            metrics.recentActivityUser.map((activity, index) => (
              <div key={index} className="py-3 flex justify-between">
                <div>
                  <div className="text-sm font-medium text-[#1C2341]">
                    Completed task "{activity.taskName}"
                  </div>
                  <div className="text-xs text-[#2E3944]">
                    {activity.projectName}
                  </div>
                </div>
                <div className="text-xs text-[#2E3944]">
                  {activity.daysAgo === 0
                    ? "Today"
                    : activity.daysAgo === 1
                    ? "Yesterday"
                    : `${activity.daysAgo} days ago`}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[#2E3944]">
              No recent activity available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
