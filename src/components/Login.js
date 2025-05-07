import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/userAuth.css";
import { doc, getDoc } from "@firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*\d).{6,}$/;
    return regex.test(password);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Email is invalid. Please try again.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password is invalid. Please try again.");
      return;
    }

    setError("");
    setLoading(true);
    const response = await login(email, password);
    console.log(response);

    if (response?.user) {
      try {
        // Reference the user document directly using doc()
        const userDocRef = doc(db, "users", response.user.uid);

        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const theUser = docSnapshot.data(); // Extract user data

          // Store in localStorage
          localStorage.setItem("user", JSON.stringify(theUser));

          console.log("Fetched User Data:", theUser);
        } else {
          console.warn("No user found with this UID.");
        }
      } catch (e) {
        console.error("There is an error fetching the logged-in user", e);
        setLoading(false);
      }

      navigate("/Home");
    } else {
      setError(response.error.message ?? "Something went wrong!");
      console.error(response.error);

      setLoading(false);
    }
  }

  return (
    <>
      <div className="containerr">
        <form className="form" onSubmit={handleSubmit}>
          <h5>Sign in</h5>
          {error && (
            <div
              style={{
                color: "red",
                fontSize: "8px",
                backgroundColor: "#ff000033",
              }}
            >
              {error}
            </div>
          )}

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

          <button
            style={{ width: "200px", height: "40px", borderRadius: "10px" }}
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <svg
                style={{
                  width: "30px",
                  height: "30px",
                  display: "inline-block",
                }}
                version="1.1"
                id="L9"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 100 100"
                enable-background="new 0 0 0 0"
                xmlSpace="preserve"
              >
                <path
                  fill="#fff"
                  d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                >
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    dur="1s"
                    from="0 50 50"
                    to="360 50 50"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
            ) : (
              "Sign In"
            )}
          </button>
          <div className="w-100 text-center mt-2">
            Need an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </>
  );
}
