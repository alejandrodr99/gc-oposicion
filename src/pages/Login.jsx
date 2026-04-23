import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode]       = useState('login')  // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password)
      }
      // AuthContext ya ha cargado el perfil → redirige según rol
      navigate(isAdmin ? '/admin' : '/app')
    } catch (err) {
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporativo via-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center"><img src="../images/pesadillapol1.png" width={300} alt="PesadillaPOL" /></div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input"
                placeholder="ejemplo@pesadilla.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {loading
                ? 'Cargando...'
                : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Traduce los códigos de error de Firebase a español
function translateError(code) {
  const errors = {
    'auth/user-not-found':       'No existe una cuenta con ese correo.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':        'El formato del correo no es válido.',
    'auth/too-many-requests':    'Demasiados intentos. Espera unos minutos.',
    'auth/invalid-credential':   'Correo o contraseña incorrectos.',
  }
  return errors[code] || 'Ha ocurrido un error. Inténtalo de nuevo.'
}
