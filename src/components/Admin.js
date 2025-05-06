import React from "react";
import "../styles/admin.css";

export default function Admin() {
  return (
    <div>
      <div className="Admin-wrapper">
        <div className="Admin-card">
          <div className="Admin-details">
            <div className="Admin-profile">
              <h3>CHARLES DETE</h3>
            </div>

            <div className="Users-list">
              <div className="list-wrapper">
                <div className="single-list">
                  <h3>JEMO NGORI</h3>
                  <button type="submit">Update</button>
                  <button type="delete">Delete</button>
                </div>
              </div>
            </div>

            <div className="Add">
              <button type="submit">Add User</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
