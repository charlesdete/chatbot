import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <>
      <div className="footer-container">
        <div className="footer-content">
          <ul className="footer-list">
            <li>AI</li>
            <li>ABOUT</li>
            <li>SERVICES</li>
            <li>CUSTOMER CARE</li>
          </ul>
        </div>
        <div className="copyright">
          <small>Charlie`s Bot</small>
        </div>
      </div>
    </>
  );
}
