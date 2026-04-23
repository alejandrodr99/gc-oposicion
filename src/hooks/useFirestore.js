import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, doc,
  addDoc, updateDoc, deleteDoc,
  serverTimestamp, orderBy, query
} from 'firebase/firestore'
import { db } from '../firebase'

// Escucha en tiempo real una colección
export function useCollection(path, ...queryConstraints) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!path) return
    const ref = query(collection(db, path), ...queryConstraints)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => { setError(err); setLoading(false) }
    )
    return unsub
  }, [path])

  return { data, loading, error }
}

// CRUD genérico
export function useFirestore(collectionPath) {
  const [loading, setLoading] = useState(false)

  async function add(data) {
    setLoading(true)
    try {
      const ref = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: serverTimestamp(),
      })
      return ref.id
    } finally {
      setLoading(false)
    }
  }

  async function update(id, data) {
    setLoading(true)
    try {
      await updateDoc(doc(db, collectionPath, id), {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } finally {
      setLoading(false)
    }
  }

  async function remove(id) {
    setLoading(true)
    try {
      await deleteDoc(doc(db, collectionPath, id))
    } finally {
      setLoading(false)
    }
  }

  return { add, update, remove, loading }
}
