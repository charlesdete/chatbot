import React, { useState, useRef } from "react";
import "../styles/home.css";
import Picker from "emoji-picker-react";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "@firebase/firestore";
import { db } from "../firebase";
import EmojiButton from "./EmojiButton";
import uuid4 from "uuid4";
import Attachment from "./attachment";

const API_KEY = process.env.REACT_API_KEY;

export default function Home() {
  const [message, setMessage] = useState("Hello Customer, how may I help you?");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);

  const [istyping, setTyping] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const messageRef = useRef(null);
  const attachmentRef = useRef(null);
  // chat with the Ai

  const sendMessage = async (event) => {
    event.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("User data from local storage", userData);

    if (chatId == null) {
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
        console.log("Chat document created!");

        // Step 2: Reference the "orders" subcollection inside the parent document
        const messagesSubcollectionRef = collection(chatDocRef, "messages");

        // Step 3: Add a document to the "orders" subcollection
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: null,
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
          attachmentUrl: null,
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

    setTyping(true);
    setLoading(true);
    // process message to chatgpt (send it over and see the response)
    await processMessageToChatgpt(message);
  };

  const onEmojiClick = (emojiObject) => {
    if (messageRef.current) {
      messageRef.current.value += emojiObject.emoji; // Append emoji to the input value
    }
  };

  async function processMessageToChatgpt(chatMessages) {
    // chatMessages {sender:"user" or "chatgpt", message:"the message content here"}
    // apiMessages{ role: "user" or "assistant", content:"the message content here"}

    let apiMessages = chatMessages.map((messageObject) => {
      let role = " ";
      if (messageObject.sender === "Chatgpt") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });
    // role:"user"-> a message from the user, "assistant" -> aresponse from chatgpt
    // "system"-> generally one of initial message defining how we want chatgpt to talk
    const systemMessage = {
      role: "system",
      content: "Explain all concepts like i am a junior software developer",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        const chatGptResponse =
          data?.choices?.[0]?.message?.content ||
          "Sorry, something went wrong.";
        setMessage([
          ...chatMessages,
          {
            message: chatGptResponse,
            sender: "ChatGPT",
          },
        ]);

        setTyping(false);
      });
  }
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
    <>
      <div className="wrapper">
        <div className="wrapper-card">
          <form>
            <div className="message-container"></div>

            {istyping && <div>ChatGPT is typing...</div>}

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
              placeholder="Chat with Ai..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <button className="" type="submit" onClick={sendMessage}>
              {loading ? "Sending message" : "Send"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
