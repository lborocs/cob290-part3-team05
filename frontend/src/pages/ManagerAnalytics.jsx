import React, { useState, useEffect } from "react";
import ToggleView from "../components/analytics/navigation/ToggleView";
import ProjectsTable from "../components/analytics/navigation/ProjectsTable";
import UsersTable from "../components/analytics/navigation/UsersTable";

const ManagerAnalytics = () => {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem("analyticsActiveView") || "projects";
  });
  const [projectsData, setProjectsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [isLeadingProject, setIsLeadingProject] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        // Get token and user info from localStorage
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        
        const userType = user?.userType;
        const isLeadingProject = user?.isLeadingProjects
        

        setUserType(userType);
        setIsLeadingProject(isLeadingProject);

        const headers = {
          Authorization: `Bearer ${token}`,
          "X-Internal-Request": "true",
          "Content-Type": "application/json",
        };

        // Fetch projects data if the user is a Manager or an employee leading projects
        if (userType === "Manager" || isLeadingProject) {
          const projectsResponse = await fetch("/api/projects", { headers });
          if (projectsResponse.status === 401) {
            console.error("Unauthorized access to projects data");
            return;
          }
          const projectsJson = await projectsResponse.json();
          setProjectsData(projectsJson);
        }

        // Fetch users data only if the user is a Manager
        if (userType === "Manager") {
          const usersResponse = await fetch("/api/users", { headers });
          if (usersResponse.status === 401) {
            console.error("Unauthorized access to users data");
            return;
          }
          const usersJson = await usersResponse.json();
          setUsersData(usersJson);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gradient-to-r from-[var(--color-overlay-light)] to-[var(--color-highlight)]">
      <div className="w-full">
        {userType === "Manager" ? (
          <ToggleView
            activeView={activeView}
            setActiveView={(view) => {
              setActiveView(view);
              localStorage.setItem("analyticsActiveView", view);
            }}
          />
        ) : (
          <h2 className="w-full text-center text-2xl font-bold py-4 text-white bg-[var(--color-overlay)] shadow-md">
  {isLeadingProject ? "Project Leader View" : "Restricted Access"}
</h2>
        )}
      </div>
  
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading data...</p>
        </div>
      ) : userType === "Manager" ? (
        activeView === "projects" ? (
          <div className="w-full flex-grow mt-20 overflow-auto">
            <ProjectsTable data={projectsData} />
          </div>
        ) : (
          <div className="w-full flex-grow mt-20 overflow-auto">
            <UsersTable data={usersData} />
          </div>
        )
      ) : isLeadingProject ? (
        <div className="w-full flex-grow mt-20 overflow-auto">
          <ProjectsTable data={projectsData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">You do not have access to this data.</p>
        </div>
      )}
    </div>
  );
};

export default ManagerAnalytics;