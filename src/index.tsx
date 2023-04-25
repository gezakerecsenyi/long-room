import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDfPbMjpK33XeB1gWpVEIP2kPmHBzXKm3k",
    authDomain: "long-room.firebaseapp.com",
    projectId: "long-room",
    storageBucket: "long-room.appspot.com",
    messagingSenderId: "557387739276",
    appId: "1:557387739276:web:c961ab49c6868b1a9f0ba9"
};

export const firebase = initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

