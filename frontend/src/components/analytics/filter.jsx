import React, { useState } from "react";
import Button from "../global/Button";
import { HomeIcon } from '@heroicons/react/24/outline';
import { ListBulletIcon, TrashIcon } from '@heroicons/react/24/outline';

// Reusable Dropdown Icon Component with animation
const DropdownIcon = ({ options = [] }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-block">
            <button onClick={() => setOpen(!open)} className="p-1">
                <ListBulletIcon className="w-5 h-5 inline-block stroke-gray-600 hover:stroke-teal-700" />
            </button>
            <div
                className={`absolute left-full top-0 ml-2 w-40 bg-white shadow-lg rounded-xl border border-gray-200 z-50 transition-all duration-700 ease-in-out transform ${
                    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <ul className="py-2 text-base text-slate-800 font-medium space-y-1">
                    {options.length > 0 ? (
                        options.map((item, i) => (
                            <li key={i} className="flex items-center space-x-2 px-4 py-2 hover:bg-teal-700 hover:text-white cursor-pointer rounded-md transition-colors duration-200">
                                {item}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-400 italic">No options</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const Filter = () => {
    return (
        <div className="w-70 h-250 bg-gray-50 rounded-4xl ml-4 pt-7">
            <nav>
                <ul className="w-62 h-50 bg-white rounded-4xl ml-4 pt-5 shadow-lg">
                    {["Main Dashboard", "Project Dashboard", "Team Dashboard"].map((label, i) => (
                        <li key={i} className="p-2 rounded ml-8 border-r-4 border-transparent hover:border-teal-700 hover:text-teal-700 transition-all duration-200 ">
                            <HomeIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700" />
                            {label}
                        </li>
                    ))}
                </ul>

                <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold flex items-center gap-2">
                    Year
                    <DropdownIcon options={["2025", "2024", "2023"]} />
                    <TrashIcon className="w-5 h-5 inline-block stroke-gray-600 hover:stroke-teal-700" />
                </div>

                {/* Year List */}
                <ul>
                    {["2025", "2024", "2023"].map((year, i) => (
                        <li key={i} className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">{year}</li>
                        </li>
                    ))}
                </ul>

                <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold flex items-center gap-2">
                    Team Member
                    <DropdownIcon options={["Vanessa", "Sawan", "Ella", "Stephen", "Jesse", "Kubby"]} />
                    <TrashIcon className="w-5 h-5 inline-block stroke-gray-600 hover:stroke-teal-700" />
                </div>

                {/* Team Members */}
                <ul className="grid grid-cols-2 gap-2">
                    {["Vanessa", "Sawan", "Ella", "Stephen", "Jesse", "Kubby"].map((member, i) => (
                        <li key={i} className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            {member}
                        </li>
                    ))}
                </ul>

                <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold flex items-center gap-2">
                    Project Name
                    <DropdownIcon options={["Graduate-1", "Sleep---2", "dance----3", "never study again"]} />
                    <TrashIcon className="w-5 h-5 inline-block stroke-gray-600 hover:stroke-teal-700" />
                </div>

                {/* Project Names */}
                <ul>
                    {["Graduate-1", "Sleep---2", "dance----3", "never study again"].map((proj, i) => (
                        <li key={i} className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">{proj}</li>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Filter;
