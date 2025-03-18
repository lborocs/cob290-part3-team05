import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

//React icons
import { PiChatsCircle } from "react-icons/pi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { RxDashboard } from "react-icons/rx";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { GoSignOut } from "react-icons/go";

import logo from '../../assets/img/make-it-all-icon.png';
import Button from '../global/Button';

export const Sidebar = () => {

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <RxDashboard className='text-2xl'/> },
    { name: 'Chats', path: '/chats', icon: <PiChatsCircle className='flex-none text-2xl'/>},
    { name: 'Analytics', path: '/analytics', icon: <LuChartNoAxesCombined className='flex-none text-2xl'/>}
  ];

  const signOut = () => {
    console.log("sign out")
  }

  return (
    <>
    <div className='flex flex-col bg-[var(--color-overlay)] items-center text-white font-bold relative'>
      <img
        src={logo}
        alt="Make-It-All Logo"
        className="flex-1 max-w-[50px] max-h-[50px] rounded-lg m-[1rem]"
      />

      <nav>
        <div className='mt-[3rem]'>
        {/* map through menu items to create navigation buttons */}
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              className={`flex-col my-[3rem] items-center w-full max-w-[50px] max-h-[50px] mb-2${
                location.pathname.startsWith(item.path)
                  ? 'bg-[var(--color-overlay-light)]' // Active page style
                  : '' // Inactive page style
              }`}
            >
              {item.icon}
              {item.name}
            </Button>
          </Link>
        ))}
        </div>
      </nav>
      <div className='mt-auto mb-[3rem] items-center justify-end'>
        <TfiLayoutLineSolid className=' text-2xl w-full'/>
        <Button
          className={`flex my-[3rem] justify-center w-full mb-2`} onClick={signOut()}
        >
          <GoSignOut className='text-2xl'/>
        </Button>
        <Button
          className={`flex my-[3rem] justify-center w-full mb-2`} onClick={signOut()}
        >
          Profile
        </Button>
      </div>
    </div>
    </>
  )
}
