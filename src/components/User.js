import React, { useState, useRef, useEffect } from "react";
import "../styles/home.css";
import {
  addDoc,
  collection,
  doc,
  query,
  orderBy,
  setDoc,
  Timestamp,
  updateDoc,
  onSnapshot,
} from "@firebase/firestore";
import { db } from "../firebase";
import Picker from "emoji-picker-react";
import EmojiButton from "./EmojiButton";
import uuid4 from "uuid4";
import Attachment from "./attachment";

export default function User() {
  const [istyping, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const attachmentRef = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [mergedData, setMergedData] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    const chatsQuery = query(collection(db, "chats"));

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latestChat = snapshot.docs[0];
        setChatId(latestChat.id);
      } else {
        console.warn("No existing chats found.");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    console.log("🔄 Listening for messages in chat:", chatId);

    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      if (snapshot.empty) {
        console.warn("⚠️ No messages found.");
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
  }, [chatId]);

  // Handle sending a message
  const handleText = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("User data from local storage", userData);

    if (!chatId) {
      // Create a new chat if it doesn`t exist
      const uuid = uuid4();
      setChatId(uuid);

      try {
        console.log("creating a new chat with ID: ", uuid);
        // Step 1: Create the parent document in the "users" collection
        const chatDocRef = doc(db, "chats", `${uuid}`);
        await setDoc(chatDocRef, {
          agentInfo: null,
          createdBy: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            photoUrl: userData.photoUrl,
            role: userData.role,
            userId: userData.userId,
          },
          status: "UNASSIGNED",
          createdAt: Timestamp.fromDate(new Date()),
        });
        console.log("Chat document created!", uuid);
        console.log(userData.firstName);
        setTypingUser(userData.firstName);
        // Step 2: Reference the "messages" subcollection inside the parent document
        const messagesSubcollectionRef = collection(chatDocRef, "messages");

        // Step 3: Add a document to the "messages" subcollection
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: attachment,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: message,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log("Message added to chat with an ID:", messageDocRef.id);
      } catch (error) {
        console.error("Error creating a new message in the chat", error);
      }
    } else {
      console.log("updating an existing chat", chatId);
      try {
        const chatDocRef = doc(db, "chats", chatId);
        if (userData.role != "CUSTOMER") {
          await updateDoc(chatDocRef, {
            agentInfo: {
              agentId: userData.userId,
              firstName: userData.firstName,
              lastName: userData.firstName,
              startTime: Timestamp.fromDate(new Date()),
            },
          });
          console.log("Agent info updated successfully.");
        }

        const messagesSubcollectionRef = collection(chatDocRef, "messages");
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: attachment,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: message,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log("Message sent. Sub-collection ID:", messageDocRef.id);
      } catch (error) {
        console.error("Error adding document to subcollection:", error);
      }
    }

    setMessage("");
    setAttachment(null);

    // Simulate agent typing
    setTyping(true);
    setLoading(true);
    setTimeout(() => setTyping(false), 1000); // Simulate 1-second typing delay
    setTimeout(() => setLoading(false), 1000);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevValue) => prevValue + emojiObject.emoji); // Append emoji to the input value
  };

  // Run when chatId changes

  //input a file attachment
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setAttachment(file);

    if (file) {
      console.log("File selected:", file.name);
    }
  };
  const fileSelect = () => {
    attachmentRef.current.click();
  };

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  return (
    <div className="rapper">
      <div className="wrapper-card">
        <form onSubmit={handleText}>
          <div className="message-container">
            {mergedData?.[0]?.messages?.length > 0 ? (
              mergedData[0].messages.map((message) => {
                console.log(" Rendering Message:", message);
                return (
                  <div
                    key={message.id}
                    className={`chatItem ${
                      message.senderId === String(userData.userId)
                        ? "user"
                        : "agent"
                    }`}
                    style={{
                      alignSelf:
                        userData.userId === message.senderId
                          ? "flex-end"
                          : "flex-start",
                    }}
                  >
                    <span>{message.text || "No text"}</span>{" "}
                    <small>
                      {message.timestamp?.seconds
                        ? new Date(
                            message.timestamp.seconds * 1000
                          ).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown Time"}
                    </small>
                  </div>
                );
              })
            ) : (
              <p> No messages available</p>
            )}
          </div>

          {istyping && typingUser && <div>{typingUser} is typing...</div>}

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
          <div style={{ display: "flex" }}>
            <EmojiButton
              color="#0b5ed7"
              size="20px"
              isOpened={isPickerVisible}
              onclickCallback={() => setPickerVisible((prev) => !prev)}
            />

            <Attachment onClick={fileSelect} size="35px" />
          </div>
          <input
            type="file"
            style={{ display: "none" }}
            ref={attachmentRef}
            onChange={handleFileSelect}
          />
          {attachment && (
            <p>
              Selected File: <strong>{attachment.name}</strong>
            </p>
          )}
          <input
            placeholder="Chat with Agent..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit">{loading ? "Sending" : "Send"}</button>
        </form>
      </div>
    </div>
  );
}
