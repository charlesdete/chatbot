import React, { useRef, useState } from "react";
import { Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/profile.css";
import Profile from "./camera";
import user from "../components/images/user.png";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [pic, setPic] = useState(null);
  const picRef = useRef();

  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  function handleProfilePic(e) {
    const file = e.target.files[0];
    setPic(file);

    if (file) {
      console.log("File selected:", file.name);
    }
  }
  const fileSelect = () => {
    picRef.current.click();
  };

  return (
    <>
      <div className="container">
        <form className="form">
          <h2 className="text-center mb-4">Profile</h2>
          <div className="profile-pic">
            <div className="outline-pic">
              <img src={pic ? URL.createObjectURL(pic) : user} />
            </div>

            <input
              type="file"
              style={{ display: "none" }}
              ref={picRef}
              onChange={handleProfilePic}
            />
          </div>
          <Profile
            onClick={fileSelect}
            size="20px"
            color="#000"
            padding="10px"
          />
          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Email:</strong> {currentUser.email}
          <Link to="/update-profile" className="btn btn-primary w-100 mt-3">
            Update Profile
          </Link>
          <div className="text-center mt-2">
            <button
              style={{ width: "200px", height: "40px", borderRadius: "10px" }}
              variant="link"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
