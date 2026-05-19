import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
