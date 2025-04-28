import { useState, useEffect } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'; // Import routing components

import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard'
import NoPage from './pages/NoPage';
import Login from './pages/Login';
import Chats from './pages/Chats';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="chats" element={<Chats />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </>
  )
}
/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);*/

export default App
