import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  where
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA93vMywvtMarjNvTwfGbXszIpBZbkvxsU",
  authDomain: "ucscclubsearch.firebaseapp.com",
  projectId: "ucscclubsearch",
  storageBucket: "ucscclubsearch.appspot.com",
  messagingSenderId: "981540927962",
  appId: "1:981540927962:web:29ac010279fd6012b9e8e3",
  measurementId: "G-E7QCKN3CWE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Login Functions ---
const googleProvider = new GoogleAuthProvider();

const signInStudentWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const signInStudentWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// --- Event Functions ---
const createEvent = async (eventData) => {
  try {
    await addDoc(collection(db, "events"), {
      ...eventData,
      createdAt: serverTimestamp(),
    });
    console.log("Event created successfully!");
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error;
  }
};

const getEvents = async () => {
  const eventsCollection = collection(db, "events");
  const q = query(eventsCollection, orderBy("createdAt", "desc"));
  const eventSnapshot = await getDocs(q);
  const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return eventList;
};

const getEventsForStudent = async (studentId) => {
  if (!studentId) return [];
  const userRef = doc(db, 'users', studentId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("Could not find user profile to get notification preferences.");
    return [];
  }
  
  const userData = userSnap.data();
  const preference = userData.notificationPreference || 'all';
  const joinedClubs = userData.joinedClubs || [];
  
  const eventsCollection = collection(db, "events");
  let eventsQuery;

  if (preference === 'joined' && joinedClubs.length > 0) {
    eventsQuery = query(eventsCollection, where('clubId', 'in', joinedClubs), orderBy("createdAt", "desc"));
  } else {
    eventsQuery = query(eventsCollection, orderBy("createdAt", "desc"));
  }

  const eventSnapshot = await getDocs(eventsQuery);
  const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return eventList;
};

// --- Storage Functions ---
const uploadEventBanner = async (file, clubName, eventName) => {
  if (!file) throw new Error("No file provided");
  const storageRef = ref(storage, `eventBanners/${clubName}_${eventName}_${Date.now()}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// --- Exports ---
export {
  auth,
  db,
  storage,
  createEvent,
  getEvents,
  uploadEventBanner,
  getEventsForStudent,
  signInStudentWithEmail,
  signInStudentWithGoogle
};