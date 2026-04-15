import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDar5X2cFLk7oq7fE6HRw12A4rMY_DW-Co',
  authDomain: 'quiz-33240.firebaseapp.com',
  databaseURL: 'https://quiz-33240-default-rtdb.firebaseio.com',
  projectId: 'quiz-33240',
  storageBucket: 'quiz-33240.firebasestorage.app',
  messagingSenderId: '551515231321',
  appId: '1:551515231321:web:bd700b0852d958425f0d48',
  measurementId: 'G-RLPEZTG6PE',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

if (typeof window !== 'undefined') {
  getAnalytics(app)
}

export { app, db }