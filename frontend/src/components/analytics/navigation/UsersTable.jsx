import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Users Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr 
                  key={user.userID}
                  onClick={() => handleUserClick(user.userID)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userID}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.userType === 'Manager' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredUsers.length}</span> users
        </div>
      </div>
    </div>
  );
};

export default UsersTable;