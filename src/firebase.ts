import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIpfZfiR5_2CWn5WgQKi_tZqeDP6KACAM",
  authDomain: "egc-photobox.firebaseapp.com",
  databaseUrl: "https://egc-photobox-default-rtdb.firebaseio.com/",
  projectId: "egc-photobox",
  storageBucket: "egc-photobox.appspot.com",
  messagingSenderId: "964549297685",
  appId: "1:964549297685:web:2cf7995c59b3dfbf18701c",
  measurementId: "G-1EVEW5N8NF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ pastikan ini ADA!
