import React, { useState, useRef, useEffect } from "react";
import "../styles/home.css";
import {
  addDoc,
  collection,
  doc,
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

  // Handle sending a message
  const handleText = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("User data from local storage", userData);

    if (chatId == null) {
      const uuid = uuid4();
      setChatId(uuid);
      localStorage.setItem("chatid", JSON.stringify(uuid));
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
        // Step 2: Reference the "orders" subcollection inside the parent document
        const messagesSubcollectionRef = collection(chatDocRef, "messages");

        // Step 3: Add a document to the "orders" subcollection
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: attachment,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: message,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log("Message added to chat with ID:", messageDocRef.id);
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

    // Simulate agent typing
    setTyping(true);
    setLoading(true);
    setTimeout(() => setTyping(false), 1000); // Simulate 1-second typing delay
    setTimeout(() => setLoading(false), 1000);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevValue) => prevValue + emojiObject.emoji); // Append emoji to the input value
  };

  useEffect(() => {
    if (!chatId) return; // Prevent running when chatId is null

    const chatRef = doc(db, "chats", chatId);

    // Subscribe to chat document
    const unsubscribeChat = onSnapshot(chatRef, (docSnap) => {
      if (!docSnap.exists()) {
        console.log("Chat document not found.");
        return;
      }

      const chatData = { id: docSnap.id, ...docSnap.data() };

      // Subscribe to messages subcollection
      const messagesRef = collection(db, "chats", chatId, "messages");
      const unsubscribeMessages = onSnapshot(
        messagesRef,
        (subCollectionSnapshot) => {
          const messages = subCollectionSnapshot.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
          }));

          // Update state with merged data
          setMergedData([{ ...chatData, messages }]);
          console.log("Updated mergedData:", [{ ...chatData, messages }]);
        }
      );

      return unsubscribeMessages;
    });

    return () => {
      unsubscribeChat(); // Cleanup function to remove listeners
    };
  }, [chatId]); // Run when chatId changes

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

  return (
    <div className="wrapper">
      <div className="wrapper-card">
        <form onSubmit={handleText}>
          <div className="message-container">
            {Array.isArray(mergedData) && mergedData.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              mergedData.map((chatItem) => (
                <div key={chatItem.id} className="chatItem">
                  {/* Check if messages exist in the chatItem */}
                  {Array.isArray(chatItem.messages) &&
                  chatItem.messages.length > 0 ? (
                    chatItem.messages.map((message) => (
                      <div
                        key={message.id} // Unique key for each message
                        className={`chatItem ${chatItem.createdBy.role}`} // Dynamically setting class based on role
                        style={{
                          alignSelf:
                            chatItem.createdBy.role === "CUSTOMER"
                              ? "flex-start"
                              : "flex-end",
                        }}
                      >
                        <span>{message.text}</span>{" "}
                        <small>
                          {new Date(
                            message.timestamp.seconds * 1000
                          ).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p>No messages available</p> // Fallback if no messages
                  )}
                </div>
              ))
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
              size="35px"
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
