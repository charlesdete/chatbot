import { useEffect, useRef, useState } from "react";
import "../styles/agent.css";
import { db } from "../firebase";
import Picker from "emoji-picker-react";
import EmojiButton from "./EmojiButton";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
} from "@firebase/firestore";
import Attachment from "./attachment";
import uuid4 from "uuid4";

export default function Agent() {
  const [attachment, setAttachment] = useState(null);
  const [istyping, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [AgentText, setAgentText] = useState(null);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const attachmentRef = useRef(null);

  const handleText = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user"));
    console.log("Agent`s data from local storage", userData);

    if (chatId == null) {
      const uuid = uuid4();
      setChatId(uuid);

      try {
        console.log("creating a new chat with ID: ", uuid);
        // create new chat or overwrite the exisiting chat
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

        // Step 2: Reference the "orders" subcollection inside the parent document
        const messagesSubcollectionRef = collection(chatDocRef, "messages");

        // Step 3: Add a document to the "orders" subcollection
        const messageDocRef = await addDoc(messagesSubcollectionRef, {
          attachmentUrl: null,
          senderId: userData.userId,
          isDelivered: false,
          isRead: false,
          text: AgentText,
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
          text: AgentText,
          timestamp: Timestamp.fromDate(new Date()),
        });

        console.log("Message sent. Sub-collection ID:", messageDocRef.id);
      } catch (error) {
        console.error("Error adding document to subcollection:", error);
      }
    }

    //   useEffect(() => {
    //     const unsubscribe = onSnapshot(collection(db, "UserText"), (snapshot) => {
    //       const agents = snapshot.docs.map((doc) => ({
    //         id: doc.id,
    //         text: doc.data()?.text || "No message", // Safe access
    //         direction: doc.data()?.direction || "incoming",
    //         sender: doc.data()?.sender || "agent",
    //         sentTime: doc.data()?.sentTime || "just now",
    //       }));
    //       setAgent(agents); // Update state with real-time data
    //     });

    //     return () => unsubscribe();
    //   }, []);

    setTyping(true);
    setLoading(true);
    setTimeout(() => setTyping(false), 1000);
  };

  const onEmojiClick = (emojiObject) => {
    if (AgentText) {
      AgentText += emojiObject.emoji; // Append emoji to the input value
    }
  };

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
            placeholder="Chat with User..."
            value={AgentText}
            onChange={(e) => setAgentText(e.target.value)}
            required
          />
          <button type="submit">{loading ? "Sending..." : "Send"}</button>
        </form>
      </div>
    </div>
  );
}
