import { useCollection } from '../../hooks/useFirestore'
import { useAuth } from '../../context/AuthContext'

function ScoreBadge({ score }) {
  if (score >= 70) return <span className="badge badge-green">{score}%</span>
  if (score >= 50) return <span className="badge badge-yellow">{score}%</span>
  return <span className="badge badge-red">{score}%</span>
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Stats() {
  const { user } = useAuth()
  const { data: sessions, loading } = useCollection(`users/${user.uid}/sessions`)

  // Calcula estadísticas globales
  const totalSessions  = sessions.length
  const totalQuestions = sessions.reduce((a, s) => a + (s.total   || 0), 0)
  const totalCorrect   = sessions.reduce((a, s) => a + (s.correct || 0), 0)
  const avgScore       = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0

  // Sesiones ordenadas de más reciente a más antigua
  const sorted = [...sessions].sort((a, b) => {
    const ta = a.date?.toMillis?.() || 0
    const tb = b.date?.toMillis?.() || 0
    return tb - ta
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mis estadísticas</h1>
        <p className="text-sm text-gray-400 mt-1">Tu historial de práctica</p>
      </div>

      {/* Resumen global */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Sesiones"   value={totalSessions}  />
        <StatCard label="Preguntas"  value={totalQuestions} />
        <StatCard label="Correctas"  value={totalCorrect}   />
        <StatCard
          label="Media global"
          value={`${avgScore}%`}
          sub={avgScore >= 70 ? '¡Bien!' : avgScore >= 50 ? 'Mejorando' : 'A practicar'}
        />
      </div>

      {/* Historial */}
      <h2 className="text-lg font-semibold mb-3">Historial de sesiones</h2>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      {!loading && sessions.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <p>Aún no has hecho ningún examen.</p>
          <p className="text-sm mt-1">Completa tu primera práctica para ver estadísticas.</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(s => (
          <div key={s.id} className="card flex items-center gap-4">
            <ScoreBadge score={s.score || 0} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.topicName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.blockName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-gray-700">
                {s.correct}/{s.total}
              </p>
              <p className="text-xs text-gray-400">
                {s.date?.toDate?.()?.toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric'
                }) || '—'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
