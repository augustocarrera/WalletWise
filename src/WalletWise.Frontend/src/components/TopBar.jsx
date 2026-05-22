import { useApp } from '../context/AppContext'

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export default function TopBar({ month, onPrev, onNext, onAdd }) {
  const { isDark, toggleTheme } = useApp()
  const now = new Date()
  const isCurrentMonth = month.year === now.getFullYear() && month.month === now.getMonth()

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-20 flex items-center px-6 md:px-8">
      <div className="flex justify-between items-center w-full">
        {/* Month selector */}
        <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant">
          <button
            onClick={onPrev}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <span className="text-sm font-bold text-primary min-w-[120px] text-center">
            {MONTH_NAMES[month.month]} {month.year}
          </span>
          <button
            onClick={onNext}
            disabled={isCurrentMonth}
            className="text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title="Alternar tema"
            className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high border border-outline-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Nova Transação
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
