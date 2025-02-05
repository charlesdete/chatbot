import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "@firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/history.css";

export default function AgentHistory() {
  const [history, setHistory] = useState("");
  const [chatId, setChatId] = useState(null);
  const [mergedData, setMergedData] = useState(null);
  const navigate = useNavigate();

  const handleHistory = async (e) => {
    e.preventDefault();

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      // if (userData.role !== "AGENT") {
      //   navigate("/login");
      // }
      const q = query(
        collection(db, "chats"),
        where("createdBy.userid", "==", "userData.userId")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestChat = snapshot.docs;
          setChatId(latestChat.id);
          console.log(latestChat);
        } else {
          console.warn("No existing chats found.");
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      console.log("There was an error finding the chats!");
    }

    try {
      if (!chatId) return;

      console.log(" Listening for messages in chat:", chatId);

      const messagesRef = collection(db, "chats", chatId, "messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        if (snapshot.empty) {
          console.warn("No messages found.");
          return;
        }

        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("New Messages Received:", newMessages);

        // Correctly update state without overriding previous messages
        setMergedData((prev) => {
          const updatedChat = { ...prev[0], messages: newMessages };
          return [updatedChat];
        });
      });

      return () => unsubscribe();
    } catch (e) {
      console.error(e);
      console.log("There was an error fetching the messages!");
    }
  };

  const userData = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="history-wrapper">
      <form onSubmit={handleHistory}>
        <div className="containerRap">
          <div className="agent-details">
            <h3>charlie</h3>
          </div>
          <div className="inputRap">
            <input
              placeholder=""
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>
        </div>

        <div className="output">
          {mergedData?.messages?.length > 0 ? (
            mergedData.messages.map((message) => {
              console.log(" Rendering Message:", message);

              return (
                <div class="list-group">
                  <a
                    href="#"
                    class="list-group-item list-group-item-action active"
                    aria-current="true"
                  >
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">List group item heading</h5>
                      <small>3 days ago</small>
                    </div>
                    <p class="mb-1">Some placeholder content in a paragraph.</p>
                    <small>And some small print.</small>
                  </a>
                  <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">List group item heading</h5>
                      <small class="text-muted">3 days ago</small>
                    </div>
                    <p class="mb-1">Some placeholder content in a paragraph.</p>
                    <small class="text-muted">
                      And some muted small print.
                    </small>
                  </a>
                </div>
              );
            })
          ) : (
            <p> No chats history available</p>
          )}
        </div>
      </form>
    </div>
  );
}
