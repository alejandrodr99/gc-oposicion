import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const LETTERS = ['A', 'B', 'C', 'D']

async function loadSingleTopic(topicId, blockId) {
  let qs = []
  if (blockId) {
    const snap = await getDocs(collection(db, `topics/${topicId}/blocks/${blockId}/questions`))
    qs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } else {
    const blocksSnap = await getDocs(query(collection(db, `topics/${topicId}/blocks`), orderBy('order')))
    for (const b of blocksSnap.docs) {
      const qSnap = await getDocs(collection(db, `topics/${topicId}/blocks/${b.id}/questions`))
      qSnap.docs.forEach(d => qs.push({ id: d.id, ...d.data() }))
    }
  }
  return qs
}

async function loadMultiTopic(topicIds) {
  let qs = []
  for (const tid of topicIds) {
    const blocksSnap = await getDocs(query(collection(db, `topics/${tid}/blocks`), orderBy('order')))
    for (const b of blocksSnap.docs) {
      const qSnap = await getDocs(collection(db, `topics/${tid}/blocks/${b.id}/questions`))
      qSnap.docs.forEach(d => qs.push({ id: d.id, ...d.data() }))
    }
  }
  return qs
}

function SetupScreen({ topicName, blockName, onStart, onBack }) {
  const [mode, setMode] = useState('20')
  const modes = [
    { value: '10',  label: '10 preguntas' },
    { value: '20',  label: '20 preguntas' },
    { value: '30',  label: '30 preguntas' },
    { value: '50',  label: '50 preguntas' },
    { value: 'all', label: 'Todas' },
  ]
  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-xl font-bold">{topicName}</h2>
          <p className="text-sm text-gray-400 mt-1">{blockName}</p>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-3">Número de preguntas</p>
        <div className="space-y-2 mb-6">
          {modes.map(m => (
            <label key={m.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${mode === m.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input type="radio" name="mode" value={m.value} checked={mode === m.value} onChange={() => setMode(m.value)} className="accent-primary-600" />
              <span className="text-sm">{m.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="btn flex-1">Volver</button>
          <button onClick={() => onStart(mode)} className="btn btn-primary flex-1">Comenzar →</button>
        </div>
      </div>
    </div>
  )
}

function QuestionCard({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const isLast = index === total - 1

  function optStyle(i) {
    if (!revealed) return selected === i ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'
    if (i === question.correct) return 'border-green-400 bg-green-50'
    if (i === selected)         return 'border-red-400 bg-red-50'
    return 'border-gray-100 bg-white opacity-50'
  }
  function badgeStyle(i) {
    if (revealed && i === question.correct) return 'border-green-500 text-green-600'
    if (revealed && i === selected)         return 'border-red-500 text-red-600'
    if (selected === i)                     return 'border-primary-500 text-primary-600'
    return 'border-gray-300 text-gray-400'
  }
  function badgeLabel(i) {
    if (revealed && i === question.correct) return '✓'
    if (revealed && i === selected)         return '✗'
    return LETTERS[i]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
        <span>Pregunta {index + 1} de {total}</span>
        <span>{Math.round((index / total) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <div className="card mb-4">
        <p className="font-medium text-gray-900 leading-relaxed">{question.text}</p>
      </div>
      <div className="space-y-2 mb-4">
        {question.options?.map((opt, i) => (
          <button key={i} onClick={() => !revealed && setSelected(i)}
            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${optStyle(i)}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${badgeStyle(i)}`}>
              {badgeLabel(i)}
            </span>
            <span className="text-sm leading-relaxed">{opt}</span>
          </button>
        ))}
      </div>
      {revealed && question.explanation && (
        <div className="card mb-4 border-l-4 border-yellow-300 bg-yellow-50 rounded-xl">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">💡 Explicación: </span>
            <span
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </p>
        </div>
      )}
      <div className="flex justify-end gap-3">
        {!revealed
          ? <button onClick={() => setRevealed(true)} disabled={selected === null} className="btn btn-primary disabled:opacity-40">Confirmar respuesta</button>
          : <button onClick={() => onAnswer(selected)} className="btn btn-primary">{isLast ? 'Ver resultados →' : 'Siguiente →'}</button>
        }
      </div>
    </div>
  )
}

function ResultsScreen({ answers, topicName, blockName, onRetry, onHome }) {
  const correct = answers.filter(a => a.selected === a.correct).length
  const total   = answers.length
  const pct     = Math.round((correct / total) * 100)
  const color   = pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'
  const msg     = pct >= 70 ? '¡Buen resultado!' : pct >= 50 ? 'Sigue practicando' : 'A repasar más'
  const [showReview, setShowReview] = useState(false)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center mb-4">
        <div className={`text-5xl font-bold mb-1 ${color}`}>{pct}%</div>
        <p className="text-lg font-semibold text-gray-700">{msg}</p>
        <p className="text-sm text-gray-400 mt-1">{correct} correctas de {total} preguntas</p>
        <p className="text-xs text-gray-300 mt-1">{topicName} · {blockName}</p>
      </div>
      <div className="flex gap-3 mb-4">
        <button onClick={onRetry} className="btn flex-1">Repetir</button>
        <button onClick={onHome}  className="btn btn-primary flex-1">Volver al inicio</button>
      </div>
      <button onClick={() => setShowReview(p => !p)} className="btn w-full mb-4">
        {showReview ? 'Ocultar revisión' : 'Ver revisión detallada'}
      </button>
      {showReview && (
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div key={i} className="card">
              <div className="flex items-start gap-3 mb-2">
                <span className={`badge shrink-0 ${a.selected === a.correct ? 'badge-green' : 'badge-red'}`}>
                  {a.selected === a.correct ? '✓' : '✗'} P{i + 1}
                </span>
                <p className="text-sm font-medium">{a.question.text}</p>
              </div>
              {a.question.options?.map((opt, oi) => (
                <div key={oi} className={`text-xs px-2 py-1 rounded ${oi === a.correct ? 'text-green-700' : oi === a.selected ? 'text-red-600' : 'text-gray-400'}`}>
                  {oi === a.correct ? '✓' : oi === a.selected ? '✗' : '·'} {LETTERS[oi]}) {opt}
                </div>
              ))}
              {a.question.explanation && (
                <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1.5">
                  💡 <span
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: a.question.explanation }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Exam() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [phase, setPhase]       = useState('setup')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]   = useState(0)
  const [answers, setAnswers]   = useState([])

  useEffect(() => { if (!state?.topicId && !state?.topicIds) navigate('/app') }, [state])

  async function handleStart(mode) {
    setPhase('loading')
    let qs = []
    if (state.multiTopic) {
      qs = await loadMultiTopic(state.topicIds)
    } else {
      qs = await loadSingleTopic(state.topicId, state.blockId)
    }
    qs = qs.sort(() => Math.random() - 0.5)
    if (mode !== 'all') qs = qs.slice(0, parseInt(mode))
    setQuestions(qs)
    setCurrent(0)
    setAnswers([])
    setPhase('exam')
  }

  function handleAnswer(selectedIdx) {
    const q = questions[current]
    const newAnswers = [...answers, { question: q, selected: selectedIdx, correct: q.correct }]
    setAnswers(newAnswers)
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
    } else {
      saveSession(newAnswers)
      setPhase('results')
    }
  }

  async function saveSession(finalAnswers) {
    try {
      const correct = finalAnswers.filter(a => a.selected === a.correct).length
      await addDoc(collection(db, `users/${user.uid}/sessions`), {
        topicName: state.topicName,
        blockName: state.blockName,
        total:     finalAnswers.length,
        correct,
        score:     Math.round((correct / finalAnswers.length) * 100),
        date:      serverTimestamp(),
      })
    } catch (e) { console.error('Error guardando sesión:', e) }
  }

  if (phase === 'setup') return (
    <SetupScreen
      topicName={state?.topicName}
      blockName={state?.blockName}
      onStart={handleStart}
      onBack={() => navigate('/app')}
    />
  )
  if (phase === 'loading') return (
    <div className="text-center py-20 text-gray-400">
      <div className="text-3xl mb-3 animate-pulse">⏳</div>
      <p>Cargando preguntas...</p>
    </div>
  )
  if (phase === 'exam') return (
    <QuestionCard
      key={current}
      question={questions[current]}
      index={current}
      total={questions.length}
      onAnswer={handleAnswer}
    />
  )
  if (phase === 'results') return (
    <ResultsScreen
      answers={answers}
      topicName={state?.topicName}
      blockName={state?.blockName}
      onRetry={() => handleStart('all')}
      onHome={() => navigate('/app')}
    />
  )
}
