import { useCollection } from '../../hooks/useFirestore'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

function StatCard({ label, value, to, color }) {
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow cursor-pointer block">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const { data: topics }  = useCollection('topics')
  const { data: users }   = useCollection('users')

  const totalBlocks    = topics.reduce((a, t) => a + (t.blockCount  || 0), 0)
  const totalQuestions = topics.reduce((a, t) => a + (t.questionCount || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenido, {profile?.email}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Temas"     value={topics.length}    to="/admin/topics" color="text-primary-600" />
        <StatCard label="Bloques"   value={totalBlocks}      to="/admin/topics" color="text-purple-600"  />
        <StatCard label="Preguntas" value={totalQuestions}   to="/admin/topics" color="text-green-600"   />
        <StatCard label="Usuarios"  value={users.length}     to="/admin/users"  color="text-orange-500"  />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/topics" className="card hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="text-3xl">📚</div>
          <div>
            <div className="font-semibold">Gestionar temas</div>
            <div className="text-sm text-gray-500">Crea temas, bloques y preguntas</div>
          </div>
        </Link>
        <Link to="/admin/users" className="card hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="text-3xl">👥</div>
          <div>
            <div className="font-semibold">Gestionar usuarios</div>
            <div className="text-sm text-gray-500">Administra roles y accesos</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
