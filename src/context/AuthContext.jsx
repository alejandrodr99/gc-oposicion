import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser]          = useState(null)   // objeto Firebase User
    const [profile, setProfile]    = useState(null)   // documento de Firestore { role, email, ... }
    const [loading, setLoading]    = useState(true)
    const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Carga el perfil del usuario desde Firestore
        const ref  = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setProfile(snap.data())
        } else {
          // Primera vez: crea el perfil con rol 'user'
          const newProfile = {
            email:     firebaseUser.email,
            role:      'user',
            createdAt: serverTimestamp(),
          }
          await setDoc(ref, newProfile)
          setProfile(newProfile)
        }
        setProfileLoaded(true)
      } else {
        setUser(null)
        setProfile(null)
        setProfileLoaded(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ─── Acciones ───────────────────────────────────────────────
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function register(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    // Crea el perfil en Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      role:      'user',
      createdAt: serverTimestamp(),
    })
    return cred
  }

  async function logout() {
    await signOut(auth)
  }

  // ─── Helpers de rol ─────────────────────────────────────────
  const isAdmin = profile?.role === 'admin'
  const isUser  = profile?.role === 'user'

  const value = { user, profile, profileLoaded, loading, isAdmin, isUser, login, register, logout }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Hook para usar en cualquier componente: const { user, isAdmin } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
