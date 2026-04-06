import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDrN0RnoCkNue7l2PlWHTslCd2Xot2wUHs",
  authDomain: "dikati-94597.firebaseapp.com",
  databaseURL: "https://dikati-94597-default-rtdb.firebaseio.com",
  projectId: "dikati-94597",
  storageBucket: "dikati-94597.firebasestorage.app",
  messagingSenderId: "607866287683",
  appId: "1:607866287683:web:b9b779e0d8a70a480686f6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
