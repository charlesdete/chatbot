import React, {useState} from "react";
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer,ChatContainer,MessageList,Message,MessageInput,TypingIndicator } from "@chatscope/chat-ui-kit-react";
import './home.css'

const API_KEY = process.env.REACT_API_KEY;
export default function Home() {
const [istyping, setTyping] = useState(false)    
const [messages, setMessages] = useState([
    {
        message: "Hello I am Chatgpt",
        sentTime:"just now",
        sender: "Chatgpt",
        direction:"incoming"
    
    }
])


const handleSend = async (message) => {
    const newMessage = {
        message:message,
        sender: "user",
        direction:"outgoing",
        sentTime:Date.now()
    }
    // all the old messages,+the new message
    const newMessages = [...messages, newMessage];


// update our mesages state
setMessages(newMessages);
// set  a typing indicator(chatgpt is typing)
setTyping(true);
// process message to chatgpt (send it over and see the response)
 await processMessageToChatgpt(newMessages);
}

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
        console.log(data);
      setMessages([...chatMessages, {
        message: data,
        sender: "ChatGPT"
      }]);
              
        setTyping(false);
    });

}


    return (
        
        <MainContainer style={{height:"600px", width:"500px"}}>
            <ChatContainer className="chatContainer">
                <MessageList  
                scrollBehavior="smooth"
                typingIndicator={istyping ? <TypingIndicator content="Chatgpt is typing"/> : null}
                >
                    {messages.map((message, i) => {
                      console.log(message)  
                     return <Message key={i} model={message}/>   
                    })}
                </MessageList>
                <MessageInput  placeholder="Type message here" onSend={handleSend}/>
            </ChatContainer>
        </MainContainer>
    
    
        

    )
}