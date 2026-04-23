import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Uso:
 *   <ProtectedRoute>           → solo requiere login
 *   <ProtectedRoute adminOnly> → solo para admins
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/app" replace />
  }

  return children
}
