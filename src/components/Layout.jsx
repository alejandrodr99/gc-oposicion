import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icons = {
  home:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  book:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  chart:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  invite: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
}

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

function BottomNavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-colors ${
          isActive ? 'text-green-700' : 'text-gray-400'
        }`
      }
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
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
    <div className="min-h-screen flex flex-col overflow-x-hidden">

      <header className="bg-corporativo shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center gap-3">

          <div className="flex items-center shrink-0 mr-2 md:mr-6">
            <img
              src="../images/pesadillapol1.png"
              alt="PesadillaPOL"
              className="h-14 md:h-20 w-auto object-contain"
            />
          </div>

          {/* Nav desktop — oculta en móvil */}
          <nav className="hidden md:flex items-center h-full ml-4">
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

          <div className="flex-1" />

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-white text-xs font-medium leading-tight truncate max-w-[160px]">
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

      {/* pb-24 en móvil para no tapar contenido con la bottom nav */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Barra inferior — solo móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 flex">
        {isAdmin ? (
          <>
            <BottomNavItem to="/admin"         icon={Icons.home}   label="Panel"   end />
            <BottomNavItem to="/admin/topics"  icon={Icons.book}   label="Temas"      />
            <BottomNavItem to="/admin/users"   icon={Icons.users}  label="Usuarios"   />
            <BottomNavItem to="/admin/invites" icon={Icons.invite} label="Invites"    />
          </>
        ) : (
          <>
            <BottomNavItem to="/app"       icon={Icons.book}  label="Estudiar" end />
            <BottomNavItem to="/app/exam"  icon={Icons.home}  label="Examen"       />
            <BottomNavItem to="/app/stats" icon={Icons.chart} label="Stats"        />
          </>
        )}
      </nav>

      <footer className="hidden md:block border-t border-gray-100 py-3 text-center text-xs text-gray-400">
        Guardia Civil. Ingreso a Escala de Cabos y Guardias · {new Date().getFullYear()}
      </footer>

    </div>
  )
}
