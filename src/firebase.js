import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
 apiKey: "AIzaSyA93vMywvtMarjNvTwfGbXszIpBZbkvxsU",
 authDomain: "ucscclubsearch.firebaseapp.com",
 projectId: "ucscclubsearch",
 storageBucket: "ucscclubsearch.firebasestorage.app",
 messagingSenderId: "981540927962",
 appId: "1:981540927962:web:29ac010279fd6012b9e8e3",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export { auth };