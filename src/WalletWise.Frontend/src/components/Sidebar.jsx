import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',             icon: 'dashboard',    label: 'Dashboard' },
  { to: '/transacoes',   icon: 'receipt_long', label: 'Transações' },
  { to: '/metas',        icon: 'track_changes', label: 'Metas' },
  { to: '/assinaturas',  icon: 'subscriptions', label: 'Assinaturas' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant p-6 z-50">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-md">
          <span className="material-symbols-outlined icon-filled">account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-primary leading-none">WalletWise</h1>
          <p className="text-xs uppercase tracking-widest text-outline mt-0.5">Global Finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                isActive
                  ? 'bg-primary text-on-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <p className="text-xs text-outline text-center">WalletWise v1.0</p>
      </div>
    </aside>
  )
}
