import "../styles/Navbar.css";
import React, { useContext, useState, useEffect } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userRole, setUserRole] = useState(null);

  // Check if user is an agent or not
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
  }, []);

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        CHARLIE`S CHATBOT
      </Link>

      <ul className="ul">
        <CustomLink to="/home">Ai</CustomLink>
        <CustomLink to="/user">User</CustomLink>
        <CustomLink to="/Dashboard">User Profile</CustomLink>

        {/* Show History only if user is an AGENT */}
        {userRole === "AGENT" && <CustomLink to="/history">History</CustomLink>}

        <CustomLink to="/Signup">Sign In </CustomLink>
        <CustomLink onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"} Mode
        </CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}

export default Navbar;
