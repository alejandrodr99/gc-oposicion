import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection, useFirestore } from '../../hooks/useFirestore'
import Modal from '../../components/Modal'

const LETTERS = ['A', 'B', 'C', 'D']

// ─── Modal pregunta ──────────────────────────────────────────
function QuestionModal({ topicId, blockId, question, onClose }) {
  const [text, setText]           = useState(question?.text || '')
  const [options, setOptions]     = useState(question?.options || ['', '', '', ''])
  const [correct, setCorrect]     = useState(question?.correct ?? 0)
  const [explanation, setExpl]    = useState(question?.explanation || '')
  const { add, update, loading }  = useFirestore(
    `topics/${topicId}/blocks/${blockId}/questions`
  )

  function setOption(i, val) {
    setOptions(prev => prev.map((o, idx) => idx === i ? val : o))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (options.some(o => !o.trim())) {
      alert('Rellena todas las opciones')
      return
    }
    const data = {
      text:        text.trim(),
      options:     options.map(o => o.trim()),
      correct:     Number(correct),
      explanation: explanation.trim(),
    }
    if (question) {
      await update(question.id, data)
    } else {
      await add(data)
      // Incrementa contadores en bloque y tema padre
      await updateDoc(doc(db, 'topics', topicId, 'blocks', blockId), {
        questionCount: increment(1),
      })
      await updateDoc(doc(db, 'topics', topicId), {
        questionCount: increment(1),
      })
    }
    onClose()
  }

  return (
    <Modal title={question ? 'Editar pregunta' : 'Nueva pregunta'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enunciado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado</label>
          <textarea
            className="input min-h-[80px]"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe aquí la pregunta..."
            required
            autoFocus
          />
        </div>

        {/* Opciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opciones <span className="text-gray-400 font-normal">(marca la correcta)</span>
          </label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <input
                type="radio"
                name="correct"
                value={i}
                checked={correct === i}
                onChange={() => setCorrect(i)}
                className="accent-primary-600 w-4 h-4 shrink-0"
              />
              <span className="w-5 text-sm font-semibold text-gray-400 shrink-0">
                {LETTERS[i]}
              </span>
              <input
                className="input mb-0"
                value={opt}
                onChange={e => setOption(i, e.target.value)}
                placeholder={`Opción ${LETTERS[i]}`}
                required
              />
            </div>
          ))}
        </div>

        {/* Explicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Explicación <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            className="input"
            value={explanation}
            onChange={e => setExpl(e.target.value)}
            placeholder="Explica por qué es correcta esta respuesta..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn">Cancelar</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Fila de pregunta ────────────────────────────────────────
function QuestionRow({ question, index, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <span className="badge badge-blue shrink-0 mt-0.5">P{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm cursor-pointer hover:text-primary-600"
            onClick={() => setExpanded(p => !p)}
          >
            {question.text}
          </p>

          {expanded && (
            <div className="mt-3 space-y-1">
              {question.options?.map((opt, i) => (
                <div
                  key={i}
                  className={`text-sm px-3 py-1.5 rounded-lg ${
                    i === question.correct
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {i === question.correct ? '✓' : '·'} {LETTERS[i]}) {opt}
                </div>
              ))}
              {question.explanation && (
                <div className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2 border-l-2 border-yellow-300">
                  💡 {question.explanation}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onEdit(question)} className="btn btn-sm">Editar</button>
          <button onClick={() => onDelete(question)} className="btn btn-sm btn-danger">Borrar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────
export default function AdminQuestions() {
  const { topicId, blockId } = useParams()
  const path = `topics/${topicId}/blocks/${blockId}/questions`
  const { data: questions, loading } = useCollection(path)
  const { remove } = useFirestore(path)
  const [modal, setModal]   = useState(null)
  const [topicName, setTopicName] = useState('')
  const [blockName, setBlockName] = useState('')

  useState(() => {
    getDoc(doc(db, 'topics', topicId)).then(s => {
      if (s.exists()) setTopicName(s.data().name)
    })
    getDoc(doc(db, 'topics', topicId, 'blocks', blockId)).then(s => {
      if (s.exists()) setBlockName(s.data().name)
    })
  }, [topicId, blockId])

  async function handleDelete(q) {
    if (!confirm('¿Borrar esta pregunta?')) return
    await remove(q.id)
    await updateDoc(doc(db, 'topics', topicId, 'blocks', blockId), {
      questionCount: increment(-1),
    })
    await updateDoc(doc(db, 'topics', topicId), {
      questionCount: increment(-1),
    })
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
        <Link to="/admin/topics" className="hover:text-primary-600">Temas</Link>
        <span>›</span>
        <Link
          to={`/admin/topics/${topicId}/blocks`}
          className="hover:text-primary-600 truncate max-w-[160px]"
        >
          {topicName}
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium truncate max-w-[160px]">{blockName}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Preguntas</h1>
        <button onClick={() => setModal('new')} className="btn btn-primary">
          + Nueva pregunta
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      {!loading && questions.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">❓</div>
          <p>No hay preguntas en este bloque. Añade la primera.</p>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuestionRow
            key={q.id}
            question={q}
            index={i}
            onEdit={setModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {modal && (
        <QuestionModal
          topicId={topicId}
          blockId={blockId}
          question={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
