import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  where,
} from "@firebase/firestore";
import { db } from "../firebase";
import "../styles/history.css";
import { useNavigate } from "react-router-dom";

export default function AgentHistory() {
  const [chatId, setChatId] = useState(null);
  const [mergedData, setMergedData] = useState({ messages: [] });
  const navigate = useNavigate();

  // 🔹 Fetch chat ID based on logged-in user
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.userId) {
          console.warn("User ID not found in localStorage.");
          return;
        }

        console.log("Fetching chats for User ID:", userData.userId);

        // Query to get chats for the logged-in user
        const q = query(
          collection(db, "chats"),
          where("createdBy.userId", "==", userData.userId) // Use the nested userId
        );

        const querySnapshot = await getDocs(q);

        // Check if chats are found
        if (querySnapshot.empty) {
          console.warn("No chats found for this user.");
          return;
        }

        // Log the fetched documents
        querySnapshot.forEach((doc) => {
          console.log(doc.id, " => ", doc.data());
        });

        // Get the first chat document (you may want to adjust this logic if needed)
        const latestChatDoc = querySnapshot.docs[0];
        const latestChat = latestChatDoc.data(); // Get chat data

        setChatId(latestChatDoc.id);
        console.log("Chat ID:", latestChatDoc.id);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats(); // Call fetchChats when component mounts
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
  return (
    <div className="history-wrapper">
      <div className="output">
        <h5>Chat History</h5>
        {mergedData.messages.length > 0 ? (
          <div className="list-group">
            {mergedData.messages.map((message) => (
              <a
                key={message.id}
                href="#"
                className="list-group-item list-group-item-action "
              >
                <div className="d-block w-600 justify-content-between">
                  <h5 className="mb-1">{message.text}</h5>
                  <small>
                    {message.timestamp?.seconds
                      ? new Date(
                          message.timestamp.seconds * 1000
                        ).toLocaleString()
                      : "No timestamp"}
                  </small>
                </div>
                <p className="mb-1">{userData.firstName || "Unknown sender"}</p>
              </a>
            ))}
          </div>
        ) : (
          <p>No chat history available</p>
        )}
      </div>
    </div>
  );
}
