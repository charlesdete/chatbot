import React from "react"
import Signup from "./Signup"
import { Container } from "react-bootstrap"
import { AuthProvider } from "../context/AuthContext"
import {   Routes, Route } from "react-router-dom"
import Login from "./Login"
import PrivateRoute from "./PrivateRoute"
import Dashboard from "./Dashboard"
import ForgotPassword from "./ForgotPassword"
import UpdateProfile from "./UpdateProfile"
import Home from "./Home";
import './App.css';
import  Navbar from './Navbar';


function App() {

  return (
    <>
   <Navbar/>
   
       
   <Container>
    
   <div className="container" style={{ maxWidth: "400px" }}>
    
    <AuthProvider>
    <Routes>
      <Route path="/home" element={<PrivateRoute><Home/></PrivateRoute>}/>
      <Route path="/Dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
      <Route path="/Signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>} />
      <Route  path="/update-profile" element={<PrivateRoute><UpdateProfile/></PrivateRoute>} />
      <Route path="/forgot-Password" element={<ForgotPassword/>}/>
    </Routes>
    </AuthProvider>
    
   </div>
   {/* <div className="info">

<div className="image">
     <img src=""/>
     </div>
<h5>Chat with me...</h5>
     
     </div> */}
   </Container>

















  
    </>
  
  )
}

export default App;