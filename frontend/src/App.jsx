import { useState, useEffect } from 'react'
import './App.css'
import { Route, Routes, Switch } from 'react-router-dom'; // Import routing components

import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard'
import NoPage from './pages/NoPage';
import Login from './pages/Login';
import Chats from './pages/Chats';


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
    <Switch>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="chats" element={<Chats />} />
      </Route>
      <Route component={NoPage} />
    </Switch>
    </>
  )
}
/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);*/

export default App
