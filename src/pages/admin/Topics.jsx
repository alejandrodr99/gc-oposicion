import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollection, useFirestore } from '../../hooks/useFirestore'
import Modal from '../../components/Modal'

// ─── Modal para crear/editar tema ───────────────────────────
function TopicModal({ topic, onClose }) {
  const [name, setName]   = useState(topic?.name || '')
  const [order, setOrder] = useState(topic?.order || '')
  const { add, update, loading } = useFirestore('topics')

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { name: name.trim(), order: Number(order) || 0 }
    if (topic) await update(topic.id, data)
    else       await add(data)
    onClose()
  }

  return (
    <Modal title={topic ? 'Editar tema' : 'Nuevo tema'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del tema</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Tema 1 – Constitución Española"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
          <input
            className="input"
            type="number"
            value={order}
            onChange={e => setOrder(e.target.value)}
            placeholder="1"
            min="0"
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

// ─── Fila de cada tema ───────────────────────────────────────
function TopicRow({ topic, onEdit, onDelete }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{topic.name}</div>
        <div className="text-sm text-gray-400 mt-0.5">
          {topic.blockCount || 0} bloques · {topic.questionCount || 0} preguntas
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link to={`/admin/topics/${topic.id}/blocks`} className="btn btn-sm">
          Ver bloques
        </Link>
        <button onClick={() => onEdit(topic)} className="btn btn-sm">Editar</button>
        <button onClick={() => onDelete(topic)} className="btn btn-sm btn-danger">Borrar</button>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────
export default function AdminTopics() {
  const { data: topics, loading } = useCollection('topics')
  const { remove } = useFirestore('topics')
  const [modal, setModal] = useState(null) // null | 'new' | topic

  async function handleDelete(topic) {
    if (!confirm(`¿Borrar "${topic.name}" y todo su contenido?`)) return
    await remove(topic.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Temas</h1>
        <button onClick={() => setModal('new')} className="btn btn-primary">
          + Nuevo tema
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      {!loading && topics.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <p>No hay temas todavía. Crea el primero.</p>
        </div>
      )}

      <div className="space-y-3">
        {topics
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(t => (
            <TopicRow
              key={t.id}
              topic={t}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {modal && (
        <TopicModal
          topic={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
