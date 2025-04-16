import { useState, useEffect } from 'react'
import Button from '../components/global/Button'

const Dashboard = () => {
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    

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
        
        <Button>
            Hello This is a Button
        </Button>
        </>
    )
}

export default Dashboard