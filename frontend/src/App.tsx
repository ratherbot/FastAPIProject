import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import { LoginPage } from './pages/Login.tsx'
import { RegisterPage } from './pages/Register'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const token = useAuthStore((state) => state.token)

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/projects" replace />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/projects" replace />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <div style={{ padding: '20px' }}>
                <h1>Мои Проекты</h1>
                <p>Тут скоро будет список проектов и тасок!</p>
                <button onClick={() => useAuthStore.getState().logout()}>Выйти</button>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </div>
  )
}

export default App