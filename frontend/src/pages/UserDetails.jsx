import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sample metrics data - replace with actual API data
  const [metrics, setMetrics] = useState({
    projectsAssigned: 0,
    projectsCompleted: 0,
    tasksAssigned: 0,
    tasksCompleted: 0,
    avgTaskCompletionTime: 0,
    currentWorkload: 0,
    productivityScore: 0
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
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
        const response = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
        
        const data = await response.json();
        setUser(data);
        
        // Calculate metrics from the user data
        if (data) {
          // Sample metrics calculations - replace with actual data
          setMetrics({
            projectsAssigned: Math.floor(Math.random() * 5) + 1,
            projectsCompleted: Math.floor(Math.random() * 4),
            tasksAssigned: Math.floor(Math.random() * 30) + 10,
            tasksCompleted: Math.floor(Math.random() * 20) + 5,
            avgTaskCompletionTime: Math.floor(Math.random() * 5) + 1, // days
            currentWorkload: Math.floor(Math.random() * 100), // percentage
            productivityScore: Math.floor(Math.random() * 50) + 50 // out of 100
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [userId]);

  // Determine user role color
  const getRoleColor = (userType) => {
    switch(userType) {
      case 'admin':
        return 'bg-[var(--color-status-blue-light)] text-[var(--color-status-blue)]';
      case 'manager':
        return 'bg-[var(--color-status-green-light)] text-[var(--color-status-green)]';
      case 'developer':
        return 'bg-[var(--color-status-amber-light)] text-[var(--color-status-amber)]';
      default:
        return 'bg-[var(--color-status-gray-light)] text-[var(--color-subtitle)]';
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Chart data for tasks progress
  const tasksData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [metrics.tasksCompleted, metrics.tasksAssigned - metrics.tasksCompleted],
        backgroundColor: ['#5A2777', '#E8C2F4'],
        borderColor: ['#5A2777', '#E8C2F4'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for workload distribution
  const workloadData = {
    labels: ['Current Workload', 'Available Capacity'],
    datasets: [
      {
        data: [metrics.currentWorkload, 100 - metrics.currentWorkload],
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

  // Monthly productivity data (sample data)
  const monthlyProductivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [5, 8, 12, 7, 9, metrics.tasksCompleted], // Sample data - replace with actual
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
        text: 'Monthly Productivity'
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
          <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block">
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
          <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] mt-4 inline-block">
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
      <div className="mb-4">
        <Link to="/analytics" className="text-[#5A2777] hover:text-[#8A4BA7] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Users
        </Link>
      </div>
      
      {/* User Header */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9] mb-6">
        <div className="p-6 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              {/* User avatar - replace with actual user image if available */}
              <div className="w-16 h-16 rounded-full bg-[#5A2777] flex items-center justify-center mr-4">
                <span className="text-white text-xl font-bold">
                  {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1C2341]">
                  {`${user.firstName} ${user.lastName}`}
                  <span className="text-sm text-[#2E3944] ml-2">ID: {user.userId}</span>
                </h1>
                <p className="text-[#2E3944] mt-1">{user.userEmail}</p>
              </div>
            </div>
            <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${roleColor}`}>
              {user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'User'}
            </span>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Projects</div>
            <div className="text-2xl font-bold text-[#1C2341]">
              {metrics.projectsAssigned}
            </div>
            <div className="text-[#2E3944] text-sm mt-1">
              {metrics.projectsCompleted} completed
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Tasks</div>
            <div className="text-2xl font-bold text-[#1C2341]">{metrics.tasksCompleted}/{metrics.tasksAssigned}</div>
            <div className="text-[#2E3944] text-sm mt-1">
              {Math.round((metrics.tasksCompleted / metrics.tasksAssigned) * 100)}% completion rate
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Workload</div>
            <div className="text-2xl font-bold text-[#1C2341]">{metrics.currentWorkload}%</div>
            <div className="text-[#2E3944] text-sm mt-1">
              current capacity
            </div>
          </div>
          
          <div className="bg-[#E8C2F4]/10 p-4 rounded-lg shadow-sm">
            <div className="text-[#5A2777] text-sm uppercase font-medium mb-2">Performance</div>
            <div className="text-2xl font-bold text-[#1C2341]">{metrics.productivityScore}/100</div>
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
            <h2 className="text-lg font-semibold text-[#1C2341]">Monthly Productivity</h2>
          </div>
          <div className="p-4 h-64">
            <Bar options={barOptions} data={monthlyProductivityData} />
          </div>
        </div>
        
        {/* Task Status */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Task Status</h2>
          </div>
          <div className="p-4 h-64 flex items-center justify-center">
            <Doughnut data={tasksData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Additional User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Current Workload</h2>
          </div>
          <div className="p-4 h-64 flex items-center justify-center">
            <Doughnut data={workloadData} options={chartOptions} />
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
          <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
            <h2 className="text-lg font-semibold text-[#1C2341]">Assigned Projects</h2>
          </div>
          <div className="p-4 divide-y divide-[#D9D9D9]">
            {/* Sample project assignments - replace with actual data */}
            <div className="py-3">
              <div className="text-sm font-medium text-[#1C2341]">Website Redesign</div>
              <div className="text-xs text-[#2E3944]">2 tasks remaining • Due in 5 days</div>
            </div>
            <div className="py-3">
              <div className="text-sm font-medium text-[#1C2341]">Mobile App Development</div>
              <div className="text-xs text-[#2E3944]">5 tasks remaining • Due in 14 days</div>
            </div>
            <div className="py-3">
              <div className="text-sm font-medium text-[#1C2341]">Database Migration</div>
              <div className="text-xs text-[#2E3944]">Completed • 3 days ago</div>
            </div>
            <div className="py-3">
              <div className="text-sm font-medium text-[#1C2341]">API Integration</div>
              <div className="text-xs text-[#2E3944]">1 task remaining • Due tomorrow</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-6 bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
        <div className="p-4 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
          <h2 className="text-lg font-semibold text-[#1C2341]">Recent Activity</h2>
        </div>
        <div className="p-4 divide-y divide-[#D9D9D9]">
          {/* Sample activities - replace with actual activity data */}
          <div className="py-3 flex justify-between">
            <div>
              <div className="text-sm font-medium text-[#1C2341]">Completed task "Update user authentication"</div>
              <div className="text-xs text-[#2E3944]">Mobile App Development</div>
            </div>
            <div className="text-xs text-[#2E3944]">Yesterday at 3:45 PM</div>
          </div>
          <div className="py-3 flex justify-between">
            <div>
              <div className="text-sm font-medium text-[#1C2341]">Added comment to "Fix payment gateway"</div>
              <div className="text-xs text-[#2E3944]">E-commerce Platform</div>
            </div>
            <div className="text-xs text-[#2E3944]">2 days ago</div>
          </div>
          <div className="py-3 flex justify-between">
            <div>
              <div className="text-sm font-medium text-[#1C2341]">Started task "Implement search functionality"</div>
              <div className="text-xs text-[#2E3944]">Website Redesign</div>
            </div>
            <div className="text-xs text-[#2E3944]">3 days ago</div>
          </div>
          <div className="py-3 flex justify-between">
            <div>
              <div className="text-sm font-medium text-[#1C2341]">Completed project "Database Migration"</div>
              <div className="text-xs text-[#2E3944]">Internal Tools</div>
            </div>
            <div className="text-xs text-[#2E3944]">5 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;