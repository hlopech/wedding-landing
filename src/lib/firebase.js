import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA95opqIXr6XTTzvoaHgxue80AoxbO3mcw',
  authDomain: "wedding-landing-6d63c.firebaseapp.com",
  projectId: "wedding-landing-6d63c",
  storageBucket: "wedding-landing-6d63c.firebasestorage.app",
  messagingSenderId: 904013771359,
  appId: "1:904013771359:web:f8ca1e507df70038b861ea"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
