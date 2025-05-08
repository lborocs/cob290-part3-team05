import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import BurndownChart from '../components/analytics/chart/BurndownChart'; 

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample metrics data - replace with actual API data
  const [metrics, setMetrics] = useState({
    tasksCompleted: 0,
    tasksTotal: 0,
    budgetUsed: 0,
    budgetTotal: 0,
    teamMembers: 0,
    daysSinceStart: 0,
    daysToDeadline: 0,
    doughnutData: {},
    taskPerUser: [],
    burndownData : [],
    recentActivity: []
  });

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
  
        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
  
        // Create headers with authorization
        const headers = {
          'Authorization': `Bearer ${token}`,
          "X-Internal-Request": "true",
          'Content-Type': 'application/json'
        };
  
        console.log('Request headers:', headers);
  
        // Adjust the API endpoint based on your backend structure
        const response = await fetch(`/api/project/${projectId}`, {
          method: 'GET',
          headers: headers
        });

        const analyticsResponse = await fetch(`/api/project/${projectId}/analytics`, {
          method: 'GET',
          headers: headers
        });

        if (!analyticsResponse.ok) {
          throw new Error(`Failed to fetch analytics: ${analyticsResponse.status}`);
        }
        
        

  
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }
        
  
        const responseData = await response.json();
        const analyticsData = await analyticsResponse.json();
  
        // Extract project data from responseData
        const { project, userRole, userID } = responseData;
        
        console.log('Project data:', project);

        setProject(project);
  
        // Calculate metrics from the project data
        if (project) {
          const startDate = project.startDate ? new Date(project.startDate) : new Date();
          const dueDate = project.dueDate ? new Date(project.dueDate) : new Date();
          const today = new Date();
          


          //Sawan Update Data Here
          setMetrics({
            tasksCompleted: analyticsData.doughnutData.completed || 0,
            tasksTotal: analyticsData.totalTasks || 0,
            teamMembers: 10,
            daysSinceStart: Math.floor((today - startDate) / (1000 * 60 * 60 * 24)),
            daysToDeadline: Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)),
            doughnutData: analyticsData.doughnutData || 0,
            taskPerUser: analyticsData.taskPerUser || [],
            burndownData: analyticsData.burndownData || [],
            recentActivity: analyticsData.recentActivityProject || []
          });
        }
  
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchProjectDetails();
  }, [projectId]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Determine project status based on completion date
  const getProjectStatus = (project) => {
    if (!project) return 'Unknown';
    if (project.completionDate && project.completionDate !== 'NULL') {
      return 'Completed';
    }
    return project.status || 'Active';
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'bg-[var(--color-status-green-light)] text-[var(--color-status-green)]';
      case 'Active':
        return 'bg-[var(--color-status-blue-light)] text-[var(--color-status-blue)]';
      case 'On Hold':
        return 'bg-[var(--color-status-amber-light)] text-[var(--color-status-amber)]';
      case 'Cancelled':
        return 'bg-[var(--color-status-red-light)] text-[var(--color-status-red)]';
      case 'At Risk':
        return 'bg-[var(--color-status-red-light)] text-[var(--color-status-red)]';
      default:
        return 'bg-[var(--color-status-gray-light)] text-[var(--color-subtitle)]';
    }
  };

 // Doughnut Chart with improved colors
 const tasksData = {
  labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
  datasets: [
    {
      data: [metrics.doughnutData.toDo, metrics.doughnutData.inProgress, metrics.doughnutData.completed, metrics.doughnutData.overdue],
      backgroundColor: ['#8e8e91', '#eab385', '#adda9d', '#f5a3a3'], // Colors for each status
      borderColor: ['#1E6B37', '#D48F07', '#136A8C', '#B02A37'], // Darker shades for 3D effect
      borderWidth: 1, // Slightly thicker border for better visibility
    },
  ],
};


  // Sample data for burndown chart
  const sampleCompletionData = [
    { date: '2025-04-05', count: 1 },  // 1 task completed on April 5
    { date: '2025-04-12', count: 1 },  // 1 more task completed on April 12
    { date: '2025-04-20', count: 2 }   // 2 more tasks completed on April 20
  ];

  

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  // Task distribution by employee data
  const taskPerEmployeeData = {
    labels: metrics.taskPerUser.map((user) => user.employeeName), 
    datasets: [
      {
        label: 'To Do',
        data: metrics.taskPerUser.map((user) => user.toDo), // To Do tasks
        backgroundColor: '#8e8e91', 
        borderRadius: 25, 
        barThickness: 20, 
      },
      {
        label: 'In Progress',
        data: metrics.taskPerUser.map((user) => user.inProgress), // In Progress tasks
        backgroundColor: '#eab385', 
        borderRadius: 25, 
        barThickness: 20, 
      },
      {
        label: 'Completed',
        data: metrics.taskPerUser.map((user) => user.completed), // Completed tasks
        backgroundColor: '#adda9d', 
        borderRadius: 25, 
        barThickness: 20, 
      },
      {
        label: 'Overdue',
        data: metrics.taskPerUser.map((user) => user.overdue), // Overdue tasks
        backgroundColor: '#f5a3a3', 
        borderRadius: 25, 
        barThickness: 20, 
      },
    ],
  };

    const barOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 14,
              family: 'Poppins, sans-serif', // Modern font
            },
            color: '#1C2341', // Dark text color
          },
        },
        title: {
          display: true,
          text: 'Task Distribution by Employee',
          font: {
            size: 18,
            weight: 'bold',
            family: 'Poppins, sans-serif',
          },
          color: '#1C2341',
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
              family: 'Poppins, sans-serif',
            },
            color: '#2E3944',
          },
        },
        y: {
          stacked: true, // Stack bars vertically
          beginAtZero: true,
          grid: {
            color: '#D9D9D9', // Light grid lines
          },
          ticks: {
            font: {
              size: 12,
              family: 'Poppins, sans-serif',
            },
            color: '#2E3944',
          },
        },
      },
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#5A2777] text-xl">Loading project dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Error: {error}</p>
          <p>Unable to load project details.</p>
          <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block">
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-[#E8C2F4]/20 border border-[#D9D9D9] p-4 rounded-md">
          <p className="text-[#5A2777]">Project not found</p>
          <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block">
            Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  const status = getProjectStatus(project);
  const statusColor = getStatusColor(status);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      <div className="mb-4">
        <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Projects
        </Link>
      </div>
      
      {/* Project Header */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] mb-6">
        <div className="p-6 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold text-[#1C2341] mb-2">
              {project.projectTitle}
              <span className="text-sm text-[#2E3944] ml-2">ID: {project.projectId}</span>
            </h1>
            <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${statusColor}`}>
              {status}
            </span>
          </div>
          <p className="text-[#2E3944] mt-2">{project.description || 'No description provided.'}</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Timeline</div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.daysToDeadline > 0 ? `${metrics.daysToDeadline} days left` : 'Overdue'}
            </div>
            <div className="text-[#2E3944] text-sm mt-1">
              {formatDate(project.startDate)} - {formatDate(project.dueDate)}
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Tasks</div>
            <div className="text-2xl font-bold text-[#1C2341]">{metrics.tasksCompleted}/{metrics.tasksTotal}</div>
            <div className="text-[#2E3944] text-sm mt-1">
              {Math.round((metrics.tasksCompleted / metrics.tasksTotal) * 100)}% completed
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Employee</div>
            <div className="text-2xl font-bold text-[#1C2341]">{(metrics.taskPerUser.length)}</div>
            <div className="text-[#2E3944] text-sm mt-1">
              total members
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Team Lead</div>
            <div className="text-2xl font-bold text-[#1C2341]">{project.leaderName}</div>
            <div className="text-[#2E3944] text-sm mt-1">
              <span className="font-medium">Contact:</span> {project.leaderEmail}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress Charts */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] lg:col-span-2">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Task Breakdown</h2>
          </div>
          <div className="p-4 h-64">
            <Bar options={barOptions} data={taskPerEmployeeData} />
          </div>
        </div>
        
        {/* Project Status */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Task Status</h2>
          </div>
          <div className="p-4 h-64 flex items-center justify-center">
            <Doughnut data={tasksData} options={chartOptions} />
          </div>
        </div>
      </div>
      
            {/* Additional Project Info */}
      <div className="grid grid-cols-1 gap-6">
        {/* Burndown Chart */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] mb-6">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Project Burndown</h2>
            <p className="text-sm text-[#2E3944]">Task completion progress over time</p>
          </div>
          <div className="p-4 h-80">
            <BurndownChart 
              startDate={project.startDate}
              dueDate={project.dueDate}
              totalTasks={metrics.tasksTotal}
              completedTasksByDate={metrics.burndownData}
            />
          </div>
        </div>
        
        {/* Recent Activities - Full width and below burndown chart */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] mb-6">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Recent Activities</h2>
          </div>
          <div className="p-4 divide-y divide-[#D9D9D9] h-64 overflow-y-auto">
            {/* Show actual activity data from API */}
            {metrics.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((activity, index) => (
                <div className="py-3" key={`activity-${index}`}>
                  <div className="text-sm font-medium text-[#1C2341]">
                    {activity.assigneeName && <span className="text-[#5A2777]">{activity.assigneeName}</span>}
                    {' '}
                    {activity.activityType.toLowerCase()}
                    {activity.taskName && <span className="font-medium">{' '}{activity.taskName}</span>}
                  </div>
                  <div className="text-xs text-[#2E3944] mt-1">
                    <span>
                      {activity.daysAgo === 0 ? 'Today' : 
                      activity.daysAgo === 1 ? 'Yesterday' : 
                      `${activity.daysAgo} days ago`}
                    </span>
                    {activity.taskStatus && <span className="ml-1">• Status: {activity.taskStatus}</span>}
                  </div>
                </div>
              ))
            ) : (
              // Fallback to sample data if no API data available
              <>
                <div className="py-3">
                  <div className="text-sm font-medium text-[#1C2341]">New task added</div>
                  <div className="text-xs text-[#2E3944]">Yesterday at 3:45 PM</div>
                </div>
                <div className="py-3">
                  <div className="text-sm font-medium text-[#1C2341]">Budget updated</div>
                  <div className="text-xs text-[#2E3944]">2 days ago</div>
                </div>
                <div className="py-3">
                  <div className="text-sm font-medium text-[#1C2341]">Team member added</div>
                  <div className="text-xs text-[#2E3944]">3 days ago</div>
                </div>
                <div className="py-3">
                  <div className="text-sm font-medium text-[#1C2341]">Milestone completed</div>
                  <div className="text-xs text-[#2E3944]">5 days ago</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </div>

    
  );
};

export default ProjectDetails;