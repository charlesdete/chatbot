import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create the SessionContext
export const SessionContext = createContext();

// SessionProvider component
export const SessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const [sessionTimeout, setSessionTimeout] = useState(null);

  useEffect(() => {
    // Start the session timer
    const interval = setInterval(() => {
      console.log("Your session has ended!");
      navigate("/login"); // Redirect to login on session expiry
    }, 1000 * 60 * 60); // 1 hour session timer

    // Cleanup timer on component unmount
    return () => clearInterval(interval);
  }, [navigate]);

  // Function to reset the session timer
  const resetSession = () => {
    if (sessionTimeout) {
      clearInterval(sessionTimeout); // Clear the current session timer
    }

    const newTimeout = setInterval(() => {
      console.log("Your session has ended!");
      navigate("/login");
    }, 1000 * 60 * 60); // Restart the 1-hour session timer

    setSessionTimeout(newTimeout);
  };

  // Function to manually end the session
  const endSession = () => {
    if (sessionTimeout) {
      clearInterval(sessionTimeout); // Clear the session timer
    }
    navigate("/login"); // Redirect to login
  };

  return (
    <SessionContext.Provider value={{ resetSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};
