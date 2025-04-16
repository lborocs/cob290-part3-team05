import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Determine project status based on completion date
const getProjectStatus = (project) => {
  if (project.completionDate && project.completionDate !== 'NULL') {
    return 'Completed';
  }
  return project.status || 'Active';
};

// Get status color based on status - updated for new theme
const getStatusColor = (status) => {
  switch(status) {
    case 'Completed':
      return 'bg-indigo-100 text-indigo-800';
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'On Hold':
      return 'bg-amber-100 text-amber-800';
    case 'Cancelled':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

const ProjectsTable = ({ data }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = data.filter(project => {
    const projectTitle = project.projectTitle?.toLowerCase() || '';
    const projectLeader = String(project.projectLeader).toLowerCase();
    const status = getProjectStatus(project).toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return projectTitle.includes(term) || projectLeader.includes(term) || status.includes(term);
  });
  
  const handleProjectClick = (projectId) => {
    navigate(`/project-details/${projectId}`);
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-purple-100">
      <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Projects Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white placeholder-purple-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-100">
          <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Leader</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-purple-50">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const status = getProjectStatus(project);
                const statusColor = getStatusColor(status);
                
                return (
                  <tr 
                    key={project.projectId}
                    onClick={() => handleProjectClick(project.projectId)}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{project.projectId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{project.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                        {project.completionDate && project.completionDate !== 'NULL' && (
                          <div className="text-xs text-purple-500 mt-1">
                            Completed: {formatDate(project.completionDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {project.projectLeader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-purple-500">
                  No projects found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
        <div className="text-sm text-purple-700">
          Showing <span className="font-medium">{filteredProjects.length}</span> projects
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;