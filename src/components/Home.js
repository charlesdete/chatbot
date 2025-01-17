import React, {useState, useRef} from "react";
import './home.css'
import Picker from 'emoji-picker-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {addDoc, collection,serverTimestamp } from "@firebase/firestore"
import { getAuth } from "firebase/auth";
import { firestore } from "../firebase";


const API_KEY = process.env.REACT_API_KEY;
export default function Home() {
 

const [istyping, setTyping] = useState(false) 
const [isPickerVisible,setPickerVisible]  = useState(false)
const messageRef = useRef(null);




// chat with the Ai
const [messages, setMessages] = useState([
    {
        message: "Hello I am Chatgpt",
        sentTime:"just now",
        sender: "Chatgpt",
        direction:"incoming"
    
    }
])



const handleSend = async ( e) => {
e.preventDefault()

if (!messageRef.current || !messageRef.current.value.trim()) return;

    const newMessage = {
        message:messageRef.current.value,
        sender: "user",
        direction:"outgoing",
        sentTime:Date.now()
    }
    // all the old messages,+the new message
    const newMessages = [...messages, newMessage];
   
// update our mesages state
setMessages(newMessages)

const auth = getAuth();
const user = auth.currentUser;
const uid = user.uid;


const ref = collection(firestore, "Chat");


let data = {
    Chat:[
        uid,
        messageRef.current.value,
    ]
}

 try{
        addDoc(ref, data);
      }catch(e){
        console.log(e);
      }


    
// set  a typing indicator(chatgpt is typing)
setTyping(true);
// process message to chatgpt (send it over and see the response)
 await processMessageToChatgpt(newMessages);


 messageRef.current.value='';
}

const onEmojiClick = (emojiObject) => {
    if (messageRef.current) {
      messageRef.current.value += emojiObject.emoji; // Append emoji to the input value
    }
  };
  




async function processMessageToChatgpt(chatMessages) {
    // chatMessages {sender:"user" or "chatgpt", message:"the message content here"}
    // apiMessages{ role: "user" or "assistant", content:"the message content here"}

    let apiMessages = chatMessages.map((messageObject)=> {
    let role= " ";
        if(messageObject.sender === "Chatgpt"){
            role="assistant"
        }else{
            role="user"
        }
        return{role:role , content:messageObject.message}
    })
        // role:"user"-> a message from the user, "assistant" -> aresponse from chatgpt
        // "system"-> generally one of initial message defining how we want chatgpt to talk
        const systemMessage ={
            role: "system",
            content: "Explain all concepts like i am a junior software developer"
        }


    const apiRequestBody = {
        "model":"gpt-3.5-turbo",
        "messages":[
            systemMessage,
            ...apiMessages 
        ]
    }

    await fetch("https://api.openai.com/v1/chat/completions",
     {
        method:"POST",
        headers:{
           "Authorization":`Bearer ${API_KEY}`,
           "Content-Type": "application/json" 
        },
        body:JSON.stringify(apiRequestBody)
    }).then((data)=>{
        return data.json();

    }).then((data)=>{
        console.log(data);
        const chatGptResponse = data?.choices?.[0]?.message?.content || "Sorry, something went wrong."; 
      setMessages([...chatMessages, {
        message: chatGptResponse,
        sender: "ChatGPT"
      }]);
              
        setTyping(false);
    });

}


    return (
<>

        <div className="wrapper">
            <div className="wrapper-card">

                
                <form >
                <div className="show-message"  
                     h1={istyping ? <h1 content="Chatgpt is typing"/> : null}>
                      {messages.map((message, i) => {
                       console.log(message)  
                      return <div key={i} model={message}/>   
                    })}
                </div>
     
                    <input placeholder="Chat with Human..." 
                     
                     required/>
                    <button className="" type="submit" >Send</button>
                </form>
            </div>



            <div className="wrapper-card">
                <form  onSubmit={handleSend} >

                <div className="message-container">
                    {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.direction}`}
                        style={{
                        alignSelf: msg.direction === 'outgoing' ? 'flex-end' : 'flex-start',
                        }}
                     >
                        <span>{msg.message}</span>
                    </div>
                    ))}
                </div>

                {istyping && <div>ChatGPT is typing...</div>} 
                        
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
                    <input placeholder="Chat with Ai..." 
                     ref={messageRef}         
                    required/>
                    
                    
                   
                     
                
                <button className="" type="submit"   >Send</button>  
               
                    </form>
            </div>
        </div>
        
    
        </>

    )
}