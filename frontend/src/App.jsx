import { useState, useEffect } from 'react'
import './App.css'
import { Route, Routes} from 'react-router-dom'; // Import routing components

import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard'
import NoPage from './pages/NoPage';
import Login from './pages/Login';
import ManagerAnalytics from './pages/ManagerAnalytics';
import Chats from './pages/Chats';
import ProjectDetails from './pages/ProjectDetails';
import UserDetails from './pages/UserDetails';



function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="manager-analytics" element={<ManagerAnalytics />} />
        <Route path="project-details/:projectId" element={<ProjectDetails />} />
        <Route path="user-details/:userId" element={<UserDetails />} />
        <Route path="*" element={<NoPage />} />
        <Route path="chats" element={<Chats />} />
      </Route>
      <Route component={NoPage} />
    </Routes>
    </>
  )
}
/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);*/

export default App
