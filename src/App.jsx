import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useRef, useState } from 'react'

import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Weather from './pages/Weather'
import Tasks from './pages/Tasks'
import Messages from './pages/Messages'
import QuickLinks from './pages/QuickLinks'
import SharedTasks from './pages/SharedTasks'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// import your music
import bgMusic from './assets/music/backgroundmusic.mp3'

function App() {
  const audioRef = useRef(null)
  const [started, setStarted] = useState(false)

  const startMusic = () => {
    if (!started) {
      audioRef.current.volume = 0.2 // nice low background volume
      audioRef.current.play()
      setStarted(true)
    }
  }

  return (
    <BrowserRouter>

      {/* Hidden audio */}
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/mpeg" />
      </audio>

      {/* Start music button (required for autoplay rules) */}
      {!started && (
        <button
          onClick={startMusic}
          className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          Enable Music
        </button>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-links"
          element={
            <ProtectedRoute>
              <QuickLinks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared-tasks"
          element={
            <ProtectedRoute>
              <SharedTasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App