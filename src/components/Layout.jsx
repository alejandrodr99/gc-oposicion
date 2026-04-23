import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin' || to === '/app'} 
      className={({ isActive }) =>
        `flex items-center px-6 h-full text-sm font-bold transition-all border-b-4 ${
          isActive
            ? 'bg-white/10 text-white border-white' 
            : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header className="bg-corporativo shadow-md sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-4 h-20 flex items-center gap-3">
    
    {/* 1. Logo (Simplificado y ajustado) */}
    <div className="flex items-center shrink-0 mr-6">
      <img 
        src="../images/pesadillapol1.png" 
        alt="PesadillaPOL" 
        className="h-20 w-auto object-contain" 
      />
    </div>

    {/* 2. Navegación (Ocupa el alto total) */}
    <nav className="flex items-center h-full ml-4">
      {isAdmin ? (
        <>
          <NavItem to="/admin">Panel de Control</NavItem>
          <NavItem to="/admin/topics">Temas</NavItem>
          <NavItem to="/admin/users">Usuarios</NavItem>
          <NavItem to="/admin/invites">Invitaciones</NavItem>
        </>
      ) : (
        <>
          <NavItem to="/app">Estudiar</NavItem>
          <NavItem to="/app/exam">Examen</NavItem>
          <NavItem to="/app/stats">Mis estadísticas</NavItem>
        </>
      )}
    </nav>

    {/* 3. Usuario + logout */}
    <div className="ml-auto flex items-center gap-4 shrink-0">
      <div className="text-right hidden sm:block">
        <p className="text-white text-xs font-medium leading-tight">
          {profile?.email}
        </p>
        <p className="text-white/60 text-xs leading-tight capitalize">
          {profile?.role}
        </p>
      </div>
      <button 
        onClick={handleLogout} 
        className="btn btn-sm bg-white/10 text-white border-white/20 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
      >
        Salir
      </button>
    </div>

  </div>
</header>

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        Guardia Civil. Ingreso a Escala de Cabos y Guardias · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
