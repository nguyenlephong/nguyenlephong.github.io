// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzNQRrPvqcFUmOMyLw-NpEl5LOTIQuwGM",
  authDomain: "nguyenlephong-cv.firebaseapp.com",
  projectId: "nguyenlephong-cv",
  storageBucket: "nguyenlephong-cv.appspot.com",
  messagingSenderId: "932193962112",
  appId: "1:932193962112:web:2340a26644074da29cbe65",
  measurementId: "G-9NT691TW85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);