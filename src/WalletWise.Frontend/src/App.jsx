import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Subscriptions from './pages/Subscriptions'
import TransactionModal from './components/TransactionModal'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/"             element={<Layout><Dashboard /></Layout>} />
        <Route path="/transacoes"   element={<Layout><Transactions /></Layout>} />
        <Route path="/metas"        element={<Layout><Goals /></Layout>} />
        <Route path="/assinaturas"  element={<Layout><Subscriptions /></Layout>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
      <TransactionModal />
    </>
  )
}
