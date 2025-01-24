
import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import {Link, useNavigate } from "react-router-dom"

export default function Login() {
  
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()




  async function HandleSubmit(e) {
    e.preventDefault()

    
      setError("")
      setLoading(true)
     const response = await  login(emailRef.current.value, passwordRef.current.value)
     

     if(response?.user !== "undefined" && response?.user !== null ) {
        navigate('/Home');
        
     }else{
     setError(response.error.message ?? "Something went wrong!")
      console.error(response.error)
     

    setLoading(false)
  }}

  return (
    <>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={HandleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
            
              <Form.Control type="email" id="email" ref={emailRef} required />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" id="password" ref={passwordRef} required />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">
              Log In
            </Button>
          </Form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </>
  )
}
