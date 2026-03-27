import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/api";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  // If no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists → allow access
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
