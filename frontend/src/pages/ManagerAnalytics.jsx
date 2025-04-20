import React, { useState, useEffect } from 'react'
import ToggleView from '../components/analytics/navigation/ToggleView'
import ProjectsTable from '../components/analytics/navigation/ProjectsTable'
import UsersTable from '../components/analytics/navigation/UsersTable'

const ManagerAnalytics = () => {
  const [activeView, setActiveView] = useState('projects')
  const [projectsData, setProjectsData] = useState([])
  const [usersData, setUsersData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        console.log(headers);
        
        // Fetch projects data with authorization header
        const projectsResponse = await fetch('/api/projects', { 
          headers: headers 
        });
        
        if (projectsResponse.status === 401) {
          console.error('Unauthorized access to projects data');
          // Handle unauthorized access (e.g., redirect to login)
          return;
        }
        
        const projectsJson = await projectsResponse.json();
        console.log(projectsJson)
        setProjectsData(projectsJson);
        
        // Fetch users data with authorization header
        const usersResponse = await fetch('/api/users', { 
          headers: headers 
        });
        
        if (usersResponse.status === 401) {
          console.error('Unauthorized access to users data');
          // Handle unauthorized access (e.g., redirect to login)
          return;
        }
        
        const usersJson = await usersResponse.json();
        setUsersData(usersJson);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }
    
    fetchAllData();
  }, []);
  
  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="w-full">
        <ToggleView 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading data...</p>
        </div>
      ) : activeView === 'projects' ? (
        <div className="w-full flex-grow mt-20 overflow-auto">
          <ProjectsTable data={projectsData} />
        </div>
      ) : (
        <div className="w-full flex-grow mt-20 overflow-auto">
          <UsersTable data={usersData} />
        </div>
      )}
    </div>
  )
}

export default ManagerAnalytics