import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";

const Layout = () => {
  return (
    <>
    <div className="flex">
        <Sidebar />
        <Outlet />
    </div>
      
    </>
  )
};

export default Layout;