// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuzftftIG-2cW_rxU5NM1AGI0L1cu_1I8",
  authDomain: "qwish-mvp.firebaseapp.com",
  projectId: "qwish-mvp",
  storageBucket: "qwish-mvp.firebasestorage.app",
  messagingSenderId: "703024484557",
  appId: "1:703024484557:web:6df7edee51cdf474af9984",
  measurementId: "G-KZ55NV2766"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);