import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredUser } from "../services/authService";
import { getAccessToken } from "../lib/apiClient";

function isAuthenticated() {
  return Boolean(getStoredUser() || getAccessToken());
}

export const Protected: React.FC = () => {
  const location = useLocation();
  if (!isAuthenticated()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};

export const Public: React.FC = () => {
  if (isAuthenticated()) return <Navigate to="/home" replace />;
  return <Outlet />;
};

export default { Protected, Public };
