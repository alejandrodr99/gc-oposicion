import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            'AIzaSyDcWzKMcGu4FhvkptaYeQR7gP04cXkNqQ8',
  authDomain:        'proyecto-guardia-civil.firebaseapp.com',
  projectId:         'proyecto-guardia-civil',
  storageBucket:     'proyecto-guardia-civil.firebasestorage.app',
  messagingSenderId: '518433171387',
  appId:             '1:518433171387:web:e76e146efb8cbac82f469e',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
export default app
