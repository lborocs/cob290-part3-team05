import { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom"; // Import routing components
import { decode } from "jwt-decode";

import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import NoPage from "./pages/NoPage";
import Login from "./pages/Login";
import Chats from "./pages/Chats";

const isTokenValid = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;

  try {
    const decoded = decode(token);
    return decoded.exp * 1000 > Date.now(); // Check if token is expired
  } catch (e) {
    return false;
  }
};

export function PrivateRoute({ children }) {
  return isTokenValid() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="chats" element={<Chats />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </>
  );
}
/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);*/

export default App;
