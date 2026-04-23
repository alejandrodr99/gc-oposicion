import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login          from './pages/Login'
import Register       from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTopics    from './pages/admin/Topics'
import AdminBlocks    from './pages/admin/Blocks'
import AdminQuestions from './pages/admin/Questions'
import AdminUsers     from './pages/admin/Users'
import AdminInvites   from './pages/admin/Invites'
import Study          from './pages/app/Study'
import Exam           from './pages/app/Exam'
import Stats          from './pages/app/Stats'

function RootRedirect() {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={isAdmin ? '/admin' : '/app'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Públicas ────────────────────────── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<RootRedirect />} />

          {/* ── Admin ───────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/topics" element={
            <ProtectedRoute adminOnly><Layout><AdminTopics /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/topics/:topicId/blocks" element={
            <ProtectedRoute adminOnly><Layout><AdminBlocks /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/topics/:topicId/blocks/:blockId/questions" element={
            <ProtectedRoute adminOnly><Layout><AdminQuestions /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly><Layout><AdminUsers /></Layout></ProtectedRoute>
          }/>
          <Route path="/admin/invites" element={
            <ProtectedRoute adminOnly><Layout><AdminInvites /></Layout></ProtectedRoute>
          }/>

          {/* ── Usuario ──────────────────────────── */}
          <Route path="/app" element={
            <ProtectedRoute><Layout><Study /></Layout></ProtectedRoute>
          }/>
          <Route path="/app/exam" element={
            <ProtectedRoute><Layout><Exam /></Layout></ProtectedRoute>
          }/>
          <Route path="/app/stats" element={
            <ProtectedRoute><Layout><Stats /></Layout></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
