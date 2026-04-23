// src/pages/admin/Dashboard.jsx
import { useAuth } from '../context/AuthContext'

export function AdminDashboard() {
  const { profile } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Panel de administración</h1>
      <p className="text-gray-500 mb-6">Bienvenido, {profile?.email}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Temas',     value: '—', color: 'blue' },
          { label: 'Preguntas', value: '—', color: 'green' },
          { label: 'Usuarios',  value: '—', color: 'purple' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-400">
        🚧 Fase 2: aquí irá el CRUD de temas, bloques y preguntas.
      </p>
    </div>
  )
}

// src/pages/admin/Topics.jsx
export function AdminTopics() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de temas</h1>
      <p className="text-sm text-gray-400">🚧 Fase 3: CRUD de temas y bloques conectado a Firestore.</p>
    </div>
  )
}

// src/pages/admin/Users.jsx
export function AdminUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <p className="text-sm text-gray-400">🚧 Fase 3: listado de usuarios con gestión de roles.</p>
    </div>
  )
}

// src/pages/app/Study.jsx
export function Study() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Estudiar</h1>
      <p className="text-sm text-gray-400">🚧 Fase 4: listado de temas y bloques disponibles.</p>
    </div>
  )
}

// src/pages/app/Exam.jsx
export function Exam() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Modo examen</h1>
      <p className="text-sm text-gray-400">🚧 Fase 4: examen tipo test con preguntas de Firestore.</p>
    </div>
  )
}

// src/pages/app/Stats.jsx
export function Stats() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis estadísticas</h1>
      <p className="text-sm text-gray-400">🚧 Fase 4: historial de resultados y aciertos por tema.</p>
    </div>
  )
}
