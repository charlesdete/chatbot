import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/userAuth.css";
import { collection, doc, getDoc } from "@firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [User, setUser] = useState(null);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validateEmail(value) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
      return true;
    }
    return false;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (validateEmail(email) == false) {
      setError("Email is invalid. Please try again.");
      return;
    }

    setError("");
    setLoading(true);
    const response = await login(email, password);

    if (response?.user !== "undefined" && response?.user !== null) {
      console.log(response.user.uid);

      try {
        // Reference the user document directly using doc()
        const userDocRef = doc(db, "users", response.user.uid);

        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const theUser = docSnapshot.data(); // Extract user data
          setUser(theUser); // Store in state

          // Store in localStorage
          localStorage.setItem("user", JSON.stringify(theUser));

          console.log("Fetched User Data:", theUser);
        } else {
          console.warn("No user found with this UID.");
        }
      } catch (e) {
        console.error("There is an error fetching the logged-in user", e);
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
      {error && <div>{error}</div>}
      <form className="form">
        <h5>Sign in</h5>
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
          disabled={loading}
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </>
  );
}
