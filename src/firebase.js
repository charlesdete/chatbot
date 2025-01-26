import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "@firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBHtWqLBF1EwEkO-kcNeYcMDRTHQppcp6w",
  authDomain: "chat-bot-e5a30.firebaseapp.com",
  projectId: "chat-bot-e5a30",
  storageBucket: "chat-bot-e5a30.firebasestorage.app",
  messagingSenderId: "44562327499",
  appId: "1:44562327499:web:9b992ec139641b92d5f84e"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const  db = getFirestore(app)
