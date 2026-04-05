import { NavLink, useNavigate } from 'react-router-dom'
import { auth } from '../store/auth'

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-teal/10 text-teal border border-teal/20'
          : 'text-text-muted hover:text-text-primary hover:bg-surface'
      }`
    }
  >
    {children}
  </NavLink>
)

export default function Layout({ children }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.clear()
    navigate('/login')
  }

  return (
    <div className="flex h-full min-h-screen bg-bg-base">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-bg-section border-r border-teal/8 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-teal/8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal/15 rounded-md flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EB9B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-text-primary text-base font-semibold leading-tight">Nord SST</p>
              <p className="text-text-dim text-[10px] tracking-widest uppercase">Documentos</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavItem to="/novo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Novo Laudo
          </NavItem>
          <NavItem to="/historico">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
            </svg>
            Histórico
          </NavItem>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-teal/8 pt-4">
          <button onClick={handleLogout} className="btn-ghost w-full text-left flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
