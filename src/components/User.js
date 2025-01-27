import React, { useState, useRef, useEffect } from "react";
import "../styles/home.css";
import { addDoc, collection, onSnapshot } from "@firebase/firestore";
import { db } from "../firebase";
import Picker from "emoji-picker-react";
import EmojiButton from "./EmojiButton";

export default function User() {
  const [istyping, setTyping] = useState(false);
  const textRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [isPickerVisible, setPickerVisible] = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "AgentText"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data()?.text || "No text available",
        direction: doc.data()?.direction || "incoming",
        sender: doc.data()?.sender || "unknown",
        sentTime: doc.data()?.sentTime || "unknown",
      }));

      setUsers(users);
    });

    return () => unsubscribe();
  }, []);

  // Handle sending a message
  const handleText = async (e) => {
    e.preventDefault();

    if (!textRef.current || !textRef.current.value.trim()) return;

    const newText = {
      id: `${Date.now()}`,
      text: textRef.current.value,
      sentTime: "just now",
      sender: "customer",
      direction: "outgoing",
    };

    // Update state with new message
    setUsers((prevTexts) => [...prevTexts, newText]);

    // Send message to Firestore
    const ref = collection(db, "UserText");

    let data = {
      id: `${Date.now()}`,
      text: textRef.current.value,
      sentTime: "just now",
      sender: "customer",
      direction: "",
    };

    try {
      await addDoc(ref, data);
    } catch (e) {
      console.error("Error sending message:", e);
    }

    // Clear input field
    textRef.current.value = "";

    // Simulate agent typing
    setTyping(true);
    setTimeout(() => setTyping(false), 1000); // Simulate 1-second typing delay
  };

  const onEmojiClick = (emojiObject) => {
    if (textRef.current) {
      textRef.current.value += emojiObject.emoji; // Append emoji to the input value
    }
  };

  return (
    <div className="wrapper">
      <div className="wrapper-card">
        <form onSubmit={handleText}>
          <div className="message-container">
            {Array.isArray(users) && users.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className={`user ${user.direction}`}
                  style={{
                    alignSelf:
                      user.direction === "outgoing" ? "flex-end" : "flex-start",
                  }}
                >
                  <span>{user.text}</span>
                </div>
              ))
            )}
          </div>

          {istyping && <div>typing...</div>}

          {isPickerVisible && (
            <div className="emoji-picker-container">
              <Picker
                reactionsDefaultOpen={true}
                reactions={[
                  "1f600",
                  "1f601",
                  "1f602",
                  "1f603",
                  "1f604",
                  "1f605",
                ]}
                onEmojiClick={onEmojiClick}
              />
            </div>
          )}

          <EmojiButton
            color="#0b5ed7"
            size="35px"
            isOpened={isPickerVisible}
            onclickCallback={() => setPickerVisible((prev) => !prev)}
          />

          <input placeholder="Chat with Agent..." ref={textRef} required />

          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}
