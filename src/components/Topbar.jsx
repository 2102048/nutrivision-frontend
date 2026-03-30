import { useNavigate, useLocation } from "react-router-dom";
import { removeToken } from "../services/api";

function Topbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("access_token");

  let userEmail = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userEmail = payload.sub || payload.email || "";
    } catch (err) {
      console.error("Token decode failed:", err);
    }
  }

  const handleLogout = () => {
    removeToken();
    navigate("/login");
  };

  const getPageTitle = () => {
    if (location.pathname.includes("scan")) return "Scan Food";
    if (location.pathname.includes("history")) return "History";
    if (location.pathname.includes("profile")) return "Profile";
    return "Dashboard";
  };

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6">

      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-sm text-gray-700 hidden sm:block">
            {userEmail}
          </span>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;