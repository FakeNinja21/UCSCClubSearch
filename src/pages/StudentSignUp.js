import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";


const googleProvider = new GoogleAuthProvider();


export default function StudentSignUp() {
 const navigate = useNavigate();


 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState("");


 const handleSignUp = async (e) => {
   e.preventDefault();
   setError("");


   if (!email.endsWith("@ucsc.edu")) {
     setError("You must use a valid @ucsc.edu email to sign up.");
     return;
   }


   if (password !== confirmPassword) {
     setError("Passwords do not match.");
     return;
   }


   try {
     await createUserWithEmailAndPassword(auth, email, password);
     alert("Account created successfully!");
     navigate("/notifications");
   } catch (err) {
     setError(err.message);
   }
 };


 const handleGoogleSignIn = async () => {
   try {
     const result = await signInWithPopup(auth, googleProvider);
     const userEmail = result.user.email;
     if (!userEmail.endsWith("@ucsc.edu")) {
       setError("Only @ucsc.edu accounts are allowed.");
       return;
     }
     navigate("/notifications");
   } catch (err) {
     setError("Google Sign-In failed: " + err.message);
   }
 };


 return (
   <div style={{
     minHeight: "100vh",
     display: "flex",
     justifyContent: "center",
     alignItems: "center",
     backgroundColor: "#f8f9fa"
   }}>
     <div style={{
       width: "100%",
       maxWidth: "400px",
       background: "white",
       padding: "2rem",
       borderRadius: "8px",
       boxShadow: "0 0 20px rgba(0,0,0,0.1)",
       textAlign: "center"
     }}>
       <img
         src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/UC_Santa_Cruz_seal.svg/1200px-UC_Santa_Cruz_seal.svg.png"
         alt="UCSC Logo"
         style={{ width: "80px", marginBottom: "1rem" }}
       />
       <h2>Student Sign Up</h2>


       <button
         onClick={handleGoogleSignIn}
         style={{
           backgroundColor: "#4285F4",
           color: "white",
           border: "none",
           padding: "10px",
           borderRadius: "4px",
           width: "100%",
           marginBottom: "1rem",
           cursor: "pointer"
         }}
       >
         Sign in with Google (UCSC Email)
       </button>


       <hr style={{ margin: "1rem 0" }} />


       <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
         <input
           type="email"
           placeholder="UCSC Email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           required
           style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
         />
         <input
           type="password"
           placeholder="Password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           required
           style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
         />
         <input
           type="password"
           placeholder="Confirm Password"
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           required
           style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
         />
         {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}
         <button
           type="submit"
           style={{
             backgroundColor: "#007bff",
             color: "white",
             border: "none",
             padding: "10px",
             borderRadius: "4px",
             cursor: "pointer"
           }}
         >
           Create Account
         </button>
       </form>
     </div>
   </div>
 );
}
