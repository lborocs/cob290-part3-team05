import { Outlet, Link } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex min-h-screen min-w-screen">
        <Sidebar />
        <div className="overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
