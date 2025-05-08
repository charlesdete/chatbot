import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AgentRoute({ children }) {
  const { currentUser } = useAuth();
  const userData = JSON.parse(localStorage.getItem("user")); // or from context if stored there

  const isAgent = userData?.role === "Agent";

  if (!currentUser || !isAgent) {
    return <Navigate to="/login" />; // or redirect to /login
  }

  return children;
}
