import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  collection, query, where, getDocs,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { register } = useAuth()

  const [code, setCode]         = useState(params.get('invite') || '')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [validCode, setValidCode] = useState(null)  // objeto invite o null

  // Valida el código automáticamente si viene en la URL
  useEffect(() => {
    if (params.get('invite')) validateCode(params.get('invite'))
  }, [])

  async function validateCode(c) {
    const trimmed = c.trim().toUpperCase()
    setCode(trimmed)
    setValidCode(null)
    setError('')
    if (trimmed.length < 6) return
    const snap = await getDocs(
      query(collection(db, 'invites'), where('code', '==', trimmed), where('used', '==', false))
    )
    if (snap.empty) {
      setError('Código de invitación inválido o ya usado.')
    } else {
      setValidCode({ id: snap.docs[0].id, ...snap.docs[0].data() })
      setError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validCode) { setError('Introduce un código de invitación válido.'); return }
    setError('')
    setLoading(true)
    try {
      const cred = await register(email, password)
      // Marca el código como usado
      await updateDoc(doc(db, 'invites', validCode.id), {
        used:   true,
        usedBy: email,
        usedAt: serverTimestamp(),
      })
      navigate('/app')
    } catch (err) {
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-600 to-primary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚖️</div>
          <h1 className="text-2xl font-bold text-white">GC Oposición</h1>
          <p className="text-white/60 text-sm mt-1">Crear cuenta con invitación</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Código */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Código de invitación
              </label>
              <div className="relative">
                <input
                  className="input font-mono text-center tracking-widest text-lg uppercase"
                  value={code}
                  onChange={e => validateCode(e.target.value)}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
                {validCode && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">✓</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !validCode}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function translateError(code) {
  const errors = {
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':        'El formato del correo no es válido.',
  }
  return errors[code] || 'Ha ocurrido un error. Inténtalo de nuevo.'
}
