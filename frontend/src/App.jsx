// src/App.jsx
import { useState, useEffect } from 'react'
import './App.css'
import { Route, Routes, useParams } from 'react-router-dom'

import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import NoPage from './pages/NoPage'
import Login from './pages/Login'
import EmployeeAnalytics from './pages/EmployeeAnalytics'

function App() {
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, tRes, pRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/tasks'),
          fetch('/api/projects'),
        ])
        if (!uRes.ok || !tRes.ok || !pRes.ok) {
          throw new Error('Failed to fetch data')
        }
        const [uData, tData, pData] = await Promise.all([
          uRes.json(),
          tRes.json(),
          pRes.json(),
        ])
        setUsers(uData)
        setTasks(tData)
        setProjects(pData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <div>Loading…</div>
  if (error)   return <div>Error: {error}</div>

  // Wrapper to pull employeeId from the URL and pass it + data into EmployeeAnalytics
  const AnalyticsWrapper = () => {
    const { employeeId } = useParams()
    return (
      <EmployeeAnalytics
        employeeId={Number(employeeId)}
        tasks={tasks}
        projects={projects}
      />
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="*" element={<NoPage />} />

        {/* Dynamic analytics route */}
        <Route
          path="analytics/:employeeId"
          element={<AnalyticsWrapper />}
        />
      </Route>
    </Routes>
  )
}

export default App
