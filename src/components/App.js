import React from "react";
import Signup from "./Signup";
import { AuthProvider } from "../context/AuthContext";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import Home from "./Home";
import "../styles/App.css";
import Navbar from "./Navbar";
import Agent from "./Agent";
import User from "./User";
import LandingPage from "./LandingPage";

function App() {
  return (
    <>
      <Navbar />

      <div className="container" style={{ maxWidth: "400px" }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/Dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/agent"
              element={
                <PrivateRoute>
                  <Agent />
                </PrivateRoute>
              }
            />
            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <User />
                </PrivateRoute>
              }
            />
            <Route path="/agent" element={<Agent />} />
            <Route
              path="/update-profile"
              element={
                <PrivateRoute>
                  <UpdateProfile />
                </PrivateRoute>
              }
            />
            <Route path="/forgot-Password" element={<ForgotPassword />} />
          </Routes>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
