import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './store/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import NovoLaudo from './pages/NovoLaudo'
import Processando from './pages/Processando'
import Historico from './pages/Historico'

function PrivateRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/historico" replace />} />
        <Route
          path="/novo"
          element={
            <PrivateRoute>
              <Layout><NovoLaudo /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/processando/:jobId"
          element={
            <PrivateRoute>
              <Layout><Processando /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <PrivateRoute>
              <Layout><Historico /></Layout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/historico" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
