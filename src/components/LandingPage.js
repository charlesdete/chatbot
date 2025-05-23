import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="space-container">
        <h1>CHAT WITH US</h1>
        <div class="space">
          <div class="content">
            <div class="content-button">
              <button onClick={() => navigate("/home")}>
                <img src="" />
                CHAT WITH AI
              </button>
            </div>
            <div class="content-image">
              <img
                src={require("../components/images/Chatbot4.png")}
                alt="Chatbot"
              />
            </div>
            <div class="content-button">
              <button onClick={() => navigate("/user")}>CHAT WITH HUMAN</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
