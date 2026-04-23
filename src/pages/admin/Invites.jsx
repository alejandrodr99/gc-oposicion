import { useState } from 'react'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection } from '../../hooks/useFirestore'
import { useAuth } from '../../context/AuthContext'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminInvites() {
  const { user } = useAuth()
  const { data: invites, loading } = useCollection('invites')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied]     = useState(null)

  async function createInvite() {
    setCreating(true)
    try {
      const code = generateCode()
      await addDoc(collection(db, 'invites'), {
        code,
        used:      false,
        usedBy:    null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
    } finally {
      setCreating(false)
    }
  }

  async function revokeInvite(id) {
    if (!confirm('¿Revocar este código?')) return
    await updateDoc(doc(db, 'invites', id), { used: true, usedBy: 'revoked' })
  }

  function copyCode(code, id) {
    const url = `${window.location.origin}/register?invite=${code}`
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const active = invites.filter(i => !i.used)
  const used   = invites.filter(i => i.used)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invitaciones</h1>
          <p className="text-sm text-gray-400 mt-1">Solo quien tenga un enlace puede registrarse</p>
        </div>
        <button onClick={createInvite} disabled={creating} className="btn btn-primary">
          {creating ? 'Generando...' : '+ Nuevo código'}
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      {/* Activos */}
      {active.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Disponibles ({active.length})
          </h2>
          <div className="space-y-2 mb-6">
            {active.map(inv => (
              <div key={inv.id} className="card flex items-center gap-4">
                <code className="text-lg font-mono font-bold text-primary-600 tracking-widest">
                  {inv.code}
                </code>
                <div className="flex-1 text-xs text-gray-400">
                  Creado: {inv.createdAt?.toDate?.()?.toLocaleDateString('es-ES') || '—'}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => copyCode(inv.code, inv.id)} className="btn btn-sm">
                    {copied === inv.id ? '✓ Copiado' : 'Copiar enlace'}
                  </button>
                  <button onClick={() => revokeInvite(inv.id)} className="btn btn-sm btn-danger">
                    Revocar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {active.length === 0 && !loading && (
        <div className="card text-center py-10 text-gray-400 mb-6">
          <p className="text-3xl mb-2">🔒</p>
          <p>No hay códigos activos. Genera uno para invitar a alguien.</p>
        </div>
      )}

      {/* Usados */}
      {used.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Usados / revocados ({used.length})
          </h2>
          <div className="space-y-2">
            {used.map(inv => (
              <div key={inv.id} className="card flex items-center gap-4 opacity-50">
                <code className="text-lg font-mono font-bold text-gray-400 tracking-widest line-through">
                  {inv.code}
                </code>
                <div className="flex-1 text-xs text-gray-400">
                  {inv.usedBy === 'revoked' ? 'Revocado' : `Usado por: ${inv.usedBy || '—'}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
