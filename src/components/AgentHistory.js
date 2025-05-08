import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  limit,
} from "@firebase/firestore";
import { db } from "../firebase";
import "../styles/history.css";

export default function AgentHistory() {
  const [chatId, setChatId] = useState(null);
  const [mergedData, setMergedData] = useState({ messages: [] });
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");

  // 🔹 Fetch chat ID based on logged-in user
  useEffect(() => {
    const fetchChat = async () => {
      const chatsRef = collection(db, "chats");
      const oldestChatQuery = query(
        chatsRef,
        orderBy("createdAt", "asc"),
        limit(1)
      );

      const snapshot = await getDocs(oldestChatQuery);

      if (!snapshot.empty) {
        const chat = snapshot.docs[0];
        console.log("Topmost (oldest) chat:", chat.id, chat.data());
        setChatId(snapshot.docs[0].id);
        return chat;
      } else {
        console.log("No chats found");
        return null;
      }
    };

    fetchChat();
  }, []);
  console.log(chatId);

  // 🔹 Fetch messages linked to the chat ID
  useEffect(() => {
    if (!chatId) return;

    console.log("Listening for messages in chat:", chatId);

    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        if (snapshot.empty) {
          console.warn("No messages found.");
          return;
        }

        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("New Messages Received:", newMessages);

        setMergedData((prev) => ({
          ...prev,
          messages: newMessages,
        }));
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  const userData = JSON.parse(localStorage.getItem("user"));
  function handleClick(message) {
    setText(message.text);
    setSender(userData.firstName);
    setEmail(userData.emailAddress);
    setTime(
      message.timestamp?.seconds
        ? new Date(message.timestamp.seconds * 1000).toLocaleString()
        : "No timestamp"
    );
  }
  return (
    <>
      <div className="agent">
        <div className="history-wrapper">
          <h4>Chat History</h4>

          {mergedData.messages.length > 0 ? (
            <div className="output">
              {mergedData.messages.map((message) => (
                <a key={message.id} onClick={() => handleClick(message)}>
                  <div className="output-content">
                    <h5>{userData.firstName || "Unknown sender"}</h5>
                    <small>
                      {message.timestamp?.seconds
                        ? new Date(
                            message.timestamp.seconds * 1000
                          ).toLocaleString()
                        : "No timestamp"}
                    </small>

                    <p>{message.text}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p>
              {loading
                ? "loading chat history..."
                : "No chat history available"}
            </p>
          )}
        </div>

        {/* new div to display the chats when clicked one */}

        <div className="display">
          <div className="display-container">
            <div className="display-text">
              <div className="display-content">
                <h5 id="h5">{text}</h5>
                <h3 id="h3">{sender}</h3>
                <p id="p">{email}</p>
                <small id="small">{time}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
