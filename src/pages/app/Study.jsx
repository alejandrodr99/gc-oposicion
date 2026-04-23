import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../../hooks/useFirestore'

function GeneralExam({ topics }) {
  const navigate  = useNavigate()
  const [mode, setMode]         = useState('all')
  const [selected, setSelected] = useState([])
  const [open, setOpen]         = useState(false)

  const totalQ = topics
    .filter(t => selected.length === 0 || selected.includes(t.id))
    .reduce((a, t) => a + (t.questionCount || 0), 0)

  function toggleTopic(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function start() {
    navigate('/app/exam', {
      state: {
        multiTopic: true,
        topicIds:   selected.length > 0 ? selected : topics.map(t => t.id),
        topicName:  selected.length > 0
          ? `${selected.length} temas seleccionados`
          : 'Todos los temas',
        blockName:  'Examen general',
        mode,
      },
    })
  }

  const modes = [
    { value: 'all', label: `Todas (${totalQ})` },
    { value: '10',  label: '10 aleatorias', disabled: totalQ < 10 },
    { value: '20',  label: '20 aleatorias', disabled: totalQ < 20 },
    { value: '30',  label: '30 aleatorias', disabled: totalQ < 30 },
    { value: '50',  label: '50 aleatorias', disabled: totalQ < 50 },
  ]

  return (
    <div className="card mb-6 border-primary-100 bg-primary-50">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(p => !p)}>
        <div>
          <p className="font-semibold text-primary-800">🎯 Examen general</p>
          <p className="text-xs text-primary-500 mt-0.5">Mezcla preguntas de varios temas</p>
        </div>
        <span className={`text-primary-400 text-lg transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-primary-100 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Temas <span className="text-gray-400 font-normal">(vacío = todos)</span>
            </p>
            <div className="space-y-1.5">
              {topics.map(t => (
                <label key={t.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={() => toggleTopic(t.id)}
                    className="accent-primary-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-700 truncate">{t.name}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{t.questionCount || 0} p.</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Número de preguntas</p>
            <div className="flex flex-wrap gap-2">
              {modes.map(m => (
                <button
                  key={m.value}
                  disabled={m.disabled}
                  onClick={() => setMode(m.value)}
                  className={`btn btn-sm ${mode === m.value ? 'btn-primary' : ''} disabled:opacity-40`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={start} disabled={totalQ === 0} className="btn btn-primary w-full disabled:opacity-40">
            Comenzar examen →
          </button>
        </div>
      )}
    </div>
  )
}

function BlockCard({ block, topicId, topicName }) {
  const navigate = useNavigate()
  function start() {
    navigate('/app/exam', { state: { multiTopic: false, topicId, blockId: block.id, topicName, blockName: block.name } })
  }
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{block.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{block.questionCount || 0} preguntas</p>
      </div>
      <button onClick={start} disabled={!block.questionCount} className="btn btn-sm btn-primary disabled:opacity-40">
        Practicar
      </button>
    </div>
  )
}

function TopicAccordion({ topic }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: blocks, loading } = useCollection(open ? `topics/${topic.id}/blocks` : null)

  function startAll(e) {
    e.stopPropagation()
    navigate('/app/exam', { state: { multiTopic: false, topicId: topic.id, blockId: null, topicName: topic.name, blockName: 'Todos los bloques' } })
  }

  return (
    <div className="card mb-3">
      <button className="w-full flex items-center justify-between gap-3 text-left" onClick={() => setOpen(p => !p)}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{topic.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{topic.blockCount || 0} bloques · {topic.questionCount || 0} preguntas</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(topic.questionCount || 0) > 0 && (
            <button onClick={startAll} className="btn btn-sm">Todo el tema</button>
          )}
          <span className={`text-gray-400 text-lg transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
        </div>
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          {loading && <p className="text-xs text-gray-400">Cargando...</p>}
          {!loading && blocks?.length === 0 && <p className="text-xs text-gray-400">No hay bloques disponibles.</p>}
          {blocks?.sort((a, b) => (a.order || 0) - (b.order || 0)).map(b => (
            <BlockCard key={b.id} block={b} topicId={topic.id} topicName={topic.name} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Study() {
  const { data: topics, loading } = useCollection('topics')
  const sorted = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Estudiar</h1>
        <p className="text-sm text-gray-400 mt-1">Practica por bloques, por tema completo o mezcla varios temas.</p>
      </div>
      {loading && <p className="text-gray-400 text-sm">Cargando temas...</p>}
      {!loading && topics.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <p>Aún no hay contenido disponible.</p>
        </div>
      )}
      {!loading && topics.length > 0 && (
        <>
          <GeneralExam topics={sorted} />
          <h2 className="text-base font-semibold text-gray-600 mb-3">Por tema</h2>
          {sorted.map(t => <TopicAccordion key={t.id} topic={t} />)}
        </>
      )}
    </div>
  )
}
