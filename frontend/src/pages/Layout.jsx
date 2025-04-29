import { Outlet, Link } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex h-screen min-w-screen overflow-hidden">
        <Sidebar />
        <div className="overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
