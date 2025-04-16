import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Get role color based on user type - for the new theme
const getRoleColor = (userType) => {
  switch(userType) {
    case 'Manager':
      return 'bg-purple-100 text-purple-800';
    case 'Developer':
      return 'bg-pink-100 text-pink-800';
    case 'Admin':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

const UsersTable = ({ data }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users based on search term
  const filteredUsers = data.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.userEmail.toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return fullName.includes(term) || email.includes(term) || user.userType.toLowerCase().includes(term);
  });
  
  const handleUserClick = (userId) => {
    navigate(`/user-details/${userId}`);
  };
  
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-purple-100">
      <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Users Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-purple-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const roleColor = getRoleColor(user.userType);
                
                return (
                  <tr 
                    key={user.userID}
                    onClick={() => handleUserClick(user.userID)}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.userID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.userEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColor}`}>
                        {user.userType}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-purple-500">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
        <div className="text-sm text-purple-700">
          Showing <span className="font-medium">{filteredUsers.length}</span> users
        </div>
      </div>
    </div>
  );
};

export default UsersTable;