import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA93vMywvtMarjNvTwfGbXszIpBZbkvxsU",
  authDomain: "ucscclubsearch.firebaseapp.com",
  projectId: "ucscclubsearch",
  storageBucket: "ucscclubsearch.appspot.com", // FIXED: was .firebasestorage.app
  messagingSenderId: "981540927962",
  appId: "1:981540927962:web:29ac010279fd6012b9e8e3",
  measurementId: "G-E7QCKN3CWE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to create a new event post in the 'events' collection
const createEvent = async (eventData) => {
  try {
    await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(), // Automatically adds the creation time
    });
    console.log("Event created successfully!");
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error; // Pass the error along to be handled by the form
  }
};

// Helper to upload an image and get its download URL
const uploadEventBanner = async (file, clubName, eventName) => {
  if (!file) throw new Error("No file provided");
  // Create a unique path for the image
  const storageRef = ref(storage, `eventBanners/${clubName}_${eventName}_${Date.now()}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Function to get all events, ordered by creation date
const getEvents = async () => {
  const eventsCollection = collection(db, "events");
  // Create a query to order events by the 'createdAt' field, newest first
  const q = query(eventsCollection, orderBy("createdAt", "desc"));
  const eventSnapshot = await getDocs(q);
  // Map over the documents and format them into a more usable array
  const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return eventList;
};


// All functions are now exported together here
export { auth, db, createEvent, getEvents, storage, uploadEventBanner };