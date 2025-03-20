import React from "react";
import Button from "../global/Button";
import { HomeIcon } from '@heroicons/react/24/outline'
import { ListBulletIcon } from '@heroicons/react/24/outline'
import { TrashIcon} from '@heroicons/react/24/outline'

const Filter = () => {
    return (
        <>
            <div className="w-70 h-250 bg-gray-50 rounded-3xl ml-4 pt-7">
                <nav>
                    <ul className="w-62 h-50 bg-white rounded-4xl ml-4 pt-5 shadow-lg">
                        <li className="p-2 rounded ml-8 border-r-4 border-transparent hover:border-teal-700 hover:text-teal-700 transition-all duration-200 ">
                            <HomeIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700" />
                            Main Dashboard </li>
                        <li className="p-2 rounded ml-8 border-r-4 border-transparent hover:border-teal-700 hover:text-teal-700 transition-all duration-200  ">
                        <HomeIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700" />
                            Main Dashboard</li>
                        <li className="p-2 rounded ml-8 border-r-4 border-transparent hover:border-teal-700 hover:text-teal-700 transition-all duration-200 ">
                        <HomeIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700" />
                            Main Dashboard</li>
                    </ul>
                    <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold">
                        Year <ListBulletIcon className="w-5 h-5 ml-35 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                        <TrashIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                    </div>
                    <ul>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                2025
                            </li>
                        </li>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                2024
                            </li>
                        </li>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                2023
                            </li>
                        </li>
                    </ul>
                    <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold">
                        Team Member <ListBulletIcon className="w-5 h-5 ml-11 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                        <TrashIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                    </div>
                    <ul className="grid grid-cols-2 gap-2">
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Vanessa
                        </li>
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Sawan
                        </li>
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Ella
                        </li>
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Stephen
                        </li>
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Jesse
                        </li>
                        <li className="ml-4 mt-4 w-20 h-10 bg-gray-200 pt-2 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center justify-center">
                            Kubby
                        </li>
                    </ul>
                    <div className="ml-5 mt-4 text-xl text-teal-700 font-semibold">
                        Project Status <ListBulletIcon className="w-5 h-5 ml-12 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                        <TrashIcon className="w-5 h-5 inline-block mr-2 stroke-gray-600 hover:stroke-teal-700"/>
                    </div>
                    <ul>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                Cancelled
                            </li>
                        </li>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                New
                            </li>
                        </li>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                In progress
                            </li>
                        </li>
                        <li className="w-62 h-10 bg-gray-200 ml-4 pt-5 mt-4 transition-all duration-300 transform hover:translate-x-2 hover:bg-teal-600 hover:text-white flex items-center px-4">
                            <li className="transform translate-y-[-10px] ml-4">
                                Completed
                            </li>
                        </li>
                    </ul>
                </nav>
            </div>

        </>
    )
}

export default Filter