import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ control sidebar

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* 🧭 Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 📦 Main Section */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* 🔝 Topbar */}
        <Topbar setSidebarOpen={setSidebarOpen} />

        {/* 📄 Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;