import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

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
    daysToDeadline: 0
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
  
        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }
  
        const responseData = await response.json();
  
        // Extract project data from responseData
        const { project, userRole, userID } = responseData;
  
        setProject(project);
  
        // Calculate metrics from the project data
        if (project) {
          const startDate = project.startDate ? new Date(project.startDate) : new Date();
          const dueDate = project.dueDate ? new Date(project.dueDate) : new Date();
          const today = new Date();
          

          //Sawan Update Data Here
          setMetrics({
            tasksCompleted: Math.floor(Math.random() * 40) + 10, // Replace with actual task data
            tasksTotal: Math.floor(Math.random() * 30) + 40, // Replace with actual task data
            budgetUsed: Math.floor(Math.random() * 50000) + 10000, // Replace with actual budget data
            budgetTotal: 100000, // Replace with actual budget data
            teamMembers: Math.floor(Math.random() * 8) + 3, // Replace with actual team data
            daysSinceStart: Math.floor((today - startDate) / (1000 * 60 * 60 * 24)),
            daysToDeadline: Math.floor((dueDate - today) / (1000 * 60 * 60 * 24))
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

  // Chart data for tasks progress
  const tasksData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [metrics.tasksCompleted, metrics.tasksTotal - metrics.tasksCompleted],
        backgroundColor: ['#5A2777', '#E8C2F4'],
        borderColor: ['#5A2777', '#E8C2F4'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for budget usage
  const budgetData = {
    labels: ['Used', 'Remaining'],
    datasets: [
      {
        data: [metrics.budgetUsed, metrics.budgetTotal - metrics.budgetUsed],
        backgroundColor: ['#5A2777', '#E8C2F4'],
        borderColor: ['#5A2777', '#E8C2F4'],
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
        position: 'bottom',
      }
    }
  };

  // Weekly progress data (sample data)
  const weeklyProgressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 8, 12, 7, 9, metrics.tasksCompleted - 41], // Sample data - replace with actual
        backgroundColor: 'rgba(90, 39, 119, 0.7)',
        barThickness: 20,
      },
    ],
  };

  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Progress'
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
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
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Budget</div>
            <div className="text-2xl font-bold text-[#1C2341]">${(metrics.budgetUsed/1000).toFixed(1)}k</div>
            <div className="text-[#2E3944] text-sm mt-1">
              of ${(metrics.budgetTotal/1000).toFixed(1)}k total
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Team</div>
            <div className="text-2xl font-bold text-[#1C2341]">{metrics.teamMembers}</div>
            <div className="text-[#2E3944] text-sm mt-1">
              <span className="font-medium">Leader:</span> {project.projectLeader}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts and Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Progress Charts */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] lg:col-span-2">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Weekly Progress</h2>
          </div>
          <div className="p-4 h-64">
            <Bar options={barOptions} data={weeklyProgressData} />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Budget Allocation</h2>
          </div>
          <div className="p-4 h-64 flex items-center justify-center">
            <Doughnut data={budgetData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Recent Activities</h2>
          </div>
          <div className="p-4 divide-y divide-[#D9D9D9]">
            {/* Sample activities - replace with actual activity data */}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;