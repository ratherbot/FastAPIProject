import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import { LoginPage } from './pages/Login.tsx'
import { RegisterPage } from './pages/Register'
import { ProjectsPage } from './pages/Projects'
import { ProjectDetailPage } from './pages/ProjectDetail'

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
              <ProjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </div>
  )
}

export default App