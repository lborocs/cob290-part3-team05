import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

//React icons
import { PiChatsCircle } from "react-icons/pi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { GoSignOut } from "react-icons/go";
import { TfiDashboard } from "react-icons/tfi";
import { FaArrowRight } from "react-icons/fa6";

import logo from "../../assets/img/make-it-all-icon.png";
import SidebarButton from "./SidebarButton";

const ProfileIcon = ({ user }) => {
  const name = user.firstName + " " + user.lastName;
  const [first, last] = name.split(" ");
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-amber-500 text-[var(--color-overlay)] font-bold text-lg aspect-square min-w-[2.5rem] px-2">
      {first[0]}
      {last[0]}
    </div>
  );
};

export const Sidebar = () => {
  const USER = JSON.parse(localStorage.getItem("user"));
  const USER_TYPE = USER?.userType;
  const USER_ID = USER?.id;
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get JWT token from localStorage
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        // Create headers with authorization
        const headers = {
          Authorization: `Bearer ${token}`,
          "X-Internal-Request": "true",
          "Content-Type": "application/json",
        };

        console.log("Request headers:", headers);

        // Adjust the API endpoint based on your backend structure
        const response = await fetch(`/api/users/${decodedToken.id}`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.message);
      }
    };

    fetchUserDetails();
  }, []);
  const menuItems = [
    {
      name: "Dashboard",
      path: user ? `/user-details/${USER_ID}` : "/", // Dynamically set the path using user.id
      icon: <TfiDashboard className="flex-none text-2xl" />,
      allowedFor: ["Employee"], // Only employees can view this
    },
    {
      name: "Chats",
      path: "/chats",
      icon: <PiChatsCircle className="flex-none text-2xl" />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <LuChartNoAxesCombined className="flex-none text-2xl" />,
      allowedFor: ["Manager"],
    },
  ];

  // Filter menu items based on userType
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.allowedFor) return true; // No restrictions, include item
    if (item.allowedFor.includes(user?.userType)) return true; // Allowed userType
    if (
      item.path === "/analytics" &&
      (USER?.isLeadingProjects || USER_TYPE === "Manager")
    )
      return true; // Special access to analytics
    return false; // Otherwise, exclude
  });

  // Sidebar expansion useState
  const [expanded, setExpanded] = useState(true);
  const toggleExpand = () => setExpanded((prev) => !prev);

  // Location for button highlights
  const location = useLocation();
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Sign out function
  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  // User profile settings
  const userSettings = () => {
    console.log("user settings");
  };

  return (
    <>
      <div className="flex flex-col bg-[var(--color-overlay)] items-center text-white font-bold relative">
        <SidebarButton
          expanded={expanded}
          className="flex-row items-center w-full p-[.75rem] gap-x-[.5rem]"
        >
          <img
            src={logo}
            alt="Make-It-All Logo"
            className="max-w-[50px] max-h-[50px] rounded-lg"
          />
          Make-it-all
        </SidebarButton>

        <button
          className="rounded-full h-[2rem] w-[2rem] bg-[var(--color-expand-btn)] p-[.5rem] hover:bg-amber-300 "
          onClick={toggleExpand}
        >
          <FaArrowRight
            className={`size-[1rem] transition-transform duration-500 ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <nav>
          <div className="mt-[5rem]">
            {/* map through menu items to create navigation buttons */}
            {filteredMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="justify-items-center"
                >
                  <SidebarButton
                    expanded={expanded}
                    className={`my-[2rem] font-light items-center w-full gap-[.5rem] hover:bg-[var(--color-overlay-dark)] rounded-lg ${
                      active
                        ? "bg-[var(--color-overlay-light)]" // Active page style
                        : "" // Inactive page style
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    {item.name}
                  </SidebarButton>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="flex flex-col mt-auto mb-[3rem] items-center gap-[.5rem] justify-end">
          {/* Sign Out Button */}
          <SidebarButton
            expanded={expanded}
            className={`w-full hover:bg-[var(--color-overlay-dark)] rounded-lg`}
            onClick={signOut}
          >
            <GoSignOut className="text-3xl stroke-[.07rem]" />
            <span className="font-extralight">Sign Out</span>
          </SidebarButton>

          {/* Line Separator */}
          <div className="mt-[1rem] w-20/21 h-0.25 bg-white"></div>

          {/* User Profile Button */}
          {user && (
            <SidebarButton
              expanded={expanded}
              className={`w-full hover:bg-[var(--color-overlay-dark)] rounded-lg`}
              onClick={userSettings}
            >
              <ProfileIcon user={user} />
              <div className="flex flex-col items-start">
                <span>{user.firstName + " " + user.lastName}</span>
                <span className="font-extralight">{user.userType}</span>
              </div>
            </SidebarButton>
          )}
        </div>
      </div>
    </>
  );
};
