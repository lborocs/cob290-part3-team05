import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../global/Button';
import logo from '../../assets/img/make-it-all-icon.png';

import { PiHouseBold } from "react-icons/pi";
import { FaRegFolder } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { BiComment } from "react-icons/bi";
import { TbClipboardText } from "react-icons/tb";

/**
 * sidebar component for navigation
 * @component
 */
const Sidebar = () => {
  // get current location using useLocation hook
  const location = useLocation();

  // define menu items with their names corresponding paths and symbol 
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <PiHouseBold className="flex-none text-xl" /> },
    { name: 'Chats', path: '/chats', icon: <BiComment className="flex-none text-xl" /> },
    { name: 'Analytics', path: '/analytics', icon: <FiFileText className="flex-none text-xl" /> },
  ];

  
  return (
    <>
      {/* show dropdown if smaller screen */}
        <div className="flex flex-col w-[20%] lg:w-[14%] bg-[var(--color-overlay)] text-[var(--color-text)] h-screen max-h-screen overflow-y-auto p-4 z-50">
          {/* app title section */}
          <div className="inline-flex mb-10 gap-x-3 items-center">
            {/* logo */}
            <img
              src={logo}
              alt="Make-It-All Logo"
              className="max-w-[45px] max-h-[45px] rounded-lg"
            />
            {/* name beside logo */}
            <h2 className="text-lg font-bold text-[var(--color-white)]">Make-it-all</h2>
          </div>

          {/* profile button */}
          <div className='mb-10'>
          </div>

          {/* navigation menu */}
          <nav>
            <h2 className="font-semibold mb-2 text-[var(--color-disabled)]">MAIN MENU</h2>
            {/* map through menu items to create navigation buttons */}
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  className={`w-full mb-2 ${
                    location.pathname.startsWith(item.path)
                      ? 'border-2 border-[var(--color-white)] font-bold rounded text-[var(--color-white)]' // Active page style
                      : 'border-2 border-[var(--color-overlay)] text-[var(--color-white)] hover:bg-[var(--color-hover)] hover:text-[var(--color-base)]' // Inactive page style
                  }`}
                >
                  {item.name}
                  {item.icon}
                </Button>
              </Link>
            ))}
          </nav>
              
          {/* bottom text */}
          <h2 className="text-sm font-semibold text-center mt-auto text-[var(--color-disabled)]">Make-it-all</h2>
        </div>
    </>
  );
};

export default Sidebar;