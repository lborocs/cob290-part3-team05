import { useState, useEffect } from 'react'
import './App.css'
import Button from './components/global/Button'

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
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
        Tailwind is working! 
      </div>
      <Button Text={"Hello This is a Button"} />
    </>
  )
}

export default App
