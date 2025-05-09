import React from "react";
import logo from "../assets/img/make-it-all-icon.png";
import { useNavigate } from "react-router-dom";

const NoPage = () => {
  const navigate = useNavigate();

  const backToSite = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col w-full px-[2.5vw] py-4 min-h-screen bg-[var(--color-highlight)] shadow-2xl relative items-center justify-center overflow-visible lg:overflow-auto">
      <div className="flex flex-col px-3 bg-[var(--color-overlay)] text-white lg:my-[20vh] my-[20px] flex-grow w-[90%] lg:w-[40%] rounded-2xl shadow-2xl justify-center items-center min-h-full relative">
        <img
          src={logo}
          alt="Make-It-All Logo"
          className="max-w-[80px] max-h-[80px] rounded-lg border-2 mb-6 border-black"
        />
        <h1 className="text-4xl font-bold mb-4 text-center justify-center">
          404 - Page Not Found
        </h1>
        <p className="text-4xl font-semibold mb-5 text-center px-3">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <button
          className="flex p-3 rounded-2xl text-gray-200 font-semibold bg-[var(--color-overlay-light)] hover:bg-[var(--color-highlight)] hover:text-[var(--color-overlay)]"
          onClick={backToSite}
        >
          Back to main site
        </button>
      </div>
    </div>
  );
};

export default NoPage;
