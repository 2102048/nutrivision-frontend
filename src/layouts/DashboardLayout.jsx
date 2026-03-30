import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* 📱 Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🧭 Sidebar */}
      <div className={`
        fixed lg:static z-50 lg:z-auto
        h-full transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}>
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* 📦 Main Section */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* 🔝 Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* 📄 Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 md:p-10">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;