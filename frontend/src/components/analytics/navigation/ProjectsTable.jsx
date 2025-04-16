import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectsTable = ({ data }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = data.filter(project => {
    const projectTitle = project.projectTitle?.toLowerCase() || '';
    const projectLeader = String(project.projectLeader).toLowerCase();
    const status = project.status?.toLowerCase() || '';
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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Projects Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr 
                  key={project.projectId}
                  onClick={() => handleProjectClick(project.projectId)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.projectId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.projectTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.projectLeader}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No projects found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredProjects.length}</span> projects
        </div>
      </div>
    </div>
  );
};

export default ProjectsTable;