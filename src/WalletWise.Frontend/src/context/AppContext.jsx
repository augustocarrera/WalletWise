import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  const [txModal, setTxModal] = useState({ open: false, tx: null, onDone: null })

  const toggleTheme = useCallback(() => {
    const next = !isDark
    setIsDark(next)
    const html = document.documentElement
    html.classList.toggle('dark', next)
    html.classList.toggle('light', !next)
    localStorage.setItem('ww-theme', next ? 'dark' : 'light')
  }, [isDark])

  const openTxModal = useCallback((tx = null, onDone = null) => {
    setTxModal({ open: true, tx, onDone })
  }, [])

  const closeTxModal = useCallback(() => {
    setTxModal({ open: false, tx: null, onDone: null })
  }, [])

  return (
    <Ctx.Provider value={{ isDark, toggleTheme, txModal, openTxModal, closeTxModal }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
