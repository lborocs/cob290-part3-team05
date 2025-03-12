import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from './components/global/Button'

function App() {
  const [count, setCount] = useState(0)

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API when the component mounts
  useEffect(() => {
    // Fetch data using fetch API
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://34.147.242.96:8080/users'); // Replace with your API URL
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setUsers(data); // Set the data into state
        setLoading(false);
      } catch (error) {
        setError(error.message); // Handle any error that occurs
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      <div className="bg-blue-500 text-white p-4 text-xl">
        Tailwind is working! 🚀
      </div>
      <Button Text={"Hello This is a Button"} />
    </>
  )
}

export default App
