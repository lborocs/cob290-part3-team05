import { Outlet, Link } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex min-h-screen min-w-screen">
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
