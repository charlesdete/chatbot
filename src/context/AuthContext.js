import React, { useContext, useState, useEffect } from "react"
import { auth } from "../firebase"
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth"
const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth,email, password)
  }

  function login(email, password) {
    const userCredential = signInWithEmailAndPassword(auth,email, password)
    return userCredential.user
  }

 function logout() {
  return auth.signOut()
 }

 function updateEmail(email) {
  return currentUser.updateEmail(email)
}

function updatePassword(password) {
  return currentUser.updatePassword(password)
}

  function resetPassword(email){
     return auth.sendPasswordResetEmail(email)
    
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    signup,
    resetPassword,
    logout,
    updateEmail,
    updatePassword

  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}