import { useState, useEffect } from 'react'
import Button from '../components/global/Button'

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users', {
                    headers: {
                        'X-Internal-Request': 'true',  // Add this header to identify internal requests
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                console.log(data)
                setUsers(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <>
            <div className="bg-blue-500 text-white p-4 text-xl">
                Dashboard
            </div>

            {loading ? (
                <p>Loading users...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div className="p-4">
                    <h2 className="text-lg font-bold mb-4">Users List</h2>
                    <ul className="space-y-2">
                        {users.map(user => (
                            <li key={user.userID} className="border p-3 rounded">
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                <p><strong>Email:</strong> {user.userEmail}</p>
                                <p><strong>Type:</strong> {user.userType}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

export default Dashboard