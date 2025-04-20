import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Get role color based on user type - updated for the new color scheme
const getRoleColor = (userType) => {
  switch(userType) {
    case 'Manager':
      return 'bg-[var(--color-status-blue-light)] text-[var(--color-status-blue)]';
    case 'Developer':
      return 'bg-[var(--color-status-gray-light)] text-[var(--color-subtitle)]';
    case 'Admin':
      return 'bg-[var(--color-status-green-light)] text-[var(--color-status-green)]';
    default:
      return 'bg-[var(--color-status-amber-light)] text-[var(--color-status-amber)]';
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#D9D9D9]">
      <div className="p-5 border-b border-[#D9D9D9] bg-gradient-to-r from-[#E8C2F4]/30 to-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#1C2341]">Users Overview</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border border-[#D9D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A2777] bg-white placeholder-[#2E3944]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D9D9D9]">
          <thead className="bg-[#E8C2F4]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5A2777] uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5A2777] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5A2777] uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#5A2777] uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#D9D9D9]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const roleColor = getRoleColor(user.userType);
                
                return (
                  <tr 
                    key={user.userID}
                    onClick={() => handleUserClick(user.userID)}
                    className="hover:bg-[#E8C2F4]/10 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E3944]">{user.userID}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1C2341]">{user.firstName} {user.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E3944]">{user.userEmail}</td>
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
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-[#5A2777]">
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-[#E8C2F4]/20 border-t border-[#D9D9D9]">
        <div className="text-sm text-[#5A2777]">
          Showing <span className="font-medium">{filteredUsers.length}</span> users
        </div>
      </div>
    </div>
  );
};

export default UsersTable;