import "../styles/Navbar.css";
import React, { useContext } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        CHARLIE`S CHATBOT
      </Link>

      <ul className="ul">
        <CustomLink to="/home">Ai</CustomLink>
        <CustomLink to="/user">User</CustomLink>
        <CustomLink to="/Dashboard">User Profile</CustomLink>
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
