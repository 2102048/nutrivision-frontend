import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DashboardLayout() {
  return (
    // font-sans added to establish the geometric typography style
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* 🧭 Sidebar */}
      <Sidebar />

      {/* 📦 Main Section */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* 🔝 Topbar */}
        <Topbar />

        {/* 📄 Page Content */}
        {/* Main content container refined:
          - p-6 removed here and moved to an inner container for better control over constraints.
          - overflow-y-auto is critical for the page's scrollable region.
        */}
        <main className="flex-1 overflow-y-auto">
          {/* This container ensures the main content (like the dashboard cards)
            doesn't stretch too wide on very large screens, remaining clean and readable.
            Increased padding here provides more breathing room around the components.
          */}
          <div className="container mx-auto p-6 md:p-10">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;