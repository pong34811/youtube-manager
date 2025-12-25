import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCWpAKdaReyNnzQoyUQUzyrQvZaO9OsQEg",
  authDomain: "prachayasittikul.firebaseapp.com",
  databaseURL:
    "https://prachayasittikul-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prachayasittikul",
  storageBucket: "prachayasittikul.firebasestorage.app",
  messagingSenderId: "219834282197",
  appId: "1:219834282197:web:c2ca637ace643d8d2fb25c",
  measurementId: "G-LJJ9T60CJF",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
