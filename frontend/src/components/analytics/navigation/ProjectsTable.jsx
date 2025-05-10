import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Determine project status based on completion date
const getProjectStatus = (project) => {
  if (project.completionDate && project.completionDate !== 'NULL') {
    return 'Completed';
  }
  return project.status || 'Active';
};

// Get status color based on status - updated for color scheme
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

const ProjectsTable = ({ data }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = data.filter(project => {
    const projectTitle = project.projectTitle?.toLowerCase() || '';
    const projectLeaderName = String(project.projectLeaderName).toLowerCase();
    const status = getProjectStatus(project).toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return projectTitle.includes(term) || projectLeaderName.includes(term) || status.includes(term);
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
      <div className="p-5 border-b border-[#D9D9D9] bg-gradient-to-r from-[var(--color-highlight)]/30 to-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#1C2341]">Projects Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-overlay)] bg-white placeholder-[#2E3944]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D9D9D9]">
          <thead className="bg-[var(--color-highlight)]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-overlay)] uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-overlay)] uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-overlay)] uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-overlay)] uppercase tracking-wider">Leader</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-overlay)] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#D9D9D9]">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const status = getProjectStatus(project);
                const statusColor = getStatusColor(status);
                
                return (
                  <tr 
                    key={project.projectId}
                    onClick={() => handleProjectClick(project.projectId)}
                    className="hover:bg-[var(--color-highlight)]/10 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E3944]">{project.projectId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1C2341]">{project.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#2E3944]">
                        {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                        {project.completionDate && project.completionDate !== 'NULL' && (
                          <div className="text-xs text-[var(--color-overlay)] mt-1">
                            Completed: {formatDate(project.completionDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E3944]">
                      {project.projectLeaderName}
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
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-[var(--color-overlay)]">
                  No projects found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-[var(--color-highlight)]/20 border-t border-[#D9D9D9]">
        <div className="text-sm text-[var(--color-overlay)]">
          Showing <span className="font-medium">{filteredProjects.length}</span> projects
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;