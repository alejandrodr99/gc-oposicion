import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { data: users, loading } = useCollection('users')
  const { user: currentUser } = useAuth()
  const [saving, setSaving] = useState(null)

  async function changeRole(uid, newRole) {
    if (uid === currentUser.uid) {
      alert('No puedes cambiar tu propio rol')
      return
    }
    setSaving(uid)
    await updateDoc(doc(db, 'users', uid), { role: newRole })
    setSaving(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-gray-400 mt-1">{users.length} usuarios registrados</p>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="card flex items-center gap-4">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm shrink-0">
              {u.email?.[0]?.toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{u.email}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {u.id === currentUser.uid ? 'Tú · ' : ''}
                Registrado el {u.createdAt?.toDate?.()?.toLocaleDateString('es-ES') || '—'}
              </div>
            </div>

            {/* Selector de rol */}
            <select
              value={u.role}
              disabled={u.id === currentUser.uid || saving === u.id}
              onChange={e => changeRole(u.id, e.target.value)}
              className="input w-auto text-sm py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
            </select>

            {saving === u.id && (
              <span className="text-xs text-gray-400">Guardando...</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
