import { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom"; // Import routing components
import { jwtDecode } from "jwt-decode";

import Layout from "./pages/Layout";
import NoPage from "./pages/NoPage";
import Login from "./pages/Login";
import Chats from "./pages/Chats";
import ManagerAnalytics from "./pages/ManagerAnalytics";
import ProjectDetails from "./pages/ProjectDetails";
import UserDetails from "./pages/UserDetails";

const isTokenValid = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("Error: No token found");
    return false; // No token, not valid
  }

  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 > Date.now()) {
      console.log("Success: Token not expired");
      return true;
    } else {
      console.log("Error: Token expired");
      return false;
    } // Check if token is expired
  } catch (e) {
    console.error(e);
    return false;
  }
};

export function PrivateRoute({ children }) {
  return isTokenValid() ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateAuth = () => {
      console.log("authChanged event detected");
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      setUser(user || null);

      if (token) {
        try {
          const decoded = jwtDecode(token);
          setDecodedToken(decoded);
        } catch (err) {
          setDecodedToken(null);
        }
      } else {
        setDecodedToken(null);
      }
    };

    updateAuth(); // Run initially

    window.addEventListener("authChanged", updateAuth);
    return () => window.removeEventListener("authChanged", updateAuth);
  }, []);

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
          <Route
            index
            element={
              !user || !decodedToken ? (
                <div>Loading...</div>
              ) : decodedToken.userType === "Manager" ? (
                <Navigate to="/analytics" replace />
              ) : (
                <Navigate to={`/user-details/${user.id}`} replace />
              )
            }
          />
          <Route path="chats" element={<Chats />} />
          <Route path="analytics" element={<ManagerAnalytics />} />
          <Route
            path="project-details/:projectId"
            element={<ProjectDetails />}
          />
          <Route path="user-details/:userId" element={<UserDetails />} />
        </Route>
        <Route path="*" element={<NoPage />} />
      </Routes>
    </>
  );
}

export default App;
