// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbR2SXiCZNES4A2VTGfaRuay2saf_7oIY",
  authDomain: "weatherapp-d8dd2.firebaseapp.com",
  projectId: "weatherapp-d8dd2",
  storageBucket: "weatherapp-d8dd2.appspot.com",
  messagingSenderId: "516125987020",
  appId: "1:516125987020:web:ddd5b97a983c187b92b269",
  measurementId: "G-V00435YHG4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebase;