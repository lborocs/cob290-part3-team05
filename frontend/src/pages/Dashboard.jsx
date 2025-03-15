import { useState, useEffect } from 'react'

import Button from '../components/global/Button'

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await fetch('/api/users');
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            console.log(data)
            setUsers(data);
            setLoading(false); // Set loading to false once data is fetched
          } catch (error) {
            setError(error.message); // Set the error message
            setLoading(false); // Set loading to false even if an error occurs
          }
        };
    
        fetchUsers();
      }, []);

    return (
        <>
        <div className="bg-blue-500 text-white p-4 text-xl">
            Dashboard
            {users}
        </div>
        <Button>
            Hello This is a Button
        </Button>
        </>
    )
}

export default Dashboard