import { useEffect, useRef, useState } from "react"
import "./agent.css"
import {addDoc, collection, onSnapshot} from "@firebase/firestore"
import { firestore } from "../firebase";
import Picker from 'emoji-picker-react';
import '@fortawesome/fontawesome-free/css/all.min.css';


export default function Agent() {

    const [istyping, setTyping] = useState(false)
    const textRef =useRef(null)
    const [agents, setAgent] = useState([])
    const [isPickerVisible,setPickerVisible]  = useState(false)

   
useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "UserText"), (snapshot) => {
        const agents = snapshot.docs.map((doc) => ({
                id: doc.id,
                text: doc.data()?.text || "No message", // Safe access
                direction: doc.data()?.direction || "incoming",
                sender: doc.data()?.sender || "agent",
                sentTime: doc.data()?.sentTime || "just now",
        
        }));
        setAgent(agents); // Update state with real-time data
    });

    return () => unsubscribe();
}, []);

    const handleText= async (e) => {
            e.preventDefault()

            if (!textRef.current || !textRef.current.value.trim()) return;
            const agentText = {
                id: `${Date.now()}`,
                text : textRef.current.value,
                sentTime:"just now",
                sender: "agent",
                direction:"outgoing"
            }

           setAgent((prevTexts) => [...prevTexts, agentText]); 
              
                
          const ref = collection(firestore, "AgentText");
           
                let data  ={
                    id: `${Date.now()}`,
                    text : textRef.current.value,
                    sentTime:"just now",
                    sender: "agent",
                    direction:""
                    
                }

            try{
               
               addDoc(ref,data);
            }catch(e){
                 console.log(e);
             }

             textRef.current.value = "";
                
        setTyping(true); 
        setTimeout(() => setTyping(false), 1000);


    }

    const onEmojiClick = (emojiObject) => {
        if (textRef.current) {
        textRef.current.value += emojiObject.emoji; // Append emoji to the input value
        }
    };

    return(
        <div className="wrapper">
        <div className="wrapper-card">
        <form onSubmit={handleText}>
            <div className="message-container">
                {agents.length === 0 ? (
                    <p>No messages yet.</p>
                ) : (
                    agents.map((agent) => (
                        <div
                            key={agent.id}
                            className={`agent ${agent.direction}`}
                            style={{
                                alignSelf:
                                    agent.direction === "outgoing"
                                        ? "flex-end"
                                        : "flex-start",
                            }}
                        >
                            <span>{agent.text}</span>
                        </div>
                    ))
                )}
            </div>

            {istyping && <div>typing...</div>}
                 {/* Emoji Picker Icon */}
                                        <i
                                        className={`emoji-icon fas fa-smile ${
                                            isPickerVisible ? "active" : ""
                                        }`}
                                        onClick={() => setPickerVisible((prev) => !prev)}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "20px",
                                            color: isPickerVisible ? "#0078d4" : "#000",
                                        }}
                                        ></i>
                
                                         {isPickerVisible && (
                                     <div className="emoji-picker-container">
                                     <Picker
                                          reactionsDefaultOpen={true}
                                          reactions={['1f600', '1f601', '1f602', '1f603', '1f604', '1f605']}
                                          onEmojiClick={onEmojiClick}
                                    
                                          />
                                         </div>
                                      )}

            <input
                placeholder="Chat with User..."
                ref={textRef}
                required
            />
            <button type="submit">Send</button>
        </form>
    </div>
    </div>
        
    )
}