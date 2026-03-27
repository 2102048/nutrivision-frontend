import { useNavigate, useLocation } from "react-router-dom";
import { removeToken } from "../services/api"; 

function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- ✅ GET ACCESS_TOKEN ---------------- */
  const token = localStorage.getItem("access_token");

  let userEmail = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Fallback logic to find email in JWT payload
      userEmail = payload.sub || payload.email || "";
    } catch {
      userEmail = "";
    }
  }

  /* ---------------- ✅ LOGOUT ---------------- */
  const handleLogout = () => {
    removeToken(); 
    navigate("/login");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("scan")) return "Scan Food";
    if (location.pathname.includes("history")) return "History";
    if (location.pathname.includes("profile")) return "Profile";
    if (location.pathname.includes("goals")) return "Goals";
    return "Dashboard";
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">

      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-800">
        {getPageTitle()}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* 📧 Email Only Section */}
        {userEmail && (
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {userEmail}
          </span>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition shadow-sm"
        >
          Logout
        </button>

      </div>
    </header>
  );
}

export default Topbar;