import React, { useState, useRef, useEffect } from "react";
import "../styles/home.css";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  limit,
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

  const userData = JSON.parse(localStorage.getItem("user"));
  // 1. CUSTOMER: create or get existing chat
  useEffect(() => {
    if (!userData?.userId || !userData.role) return;

    const fetchChat = async () => {
      // if (userData.role === "CUSTOMER") {
      //   const customerChatsQuery = query(
      //     collection(db, "chats"),
      //     where("createdBy.userId", "==", userData.userId)
      //   );
      //   const snapshot = await getDocs(customerChatsQuery);
      //   if (!snapshot.empty) {
      //     setChatId(snapshot.docs[0].id); // use existing chat
      //   } else {
      //     const newChatId = uuid4();
      //     await setDoc(doc(db, "chats", newChatId), {
      //       createdBy: {
      //         userId: userData.userId,
      //         firstName: userData.firstName,
      //         lastName: userData.lastName,
      //         role: userData.role,
      //         photoUrl: userData.photoUrl,
      //       },
      //       agentInfo: null,
      //       status: "UNASSIGNED",
      //       createdAt: Timestamp.now(),
      //     });
      //     setChatId(newChatId);
      //   }
      // }
      // // 2. AGENT: find unassigned chat and join
      // if (userData.role === "AGENT") {
      //   const unassignedChatsQuery = query(
      //     collection(db, "chats"),
      //     where("createdBy.userId", "==", userData.userId)
      //   );
      //   const snapshot = await getDocs(unassignedChatsQuery);
      //   if (!snapshot.empty) {
      //     const targetChat = snapshot.docs[0];
      //     const chatRef = doc(db, "chats", targetChat.id);
      //     // Assign agent to chat
      //     await updateDoc(chatRef, {
      //       agentInfo: {
      //         agentId: userData.userId,
      //         firstName: userData.firstName,
      //         lastName: userData.lastName,
      //         startTime: Timestamp.now(),
      //       },
      //       status: "ASSIGNED",
      //     });
      //     setChatId(targetChat.id);
      //   } else {
      //     console.warn("No unassigned chats found.");
      //   }
      // }
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
  }, [userData]);

  // 3. Listen to messages in real-time
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMergedData([{ messages: newMessages }]);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleText = async (e) => {
    e.preventDefault();

    if (chatId) {
      const chatDocRef = doc(db, "chats", chatId);
      const messagesSubcollectionRef = collection(chatDocRef, "messages");

      try {
        if (userData.role !== "CUSTOMER") {
          await updateDoc(chatDocRef, {
            agentInfo: {
              agentId: userData.userId,
              firstName: userData.firstName,
              lastName: userData.firstName,
              startTime: Timestamp.fromDate(new Date()),
            },
          });
        }

        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: attachment,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: message,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log("Message sent. ID:", messageDocRef.id);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      const uuid = uuid4();
      setChatId(uuid);

      try {
        const chatDocRef = doc(db, "chats", uuid);
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

        setTypingUser(userData.firstName);

        const messagesSubcollectionRef = collection(chatDocRef, "messages");
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: attachment,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: message,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log(
          "New chat created and message added. ID:",
          messageDocRef.id
        );
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    }

    setMessage("");
    setAttachment(null);
    setTyping(true);
    setLoading(true);
    setTimeout(() => setTyping(false), 1000);
    setTimeout(() => setLoading(false), 1000);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevValue) => prevValue + emojiObject.emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment(url);
    }
  };

  const fileSelect = () => {
    attachmentRef.current.click();
  };

  return (
    <div className="rapper">
      <div className="wrapper-card">
        <form onSubmit={handleText}>
          <div className="message-container">
            {mergedData?.[0]?.messages?.length > 0 ? (
              mergedData[0].messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatItem ${
                    message.senderId === String(userData.userId)
                      ? "user"
                      : "agent"
                  }`}
                  style={{
                    alignSelf:
                      message.senderId === userData.userId
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  <span>{message.text || "No text"}</span>
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
              ))
            ) : (
              <p>No messages available</p>
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
            placeholder={`${userData.firstName} chat with an Agent...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit" style={{ borderRadius: "10px" }}>
            {loading ? "Sending" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
