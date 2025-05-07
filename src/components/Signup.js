import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import "../styles/userAuth.css";

export default function Signup() {
  const [firstname, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function validateEmail(value) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      return true;
    }
    return false;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Email is invalid. Please try again.");
      return;
    }
    if (password != confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await signup(email, password);

      console.log(response.user);

      let userData = {
        userId: response.user.uid,
        firstName: firstname,
        lastName: lastName,
        emailAddress: response.user.email,
        role: "CUSTOMER",
        accountStatus: "ACTIVE",
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        deviceInfo: {
          deviceType: null,
          brwoser: null,
        },
        photoUrl: null,
        chats: null,
      };

      await setDoc(doc(db, "users", `${response.user.uid}`), userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setLoading(false);
      navigate("/Home");
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="container">
        <form className="form">
          <h5>Sign up</h5>
          {error && (
            <div
              style={{
                color: "#f00",
                fontSize: "8px",
                backgroundColor: "#ff000033",
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <div className="input-shield">
              <input
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                type="text"
                name="First Name"
                required={true}
              />
            </div>
            <div className="input-shield">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                type="text"
                name="Last Name"
                required={true}
              />
            </div>
          </div>
          <div className="input-shield">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              type="email"
              name="email"
              required={true}
            />
          </div>
          <div className="input-shield">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password here"
              type="password"
              name="password"
              required={true}
            />
          </div>
          <div className="input-shield">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password here"
              type="password"
              name="confirmPassword"
              required={true}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            onClick={(e) => handleSubmit(e)}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </form>
      </div>
    </>
  );
}
