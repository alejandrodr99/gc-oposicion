import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../../firebase'
import { useCollection, useFirestore } from '../../hooks/useFirestore'
import Modal from '../../components/Modal'

function BlockModal({ topicId, block, onClose }) {
  const [name, setName]   = useState(block?.name || '')
  const [order, setOrder] = useState(block?.order || '')
  const { add, update, loading } = useFirestore(`topics/${topicId}/blocks`)

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { name: name.trim(), order: Number(order) || 0 }
    if (block) {
      await update(block.id, data)
    } else {
      await add(data)
      // Incrementa contador en el tema padre
      await updateDoc(doc(db, 'topics', topicId), { blockCount: increment(1) })
    }
    onClose()
  }

  return (
    <Modal title={block ? 'Editar bloque' : 'Nuevo bloque'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del bloque</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Bloque 1 – Derechos Fundamentales"
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

export default function AdminBlocks() {
  const { topicId } = useParams()
  const { data: blocks, loading } = useCollection(`topics/${topicId}/blocks`)
  const { remove } = useFirestore(`topics/${topicId}/blocks`)
  const [modal, setModal] = useState(null)
  const [topicName, setTopicName] = useState('')

  // Carga el nombre del tema para el breadcrumb
  useState(() => {
    getDoc(doc(db, 'topics', topicId)).then(s => {
      if (s.exists()) setTopicName(s.data().name)
    })
  }, [topicId])

  async function handleDelete(block) {
    if (!confirm(`¿Borrar "${block.name}" y todas sus preguntas?`)) return
    await remove(block.id)
    await updateDoc(doc(db, 'topics', topicId), { blockCount: increment(-1) })
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/admin/topics" className="hover:text-primary-600">Temas</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium truncate">{topicName}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bloques</h1>
        <button onClick={() => setModal('new')} className="btn btn-primary">
          + Nuevo bloque
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando...</p>}

      {!loading && blocks.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📂</div>
          <p>No hay bloques en este tema. Crea el primero.</p>
        </div>
      )}

      <div className="space-y-3">
        {blocks
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(b => (
            <div key={b.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{b.name}</div>
                <div className="text-sm text-gray-400 mt-0.5">
                  {b.questionCount || 0} preguntas
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  to={`/admin/topics/${topicId}/blocks/${b.id}/questions`}
                  className="btn btn-sm"
                >
                  Preguntas
                </Link>
                <button onClick={() => setModal(b)} className="btn btn-sm">Editar</button>
                <button onClick={() => handleDelete(b)} className="btn btn-sm btn-danger">Borrar</button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <BlockModal
          topicId={topicId}
          block={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
