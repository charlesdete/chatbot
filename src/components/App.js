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
import User from "./User";
import LandingPage from "./LandingPage";
import AgentHistory from "./AgentHistory";
import Admin from "./Admin";
import Footer from "./footer";

function App() {
  return (
    <>
      <Navbar />

      <div className="container" style={{ maxWidth: "400px" }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/Home"
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
            <Route
              path="/Admin"
              element={
                <PrivateRoute>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/History"
              element={
                <PrivateRoute>
                  <AgentHistory />
                </PrivateRoute>
              }
            />
            <Route path="/Signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <User />
                </PrivateRoute>
              }
            />
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

      <Footer />
    </>
  );
}

export default App;
