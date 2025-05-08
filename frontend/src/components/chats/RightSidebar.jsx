import React from "react";

// React icons
import { FaPencilAlt } from "react-icons/fa";

const RightSidebar = ({
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    isNotificationsOn,
    setIsNotificationsOn
}) => {
    return (
        <div className="w-[250px] text-white flex flex-col items-center p-4" style={{ backgroundColor: "var(--color-overlay-dark)" }}>
            {/* Header */}
            <div className="w-full flex justify-between items-center">
                <h2 className="text-lg font-bold">
                    {activeTab === "direct" ? "Chat Details" : "Group Info"}
                </h2>
                <div className="text-3xl cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
                    &times;
                </div>
            </div>

            {activeTab === "direct" ? (
                <>
                    {/* Direct Chat Sidebar */}
                    <div className="relative w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mt-4"></div>
                    <h2 className="text-lg font-bold mt-2">Full Name</h2>
                    <p className="text-sm text-gray-300">Role</p>

                    <div className="mt-3 text-left w-full">
                        <h3 className="text-sm font-bold">Email:</h3>
                        <p className="text-sm text-gray-300">Fullname@make-it-all.co.uk</p>
                    </div>

                    {/* Notifications */}
                    <div
                        className="mt-4 flex items-center justify-between w-full bg-[var(--color-overlay-light)] p-2 rounded-lg"
                        onClick={() => setIsNotificationsOn(!isNotificationsOn)}
                    >
                        <span className="text-sm font-bold">Notifications</span>

                        <div className={`w-10 h-5 flex items-center rounded-full transition-all duration-300 cursor-pointer 
              ${isNotificationsOn ? "bg-purple-500" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md 
                ${isNotificationsOn ? "translate-x-5" : "translate-x-0"}`}></div>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="mt-6 w-full">
                        <h3 className="font-bold text-lg">Media <span className="text-sm text-gray-300">0 Images</span></h3>
                    </div>

                    {/* Shared Files Section */}
                    <div className="mt-6 w-full">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">Shared Files</h3>
                            <span className="text-sm text-gray-300 cursor-pointer">View All</span>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Group Chat Sidebar */}
                    <div className="flex flex-col items-center mt-4">
                        <div className="w-20 h-20 bg-pink-500 rounded-full"></div>
                        <div className="mt-3 flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white">Group Title</h2>
                            <FaPencilAlt className="cursor-pointer text-white text-sm" />
                        </div>
                        <p className="text-sm text-gray-300">0 Members</p>
                    </div>

                    {/* Members Section */}
                    <div className="mt-10 w-full">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">Members</h3>
                            <span className="text-sm text-gray-300 cursor-pointer">View All</span>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="mt-20 w-full">
                        <h3 className="font-bold text-lg">Media <span className="text-sm text-gray-300">0 Images</span></h3>
                    </div>

                    {/* Shared Files Section */}
                    <div className="mt-20 w-full">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">Shared Files</h3>
                            <span className="text-sm text-gray-300 cursor-pointer">View All</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RightSidebar;
