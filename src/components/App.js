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
    </>
  );

  // if (!chatId) {
  //   console.warn("No chat ID found, trying to retrieve...");
  //   const chatsRef = collection(db, "chats");
  //   const q = query(
  //     chatsRef,
  //     where("createdBy.userId", "==", userData.userId)
  //   );
  //   const querySnapshot = await getDocs(q);

  //   if (!querySnapshot.empty) {
  //     setChatId(querySnapshot.docs[0].id);
  //   } else if (chatId == null) {
  //     const uuid = uuid4();
  //     setChatId(uuid);
  //     localStorage.setItem("chatid", JSON.stringify(uuid));
  //   }
}

export default App;
